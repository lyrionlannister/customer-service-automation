import { useCallback, useEffect, useRef, useState } from "react";

import type { LocalRecord } from "./use-local";

export type AttributionBasis = "total_value" | "margin" | "labor_only";

export interface LocalFormState {
  name: string;
  address: string;
  phone: string;
  nextControlNumber: string;
  cashRoundingUnit: string;
  logo: string;
}

const emptyForm: LocalFormState = {
  name: "",
  address: "",
  phone: "",
  nextControlNumber: "1",
  cashRoundingUnit: "0",
  logo: "",
};

export const useLocalPage = ({
  local,
  loading,
  saving,
  saveSuccess,
  error,
  fetchLocal,
  updateLocal,
  apiClient,
}: {
  local: LocalRecord | null;
  loading: boolean;
  saving: boolean;
  saveSuccess: boolean;
  error: string | null;
  fetchLocal: () => Promise<void>;
  updateLocal: (data: Partial<LocalRecord>) => Promise<boolean>;
  apiClient: (input: string, init?: RequestInit) => Promise<Response>;
}) => {
  const [form, setForm] = useState<LocalFormState>(emptyForm);
  const [attributionBasis, setAttributionBasis] = useState<AttributionBasis>("total_value");
  const [attributionSaving, setAttributionSaving] = useState(false);
  const [attributionMessage, setAttributionMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getAuthHeader = useCallback((): Record<string, string> => {
    const token = sessionStorage.getItem("accessToken");
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  const fetchAttributionBasis = useCallback(async () => {
    const response = await apiClient("/settings/revenue-attribution", {
      headers: getAuthHeader(),
    });

    if (!response.ok) {
      throw new Error("No se pudo cargar la base de atribución");
    }

    const payload = (await response.json()) as { attributionBasis?: AttributionBasis };
    setAttributionBasis(payload.attributionBasis ?? "total_value");
  }, [apiClient, getAuthHeader]);

  useEffect(() => {
    fetchLocal();
    fetchAttributionBasis().catch((err) => {
      console.error(err);
    });
  }, [fetchLocal, fetchAttributionBasis]);

  useEffect(() => {
    if (local) {
      setForm({
        name: local.name ?? "",
        address: local.address ?? "",
        phone: local.phone ?? "",
        nextControlNumber: String(local.nextControlNumber),
        cashRoundingUnit: String(local.cashRoundingUnit ?? 0),
        logo: local.logo ?? "",
      });
    }
  }, [local]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setForm((prev) => ({ ...prev, logo: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handleAttributionBasisChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    const nextBasis = event.target.value as AttributionBasis;
    setAttributionBasis(nextBasis);
    setAttributionMessage(null);
    setAttributionSaving(true);

    try {
      const response = await apiClient("/settings/revenue-attribution", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeader(),
        },
        body: JSON.stringify({ attributionBasis: nextBasis }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => ({}))) as { error?: string };
        throw new Error(payload.error ?? "No se pudo guardar la base de atribución");
      }

      setAttributionMessage("Base de atribución actualizada correctamente.");
    } catch (err) {
      setAttributionMessage(err instanceof Error ? err.message : "No se pudo guardar la base de atribución.");
    } finally {
      setAttributionSaving(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    await updateLocal({
      name: form.name || undefined,
      address: form.address || undefined,
      phone: form.phone || undefined,
      nextControlNumber: Number.parseInt(form.nextControlNumber, 10) || 1,
      cashRoundingUnit: Number.parseFloat(form.cashRoundingUnit) || 0,
      logo: form.logo || undefined,
    });
  };

  const removeLogo = () => setForm((prev) => ({ ...prev, logo: "" }));

  return {
    fileInputRef,
    form,
    setForm,
    attributionBasis,
    attributionSaving,
    attributionMessage,
    loading,
    saving,
    saveSuccess,
    error,
    fetchLocal,
    updateLocal,
    handleChange,
    handleLogoChange,
    handleAttributionBasisChange,
    handleSubmit,
    removeLogo,
  };
};
