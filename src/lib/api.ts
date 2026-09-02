const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
const DJANGO_BASE = process.env.NEXT_PUBLIC_DJANGO_API_URL || "http://127.0.0.1:8000/api";

async function request<T>(baseUrl: string, path: string, options?: RequestInit): Promise<T> {
  const url = `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
  const res = await fetch(url, {
    ...options,
    headers: { "Content-Type": "application/json", ...(options?.headers || {}) },
    cache: "no-store",
  });

  if (res.status === 204) {
    return null as T;
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || body.detail || `Request failed: ${res.status}`);
  }
  return res.json();
}

export const api = {
  get: <T>(path: string) => request<T>(API_BASE, path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(API_BASE, path, { method: "POST", body: body ? JSON.stringify(body) : undefined }),
  put: <T>(path: string, body?: unknown) =>
    request<T>(API_BASE, path, { method: "PUT", body: body ? JSON.stringify(body) : undefined }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(API_BASE, path, { method: "PATCH", body: body ? JSON.stringify(body) : undefined }),
  delete: <T>(path: string) => request<T>(API_BASE, path, { method: "DELETE" }),

  // Django API helpers for Phase 1-5 Program Settings, Rules, Types, Codes, Links
  djangoGet: <T>(path: string) => request<T>(DJANGO_BASE, path),
  djangoPost: <T>(path: string, body?: unknown) =>
    request<T>(DJANGO_BASE, path, { method: "POST", body: body ? JSON.stringify(body) : undefined }),
  djangoPut: <T>(path: string, body?: unknown) =>
    request<T>(DJANGO_BASE, path, { method: "PUT", body: body ? JSON.stringify(body) : undefined }),
  djangoPatch: <T>(path: string, body?: unknown) =>
    request<T>(DJANGO_BASE, path, { method: "PATCH", body: body ? JSON.stringify(body) : undefined }),
  djangoDelete: <T>(path: string) => request<T>(DJANGO_BASE, path, { method: "DELETE" }),
};

export default api;
