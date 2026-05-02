import Badge from "@ui/badge/badge";
import { STATUS_STYLES } from "../constants/whatsapp.constants";
import type { WhatsappStatus } from "../types/whatsapp.types";

type Props = {
  status: WhatsappStatus;
};

const WhatsappHeader: React.FC<Props> = ({ status }) => (
  <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-soft dark:border-gray-700 dark:bg-gray-950">
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-brand-600 dark:text-brand-400">
          WhatsApp
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Controla la conexión, las respuestas automáticas y los contactos excluidos.
        </p>
      </div>
      <Badge color={STATUS_STYLES[status].color} variant="solid" size="lg">
        {STATUS_STYLES[status].label}
      </Badge>
    </div>
  </div>
);

export default WhatsappHeader;
