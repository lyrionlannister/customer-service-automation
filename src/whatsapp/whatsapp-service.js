import { AUTOMATION } from "../config/constants/automation.js";

class WhatsappProcessor {
  constructor() {}

  sendToAutomation = async (message) => {
    try {
      const response = await fetch(AUTOMATION, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(message),
      });
      if (!response.ok) {
        console.error(
          "No se pudo enviar el mensaje a la automatización:",
          response.statusText,
        );
      }
    } catch (error) {
      console.error("Error al enviar el mensaje a la automatización:", error);
    }
  };
}

export class WhatsappListener {
  constructor(processor) {
    this.processor = processor;
  }
}
