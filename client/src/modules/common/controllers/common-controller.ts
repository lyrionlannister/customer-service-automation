export default class CommonController {
  private readonly baseUrl: string = import.meta.env.VITE_API_BASE_URL;
  private abortControllers: Map<string, AbortController> = new Map();
  readonly token: string | null = sessionStorage.getItem("accessToken") || null;

  constructor() {}

  private getRequestKey(
    method: string,
    url: string,
    id?: string | number
  ): string {
    return `${method}:${url}${id ? `/${id}` : ""}`;
  }

  private cancelPreviousRequest(requestKey: string): void {
    if (this.abortControllers.has(requestKey)) {
      const controller = this.abortControllers.get(requestKey);
      controller?.abort();
      this.abortControllers.delete(requestKey);
    }
  }

  private async request<TResponse = unknown, TData = unknown>(
    method: string,
    url: string,
    id?: string | number,
    data?: TData,
    headers?: Record<string, string>
  ): Promise<TResponse | string | null> {
    const fullUrl = `${this.baseUrl}${url}${id !== undefined ? `/${id}` : ""}`;
    const requestKey = this.getRequestKey(method, url, id);
    this.cancelPreviousRequest(requestKey);

    const controller = new AbortController();
    this.abortControllers.set(requestKey, controller);

    const config: RequestInit = {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(headers || {}),
        ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
      },
      signal: controller.signal,
    };

    if (data && method !== "GET" && method !== "DELETE") {
      config.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(fullUrl, config);
      this.abortControllers.delete(requestKey);

      if (response.status === 401) {
        console.error(
          "Error de autenticación. Redirigiendo a la página de inicio de sesión."
        );
        window.location.href = "/admin/sign-in";
        return null;
      }

      if (response.status === 409) {
        const refreshToken = sessionStorage.getItem("refreshToken");
        if (refreshToken) {
          const refreshResponse = await fetch(
            `${this.baseUrl}/api/auth/refresh`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ refreshToken }),
            }
          );

          if (refreshResponse.ok) {
            const { accessToken, newRefreshToken } =
              await refreshResponse.json();
            sessionStorage.setItem("accessToken", accessToken);
            sessionStorage.setItem("refreshToken", newRefreshToken);
            return this.request<TResponse, TData>(
              method,
              url,
              id,
              data,
              headers
            );
          } else {
            console.error(
              "Error al refrescar el token. Redirigiendo a la página de inicio de sesión."
            );
            sessionStorage.clear();
            window.location.href = "/admin/sign-in";
            return null;
          }
        }
      }

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`HTTP error ${response.status}: ${errorBody}`);
      }

      const contentType = response.headers.get("Content-Type");
      if (contentType && contentType.includes("application/json")) {
        const responseData: TResponse = await response.json();
        return responseData;
      }

      return await response.text();
    } catch (error: unknown) {
      this.abortControllers.delete(requestKey);

      if (error instanceof DOMException && error.name === "AbortError") {
        console.log("Solicitud cancelada:", requestKey);
        return null;
      }

      console.error(
        `Error en solicitud ${method}${id ? ` para ID ${id}` : ""}:`,
        error
      );
      throw error;
    }
  }

  getAll = async <TResponse = unknown>(
    url: string,
    headers?: Record<string, string>
  ) => {
    return this.request<TResponse>("GET", url, undefined, undefined, headers);
  };

  getById = async <TResponse = unknown>(
    url: string,
    id: string | number,
    headers?: Record<string, string>
  ) => {
    return this.request<TResponse>("GET", url, id, undefined, headers);
  };

  create = async <TResponse = unknown, TData = unknown>(
    url: string,
    data: TData,
    headers?: Record<string, string>
  ) => {
    return this.request<TResponse, TData>(
      "POST",
      url,
      undefined,
      data,
      headers
    );
  };

  update = async <TResponse = unknown, TData = unknown>(
    url: string,
    id: string | number,
    data: TData,
    headers?: Record<string, string>
  ) => {
    return this.request<TResponse, TData>("PUT", url, id, data, headers);
  };

  partialUpdate = async <TResponse = unknown, TData = unknown>(
    url: string,
    id: string | number,
    data: TData,
    headers?: Record<string, string>
  ) => {
    return this.request<TResponse, TData>("PATCH", url, id, data, headers);
  };

  delete = async <TResponse = unknown>(
    url: string,
    id: string | number,
    headers?: Record<string, string>
  ) => {
    return this.request<TResponse>("DELETE", url, id, undefined, headers);
  };

  cancelAllRequests = (): void => {
    this.abortControllers.forEach((controller, key) => {
      controller.abort();
      console.log("Solicitud cancelada:", key);
    });
    this.abortControllers.clear();
  };

  cancelRequest = (method: string, url: string, id?: string | number): void => {
    const requestKey = this.getRequestKey(method, url, id);
    this.cancelPreviousRequest(requestKey);
  };
}
