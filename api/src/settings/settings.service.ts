import AppDataSource from "../config/data-source.js";
import { WhatsappSettings } from "../whatsapp-admin/entities/whatsapp-settings.entity.js";

type CacheEntry = {
  value: string;
  expiresAt: number;
};

export class SettingsService {
  private static instance: SettingsService;
  private static readonly SETTINGS_ID = 1;
  private static readonly CACHE_TTL_MS = Number(
    process.env.AUTOMATION_URL_CACHE_TTL_MS ?? 10_000,
  );

  private automationUrlCache: CacheEntry | null = null;

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
    const repository = AppDataSource.getRepository(WhatsappSettings);
    const existing = await repository.findOneBy({ id: SettingsService.SETTINGS_ID });

    if (existing) return existing;

    const created = repository.create({
      id: SettingsService.SETTINGS_ID,
      aiRepliesEnabled: true,
      automationUrl: null,
      n8nEditorUrl: null,
    });

    return repository.save(created);
  }

  async getAutomationUrl(): Promise<string> {
    const now = Date.now();
    if (this.automationUrlCache && this.automationUrlCache.expiresAt > now) {
      return this.automationUrlCache.value;
    }

    const settings = await this.getSettingsRow();
    const value = settings.automationUrl?.trim() || this.getFallbackAutomationUrl();

    this.automationUrlCache = {
      value,
      expiresAt: now + SettingsService.CACHE_TTL_MS,
    };

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

    this.automationUrlCache = {
      value: url,
      expiresAt: Date.now() + SettingsService.CACHE_TTL_MS,
    };

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
