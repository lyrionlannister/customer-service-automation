import { describe, expect, it, vi } from "vitest";
import { SupplierService } from "../../../../src/commerce/suppliers/services/supplier.service.js";
import type { SupplierDao } from "../../../../src/commerce/suppliers/daos/supplier.dao.js";

function makeDao() {
  return {
    findAll: vi.fn(),
    findById: vi.fn(),
    findByName: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  } as unknown as SupplierDao;
}

describe("SupplierService", () => {
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

  it("creates, updates and deletes suppliers through the dao", async () => {
    const dao = makeDao();
    const created = { id: "s-1", name: "Proveedor Nuevo", phone: "123" };
    const updated = { id: "s-1", name: "Proveedor Editado", phone: "456" };
    (dao.create as any).mockResolvedValue(created);
    (dao.update as any).mockResolvedValue(updated);
    (dao.delete as any).mockResolvedValue(true);

    const service = new SupplierService(dao);

    await expect(service.create({ name: "Proveedor Nuevo", phone: "123" })).resolves.toEqual(created);
    await expect(service.update("s-1", { name: "Proveedor Editado", phone: "456" })).resolves.toEqual(updated);
    await expect(service.delete("s-1")).resolves.toBe(true);
  });
});
