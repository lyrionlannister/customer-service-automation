import { Clock, Smartphone } from "lucide-react";
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
  <Modal isOpen={isOpen && Boolean(qrData.qr)} onClose={onClose} className="mx-4 max-w-md overflow-hidden">

    {/* Header con gradiente brand */}
    <div className="bg-gradient-to-br from-brand-600 to-brand-400 px-6 pb-5 pt-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
          <Smartphone className="size-5 text-white" />
        </div>
        <div>
          <p className="text-lg font-semibold text-white">Vincular WhatsApp</p>
          <p className="text-sm text-white/70">
            Escanea el código con tu teléfono
          </p>
        </div>
      </div>
    </div>

    {/* Cuerpo */}
    <div className="space-y-4 p-6">
      {qrData.qr ? (
        <>
          {/* Instrucción */}
          <div className="flex items-start gap-2.5 rounded-xl border border-brand-100 bg-brand-50 px-4 py-3 dark:border-brand-900/40 dark:bg-brand-950/30">
            <span className="mt-px text-base">📱</span>
            <p className="text-sm leading-snug text-brand-700 dark:text-brand-300">
              Ve a <span className="font-medium">Dispositivos vinculados</span> en tu WhatsApp y escanea el código.
            </p>
          </div>

          {/* QR */}
          <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
            <div className="flex justify-center rounded-xl bg-white p-4 shadow-sm dark:bg-white">
              <QRCodeSVG value={qrData.qr} size={260} />
            </div>
          </div>

          {/* Expiración */}
          {formattedExpiration && (
            <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500">
              <Clock className="size-3.5 shrink-0" />
              <span>Expira el {formattedExpiration}</span>
            </div>
          )}
        </>
      ) : (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          No hay QR disponible en este momento.
        </p>
      )}
    </div>
  </Modal>
);

export default WhatsappQrModal;
