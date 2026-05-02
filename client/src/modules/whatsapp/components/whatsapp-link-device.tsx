import Button from "@ui/button/button";
import type { QrResponse, WhatsappStatus } from "../types/whatsapp.types";

type Props = {
  status: WhatsappStatus;
  qrData: QrResponse;
  isLoadingQr: boolean;
  isClosingSession: boolean;
  qrError: string | null;
  formattedExpiration: string | null;
  onFetchQr: () => void;
  onCloseSession: () => void;
};

const WhatsappLinkDevice: React.FC<Props> = ({
  status,
  qrData,
  isLoadingQr,
  isClosingSession,
  qrError,
  formattedExpiration,
  onFetchQr,
  onCloseSession,
}) => (
  <section className="h-full rounded-3xl border border-gray-200 bg-white p-6 shadow-soft dark:border-gray-700 dark:bg-gray-950">
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
          onClick={onCloseSession}
          disabled={isClosingSession}
        >
          {isClosingSession ? "Desconectando..." : "Desconectar dispositivo"}
        </Button>
      ) : (
        <Button
          variant="primary"
          size="md"
          className="min-w-35"
          onClick={onFetchQr}
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
);

export default WhatsappLinkDevice;
