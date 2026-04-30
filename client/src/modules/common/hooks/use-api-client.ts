const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const sendRequest = async (url: string, options: RequestInit = {}) => {
  return await fetch(url, options);
};

export const useApiClient = () => {
  const apiClient = (endpoint: string, options: RequestInit = {}) => {
    if (!endpoint.startsWith("/")) {
      throw new Error("Endpoint must start with a slash (/)");
    }

    const url = `${API_BASE_URL}${endpoint}`;
    return sendRequest(url, options);
  };

  return { apiClient };
};
