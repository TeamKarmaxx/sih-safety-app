import apiClient, { TOKEN_STORAGE_KEY } from "./client";

const SESSION_KEYS = {
  token: TOKEN_STORAGE_KEY,
  userId: "sih_auth_user_id",
  name: "sih_auth_name",
  email: "sih_auth_email",
  isAdmin: "sih_auth_is_admin",
};

/** POST /login — real backend auth, no local/fake validation. */
export async function login(email, password) {
  const data = await apiClient.post("/login", { email, password }, { auth: false });
  persistSession(data);
  return data;
}

export function persistSession(data) {
  localStorage.setItem(SESSION_KEYS.token, data.access_token);
  localStorage.setItem(SESSION_KEYS.userId, String(data.user_id));
  localStorage.setItem(SESSION_KEYS.name, data.name || "");
  localStorage.setItem(SESSION_KEYS.email, data.email || "");
  localStorage.setItem(SESSION_KEYS.isAdmin, data.is_admin ? "true" : "false");
}

/**
 * Refreshes the cached name/email/is_admin from a fresh GET /me response
 * (note: /me uses `id`, not `user_id`) without touching the stored token.
 * Used on app load so `isAdmin` — which gates the entire admin dashboard —
 * reflects the backend's current value rather than whatever was cached at
 * the last login. The backend's own `admin_required` dependency remains the
 * real authorization boundary regardless; this just keeps the frontend flag
 * honest so the UI doesn't show/hide the wrong thing.
 */
export function syncSessionFromMe(meData) {
  localStorage.setItem(SESSION_KEYS.name, meData.name || "");
  localStorage.setItem(SESSION_KEYS.email, meData.email || "");
  localStorage.setItem(SESSION_KEYS.isAdmin, meData.is_admin ? "true" : "false");
}

export function getSession() {
  const token = localStorage.getItem(SESSION_KEYS.token);
  if (!token) return null;

  const userId = localStorage.getItem(SESSION_KEYS.userId);

  return {
    token,
    userId: userId ? Number(userId) : null,
    name: localStorage.getItem(SESSION_KEYS.name) || "",
    email: localStorage.getItem(SESSION_KEYS.email) || "",
    isAdmin: localStorage.getItem(SESSION_KEYS.isAdmin) === "true",
  };
}

export function clearSession() {
  Object.values(SESSION_KEYS).forEach((key) => localStorage.removeItem(key));
}

/** GET /me — used to verify a stored token is still valid on app load. */
export function fetchMe() {
  return apiClient.get("/me");
}
