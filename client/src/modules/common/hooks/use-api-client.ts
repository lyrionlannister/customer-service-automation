import { useCallback, useMemo } from "react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const sendRequest = async (url: string, options: RequestInit = {}) => {
  return await fetch(url, options);
};

export const useApiClient = () => {
  const apiClient = useCallback(
    (endpoint: string, options: RequestInit = {}) => {
      if (!endpoint.startsWith("/")) {
        throw new Error("Endpoint must start with a slash (/)");
      }

      if (!API_BASE_URL || typeof API_BASE_URL !== "string") {
        throw new Error(
          "VITE_API_BASE_URL no esta configurada. Define esta variable en el entorno del client.",
        );
      }

      const url = `${API_BASE_URL}${endpoint}`;
      return sendRequest(url, options);
    },
    [],
  );

  return useMemo(() => ({ apiClient }), [apiClient]);
};
