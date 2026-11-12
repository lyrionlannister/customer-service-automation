import Modal from "./modal";
import Button from "@ui/button/button";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  danger = false,
  loading = false,
  onConfirm,
  onClose,
}) => (
  <Modal isOpen={isOpen} onClose={onClose} className="max-w-md p-6">
    <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">{title}</h3>
    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{message}</p>
    <div className="mt-6 flex justify-end gap-2">
      <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
        {cancelLabel}
      </Button>
      <Button
        type="button"
        variant={danger ? "danger" : "primary"}
        onClick={onConfirm}
        disabled={loading}
      >
        {loading ? "Procesando..." : confirmLabel}
      </Button>
    </div>
  </Modal>
);

export default ConfirmModal;
