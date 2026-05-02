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

const WhatsAppAdminPage: React.FC = () => {
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

  const { setAiRepliesEnabled, aiRepliesEnabled, isSavingSettings, toggleAiReplies } =
    useWhatsappSettings();

  const {
    automationUrl,
    setAutomationUrl,
    automationSource,
    isSavingAutomation,
    automationError,
    saveAutomationUrl,
  } = useAutomationConfig();

  const { exclusions, newPhone, setNewPhone, createExclusion, deleteExclusion } =
    useExcludedPhones();

  useWhatsappEvents({
    onStatusChange: setStatus,
    onQr: (data) => {
      setQrData(data);
      openQrModal();
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
