import { QRCodeSVG } from "qrcode.react";
import Modal from "@ui/modal/modal";
import type { QrResponse } from "../types/whatsapp.types";

type Props = {
  isOpen: boolean;
  qrData: QrResponse;
  formattedExpiration: string | null;
  onClose: () => void;
};

const WhatsappQrModal: React.FC<Props> = ({ isOpen, qrData, formattedExpiration, onClose }) => (
  <Modal isOpen={isOpen && Boolean(qrData.qr)} onClose={onClose} className="mx-4 max-w-120 p-6">
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
);

export default WhatsappQrModal;
