import { useEffect, useMemo, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { useApiClient } from "../../common/hooks/use-api-client";

type WhatsappStatus = "connecting" | "qr_required" | "ready" | "disconnected";

type QrResponse = {
  qr: string | null;
  expiresAt?: string;
};

type ExcludedPhone = {
  phone: string;
  createdAt: string;
};

type WhatsappSettings = {
  aiRepliesEnabled: boolean;
};

const WhatsAppAdminPage: React.FC = () => {
  const { apiClient } = useApiClient();
  const [status, setStatus] = useState<WhatsappStatus>("disconnected");
  const [qrData, setQrData] = useState<QrResponse>({ qr: null });
  const [isLoadingQr, setIsLoadingQr] = useState(false);
  const [qrError, setQrError] = useState<string | null>(null);
  const [exclusions, setExclusions] = useState<ExcludedPhone[]>([]);
  const [newPhone, setNewPhone] = useState("");
  const [aiRepliesEnabled, setAiRepliesEnabled] = useState(true);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  const fetchQr = async (): Promise<void> => {
    try {
      setIsLoadingQr(true);
      setQrError(null);

      const qrRes = await apiClient("/api/v1/whatsapp/qr");

      if (!qrRes.ok) {
        setQrError("No se pudo obtener el QR. Intenta nuevamente.");
        return;
      }

      const qrPayload = (await qrRes.json()) as QrResponse;
      setQrData(qrPayload);
    } catch (error) {
      console.error("Error solicitando QR de WhatsApp", error);
      setQrError("Ocurrió un error al solicitar el QR.");
    } finally {
      setIsLoadingQr(false);
    }
  };

  const fetchExclusions = async (): Promise<void> => {
    const response = await apiClient("/api/v1/whatsapp/exclusions");
    if (!response.ok) return;

    const payload = (await response.json()) as ExcludedPhone[];
    setExclusions(payload);
  };

  const fetchSettings = async (): Promise<void> => {
    const response = await apiClient("/api/v1/whatsapp/settings");
    if (!response.ok) return;

    const payload = (await response.json()) as WhatsappSettings;
    setAiRepliesEnabled(payload.aiRepliesEnabled);
  };

  const updateAiRepliesEnabled = async (nextValue: boolean): Promise<void> => {
    try {
      setIsSavingSettings(true);
      const response = await apiClient("/api/v1/whatsapp/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ aiRepliesEnabled: nextValue }),
      });

      if (!response.ok) return;

      const payload = (await response.json()) as WhatsappSettings;
      setAiRepliesEnabled(payload.aiRepliesEnabled);
    } finally {
      setIsSavingSettings(false);
    }
  };

  const createExclusion = async (): Promise<void> => {
    const response = await apiClient("/api/v1/whatsapp/exclusions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: newPhone }),
    });

    if (!response.ok) return;

    setNewPhone("");
    await fetchExclusions();
  };

  const deleteExclusion = async (phone: string): Promise<void> => {
    const encodedPhone = encodeURIComponent(phone);
    const response = await apiClient(`/api/v1/whatsapp/exclusions/${encodedPhone}`, {
      method: "DELETE",
    });

    if (!response.ok) return;

    await fetchExclusions();
  };

  const formattedExpiration = useMemo(() => {
    if (!qrData.expiresAt) return null;
    return new Date(qrData.expiresAt).toLocaleString();
  }, [qrData.expiresAt]);

  useEffect(() => {
    const load = async () => {
      const statusRes = await apiClient("/api/v1/whatsapp/status");

      if (statusRes.ok) {
        const statusPayload = (await statusRes.json()) as { status: WhatsappStatus };
        setStatus(statusPayload.status);
      }

      await fetchExclusions();
      await fetchSettings();
    };

    load().catch((error) => console.error("Error cargando estado de WhatsApp", error));

    const baseUrl = import.meta.env.VITE_API_BASE_URL as string;
    const eventsUrl = `${baseUrl}/api/v1/whatsapp/events`;
    const eventSource = new EventSource(eventsUrl);

    eventSource.addEventListener("state_change", (event) => {
      const payload = JSON.parse(event.data) as { status?: WhatsappStatus };
      if (payload.status) setStatus(payload.status);
    });

    eventSource.addEventListener("qr", (event) => {
      const payload = JSON.parse(event.data) as QrResponse;
      setQrData(payload);
      setStatus("qr_required");
    });

    eventSource.addEventListener("ready", () => {
      setStatus("ready");
      setQrData({ qr: null });
    });

    eventSource.addEventListener("disconnected", () => {
      setStatus("disconnected");
      setQrData({ qr: null });
    });

    eventSource.addEventListener("ai_replies_setting", (event) => {
      const payload = JSON.parse(event.data) as WhatsappSettings;
      if (typeof payload.aiRepliesEnabled === "boolean") {
        setAiRepliesEnabled(payload.aiRepliesEnabled);
      }
    });

    return () => {
      eventSource.close();
    };
  }, [apiClient]);

  return (
    <div className="mx-auto max-w-2xl p-6 space-y-6">
      <h1 className="text-2xl font-bold">WhatsApp Admin</h1>
      <p>
        Estado actual: <span className="font-semibold">{status}</span>
      </p>

      <section className="space-y-2 rounded border border-gray-200 p-4">
        <h2 className="text-xl font-semibold">Configuración de respuestas</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Responder con IA</p>
            <p className="text-sm text-gray-600">
              Estado: {aiRepliesEnabled ? "Activo" : "Silenciado"}
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={aiRepliesEnabled}
            disabled={isSavingSettings}
            onClick={() => {
              updateAiRepliesEnabled(!aiRepliesEnabled).catch((error) => {
                console.error("Error actualizando configuración de IA", error);
              });
            }}
            className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors disabled:opacity-50 ${
              aiRepliesEnabled ? "bg-emerald-500" : "bg-gray-300"
            }`}
          >
            <span
              className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                aiRepliesEnabled ? "translate-x-7" : "translate-x-1"
              }`}
            />
          </button>
        </div>
      </section>

      <div className="space-y-4">
        <button
          className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
          disabled={isLoadingQr}
          onClick={() => {
            fetchQr().catch((error) => {
              console.error("Error en solicitud de QR", error);
            });
          }}
        >
          {isLoadingQr ? "Solicitando..." : "Solicitar QR"}
        </button>

        {qrError ? <p className="text-sm text-red-500">{qrError}</p> : null}

        {qrData.qr ? (
          <div className="space-y-3">
            <p className="font-medium">Escanea este código QR para autenticar la sesión.</p>
            <div className="bg-white p-4 inline-block rounded">
              <QRCodeSVG value={qrData.qr} size={280} />
            </div>
            {formattedExpiration ? (
              <p className="text-sm text-gray-600">Expira: {formattedExpiration}</p>
            ) : null}
          </div>
        ) : (
          <p>No hay QR disponible en este momento.</p>
        )}
      </div>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Teléfonos excluidos</h2>
        <div className="flex gap-2">
          <input
            className="border rounded px-3 py-2 w-full"
            placeholder="Ej: +54 11 1234 5678"
            value={newPhone}
            onChange={(event) => setNewPhone(event.target.value)}
          />
          <button
            className="rounded bg-emerald-600 px-4 py-2 text-white disabled:opacity-50"
            disabled={!newPhone.trim()}
            onClick={() => {
              createExclusion().catch((error) => {
                console.error("Error creando exclusión", error);
              });
            }}
          >
            Agregar
          </button>
        </div>

        <table className="w-full border border-gray-200 rounded">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-2">Teléfono</th>
              <th className="p-2">Creado</th>
              <th className="p-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {exclusions.map((exclusion) => (
              <tr key={exclusion.phone} className="border-t border-gray-200">
                <td className="p-2">{exclusion.phone}</td>
                <td className="p-2">{new Date(exclusion.createdAt).toLocaleString()}</td>
                <td className="p-2">
                  <button
                    className="text-red-600"
                    onClick={() => {
                      deleteExclusion(exclusion.phone).catch((error) => {
                        console.error("Error eliminando exclusión", error);
                      });
                    }}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
            {exclusions.length === 0 ? (
              <tr>
                <td className="p-2 text-gray-500" colSpan={3}>
                  Sin teléfonos excluidos.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </section>
    </div>
  );
};

export default WhatsAppAdminPage;
