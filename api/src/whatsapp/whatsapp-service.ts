import { AUTOMATION } from "../config/constants/automation.js";
import { existsSync, readdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import whatsappWeb from "whatsapp-web.js";
import type { Client as WhatsAppClient } from "whatsapp-web.js";

const { Client, LocalAuth } = whatsappWeb;
const authPath = process.env.WHATSAPP_AUTH_PATH ?? ".wwebjs_auth";
const clientId = "customer-service";

export type WhatsappSessionStatus =
  | "connecting"
  | "qr_required"
  | "ready"
  | "disconnected";

type ListenerEventType = "qr" | "ready" | "disconnected" | "state_change";

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
      const response = await fetch(AUTOMATION, {
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

  private constructor(processor: WhatsappProcessor) {
    this.processor = processor;
    clearStaleChromiumLocks();

    this.client = new Client({
      authStrategy: new LocalAuth({
        clientId,
        dataPath: authPath,
      }),
      puppeteer: {
        headless: true,
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
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
        const { from, body, fromMe } = msg;

        if (!body) return;
        if (fromMe) return;

        if (from === "status@broadcast" || from.endsWith("@g.us")) {
          console.warn("Mensaje recibido de un broadcast o grupo, ignorando");
          return;
        }

        const message: IncomingMessage = {
          from: from,
          body: body,
        };

        console.log("Mensaje recibido:", message);

        const automationResponse =
          await this.processor.sendToAutomation(message);

        if (!automationResponse?.reply) {
          console.log("n8n no devolvió respuesta para enviar");
          return;
        }

        await this.processor.sendMessage(this.client, {
          to: from,
          body: automationResponse.reply,
        });
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

  private emit(type: ListenerEventType, data: Record<string, unknown>): void {
    for (const subscriber of this.subscribers) {
      subscriber({ type, data });
    }
  }

  private setStatus(status: WhatsappSessionStatus): void {
    this.status = status;
    this.emit("state_change", { status });
  }
}

export const listener = WhatsappListener.getInstance();
