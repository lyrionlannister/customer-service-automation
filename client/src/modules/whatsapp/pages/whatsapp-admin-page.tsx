import { useEffect, useMemo, useState } from "react";
import { useApiClient } from "@common/hooks/use-api-client";
import Button from "@ui/button/button";
import Input from "@ui/inputs/input";
import Badge from "@ui/badge/badge";
import { useWhatsappSession } from "../hooks/use-whatsapp-session";
import { useWhatsappEvents } from "../hooks/use-whatsapp-events";
import { useWhatsappSettings } from "../hooks/use-whatsapp-settings";
import { useAutomationConfig } from "../hooks/use-automation-config";
import { useExcludedPhones } from "../hooks/use-excluded-phones";
import WhatsappHeader from "../components/whatsapp-header";
import WhatsappAiReplies from "../components/whatsapp-ai-replies";
import WhatsappLinkDevice from "../components/whatsapp-link-device";
import WhatsappAutomation from "../components/whatsapp-automation";
import WhatsappExcludedPhones from "../components/whatsapp-excluded-phones";
import WhatsappQrModal from "../components/whatsapp-qr-modal";

type N8nIntegrationConfig = { n8nEditorUrl: string; source: "db" | "env" };

const WhatsAppAdminPage: React.FC = () => {
  const { apiClient } = useApiClient();
  const {
    status,
    setStatus,
    qrData,
    setQrData,
    isQrModalOpen,
    openQrModal,
    closeQrModal,
    isLoadingQr,
    qrError,
    isClosingSession,
    fetchQr,
    closeSession,
  } = useWhatsappSession();

  const {
    setAiRepliesEnabled,
    aiRepliesEnabled,
    isSavingSettings,
    toggleAiReplies,
  } = useWhatsappSettings();

  const {
    automationUrl,
    setAutomationUrl,
    automationSource,
    isSavingAutomation,
    automationError,
    saveAutomationUrl,
  } = useAutomationConfig();

  const [n8nEditorUrl, setN8nEditorUrl] = useState("");
  const [n8nEditorSource, setN8nEditorSource] = useState<"db" | "env">("env");
  const [isSavingN8nEditorUrl, setIsSavingN8nEditorUrl] = useState(false);
  const [n8nEditorError, setN8nEditorError] = useState<string | null>(null);

  const {
    exclusions,
    newPhone,
    setNewPhone,
    createExclusion,
    deleteExclusion,
  } = useExcludedPhones();

  useWhatsappEvents({
    onStatusChange: setStatus,
    onQr: (data) => {
      setQrData(data);
    },
    onReady: () => {
      setStatus("ready");
      setQrData({ qr: null });
      closeQrModal();
    },
    onDisconnected: () => {
      setStatus("disconnected");
      setQrData({ qr: null });
      closeQrModal();
    },
    onAiRepliesSetting: (s) => setAiRepliesEnabled(s.aiRepliesEnabled),
  });

  useEffect(() => {
    const loadN8nEditorConfig = async (): Promise<void> => {
      const response = await apiClient("/integrations/n8n");
      if (!response.ok) return;
      const payload = (await response.json()) as N8nIntegrationConfig;
      setN8nEditorUrl(payload.n8nEditorUrl);
      setN8nEditorSource(payload.source);
    };

    loadN8nEditorConfig().catch((error) =>
      console.error("Error cargando configuración de n8n", error),
    );
  }, [apiClient]);

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
        const isLocalhost = ["localhost", "127.0.0.1", "::1"].includes(
          parsed.hostname,
        );
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
        const payload = (await response.json()) as { error?: string };
        setN8nEditorError(
          payload.error ?? "No se pudo guardar la URL del editor",
        );
        return;
      }

      const payload = (await response.json()) as N8nIntegrationConfig;
      setN8nEditorUrl(payload.n8nEditorUrl);
      setN8nEditorSource(payload.source);
    } finally {
      setIsSavingN8nEditorUrl(false);
    }
  };

  const formattedExpiration = useMemo(() => {
    if (!qrData.expiresAt) return null;
    return new Date(qrData.expiresAt).toLocaleString();
  }, [qrData.expiresAt]);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <WhatsappHeader status={status} />

      <div className="grid items-start gap-6 xl:grid-cols-2">
        <WhatsappAiReplies
          status={status}
          aiRepliesEnabled={aiRepliesEnabled}
          isSavingSettings={isSavingSettings}
          onToggle={toggleAiReplies}
        />
        <WhatsappLinkDevice
          status={status}
          qrData={qrData}
          isLoadingQr={isLoadingQr}
          isClosingSession={isClosingSession}
          qrError={qrError}
          formattedExpiration={formattedExpiration}
          onFetchQr={fetchQr}
          onCloseSession={closeSession}
        />
      </div>

      <WhatsappAutomation
        automationUrl={automationUrl}
        automationSource={automationSource}
        isSavingAutomation={isSavingAutomation}
        automationError={automationError}
        onUrlChange={setAutomationUrl}
        onSave={saveAutomationUrl}
      />

      <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-soft dark:border-gray-700 dark:bg-gray-950">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-lg font-semibold text-brand-600 dark:text-brand-400">
              Editor de n8n
            </p>
          </div>
          <Badge
            color={n8nEditorSource === "db" ? "success" : "secondary"}
            size="sm"
          >
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
          <Button
            onClick={saveN8nEditorUrl}
            disabled={
              !!getN8nEditorUrlValidationError(n8nEditorUrl) ||
              isSavingN8nEditorUrl
            }
          >
            {isSavingN8nEditorUrl ? "Guardando..." : "Guardar"}
          </Button>
          <Button
            variant="secondary"
            onClick={() =>
              window.open(n8nEditorUrl, "_blank", "noopener,noreferrer")
            }
            disabled={!!getN8nEditorUrlValidationError(n8nEditorUrl)}
          >
            Abrir n8n
          </Button>
        </div>

        {n8nEditorError ? (
          <p className="mt-3 text-sm text-red-600 dark:text-red-400">
            {n8nEditorError}
          </p>
        ) : null}
      </section>

      <WhatsappExcludedPhones
        exclusions={exclusions}
        newPhone={newPhone}
        onNewPhoneChange={setNewPhone}
        onCreateExclusion={createExclusion}
        onDeleteExclusion={deleteExclusion}
      />

      <WhatsappQrModal
        isOpen={isQrModalOpen}
        qrData={qrData}
        formattedExpiration={formattedExpiration}
        onClose={closeQrModal}
      />
    </div>
  );
};

export default WhatsAppAdminPage;
