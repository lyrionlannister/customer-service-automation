import { useState } from "react";
import { useApiClient } from "@common/hooks/use-api-client";
import useToast from "@common/hooks/use-toast";
import { useModal } from "@common/hooks/use-modal";
import type { QrResponse, WhatsappStatus } from "../types/whatsapp.types";
import { getQr, postLogoutSession } from "../services/whatsapp.service";

export const useWhatsappSession = () => {
  const { apiClient } = useApiClient();
  const { showToast } = useToast();
  const { isOpen: isQrModalOpen, openModal: openQrModal, closeModal: closeQrModal } = useModal(false);

  const [status, setStatus] = useState<WhatsappStatus>("disconnected");
  const [qrData, setQrData] = useState<QrResponse>({ qr: null });
  const [isLoadingQr, setIsLoadingQr] = useState(false);
  const [qrError, setQrError] = useState<string | null>(null);
  const [isClosingSession, setIsClosingSession] = useState(false);

  const fetchQr = async (): Promise<void> => {
    try {
      setIsLoadingQr(true);
      setQrError(null);
      const data = await getQr(apiClient);
      setQrData(data);
      if (data.qr) openQrModal();
    } catch (error) {
      console.error("Error solicitando QR de WhatsApp", error);
      setQrError(
        error instanceof Error ? error.message : "Ocurrió un error al solicitar el QR.",
      );
    } finally {
      setIsLoadingQr(false);
    }
  };

  const closeSession = async (): Promise<void> => {
    try {
      setIsClosingSession(true);
      const payload = await postLogoutSession(apiClient);
      setStatus(payload.status ?? "disconnected");
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
        message:
          error instanceof Error
            ? error.message
            : "Ocurrió un error al cerrar la sesión.",
      });
    } finally {
      setIsClosingSession(false);
    }
  };

  return {
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
  };
};
