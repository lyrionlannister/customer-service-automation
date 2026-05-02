import { useEffect, useMemo, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { useApiClient } from "../../common/hooks/use-api-client";
import useToast from "../../common/hooks/use-toast";
import { useModal } from "../../common/hooks/use-modal";
import Button from "@/modules/common/components/ui/button/button";
import Input from "@/modules/common/components/ui/inputs/input";
import Badge from "@/modules/common/components/ui/badge/badge";
import Modal from "@/modules/common/components/ui/modal/modal";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
} from "@/modules/common/components/ui/table/table";

type WhatsappStatus = "connecting" | "qr_required" | "ready" | "disconnected";

const statusStyles: Record<WhatsappStatus, { label: string; color: string }> = {
  connecting: { label: "Conectando", color: "secondary" },
  qr_required: { label: "Requiere vinculación", color: "warning" },
  ready: { label: "Conectado", color: "success" },
  disconnected: { label: "Desconectado", color: "danger" },
};

type QrResponse = {
  qr: string | null;
  expiresAt?: string;
};

type ExcludedPhone = {
  phone: string;
  createdAt: string;
};

type WhatsappSettings = {
  aiRepliesEnabled: boolean;
};

type AutomationConfig = {
  automationUrl: string;
  source: "db" | "env";
};

type N8nIntegrationConfig = {
  n8nEditorUrl: string;
  source: "db" | "env";
};

const WhatsAppAdminPage: React.FC = () => {
  const { apiClient } = useApiClient();
  const { showToast } = useToast();
  const { isOpen: isQrModalOpen, openModal: openQrModal, closeModal: closeQrModal } =
    useModal(false);
  const [status, setStatus] = useState<WhatsappStatus>("disconnected");
  const [qrData, setQrData] = useState<QrResponse>({ qr: null });
  const [isLoadingQr, setIsLoadingQr] = useState(false);
  const [qrError, setQrError] = useState<string | null>(null);
  const [exclusions, setExclusions] = useState<ExcludedPhone[]>([]);
  const [newPhone, setNewPhone] = useState("");
  const [aiRepliesEnabled, setAiRepliesEnabled] = useState(true);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [automationUrl, setAutomationUrl] = useState("");
  const [automationSource, setAutomationSource] = useState<"db" | "env">("env");
  const [isSavingAutomation, setIsSavingAutomation] = useState(false);
  const [automationError, setAutomationError] = useState<string | null>(null);
  const [n8nEditorUrl, setN8nEditorUrl] = useState("");
  const [n8nEditorSource, setN8nEditorSource] = useState<"db" | "env">("env");
  const [isSavingN8nEditorUrl, setIsSavingN8nEditorUrl] = useState(false);
  const [n8nEditorError, setN8nEditorError] = useState<string | null>(null);
  const [isClosingWhatsappSession, setIsClosingWhatsappSession] =
    useState(false);

  const parseErrorMessage = async (
    response: Response,
    fallbackMessage: string,
  ): Promise<string> => {
    try {
      const payload = (await response.json()) as { error?: string };
      return payload?.error || fallbackMessage;
    } catch {
      return fallbackMessage;
    }
  };

  const fetchQr = async (): Promise<void> => {
    try {
      setIsLoadingQr(true);
      setQrError(null);

      const qrRes = await apiClient("/whatsapp/qr");

      if (!qrRes.ok) {
        setQrError("No se pudo obtener el QR. Intenta nuevamente.");
        return;
      }

      const qrPayload = (await qrRes.json()) as QrResponse;
      setQrData(qrPayload);
      if (qrPayload.qr) {
        openQrModal();
      }
    } catch (error) {
      console.error("Error solicitando QR de WhatsApp", error);
      setQrError("Ocurrió un error al solicitar el QR.");
    } finally {
      setIsLoadingQr(false);
    }
  };

  const fetchExclusions = async (): Promise<void> => {
    const response = await apiClient("/whatsapp/exclusions");
    if (!response.ok) return;

    const payload = (await response.json()) as ExcludedPhone[];
    setExclusions(payload);
  };

  const fetchSettings = async (): Promise<void> => {
    const response = await apiClient("/whatsapp/settings");
    if (!response.ok) return;

    const payload = (await response.json()) as WhatsappSettings;
    setAiRepliesEnabled(payload.aiRepliesEnabled);
  };

  const fetchAutomationConfig = async (): Promise<void> => {
    const response = await apiClient("/automation/config");
    if (!response.ok) return;

    const payload = (await response.json()) as AutomationConfig;
    setAutomationUrl(payload.automationUrl);
    setAutomationSource(payload.source);
  };

  const getN8nEditorUrlValidationError = (rawValue: string): string | null => {
    const value = rawValue.trim();
    if (!value) return "La URL del editor de n8n es obligatoria.";

    try {
      const parsed = new URL(value);
      const isProd = import.meta.env.PROD;
      if (isProd && parsed.protocol !== "https:") {
        return "En producción, la URL del editor debe usar HTTPS.";
      }

      if (!isProd && parsed.protocol === "http:") {
        const isLocalhost = ["localhost", "127.0.0.1", "::1"].includes(parsed.hostname);
        if (!isLocalhost) {
          return "En desarrollo, HTTP solo se permite para localhost.";
        }
      }

      if (!["http:", "https:"].includes(parsed.protocol)) {
        return "La URL del editor debe usar HTTP o HTTPS.";
      }

      return null;
    } catch {
      return "La URL del editor debe ser una URL absoluta válida.";
    }
  };

  const fetchN8nEditorConfig = async (): Promise<void> => {
    const response = await apiClient("/integrations/n8n");
    if (!response.ok) return;

    const payload = (await response.json()) as N8nIntegrationConfig;
    setN8nEditorUrl(payload.n8nEditorUrl);
    setN8nEditorSource(payload.source);
  };

  const saveN8nEditorUrl = async (): Promise<void> => {
    const validationError = getN8nEditorUrlValidationError(n8nEditorUrl);
    if (validationError) {
      setN8nEditorError(validationError);
      return;
    }

    try {
      setIsSavingN8nEditorUrl(true);
      setN8nEditorError(null);

      const response = await apiClient("/integrations/n8n", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ n8nEditorUrl: n8nEditorUrl.trim() }),
      });

      if (!response.ok) {
        const message = await parseErrorMessage(response, "No se pudo guardar la URL del editor");
        setN8nEditorError(message);
        return;
      }

      const payload = (await response.json()) as N8nIntegrationConfig;
      setN8nEditorUrl(payload.n8nEditorUrl);
      setN8nEditorSource(payload.source);
    } finally {
      setIsSavingN8nEditorUrl(false);
    }
  };

  const saveAutomationUrl = async (): Promise<void> => {
    try {
      setIsSavingAutomation(true);
      setAutomationError(null);

      const response = await apiClient("/automation/config", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ automationUrl: automationUrl.trim() }),
      });

      if (!response.ok) {
        const message = await parseErrorMessage(response, "No se pudo guardar la URL");
        setAutomationError(message);
        showToast({
          variant: "error",
          title: "Error al guardar URL",
          message,
        });
        return;
      }

      const payload = (await response.json()) as AutomationConfig;
      setAutomationUrl(payload.automationUrl);
      setAutomationSource(payload.source);
      showToast({
        variant: "success",
        title: "URL guardada",
        message: "La URL de automatización se actualizó correctamente.",
      });
    } catch (error) {
      console.error("Error guardando URL de automatización", error);
      setAutomationError("Ocurrió un error al guardar la URL");
      showToast({
        variant: "error",
        title: "Error al guardar URL",
        message: "Ocurrió un error al guardar la URL.",
      });
    } finally {
      setIsSavingAutomation(false);
    }
  };

  const updateAiRepliesEnabled = async (nextValue: boolean): Promise<void> => {
    try {
      setIsSavingSettings(true);
      const response = await apiClient("/whatsapp/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ aiRepliesEnabled: nextValue }),
      });

      if (!response.ok) {
        const message = await parseErrorMessage(
          response,
          "No se pudo actualizar la configuración de IA",
        );
        showToast({
          variant: "error",
          title: "No se pudo actualizar IA",
          message,
        });
        return;
      }

      const payload = (await response.json()) as WhatsappSettings;
      setAiRepliesEnabled(payload.aiRepliesEnabled);
      showToast({
        variant: "success",
        title: payload.aiRepliesEnabled ? "IA activada" : "IA desactivada",
      });
    } catch (error) {
      console.error("Error actualizando configuración de IA", error);
      showToast({
        variant: "error",
        title: "No se pudo actualizar IA",
        message: "Ocurrió un error al actualizar la configuración.",
      });
    } finally {
      setIsSavingSettings(false);
    }
  };

  const createExclusion = async (): Promise<void> => {
    try {
      const response = await apiClient("/whatsapp/exclusions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: newPhone }),
      });

      if (!response.ok) {
        const message = await parseErrorMessage(response, "No se pudo excluir el teléfono");
        showToast({
          variant: "error",
          title: "No se pudo guardar",
          message,
        });
        return;
      }

      setNewPhone("");
      await fetchExclusions();
      showToast({
        variant: "success",
        title: "Teléfono excluido",
        message: "El número se agregó a la lista de exclusión.",
      });
    } catch (error) {
      console.error("Error guardando teléfono excluido", error);
      showToast({
        variant: "error",
        title: "No se pudo guardar",
        message: "Ocurrió un error al guardar el teléfono excluido.",
      });
    }
  };

  const deleteExclusion = async (phone: string): Promise<void> => {
    try {
      const encodedPhone = encodeURIComponent(phone);
      const response = await apiClient(`/whatsapp/exclusions/${encodedPhone}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const message = await parseErrorMessage(response, "No se pudo eliminar el teléfono");
        showToast({
          variant: "error",
          title: "No se pudo eliminar",
          message,
        });
        return;
      }

      await fetchExclusions();
      showToast({
        variant: "success",
        title: "Teléfono eliminado",
      });
    } catch (error) {
      console.error("Error eliminando teléfono excluido", error);
      showToast({
        variant: "error",
        title: "No se pudo eliminar",
        message: "Ocurrió un error al eliminar el teléfono excluido.",
      });
    }
  };

  const closeWhatsappSession = async (): Promise<void> => {
    try {
      setIsClosingWhatsappSession(true);

      const response = await apiClient("/whatsapp/session/logout", {
        method: "POST",
      });

      if (!response.ok) {
        const message = await parseErrorMessage(
          response,
          "No se pudo cerrar la sesión de WhatsApp",
        );
        showToast({
          variant: "error",
          title: "No se pudo cerrar sesión",
          message,
        });
        return;
      }

      const payload = (await response.json()) as { status?: WhatsappStatus };
      if (payload.status) {
        setStatus(payload.status);
      } else {
        setStatus("disconnected");
      }

      setQrData({ qr: null });
      closeQrModal();
      showToast({
        variant: "success",
        title: "Sesión de WhatsApp cerrada",
        message: "Se reinició la sesión. Solicita un QR para volver a vincular.",
      });
    } catch (error) {
      console.error("Error cerrando sesión de WhatsApp", error);
      showToast({
        variant: "error",
        title: "No se pudo cerrar sesión",
        message: "Ocurrió un error al cerrar la sesión de WhatsApp.",
      });
    } finally {
      setIsClosingWhatsappSession(false);
    }
  };

  const formattedExpiration = useMemo(() => {
    if (!qrData.expiresAt) return null;
    return new Date(qrData.expiresAt).toLocaleString();
  }, [qrData.expiresAt]);

  useEffect(() => {
    const load = async () => {
      const statusRes = await apiClient("/whatsapp/status");

      if (statusRes.ok) {
        const statusPayload = (await statusRes.json()) as {
          status: WhatsappStatus;
        };
        setStatus(statusPayload.status);
      }

      await fetchExclusions();
      await fetchSettings();
      await fetchAutomationConfig();
      await fetchN8nEditorConfig();
    };

    load().catch((error) =>
      console.error("Error cargando estado de WhatsApp", error),
    );

    const baseUrl = import.meta.env.VITE_API_BASE_URL as string;
    const eventsUrl = `${baseUrl}/whatsapp/events`;
    const eventSource = new EventSource(eventsUrl);

    eventSource.addEventListener("state_change", (event) => {
      const payload = JSON.parse(event.data) as {
        status?: WhatsappStatus;
        state?: string;
      };
      const nextStatus =
        payload.status ?? (payload.state as WhatsappStatus | undefined);
      if (nextStatus) setStatus(nextStatus);
    });

    eventSource.addEventListener("qr", (event) => {
      const payload = JSON.parse(event.data) as QrResponse;
      setQrData(payload);
      setStatus("qr_required");
      if (payload.qr) {
        openQrModal();
      }
    });

    eventSource.addEventListener("ready", () => {
      setStatus("ready");
      setQrData({ qr: null });
      closeQrModal();
    });

    eventSource.addEventListener("disconnected", () => {
      setStatus("disconnected");
      setQrData({ qr: null });
      closeQrModal();
    });

    eventSource.addEventListener("ai_replies_setting", (event) => {
      const payload = JSON.parse(event.data) as WhatsappSettings;
      if (typeof payload.aiRepliesEnabled === "boolean") {
        setAiRepliesEnabled(payload.aiRepliesEnabled);
      }
    });

    return () => {
      eventSource.close();
    };
  }, [apiClient, closeQrModal, openQrModal]);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-soft dark:border-gray-700 dark:bg-gray-950">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-brand-600 dark:text-brand-400">
              WhatsApp
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Controla la conexión, las respuestas automáticas y los contactos excluidos.
            </p>
          </div>
          <Badge color={statusStyles[status].color} variant="solid" size="lg">
            {statusStyles[status].label}
          </Badge>
        </div>
      </div>

      <div className="grid items-start gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="space-y-5 rounded-3xl border border-gray-200 bg-white p-6 shadow-soft dark:border-gray-700 dark:bg-gray-950">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-lg font-semibold text-brand-600 dark:text-brand-400">
                Respuestas automáticas
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500">
                Activa o desactiva las respuestas automáticas con inteligencia artificial.
              </p>
            </div>
            <Button
              variant={aiRepliesEnabled ? "success" : "secondary"}
              size="md"
              onClick={() => updateAiRepliesEnabled(!aiRepliesEnabled)}
              disabled={isSavingSettings}
            >
              {aiRepliesEnabled ? "Desactivar respuestas" : "Activar respuestas"}
            </Button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Respuestas automáticas
              </p>
              <p className="mt-2 text-xl font-semibold">
                {aiRepliesEnabled ? "Activadas" : "Desactivadas"}
              </p>
            </div>
            <div className="rounded-3xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Estado de conexión
              </p>
              <p className="mt-2 text-xl font-semibold">
                {statusStyles[status].label}
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-soft dark:border-gray-700 dark:bg-gray-950">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-lg font-semibold text-brand-600 dark:text-brand-400">
                Vincular dispositivo
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500">
                Escanea el código con tu teléfono para conectar WhatsApp.
              </p>
            </div>
            {status === "ready" ? (
              <Button
                variant="danger"
                size="md"
                className="min-w-40"
                onClick={closeWhatsappSession}
                disabled={isClosingWhatsappSession}
              >
                {isClosingWhatsappSession ? "Desconectando..." : "Desconectar dispositivo"}
              </Button>
            ) : (
              <Button
                variant="primary"
                size="md"
                className="min-w-35"
                onClick={fetchQr}
                disabled={isLoadingQr}
              >
                {isLoadingQr ? "Generando..." : "Generar código QR"}
              </Button>
            )}
          </div>

          {qrError ? (
            <div className="mt-4 rounded-3xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300">
              {qrError}
            </div>
          ) : null}

          <p className="pt-4 text-sm text-gray-500 dark:text-gray-400">
            {qrData.qr
              ? "Código listo. Ábrelo para escanearlo con tu teléfono."
              : "No hay código disponible. Genera uno para vincular tu dispositivo."}
          </p>
          {formattedExpiration ? (
            <p className="pt-1 text-sm text-gray-500 dark:text-gray-400">
              Expira el {formattedExpiration}
            </p>
          ) : null}
        </section>
      </div>

      <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-soft dark:border-gray-700 dark:bg-gray-950">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-lg font-semibold text-brand-600 dark:text-brand-400">
              Servicio de automatización
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Configura el enlace del servicio encargado de procesar y enviar mensajes automáticos.
            </p>
          </div>
          <Badge
            color={automationSource === "db" ? "success" : "secondary"}
            size="sm"
          >
            {automationSource === "db" ? "Personalizada" : "Por defecto"}
          </Badge>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-[1.8fr_0.8fr]">
          <Input
            placeholder="https://mi-n8n.example.com/webhook/customer-service"
            value={automationUrl}
            onChange={(event) => setAutomationUrl(event.target.value)}
            className="w-full"
          />
          <Button
            onClick={saveAutomationUrl}
            disabled={!automationUrl.trim() || isSavingAutomation}
          >
            {isSavingAutomation ? "Guardando..." : "Guardar"}
          </Button>
        </div>

        {automationError ? (
          <p className="mt-3 text-sm text-red-600 dark:text-red-400">
            {automationError}
          </p>
        ) : null}
      </section>

      <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-soft dark:border-gray-700 dark:bg-gray-950">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-lg font-semibold text-brand-600 dark:text-brand-400">Editor de n8n</p>
          </div>
          <Badge color={n8nEditorSource === "db" ? "success" : "secondary"} size="sm">
            {n8nEditorSource === "db" ? "Personalizada" : "Por defecto"}
          </Badge>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-[1.8fr_0.8fr_0.8fr]">
          <Input
            placeholder="https://mi-n8n.example.com"
            value={n8nEditorUrl}
            onChange={(event) => setN8nEditorUrl(event.target.value)}
            className="w-full"
          />
          <Button onClick={saveN8nEditorUrl} disabled={!!getN8nEditorUrlValidationError(n8nEditorUrl) || isSavingN8nEditorUrl}>
            {isSavingN8nEditorUrl ? "Guardando..." : "Guardar"}
          </Button>
          <Button
            variant="secondary"
            onClick={() => window.open(n8nEditorUrl, "_blank", "noopener,noreferrer")}
            disabled={!!getN8nEditorUrlValidationError(n8nEditorUrl)}
          >
            Abrir n8n
          </Button>
        </div>

        {n8nEditorError ? (
          <p className="mt-3 text-sm text-red-600 dark:text-red-400">{n8nEditorError}</p>
        ) : null}
      </section>

      <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-soft dark:border-gray-700 dark:bg-gray-950">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-lg font-semibold text-brand-600 dark:text-brand-400">
              Teléfonos excluidos
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Estos números no recibirán respuestas automáticas.
            </p>
          </div>
          <div className="flex w-full gap-3 sm:w-auto">
            <Input
              placeholder="Ej: +54 11 1234 5678"
              value={newPhone}
              onChange={(event) => setNewPhone(event.target.value)}
              className="max-w-[320px]"
            />
            <Button onClick={createExclusion} disabled={!newPhone.trim()}>
              Agregar
            </Button>
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl border border-gray-200 dark:border-gray-700">
          <Table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <TableHeader className="bg-gray-50 dark:bg-gray-900">
              <TableRow>
                <TableCell
                  isHeader
                  className="px-5 py-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400"
                >
                  Teléfono
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400"
                >
                  Agregado el
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400"
                >
                  Acciones
                </TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="bg-white dark:bg-gray-950">
              {exclusions.length === 0 ? (
                <TableRow>
                  <TableCell
                    className="px-5 py-6 text-sm text-gray-500 dark:text-gray-400"
                    colSpan={3}
                  >
                    No hay números excluidos aún.
                  </TableCell>
                </TableRow>
              ) : (
                exclusions.map((exclusion) => (
                  <TableRow
                    key={exclusion.phone}
                    className="border-t border-gray-200 dark:border-gray-800"
                  >
                    <TableCell className="px-5 py-4 text-sm text-gray-900 dark:text-white">
                      {exclusion.phone}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {new Date(exclusion.createdAt).toLocaleString()}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-sm">
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => deleteExclusion(exclusion.phone)}
                      >
                        Eliminar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </section>

      <Modal
        isOpen={isQrModalOpen && Boolean(qrData.qr)}
        onClose={closeQrModal}
        className="mx-4 max-w-120 p-6"
      >
        <div className="space-y-4">
          <div>
            <p className="text-lg font-semibold text-brand-600 dark:text-brand-400">
              Vincular WhatsApp
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Abre WhatsApp en tu teléfono y escanea el código para conectarte.
            </p>
          </div>

          {qrData.qr ? (
            <div className="space-y-3">
              <div className="rounded-2xl bg-gray-950 p-3 text-center text-sm text-white/80">
                Ve a Dispositivos vinculados en tu WhatsApp y escanea el código.
              </div>

              <div className="rounded-3xl border border-gray-200 bg-gray-50 p-3 shadow-sm dark:border-gray-700 dark:bg-gray-800/40">
                <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-[0_8px_24px_-12px_rgba(16,24,40,0.35)] dark:border-gray-600">
                  <div className="flex justify-center rounded-xl border border-gray-100 bg-white p-2">
                    <QRCodeSVG value={qrData.qr} size={320} />
                  </div>
                </div>
              </div>

              {formattedExpiration ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Expira el {formattedExpiration}
                </p>
              ) : null}
            </div>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No hay QR disponible en este momento.
            </p>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default WhatsAppAdminPage;
