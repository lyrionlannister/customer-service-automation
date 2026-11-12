import { describe, expect, it, vi } from "vitest";
import { MessageTemplateService } from "../../../src/message-templates/services/message-template.service.js";
import type { MessageTemplateDao } from "../../../src/message-templates/daos/message-template.dao.js";

function makeDao() {
  return {
    findAllOrdered: vi.fn(),
    findByKey: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  } as unknown as MessageTemplateDao;
}

describe("MessageTemplateService.seed", () => {
  it("creates every default template when none exist yet", async () => {
    const dao = makeDao();
    (dao.findByKey as any).mockResolvedValue(null);

    const service = new MessageTemplateService(dao);
    await service.seed();

    expect(dao.create).toHaveBeenCalled();
    const createdKeys = (dao.create as any).mock.calls.map((call: any) => call[0].key);
    expect(createdKeys).toContain("garantia_en_rango");
    expect(new Set(createdKeys).size).toBe(createdKeys.length);
  });

  it("is idempotent: never recreates a template whose key already exists", async () => {
    const dao = makeDao();
    (dao.findByKey as any).mockResolvedValue({ id: "existing" });

    const service = new MessageTemplateService(dao);
    await service.seed();

    expect(dao.create).not.toHaveBeenCalled();
  });
});

describe("MessageTemplateService.getByKey", () => {
  it("delegates to the dao and returns null for an unknown key", async () => {
    const dao = makeDao();
    (dao.findByKey as any).mockResolvedValue(null);

    const service = new MessageTemplateService(dao);
    await expect(service.getByKey("does_not_exist")).resolves.toBeNull();
    expect(dao.findByKey).toHaveBeenCalledWith("does_not_exist");
  });
});
