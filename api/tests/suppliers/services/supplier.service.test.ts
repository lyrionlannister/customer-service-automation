import { describe, expect, it, vi } from "vitest";
import { SupplierService } from "../../../src/suppliers/services/supplier.service.js";
import type { SupplierDao } from "../../../src/suppliers/daos/supplier.dao.js";

function makeDao() {
  return {
    findAll: vi.fn(),
    findById: vi.fn(),
    findByName: vi.fn(),
    create: vi.fn(),
  } as unknown as SupplierDao;
}

describe("SupplierService.seed", () => {
  it("creates each seed supplier that doesn't exist yet", async () => {
    const dao = makeDao();
    (dao.findByName as any).mockResolvedValue(null);

    const service = new SupplierService(dao);
    await service.seed();

    expect(dao.create).toHaveBeenCalledWith({ name: "Tecnomax", phone: "3195083168" });
    expect(dao.create).toHaveBeenCalledWith({ name: "MN Refacciones", phone: "5587527124" });
    expect(dao.create).toHaveBeenCalledTimes(2);
  });

  it("is idempotent: skips suppliers that already exist", async () => {
    const dao = makeDao();
    (dao.findByName as any).mockResolvedValue({ id: "existing" });

    const service = new SupplierService(dao);
    await service.seed();

    expect(dao.create).not.toHaveBeenCalled();
  });
});
