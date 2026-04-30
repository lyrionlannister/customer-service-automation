import { useState } from "react";
import { useApiClient } from "./use-api-client";

interface RegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

interface RegisterResponse {
  message: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    createdAt: string;
    updatedAt: string;
  };
}

export const useRegister = () => {
  const { apiClient } = useApiClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const safeReadJson = async <T>(response: Response): Promise<T | null> => {
    const raw = await response.text();
    if (!raw) return null;

    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  };

  const register = async (
    data: RegisterPayload,
  ): Promise<RegisterResponse | null> => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await apiClient("/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await safeReadJson<{ error?: string }>(response);
        throw new Error(errorData?.error || "Error en el registro");
      }

      const result = await safeReadJson<RegisterResponse>(response);
      if (!result?.user) {
        throw new Error("Respuesta invalida del servidor al registrar usuario");
      }

      setSuccess(true);
      setLoading(false);
      return result;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error desconocido en el registro";
      setError(errorMessage);
      setLoading(false);
      return null;
    }
  };

  const clearError = () => setError(null);
  const clearSuccess = () => setSuccess(false);

  return {
    register,
    loading,
    error,
    success,
    clearError,
    clearSuccess,
  };
};
