import type {
  AutomationConfig,
  ExcludedPhone,
  QrResponse,
  WhatsappSettings,
  WhatsappStatus,
} from "../types/whatsapp.types";
import { parseErrorMessage } from "../utils/whatsapp.utils";

type ApiClient = (endpoint: string, options?: RequestInit) => Promise<Response>;

export const getWhatsappStatus = async (apiClient: ApiClient): Promise<WhatsappStatus | null> => {
  const response = await apiClient("/whatsapp/status");
  if (!response.ok) return null;
  const payload = (await response.json()) as { status: WhatsappStatus };
  return payload.status;
};

export const getQr = async (apiClient: ApiClient): Promise<QrResponse> => {
  const response = await apiClient("/whatsapp/qr");
  if (!response.ok) throw new Error("No se pudo obtener el QR. Intenta nuevamente.");
  return (await response.json()) as QrResponse;
};

export const getExclusions = async (apiClient: ApiClient): Promise<ExcludedPhone[]> => {
  const response = await apiClient("/whatsapp/exclusions");
  if (!response.ok) return [];
  return (await response.json()) as ExcludedPhone[];
};

export const getSettings = async (apiClient: ApiClient): Promise<WhatsappSettings | null> => {
  const response = await apiClient("/whatsapp/settings");
  if (!response.ok) return null;
  return (await response.json()) as WhatsappSettings;
};

export const getAutomationConfig = async (
  apiClient: ApiClient,
): Promise<AutomationConfig | null> => {
  const response = await apiClient("/automation/config");
  if (!response.ok) return null;
  return (await response.json()) as AutomationConfig;
};

export const patchAutomationUrl = async (
  apiClient: ApiClient,
  url: string,
): Promise<AutomationConfig> => {
  const response = await apiClient("/automation/config", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ automationUrl: url }),
  });
  if (!response.ok) {
    const message = await parseErrorMessage(response, "No se pudo guardar la URL");
    throw new Error(message);
  }
  return (await response.json()) as AutomationConfig;
};

export const patchAiRepliesEnabled = async (
  apiClient: ApiClient,
  enabled: boolean,
): Promise<WhatsappSettings> => {
  const response = await apiClient("/whatsapp/settings", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ aiRepliesEnabled: enabled }),
  });
  if (!response.ok) {
    const message = await parseErrorMessage(
      response,
      "No se pudo actualizar la configuración de IA",
    );
    throw new Error(message);
  }
  return (await response.json()) as WhatsappSettings;
};

export const postExclusion = async (apiClient: ApiClient, phone: string): Promise<void> => {
  const response = await apiClient("/whatsapp/exclusions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone }),
  });
  if (!response.ok) {
    const message = await parseErrorMessage(response, "No se pudo excluir el teléfono");
    throw new Error(message);
  }
};

export const removeExclusion = async (apiClient: ApiClient, phone: string): Promise<void> => {
  const response = await apiClient(`/whatsapp/exclusions/${encodeURIComponent(phone)}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    const message = await parseErrorMessage(response, "No se pudo eliminar el teléfono");
    throw new Error(message);
  }
};

export const postLogoutSession = async (
  apiClient: ApiClient,
): Promise<{ status?: WhatsappStatus }> => {
  const response = await apiClient("/whatsapp/session/logout", { method: "POST" });
  if (!response.ok) {
    const message = await parseErrorMessage(
      response,
      "No se pudo cerrar la sesión de WhatsApp",
    );
    throw new Error(message);
  }
  return (await response.json()) as { status?: WhatsappStatus };
};
