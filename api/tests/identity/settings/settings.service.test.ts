import { beforeEach, describe, expect, it, vi } from "vitest";

const TENANT_ID = "11111111-1111-1111-1111-111111111111";

const repoMock = {
  findOneBy: vi.fn(),
  create: vi.fn((data: any) => data),
  save: vi.fn((data: any) => Promise.resolve(data)),
};

vi.mock("../../../src/core/config/data-source.js", () => ({
  default: { getRepository: () => repoMock },
}));

// Imported after the mock so SettingsService picks up the mocked AppDataSource.
const { SettingsService } = await import("../../../src/identity/settings/settings.service.js");
const { runWithTenant } = await import("../../../src/core/tenancy/tenant-context.js");

beforeEach(() => {
  vi.clearAllMocks();
  repoMock.create.mockImplementation((data: any) => data);
  repoMock.save.mockImplementation((data: any) => Promise.resolve(data));
});

describe("SettingsService.getAutomationConfig", () => {
  it("prefers the value stored in the db when present", async () => {
    repoMock.findOneBy.mockResolvedValue({
      tenantId: TENANT_ID,
      automationUrl: "https://db.example.com/webhook",
      n8nEditorUrl: null,
    });

    const service = new SettingsService();
    const config = await runWithTenant(TENANT_ID, () => service.getAutomationConfig());

    expect(config).toEqual({ automationUrl: "https://db.example.com/webhook", source: "db" });
  });

  it("falls back to AUTOMATION_URL when the db value is empty", async () => {
    repoMock.findOneBy.mockResolvedValue({ tenantId: TENANT_ID, automationUrl: "  ", n8nEditorUrl: null });
    const original = process.env.AUTOMATION_URL;
    process.env.AUTOMATION_URL = "https://env.example.com/webhook";

    const service = new SettingsService();
    const config = await runWithTenant(TENANT_ID, () => service.getAutomationConfig());

    expect(config).toEqual({ automationUrl: "https://env.example.com/webhook", source: "env" });
    process.env.AUTOMATION_URL = original;
  });
});

describe("SettingsService.getAutomationUrl caching", () => {
  it("only hits the db once while the cache is still warm", async () => {
    repoMock.findOneBy.mockResolvedValue({
      tenantId: TENANT_ID,
      automationUrl: "https://db.example.com/webhook",
      n8nEditorUrl: null,
    });

    const service = new SettingsService();
    await runWithTenant(TENANT_ID, async () => {
      await service.getAutomationUrl();
      await service.getAutomationUrl();
    });

    expect(repoMock.findOneBy).toHaveBeenCalledTimes(1);
  });

  it("keeps separate cache entries per tenant", async () => {
    const otherTenant = "22222222-2222-2222-2222-222222222222";
    repoMock.findOneBy.mockImplementation(({ tenantId }: { tenantId: string }) =>
      Promise.resolve({
        tenantId,
        automationUrl: `https://${tenantId}.example.com/webhook`,
        n8nEditorUrl: null,
      }),
    );

    const service = new SettingsService();
    const urlA = await runWithTenant(TENANT_ID, () => service.getAutomationUrl());
    const urlB = await runWithTenant(otherTenant, () => service.getAutomationUrl());

    expect(urlA).not.toBe(urlB);
    expect(repoMock.findOneBy).toHaveBeenCalledTimes(2);
  });
});

describe("SettingsService.setAutomationUrl", () => {
  it("persists the new url and refreshes the cache with it", async () => {
    repoMock.findOneBy.mockResolvedValue({ tenantId: TENANT_ID, automationUrl: null, n8nEditorUrl: null });

    const service = new SettingsService();

    await runWithTenant(TENANT_ID, async () => {
      await service.setAutomationUrl("https://new.example.com/webhook");

      expect(repoMock.save).toHaveBeenCalledWith(
        expect.objectContaining({ automationUrl: "https://new.example.com/webhook" }),
      );

      const url = await service.getAutomationUrl();
      expect(url).toBe("https://new.example.com/webhook");
      expect(repoMock.findOneBy).toHaveBeenCalledTimes(1); // cache served the second read
    });
  });
});
