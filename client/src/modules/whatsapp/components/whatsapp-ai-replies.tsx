import Toggle from "@ui/toggle/toggle";
import { STATUS_STYLES } from "../constants/whatsapp.constants";
import type { WhatsappStatus } from "../types/whatsapp.types";

type Props = {
  status: WhatsappStatus;
  aiRepliesEnabled: boolean;
  isSavingSettings: boolean;
  onToggle: () => void;
};

const WhatsappAiReplies: React.FC<Props> = ({
  status,
  aiRepliesEnabled,
  isSavingSettings,
  onToggle,
}) => (
  <section className="h-full space-y-5 rounded-3xl border border-gray-200 bg-white p-6 shadow-soft dark:border-gray-700 dark:bg-gray-950">
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-lg font-semibold text-brand-600 dark:text-brand-400">
          Respuestas automáticas
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-500">
          Activa o desactiva las respuestas automáticas con inteligencia
          artificial.
        </p>
      </div>
      <Toggle checked={aiRepliesEnabled} onChange={onToggle} disabled={isSavingSettings} />
    </div>

    <div className="grid gap-4 sm:grid-cols-2">
      <div className="rounded-3xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Respuestas automáticas
        </p>
        <p className="mt-2 text-xl font-semibold">
          {aiRepliesEnabled ? "Activadas" : "Desactivadas"}
        </p>
      </div>
      <div className="rounded-3xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Estado de conexión
        </p>
        <p className="mt-2 text-xl font-semibold">
          {STATUS_STYLES[status].label}
        </p>
      </div>
    </div>
  </section>
);

export default WhatsappAiReplies;
