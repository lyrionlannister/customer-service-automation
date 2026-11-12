import { useEffect, useRef } from "react";
import { useApiClient } from "@common/hooks/use-api-client";
import { authenticatedEventSourceUrl } from "@common/utils/auth-header";
import type { QrResponse, WhatsappSettings, WhatsappStatus } from "../types/whatsapp.types";
import { getWhatsappStatus } from "../services/whatsapp.service";

type EventCallbacks = {
  onStatusChange: (status: WhatsappStatus) => void;
  onQr: (data: QrResponse) => void;
  onReady: () => void;
  onDisconnected: () => void;
  onAiRepliesSetting: (settings: WhatsappSettings) => void;
};

export const useWhatsappEvents = (callbacks: EventCallbacks) => {
  const { apiClient } = useApiClient();
  const callbacksRef = useRef(callbacks);
  callbacksRef.current = callbacks;

  useEffect(() => {
    getWhatsappStatus(apiClient)
      .then((status) => {
        if (status) callbacksRef.current.onStatusChange(status);
      })
      .catch((error) => console.error("Error cargando estado de WhatsApp", error));

    const baseUrl = import.meta.env.VITE_API_BASE_URL as string;
    const eventSource = new EventSource(authenticatedEventSourceUrl(`${baseUrl}/whatsapp/events`));

    eventSource.addEventListener("state_change", (event) => {
      const payload = JSON.parse(event.data) as { status?: WhatsappStatus; state?: string };
      const nextStatus = payload.status ?? (payload.state as WhatsappStatus | undefined);
      if (nextStatus) callbacksRef.current.onStatusChange(nextStatus);
    });

    eventSource.addEventListener("qr", (event) => {
      callbacksRef.current.onQr(JSON.parse(event.data) as QrResponse);
    });

    eventSource.addEventListener("ready", () => callbacksRef.current.onReady());

    eventSource.addEventListener("disconnected", () =>
      callbacksRef.current.onDisconnected(),
    );

    eventSource.addEventListener("ai_replies_setting", (event) => {
      callbacksRef.current.onAiRepliesSetting(JSON.parse(event.data) as WhatsappSettings);
    });

    return () => eventSource.close();
  }, [apiClient]);
};
