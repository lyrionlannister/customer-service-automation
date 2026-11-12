import { useCallback, useEffect, useState } from "react";
import { useApiClient } from "@common/hooks/use-api-client";
import useToast from "@common/hooks/use-toast";
import { getSettings, patchAiRepliesEnabled } from "../services/whatsapp.service";

export const useWhatsappSettings = () => {
  const { apiClient } = useApiClient();
  const { showToast } = useToast();
  const [aiRepliesEnabled, setAiRepliesEnabled] = useState(true);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  const loadSettings = useCallback(async (): Promise<void> => {
    const data = await getSettings(apiClient);
    if (data) setAiRepliesEnabled(data.aiRepliesEnabled);
  }, [apiClient]);

  useEffect(() => {
    loadSettings().catch((error) =>
      console.error("Error cargando configuración de IA", error),
    );
  }, [loadSettings]);

  const toggleAiReplies = async (): Promise<void> => {
    try {
      setIsSavingSettings(true);
      const data = await patchAiRepliesEnabled(apiClient, !aiRepliesEnabled);
      setAiRepliesEnabled(data.aiRepliesEnabled);
      showToast({
        variant: "success",
        title: data.aiRepliesEnabled ? "IA activada" : "IA desactivada",
      });
    } catch (error) {
      console.error("Error actualizando configuración de IA", error);
      showToast({
        variant: "error",
        title: "No se pudo actualizar IA",
        message:
          error instanceof Error
            ? error.message
            : "Ocurrió un error al actualizar la configuración.",
      });
    } finally {
      setIsSavingSettings(false);
    }
  };

  return {
    aiRepliesEnabled,
    setAiRepliesEnabled,
    isSavingSettings,
    toggleAiReplies,
  };
};
