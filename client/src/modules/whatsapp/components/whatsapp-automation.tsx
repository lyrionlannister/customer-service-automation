import Button from "@ui/button/button";
import Input from "@ui/inputs/input";
import Badge from "@ui/badge/badge";
import type { AutomationConfig } from "../types/whatsapp.types";

type Props = {
  automationUrl: string;
  automationSource: AutomationConfig["source"];
  isSavingAutomation: boolean;
  automationError: string | null;
  onUrlChange: (url: string) => void;
  onSave: () => void;
};

const WhatsappAutomation: React.FC<Props> = ({
  automationUrl,
  automationSource,
  isSavingAutomation,
  automationError,
  onUrlChange,
  onSave,
}) => (
  <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-soft dark:border-gray-700 dark:bg-gray-950">
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-lg font-semibold text-brand-600 dark:text-brand-400">
          Servicio de automatización
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-500">
          Configura el enlace del servicio encargado de procesar y enviar mensajes automáticos.
        </p>
      </div>
      <Badge color={automationSource === "db" ? "success" : "secondary"} size="sm">
        {automationSource === "db" ? "Personalizada" : "Por defecto"}
      </Badge>
    </div>

    <div className="mt-4 grid gap-3 sm:grid-cols-[1.8fr_0.8fr]">
      <Input
        placeholder="https://mi-n8n.example.com/webhook/customer-service"
        value={automationUrl}
        onChange={(event) => onUrlChange(event.target.value)}
        className="w-full"
      />
      <Button onClick={onSave} disabled={!automationUrl.trim() || isSavingAutomation}>
        {isSavingAutomation ? "Guardando..." : "Guardar"}
      </Button>
    </div>

    {automationError ? (
      <p className="mt-3 text-sm text-red-600 dark:text-red-400">{automationError}</p>
    ) : null}
  </section>
);

export default WhatsappAutomation;
