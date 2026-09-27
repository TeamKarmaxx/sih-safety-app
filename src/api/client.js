/**
 * Centralized API client.
 *
 * Every request to the FastAPI backend goes through here so that:
 * - the base URL lives in one place (VITE_API_BASE_URL)
 * - the JWT is attached automatically when present
 * - 401 / 403 / network errors are normalized into one ApiError shape
 *
 * Nothing in src/screens or src/components should call fetch() directly.
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://" + "192.168.1.8" + ":8000";

const TOKEN_STORAGE_KEY = "sih_auth_token";

export class ApiError extends Error {
  constructor(message, { status = null, data = null, isNetworkError = false } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
    this.isNetworkError = isNetworkError;
  }
}

export function getStoredToken() {
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

export { TOKEN_STORAGE_KEY };

async function parseResponseBody(response) {
  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    try {
      return await response.json();
    } catch {
      return null;
    }
  }

  if (contentType.includes("image/")) {
    return response.blob();
  }

  try {
    const text = await response.text();
    return text || null;
  } catch {
    return null;
  }
}

async function request(path, { method = "GET", body, auth = true, query, signal } = {}) {
  let url = `${BASE_URL}${path}`;

  if (query && Object.keys(query).length > 0) {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null) params.set(key, value);
    });
    const qs = params.toString();
    if (qs) url += `?${qs}`;
  }

  const headers = {};
  let payload;

  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    payload = JSON.stringify(body);
  }

  if (auth) {
    const token = getStoredToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  let response;
  try {
    response = await fetch(url, { method, headers, body: payload, signal });
  } catch {
    throw new ApiError(
      "Unable to reach the training server. Check your connection and try again.",
      { isNetworkError: true }
    );
  }

  const data = await parseResponseBody(response);

  if (!response.ok) {
    const detail =
      (data && typeof data === "object" && data.detail) ||
      (typeof data === "string" && data) ||
      `Request failed (${response.status})`;

    throw new ApiError(detail, { status: response.status, data });
  }

  return data;
}

export const apiClient = {
  get: (path, options = {}) => request(path, { ...options, method: "GET" }),
  post: (path, body, options = {}) => request(path, { ...options, method: "POST", body }),
  put: (path, body, options = {}) => request(path, { ...options, method: "PUT", body }),
  delete: (path, options = {}) => request(path, { ...options, method: "DELETE" }),
};

export default apiClient;
