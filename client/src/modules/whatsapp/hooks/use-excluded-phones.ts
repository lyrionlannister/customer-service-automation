import { useCallback, useEffect, useState } from "react";
import { useApiClient } from "@common/hooks/use-api-client";
import useToast from "@common/hooks/use-toast";
import type { ExcludedPhone } from "../types/whatsapp.types";
import { getExclusions, postExclusion, removeExclusion } from "../services/whatsapp.service";

export const useExcludedPhones = () => {
  const { apiClient } = useApiClient();
  const { showToast } = useToast();
  const [exclusions, setExclusions] = useState<ExcludedPhone[]>([]);
  const [newPhone, setNewPhone] = useState("");

  const loadExclusions = useCallback(async (): Promise<void> => {
    const data = await getExclusions(apiClient);
    setExclusions(data);
  }, [apiClient]);

  useEffect(() => {
    loadExclusions().catch((error) =>
      console.error("Error cargando teléfonos excluidos", error),
    );
  }, [loadExclusions]);

  const createExclusion = async (): Promise<void> => {
    try {
      await postExclusion(apiClient, newPhone);
      setNewPhone("");
      await loadExclusions();
      showToast({
        variant: "success",
        title: "Teléfono excluido",
        message: "El número se agregó a la lista de exclusión.",
      });
    } catch (error) {
      console.error("Error guardando teléfono excluido", error);
      showToast({
        variant: "error",
        title: "No se pudo guardar",
        message:
          error instanceof Error
            ? error.message
            : "Ocurrió un error al guardar el teléfono.",
      });
    }
  };

  const deleteExclusion = async (phone: string): Promise<void> => {
    try {
      await removeExclusion(apiClient, phone);
      await loadExclusions();
      showToast({ variant: "success", title: "Teléfono eliminado" });
    } catch (error) {
      console.error("Error eliminando teléfono excluido", error);
      showToast({
        variant: "error",
        title: "No se pudo eliminar",
        message:
          error instanceof Error
            ? error.message
            : "Ocurrió un error al eliminar el teléfono.",
      });
    }
  };

  return {
    exclusions,
    newPhone,
    setNewPhone,
    createExclusion,
    deleteExclusion,
  };
};
