import { AUTOMATION } from "../config/constants/automation.js";
import { Client } from "whatsapp-web.js";
import qrcode from "qrcode-terminal";

export class WhatsappProcessor {
  private static instance: WhatsappProcessor;

  private constructor() {}

  static getInstance(): WhatsappProcessor {
    if (!WhatsappProcessor.instance) {
      WhatsappProcessor.instance = new WhatsappProcessor();
    }

    return WhatsappProcessor.instance;
  }

  async sendToAutomation(message: { from: string; body: string }) {
    try {
      const response = await fetch(AUTOMATION, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(message),
      });

      if (!response.ok) {
        console.error("Error:", response.statusText);
      }
    } catch (error) {
      console.error("Error al enviar:", error);
    }
  }
}

export class WhatsappListener {
  private static instance: WhatsappListener;

  private client: Client;
  private processor: WhatsappProcessor;

  private constructor(processor: WhatsappProcessor) {
    this.processor = processor;
    this.client = new Client({});
  }

  static getInstance(): WhatsappListener {
    if (!WhatsappListener.instance) {
      WhatsappListener.instance = new WhatsappListener(
        WhatsappProcessor.getInstance(),
      );
    }

    return WhatsappListener.instance;
  }

  start() {
    this.client.on("qr", (qr) => {
      qrcode.generate(qr, { small: true });
    });

    this.client.on("ready", () => {
      console.log("🟢 WhatsApp listo");
    });

    this.client.on("message", async (msg) => {
      try {
        const message = {
          from: msg.from,
          body: msg.body,
        };

        await this.processor.sendToAutomation(message);
      } catch (error) {
        console.error("Error procesando mensaje:", error);
      }
    });

    this.client.initialize();
  }
}

export const listener = WhatsappListener.getInstance();
