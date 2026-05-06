import { settingsService } from "../settings/settings.service.js";
import { existsSync, readdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import whatsappWeb from "whatsapp-web.js";
import type { Client as WhatsAppClient } from "whatsapp-web.js";
import AppDataSource from "../config/data-source.js";
import { ExcludedPhone } from "../whatsapp-admin/entities/excluded-phone.entity.js";
import { WhatsappSettings } from "../whatsapp-admin/entities/whatsapp-settings.entity.js";
import { ContactName } from "../chats/entities/contact-name.entity.js";
import { humanModeService } from "../human-mode/human-mode.service.js";

const { Client, LocalAuth } = whatsappWeb;
const authPath = process.env.WHATSAPP_AUTH_PATH ?? ".wwebjs_auth";
const puppeteerExecutablePath =
  process.env.PUPPETEER_EXECUTABLE_PATH?.trim() || "/usr/bin/chromium";
const clientId = "customer-service";

export type WhatsappSessionStatus =
  | "connecting"
  | "qr_required"
  | "ready"
  | "disconnected";

type ListenerEventType =
  | "qr"
  | "ready"
  | "disconnected"
  | "state_change"
  | "ai_replies_setting"
  | "message_received"
  | "conversation_transferred";

type ListenerEvent = {
  type: ListenerEventType;
  data: Record<string, unknown>;
};

type IncomingMessage = {
  from: string;
  body: string;
};

type AutomationResponse = {
  reply?: string;
  transferToHuman?: boolean;
};

function clearStaleChromiumLocks(): void {
  const profilePath = join(authPath, `session-${clientId}`);

  if (!existsSync(profilePath)) return;

  for (const entry of readdirSync(profilePath, { withFileTypes: true })) {
    if (!entry.name.startsWith("Singleton")) continue;

    const lockPath = join(profilePath, entry.name);
    try {
      rmSync(lockPath, { force: true });
      console.log(`Candado anterior de Chromium eliminado: ${entry.name}`);
    } catch (error) {
      console.warn(
        `No se pudo eliminar el candado de Chromium ${entry.name}:`,
        error,
      );
    }
  }
}

export class WhatsappProcessor {
  private static instance: WhatsappProcessor;

  private constructor() {}

  static getInstance(): WhatsappProcessor {
    if (!WhatsappProcessor.instance) {
      WhatsappProcessor.instance = new WhatsappProcessor();
    }

    return WhatsappProcessor.instance;
  }

  async sendToAutomation(
    message: IncomingMessage,
  ): Promise<AutomationResponse | null> {
    try {
      const automationUrl = await settingsService.getAutomationUrl();
      const response = await fetch(automationUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(message),
      });

      if (!response.ok) {
        console.error("Error en n8n:", response.status, response.statusText);
        return null;
      }

      return (await response.json()) as AutomationResponse;
    } catch (error) {
      console.error("Error al enviar mensaje a n8n:", error);
      return null;
    }
  }

  async sendMessage(
    client: WhatsAppClient,
    { to, body }: { to: string; body: string },
  ): Promise<void> {
    try {
      await client.sendMessage(to, body);
    } catch (error) {
      console.error("Error al enviar mensaje por WhatsApp:", error);
    }
  }
}

export class WhatsappListener {
  private static instance: WhatsappListener;

  private client: WhatsAppClient;
  private processor: WhatsappProcessor;
  private isStarted = false;
  private status: WhatsappSessionStatus = "disconnected";
  private lastQr: string | null = null;
  private qrExpiresAt: string | null = null;
  private subscribers = new Set<(event: ListenerEvent) => void>();
  private static readonly SETTINGS_ID = 1;

  private constructor(processor: WhatsappProcessor) {
    this.processor = processor;
    clearStaleChromiumLocks();

    this.client = this.createClient();
  }

  private createClient(): WhatsAppClient {
    return new Client({
      authStrategy: new LocalAuth({
        clientId,
        dataPath: authPath,
      }),
      puppeteer: {
        headless: true,
        executablePath: puppeteerExecutablePath,
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
          "--disable-gpu",
        ],
      },
    });
  }

  static getInstance(): WhatsappListener {
    if (!WhatsappListener.instance) {
      WhatsappListener.instance = new WhatsappListener(
        WhatsappProcessor.getInstance(),
      );
    }

    return WhatsappListener.instance;
  }

  start(): void {
    if (this.isStarted) {
      console.log("El listener de WhatsApp ya fue iniciado");
      return;
    }

    this.isStarted = true;
    this.setStatus("connecting");
    console.log("Iniciando listener de WhatsApp...");

    this.client.on("qr", (qr) => {
      const expiresAt = new Date(Date.now() + 60_000).toISOString();
      this.lastQr = qr;
      this.qrExpiresAt = expiresAt;
      this.setStatus("qr_required");
      this.emit("qr", { qr, expiresAt });
      console.log("QR de WhatsApp generado y almacenado temporalmente");
    });

    this.client.on("loading_screen", (percent, message) => {
      console.log(`WhatsApp cargando: ${percent}% - ${message}`);
    });

    this.client.on("ready", () => {
      this.lastQr = null;
      this.qrExpiresAt = null;
      this.setStatus("ready");
      this.emit("ready", {});
      console.log("WhatsApp listo");
    });

    this.client.on("change_state", (state) => {
      this.emit("state_change", { state });
      console.log("Estado de WhatsApp:", state);
    });

    this.client.on("authenticated", () => {
      console.log("WhatsApp autenticado");
    });

    this.client.on("auth_failure", (message) => {
      console.error("Error de autenticación:", message);
    });

    this.client.on("disconnected", (reason) => {
      this.lastQr = null;
      this.qrExpiresAt = null;
      this.setStatus("disconnected");
      this.emit("disconnected", { reason });
      console.warn("WhatsApp desconectado:", reason);
    });

    this.client.on("message", async (msg) => {
      try {
        const { from: chatId, body, fromMe } = msg;

        if (!body) return;
        if (fromMe) return;

        if (chatId === "status@broadcast" || chatId.endsWith("@g.us")) {
          console.warn("Mensaje recibido de un broadcast o grupo, ignorando");
          return;
        }

        // getContact() resuelve el teléfono real incluso para usuarios con LID (@lid)
        const contact = await msg.getContact();
        const phone = contact.id.user;

        if (!phone) {
          console.warn("No se pudo obtener el teléfono del contacto, ignorando mensaje", { from: chatId });
          return;
        }

        const normalizedPhone = `${phone}@c.us`;

        const exclusionsRepository = AppDataSource.getRepository(ExcludedPhone);
        const isExcluded = await exclusionsRepository.exists({
          where: { phone: normalizedPhone },
        });

        if (isExcluded) {
          console.log("Mensaje ignorado por exclusión de teléfono", { from: phone });
          return;
        }

        const aiRepliesEnabled = await this.getAiRepliesEnabled();

        if (!aiRepliesEnabled) {
          console.log("Mensaje ignorado: respuestas con IA deshabilitadas", { from: phone, body });
          return;
        }

        const name = contact.name || contact.pushname;
        if (name) {
          AppDataSource.getRepository(ContactName)
            .save({ phone, name })
            .catch((err) => console.warn("Error guardando nombre de contacto:", err));
        }

        const isHumanMode = await humanModeService.isActive(phone);
        if (isHumanMode) {
          console.log("Conversación en modo humano, omitiendo IA", { from: phone });
          this.emit("message_received", { sessionId: phone });
          return;
        }

        const message: IncomingMessage = {
          from: phone,
          body: body,
        };

        console.log("Mensaje recibido:", message);
        this.emit("message_received", { sessionId: phone });

        const automationResponse =
          await this.processor.sendToAutomation(message);

        if (automationResponse?.transferToHuman) {
          const contactName = name || undefined;
          await humanModeService.activate(phone, contactName);
          this.emit("conversation_transferred", { sessionId: phone, phone, contactName: contactName ?? null });
          console.log("Conversación transferida a humano:", { phone });
        }

        if (!automationResponse?.reply) {
          console.log("n8n no devolvió respuesta para enviar");
          return;
        }

        await this.processor.sendMessage(this.client, {
          // Reply to the original WhatsApp chat id to preserve LID-based users.
          to: chatId,
          body: automationResponse.reply,
        });
        this.emit("message_received", { sessionId: phone });
      } catch (error) {
        console.error("Error procesando mensaje:", error);
      }
    });

    this.client.initialize().catch((error) => {
      this.isStarted = false;
      this.setStatus("disconnected");
      console.error("Error inicializando WhatsApp:", error);
    });
  }

  getStatus(): WhatsappSessionStatus {
    return this.status;
  }

  async logoutSession(): Promise<void> {
    try {
      await this.client.logout();
    } catch (error) {
      console.warn("Error cerrando sesión de WhatsApp, continuando reinicio:", error);
    }

    try {
      await this.client.destroy();
    } catch (error) {
      console.warn("Error destruyendo cliente de WhatsApp tras logout:", error);
    }

    this.isStarted = false;
    this.lastQr = null;
    this.qrExpiresAt = null;
    this.setStatus("disconnected");

    clearStaleChromiumLocks();
    this.client = this.createClient();
    this.start();
  }

  getLastQr(): { qr: string | null; expiresAt?: string } {
    if (!this.lastQr) return { qr: null };

    return {
      qr: this.lastQr,
      ...(this.qrExpiresAt ? { expiresAt: this.qrExpiresAt } : {}),
    };
  }

  subscribe(listener: (event: ListenerEvent) => void): () => void {
    this.subscribers.add(listener);
    return () => this.subscribers.delete(listener);
  }

  broadcast(type: ListenerEventType, data: Record<string, unknown>): void {
    this.emit(type, data);
  }

  async sendReply(phone: string, body: string): Promise<void> {
    if (this.status !== "ready") {
      throw new Error("WhatsApp no está conectado");
    }
    await this.processor.sendMessage(this.client, { to: `${phone}@c.us`, body });
  }

  private emit(type: ListenerEventType, data: Record<string, unknown>): void {
    for (const subscriber of this.subscribers) {
      subscriber({ type, data });
    }
  }

  private setStatus(status: WhatsappSessionStatus): void {
    this.status = status;
    this.emit("state_change", { status });
  }

  async getAiRepliesEnabled(): Promise<boolean> {
    const settingsRepository = AppDataSource.getRepository(WhatsappSettings);
    const settings = await settingsRepository.findOneBy({
      id: WhatsappListener.SETTINGS_ID,
    });

    if (settings) {
      return settings.aiRepliesEnabled;
    }

    const newSettings = settingsRepository.create({
      id: WhatsappListener.SETTINGS_ID,
      aiRepliesEnabled: true,
    });

    await settingsRepository.save(newSettings);
    return newSettings.aiRepliesEnabled;
  }

  async setAiRepliesEnabled(aiRepliesEnabled: boolean): Promise<boolean> {
    const settingsRepository = AppDataSource.getRepository(WhatsappSettings);
    const settings =
      (await settingsRepository.findOneBy({ id: WhatsappListener.SETTINGS_ID })) ??
      settingsRepository.create({ id: WhatsappListener.SETTINGS_ID });

    settings.aiRepliesEnabled = aiRepliesEnabled;
    await settingsRepository.save(settings);

    this.emit("ai_replies_setting", { aiRepliesEnabled });
    return settings.aiRepliesEnabled;
  }
}

export const listener = WhatsappListener.getInstance();
