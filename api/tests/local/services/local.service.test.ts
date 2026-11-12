import { describe, expect, it, vi } from "vitest";
import { LocalService } from "../../../src/local/services/local.service.js";
import type { LocalDao } from "../../../src/local/daos/local.dao.js";

function makeDao() {
  return {
    findOrCreate: vi.fn(),
    update: vi.fn(),
    consumeControlNumber: vi.fn(),
  } as unknown as LocalDao;
}

describe("LocalService.updateConfig", () => {
  it("updates the existing (or newly created) local row, not a fresh one", async () => {
    const dao = makeDao();
    (dao.findOrCreate as any).mockResolvedValue({ id: "local-1", nextControlNumber: 1 });
    (dao.update as any).mockResolvedValue({ id: "local-1", name: "Mi Taller" });

    const service = new LocalService(dao);
    const result = await service.updateConfig({ name: "Mi Taller" } as any);

    expect(dao.update).toHaveBeenCalledWith("local-1", { name: "Mi Taller" });
    expect(result).toEqual({ id: "local-1", name: "Mi Taller" });
  });
});

describe("LocalService.consumeControlNumber", () => {
  it("delegates straight to the dao", async () => {
    const dao = makeDao();
    (dao.consumeControlNumber as any).mockResolvedValue(9);

    const service = new LocalService(dao);
    await expect(service.consumeControlNumber()).resolves.toBe(9);
  });
});
