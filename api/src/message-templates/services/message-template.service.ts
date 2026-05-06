import { MessageTemplateDao } from "../daos/message-template.dao.js";
import { MessageTemplate } from "../entities/message-template.entity.js";

type CreatePayload = Omit<MessageTemplate, "id" | "createdAt" | "updatedAt">;
type UpdatePayload = Partial<Omit<MessageTemplate, "id" | "key" | "createdAt" | "updatedAt">>;

const DEFAULT_TEMPLATES: Array<{ key: string; text: string; description: string }> = [
  {
    key: "solicitar_imagen",
    text: "Para ayudarte mejor, ¿podrías enviarme una foto del equipo para poder identificar el modelo?",
    description: "Cuando el cliente no sabe el modelo de su equipo",
  },
  {
    key: "diagnostico_gratuito",
    text: "Con gusto te ayudamos. 😊 Te invitamos a acercarte a nuestro local para un *Diagnóstico Técnico Gratuito*. Nuestros técnicos identificarán el problema sin ningún costo. ¡Te estaremos esperando!",
    description: "Cuando la falla no es de pantalla o el equipo no es accesible",
  },
  {
    key: "cotizacion_pantalla",
    text: "¡Buenas noticias! Tenemos disponible la pantalla para tu *{{marca}} {{modelo}}*:\n\n💰 *Precio total: ${{precio}}*\n_(incluye pieza + mano de obra)_\n\n¿Te interesa agendar la reparación? 😊",
    description: "Envío de cotización de pantalla al cliente",
  },
  {
    key: "cotizacion_aceptada",
    text: "¡Perfecto! 🎉 Puedes acercarte a nuestro local en cualquier momento y preguntar por los técnicos. ¡Te estaremos esperando!",
    description: "El cliente acepta la cotización",
  },
  {
    key: "cotizacion_rechazada",
    text: "Entiendo, ¿me podrías comentar el motivo? Así puedo ver si hay alguna alternativa para ayudarte. 😊",
    description: "El cliente rechaza la cotización",
  },
  {
    key: "garantia_preguntar_nota",
    text: "Claro, con gusto te ayudo con tu garantía. 😊 ¿Me podrías proporcionar tu *número de nota* o número de control de la reparación?",
    description: "Inicio del flujo de garantía, pedir número de nota",
  },
  {
    key: "garantia_en_rango",
    text: "¡Buenas noticias! Tu reparación se encuentra dentro del período de garantía. 🎉 Por favor acércate a nuestro local con tu equipo y con gusto lo revisamos sin costo adicional.",
    description: "La garantía está vigente y en rango",
  },
  {
    key: "garantia_fuera_rango",
    text: "Revisé tu reparación y lamentablemente ya se encuentra fuera del período de garantía. Sin embargo, te invito a acercarte al local para que podamos revisar tu equipo y ver de qué manera te podemos ayudar. 😊",
    description: "La garantía existe pero ya expiró",
  },
  {
    key: "garantia_sin_garantia",
    text: "Tu reparación no cuenta con garantía activa. Sin embargo, no te preocupes, te invitamos a acercarte al local y revisamos de qué manera te podemos ayudar. 😊",
    description: "La reparación no tiene garantía",
  },
  {
    key: "transferencia_humano",
    text: "Un momento por favor, te voy a comunicar con uno de nuestros agentes para que puedan ayudarte de manera más personalizada. ¡Ya te atienden! 😊",
    description: "Transferencia de la conversación a un agente humano",
  },
];

export class MessageTemplateService {
  constructor(private dao: MessageTemplateDao) {}

  async getAll(): Promise<MessageTemplate[]> {
    return this.dao.findAllOrdered();
  }

  async getByKey(key: string): Promise<MessageTemplate | null> {
    return this.dao.findByKey(key);
  }

  async create(data: CreatePayload): Promise<MessageTemplate> {
    return this.dao.create(data as Partial<MessageTemplate>);
  }

  async update(id: string, data: UpdatePayload): Promise<MessageTemplate | null> {
    return this.dao.update(id, data as Partial<MessageTemplate>);
  }

  async delete(id: string): Promise<boolean> {
    return this.dao.delete(id);
  }

  async seed(): Promise<void> {
    for (const tpl of DEFAULT_TEMPLATES) {
      const existing = await this.dao.findByKey(tpl.key);
      if (!existing) {
        await this.dao.create(tpl as Partial<MessageTemplate>);
        console.log(`Template creado: ${tpl.key}`);
      }
    }
  }
}
