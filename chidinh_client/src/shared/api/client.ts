const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";

type RequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: FormData | unknown;
};

type ApiEnvelope<T> = {
  data: T;
  error: {
    code: string;
    message: string;
  } | null;
};

export async function apiRequest<T>(path: string, options: RequestOptions = {}) {
  const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData;
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? "GET",
    credentials: "include",
    headers: isFormData
      ? undefined
      : {
          "Content-Type": "application/json",
        },
    body: options.body ? (isFormData ? options.body : JSON.stringify(options.body)) : undefined,
  });

  const payload = (await response.json()) as ApiEnvelope<T>;
  if (!response.ok || payload.error) {
    throw new Error(payload.error?.message ?? "Request failed");
  }

  return payload.data;
}
