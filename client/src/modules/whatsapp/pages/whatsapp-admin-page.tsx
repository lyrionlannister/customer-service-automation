import { useEffect, useMemo, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { useApiClient } from "../../common/hooks/use-api-client";
import useToast from "../../common/hooks/use-toast";
import Button from "@/modules/common/components/ui/button/button";
import Input from "@/modules/common/components/ui/inputs/input";
import Badge from "@/modules/common/components/ui/badge/badge";
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
  qr_required: { label: "QR requerido", color: "warning" },
  ready: { label: "Listo", color: "success" },
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

const WhatsAppAdminPage: React.FC = () => {
  const { apiClient } = useApiClient();
  const { showToast } = useToast();
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
    });

    eventSource.addEventListener("ready", () => {
      setStatus("ready");
      setQrData({ qr: null });
    });

    eventSource.addEventListener("disconnected", () => {
      setStatus("disconnected");
      setQrData({ qr: null });
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
  }, [apiClient]);

  return (
    <div className="mx-auto max-w-6xl p-6 space-y-6">
      <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-soft dark:border-gray-700 dark:bg-gray-950">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-brand-600 dark:text-brand-400">
              WhatsApp Admin
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Gestiona la conexión de WhatsApp, el QR y los teléfonos excluidos.
            </p>
          </div>
          <Badge color={statusStyles[status].color} variant="solid" size="lg">
            {statusStyles[status].label}
          </Badge>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="space-y-5 rounded-3xl border border-gray-200 bg-white p-6 shadow-soft dark:border-gray-700 dark:bg-gray-950">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-lg font-semibold text-brand-600 dark:text-brand-400">
                Respuestas automáticas
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500">
                Controla el uso de IA para responder mensajes entrantes.
              </p>
            </div>
            <Button
              variant={aiRepliesEnabled ? "success" : "secondary"}
              size="md"
              onClick={() => updateAiRepliesEnabled(!aiRepliesEnabled)}
              disabled={isSavingSettings}
            >
              {aiRepliesEnabled ? "Desactivar IA" : "Activar IA"}
            </Button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Estado de IA
              </p>
              <p className="mt-2 text-xl font-semibold">
                {aiRepliesEnabled ? "Activo" : "Silenciado"}
              </p>
            </div>
            <div className="rounded-3xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Último estado
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
                Autenticación QR
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500">
                Genera un nuevo QR para vincular la sesión de WhatsApp.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="danger"
                size="md"
                className="min-w-[160px]"
                onClick={closeWhatsappSession}
                disabled={isClosingWhatsappSession}
              >
                {isClosingWhatsappSession ? "Cerrando..." : "Cerrar sesión WA"}
              </Button>
              <Button
                variant={status === "ready" ? "success" : "primary"}
                size="md"
                className="min-w-[140px]"
                onClick={fetchQr}
                disabled={isLoadingQr || status === "ready"}
              >
                {status === "ready"
                  ? "Sesión Iniciada"
                  : isLoadingQr
                    ? "Solicitando..."
                    : "Solicitar QR"}
              </Button>
            </div>
          </div>

          {qrError ? (
            <div className="mt-4 rounded-3xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300">
              {qrError}
            </div>
          ) : null}

          {qrData.qr ? (
            <div className="space-y-4 pt-4">
              <div className="rounded-3xl bg-gray-950 p-4 text-center text-sm text-white/80">
                Escanea este QR desde tu app de WhatsApp Web.
              </div>
              <div className="flex justify-center rounded-3xl bg-white p-6 shadow-sm dark:bg-gray-900">
                <QRCodeSVG value={qrData.qr} size={240} />
              </div>
              {formattedExpiration ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Expira el {formattedExpiration}
                </p>
              ) : null}
            </div>
          ) : (
            <p className="pt-4 text-sm text-gray-500 dark:text-gray-400">
              No hay QR disponible en este momento.
            </p>
          )}
        </section>
      </div>

      <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-soft dark:border-gray-700 dark:bg-gray-950">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-lg font-semibold text-brand-600 dark:text-brand-400">
              URL de automatización
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Guarda la URL que el backend usará para enviar mensajes a n8n.
            </p>
          </div>
          <Badge
            color={automationSource === "db" ? "success" : "secondary"}
            size="sm"
          >
            {automationSource === "db" ? "Guardada en DB" : "Valor por entorno"}
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
            {isSavingAutomation ? "Guardando..." : "Guardar URL"}
          </Button>
        </div>

        {automationError ? (
          <p className="mt-3 text-sm text-red-600 dark:text-red-400">
            {automationError}
          </p>
        ) : null}
      </section>

      <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-soft dark:border-gray-700 dark:bg-gray-950">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-lg font-semibold text-brand-600 dark:text-brand-400">
              Teléfonos excluidos
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Agrega números que no deben recibir respuestas automáticas.
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
                  Creado
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
                    Sin teléfonos excluidos.
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
    </div>
  );
};

export default WhatsAppAdminPage;
