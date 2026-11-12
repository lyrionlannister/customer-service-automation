import AppDataSource from "../../core/config/data-source.js";
import { WhatsappSettings } from "../../messaging/whatsapp-admin/entities/whatsapp-settings.entity.js";
import { getCurrentTenantId } from "../../core/tenancy/tenant-context.js";

type CacheEntry = {
  value: string;
  expiresAt: number;
};

export class SettingsService {
  private static instance: SettingsService;
  private static readonly CACHE_TTL_MS = Number(
    process.env.AUTOMATION_URL_CACHE_TTL_MS ?? 10_000,
  );

  // Cacheado por tenant: una sola instancia de SettingsService sirve a todos
  // los tenants del proceso, asi que la cache no puede ser un solo valor.
  private automationUrlCache = new Map<string, CacheEntry>();

  static getInstance(): SettingsService {
    if (!SettingsService.instance) {
      SettingsService.instance = new SettingsService();
    }

    return SettingsService.instance;
  }

  private getFallbackAutomationUrl(): string {
    return (
      process.env.AUTOMATION_URL ?? "http://n8n:5678/webhook/customer-service"
    );
  }

  private async getSettingsRow(): Promise<WhatsappSettings> {
    const tenantId = getCurrentTenantId();
    const repository = AppDataSource.getRepository(WhatsappSettings);
    const existing = await repository.findOneBy({ tenantId });

    if (existing) return existing;

    const created = repository.create({
      tenantId,
      aiRepliesEnabled: true,
      automationUrl: null,
      n8nEditorUrl: null,
    });

    return repository.save(created);
  }

  async getAutomationUrl(): Promise<string> {
    const tenantId = getCurrentTenantId();
    const now = Date.now();
    const cached = this.automationUrlCache.get(tenantId);
    if (cached && cached.expiresAt > now) {
      return cached.value;
    }

    const settings = await this.getSettingsRow();
    const value = settings.automationUrl?.trim() || this.getFallbackAutomationUrl();

    this.automationUrlCache.set(tenantId, {
      value,
      expiresAt: now + SettingsService.CACHE_TTL_MS,
    });

    return value;
  }

  async getAutomationConfig(): Promise<{ automationUrl: string; source: "db" | "env" }> {
    const settings = await this.getSettingsRow();
    const dbValue = settings.automationUrl?.trim();

    if (dbValue) {
      return { automationUrl: dbValue, source: "db" };
    }

    return { automationUrl: this.getFallbackAutomationUrl(), source: "env" };
  }

  async getN8nIntegrationConfig(): Promise<{ n8nEditorUrl: string; source: "db" | "env" }> {
    const settings = await this.getSettingsRow();
    const dbValue = settings.n8nEditorUrl?.trim();

    if (dbValue) {
      return { n8nEditorUrl: dbValue, source: "db" };
    }

    return { n8nEditorUrl: this.getFallbackAutomationUrl(), source: "env" };
  }

  async setAutomationUrl(url: string): Promise<string> {
    const repository = AppDataSource.getRepository(WhatsappSettings);
    const settings = await this.getSettingsRow();

    settings.automationUrl = url;
    await repository.save(settings);

    this.automationUrlCache.set(settings.tenantId, {
      value: url,
      expiresAt: Date.now() + SettingsService.CACHE_TTL_MS,
    });

    return url;
  }

  async setN8nEditorUrl(url: string): Promise<string> {
    const repository = AppDataSource.getRepository(WhatsappSettings);
    const settings = await this.getSettingsRow();

    settings.n8nEditorUrl = url;
    await repository.save(settings);

    return url;
  }
}

export const settingsService = SettingsService.getInstance();
