import Badge from "@ui/badge/badge";
import Button from "@ui/button/button";
import { Workflow } from "lucide-react";
import { STATUS_STYLES } from "../constants/whatsapp.constants";
import type { WhatsappStatus } from "../types/whatsapp.types";

const N8N_URL = (import.meta.env.VITE_N8N_URL as string | undefined) ?? "http://localhost:5678";

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
      <div className="flex items-center gap-3">
        <a href={N8N_URL} target="_blank" rel="noreferrer">
          <Button variant="outline" startIcon={<Workflow className="h-4 w-4" />}>
            Ir a n8n
          </Button>
        </a>
        <Badge color={STATUS_STYLES[status].color} variant="solid" size="lg">
          {STATUS_STYLES[status].label}
        </Badge>
      </div>
    </div>
  </div>
);

export default WhatsappHeader;
