import type { WhatsappStatus } from "../types/whatsapp.types";
import type { BadgeColor } from "../../common/types/interfaces/props/badge-props";

export const STATUS_STYLES: Record<WhatsappStatus, { label: string; color: BadgeColor }> = {
  connecting: { label: "Conectando", color: "light" },
  qr_required: { label: "Requiere vinculación", color: "warning" },
  ready: { label: "Conectado", color: "success" },
  disconnected: { label: "Desconectado", color: "error" },
};
