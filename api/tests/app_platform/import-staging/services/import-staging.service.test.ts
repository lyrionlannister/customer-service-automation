import { describe, expect, it, vi } from "vitest";
import { ImportStagingService } from "../../../../src/app_platform/import-staging/services/import-staging.service.js";
import { runWithTenant } from "../../../../src/core/tenancy/tenant-context.js";
import type { PriceListDao } from "../../../../src/commerce/price-list/daos/price-list.dao.js";
import type { RedisLike } from "../../../../src/app_platform/import-staging/types.js";

const TENANT_A = "1";
const TENANT_B = "2";

function makeFakeRedis(): RedisLike {
  const store = new Map<string, string>();
  return {
    get: vi.fn(async (key: string) => store.get(key) ?? null),
    set: vi.fn(async (key: string, value: string) => {
      store.set(key, value);
      return "OK";
    }),
    del: vi.fn(async (key: string) => {
      store.delete(key);
      return 1;
    }),
  };
}

function makePriceListDao(): PriceListDao {
  return {
    deleteBySupplier: vi.fn().mockResolvedValue(undefined),
    bulkCreate: vi.fn().mockResolvedValue(undefined),
  } as unknown as PriceListDao;
}

describe("ImportStagingService", () => {
  it("startUpload crea un staging en estado processing, luego el callback lo deja ready", async () => {
    const redis = makeFakeRedis();
    const service = new ImportStagingService(redis, makePriceListDao());

    const { importId } = await runWithTenant(TENANT_A, () => service.startUpload("sup-1"));
    const processing = await runWithTenant(TENANT_A, () => service.getById(importId));
    expect(processing?.status).toBe("processing");

    await service.applyCallback(TENANT_A, importId, {
      rows: [{ brand: "Samsung", model: "A15", price: 250 }],
    });

    const ready = await runWithTenant(TENANT_A, () => service.getById(importId));
    expect(ready?.status).toBe("ready");
    expect(ready?.rows).toHaveLength(1);
  });

  it("applyCallback con error deja el staging en estado error", async () => {
    const redis = makeFakeRedis();
    const service = new ImportStagingService(redis, makePriceListDao());

    const { importId } = await runWithTenant(TENANT_A, () => service.startUpload("sup-1"));
    await service.applyCallback(TENANT_A, importId, { error: "PDF ilegible" });

    const record = await runWithTenant(TENANT_A, () => service.getById(importId));
    expect(record?.status).toBe("error");
    expect(record?.error).toBe("PDF ilegible");
  });

  it("un tenant no puede leer el staging de otro tenant (claves aisladas por tenantId)", async () => {
    const redis = makeFakeRedis();
    const service = new ImportStagingService(redis, makePriceListDao());

    const { importId } = await runWithTenant(TENANT_A, () => service.startUpload("sup-1"));
    const fromOtherTenant = await runWithTenant(TENANT_B, () => service.getById(importId));
    expect(fromOtherTenant).toBeNull();
  });

  it("commit falla si el staging todavía está processing", async () => {
    const redis = makeFakeRedis();
    const service = new ImportStagingService(redis, makePriceListDao());

    const { importId } = await runWithTenant(TENANT_A, () => service.startUpload("sup-1"));
    await expect(runWithTenant(TENANT_A, () => service.commit(importId))).rejects.toThrow(
      "aún no está listo",
    );
  });

  it("commit escribe las filas via PriceListDao y borra la key de Redis", async () => {
    const redis = makeFakeRedis();
    const priceListDao = makePriceListDao();
    const service = new ImportStagingService(redis, priceListDao);

    const { importId } = await runWithTenant(TENANT_A, () => service.startUpload("sup-1"));
    await service.applyCallback(TENANT_A, importId, {
      rows: [
        { brand: "Samsung", model: "A15", price: 250 },
        { brand: "Samsung", model: "A23", price: 300 },
      ],
    });

    const result = await runWithTenant(TENANT_A, () => service.commit(importId));
    expect(result).toEqual({ imported: 2 });
    expect(priceListDao.deleteBySupplier).toHaveBeenCalledWith("sup-1");
    expect(priceListDao.bulkCreate).toHaveBeenCalledWith([
      { brand: "Samsung", model: "A15", price: 250, supplierId: "sup-1" },
      { brand: "Samsung", model: "A23", price: 300, supplierId: "sup-1" },
    ]);

    const afterCommit = await runWithTenant(TENANT_A, () => service.getById(importId));
    expect(afterCommit).toBeNull();
  });

  it("updateRows sobreescribe las filas antes de confirmar", async () => {
    const redis = makeFakeRedis();
    const service = new ImportStagingService(redis, makePriceListDao());

    const { importId } = await runWithTenant(TENANT_A, () => service.startUpload("sup-1"));
    await service.applyCallback(TENANT_A, importId, {
      rows: [{ brand: "Samsung", model: "A15", price: 250 }],
    });

    const updated = await runWithTenant(TENANT_A, () =>
      service.updateRows(importId, [{ brand: "Samsung", model: "A15 corregido", price: 260 }]),
    );
    expect(updated?.rows).toEqual([{ brand: "Samsung", model: "A15 corregido", price: 260 }]);
  });

  it("discard borra el staging sin confirmar", async () => {
    const redis = makeFakeRedis();
    const service = new ImportStagingService(redis, makePriceListDao());

    const { importId } = await runWithTenant(TENANT_A, () => service.startUpload("sup-1"));
    await runWithTenant(TENANT_A, () => service.discard(importId));

    const record = await runWithTenant(TENANT_A, () => service.getById(importId));
    expect(record).toBeNull();
  });
});
