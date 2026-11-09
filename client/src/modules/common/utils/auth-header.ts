export const authToken = (): string | null => sessionStorage.getItem("accessToken");

export const authHeader = (): Record<string, string> => {
  const token = authToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// EventSource no puede mandar headers custom: el token viaja por query string.
// authMiddleware acepta ?token= como fallback solo para esto.
export const authenticatedEventSourceUrl = (url: string): string => {
  const token = authToken();
  if (!token) return url;
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}token=${encodeURIComponent(token)}`;
};
