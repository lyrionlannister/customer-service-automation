import { describe, expect, it, vi } from "vitest";
import { CustomerService } from "../../../../src/commerce/customers/services/customer.service.js";
import type { CustomerDao } from "../../../../src/commerce/customers/daos/customer.dao.js";
import type { RepairNoteDao } from "../../../../src/commerce/repair-notes/daos/repair-note.dao.js";

function makeDao() {
  return {
    findAll: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  } as unknown as CustomerDao;
}

function makeRepairNoteDao() {
  return {
    findByCustomerId: vi.fn(),
  } as unknown as RepairNoteDao;
}

describe("CustomerService", () => {
  it("create rejects a blank name or phone", async () => {
    const dao = makeDao();
    const service = new CustomerService(dao, makeRepairNoteDao());

    await expect(service.create({ name: "  ", phone: "555" } as any)).rejects.toThrow("nombre");
    await expect(service.create({ name: "Juan", phone: "  " } as any)).rejects.toThrow("teléfono");
    expect(dao.create).not.toHaveBeenCalled();
  });

  it("create trims fields and treats email as optional", async () => {
    const dao = makeDao();
    (dao.create as any).mockResolvedValue({ id: "c-1" });
    const service = new CustomerService(dao, makeRepairNoteDao());

    await service.create({ name: " Juan Pérez ", phone: " 5551234567 " } as any);

    expect(dao.create).toHaveBeenCalledWith({
      name: "Juan Pérez",
      phone: "5551234567",
      email: undefined,
    });
  });

  it("getDeviceHistory dedupes by brand+model, keeps the most recent date, and counts notes", async () => {
    const repairNoteDao = makeRepairNoteDao();
    (repairNoteDao.findByCustomerId as any).mockResolvedValue([
      { brand: "Samsung", model: "A15", receivedAt: "2026-01-10", controlNumber: 10 },
      { brand: "samsung", model: "a15", receivedAt: "2026-03-05", controlNumber: 22 },
      { brand: "Apple", model: "iPhone 12", receivedAt: "2026-02-01", controlNumber: 15 },
    ]);
    const service = new CustomerService(makeDao(), repairNoteDao);

    const history = await service.getDeviceHistory("c-1");

    expect(history).toHaveLength(2);
    expect(history[0]).toEqual({
      brand: "Samsung",
      model: "A15",
      lastReceivedAt: "2026-03-05",
      controlNumber: 22,
      notesCount: 2,
    });
    expect(history[1].brand).toBe("Apple");
  });

  it("getDeviceHistory returns an empty list when the customer has no notes", async () => {
    const repairNoteDao = makeRepairNoteDao();
    (repairNoteDao.findByCustomerId as any).mockResolvedValue([]);
    const service = new CustomerService(makeDao(), repairNoteDao);

    expect(await service.getDeviceHistory("c-1")).toEqual([]);
  });
});
