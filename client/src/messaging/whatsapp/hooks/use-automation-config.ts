import { useCallback, useEffect, useState } from "react";
import { useApiClient } from "@common/hooks/use-api-client";
import useToast from "@common/hooks/use-toast";
import type { AutomationConfig } from "../types/whatsapp.types";
import { getAutomationConfig, patchAutomationUrl } from "../services/whatsapp.service";

export const useAutomationConfig = () => {
  const { apiClient } = useApiClient();
  const { showToast } = useToast();
  const [automationUrl, setAutomationUrl] = useState("");
  const [automationSource, setAutomationSource] = useState<AutomationConfig["source"]>("env");
  const [isSavingAutomation, setIsSavingAutomation] = useState(false);
  const [automationError, setAutomationError] = useState<string | null>(null);

  const loadAutomationConfig = useCallback(async (): Promise<void> => {
    const data = await getAutomationConfig(apiClient);
    if (data) {
      setAutomationUrl(data.automationUrl);
      setAutomationSource(data.source);
    }
  }, [apiClient]);

  useEffect(() => {
    loadAutomationConfig().catch((error) =>
      console.error("Error cargando configuración de automatización", error),
    );
  }, [loadAutomationConfig]);

  const saveAutomationUrl = async (): Promise<void> => {
    try {
      setIsSavingAutomation(true);
      setAutomationError(null);
      const data = await patchAutomationUrl(apiClient, automationUrl.trim());
      setAutomationUrl(data.automationUrl);
      setAutomationSource(data.source);
      showToast({
        variant: "success",
        title: "URL guardada",
        message: "La URL de automatización se actualizó correctamente.",
      });
    } catch (error) {
      console.error("Error guardando URL de automatización", error);
      const message =
        error instanceof Error ? error.message : "Ocurrió un error al guardar la URL.";
      setAutomationError(message);
      showToast({ variant: "error", title: "Error al guardar URL", message });
    } finally {
      setIsSavingAutomation(false);
    }
  };

  return {
    automationUrl,
    setAutomationUrl,
    automationSource,
    isSavingAutomation,
    automationError,
    saveAutomationUrl,
  };
};
