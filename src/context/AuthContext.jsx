import { useCallback, useEffect, useState } from "react";
import { login as apiLogin, getSession, clearSession, fetchMe, syncSessionFromMe } from "../api/auth";
import { AuthContext } from "./auth-context.js";

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  // "checking" while we verify a stored token on first load, so screens don't
  // flash a login page before we know a valid session already exists.
  const [status, setStatus] = useState("checking");

  useEffect(() => {
    let cancelled = false;

    async function verifyStoredSession() {
      const existing = getSession();

      if (!existing) {
        if (!cancelled) setStatus("signed-out");
        return;
      }

      try {
        const me = await fetchMe();
        syncSessionFromMe(me);
        if (!cancelled) {
          setSession(getSession());
          setStatus("signed-in");
        }
      } catch {
        // Token missing/expired/invalid, or backend unreachable — either way
        // we don't treat the stored token as good. If it was a pure network
        // error we still fall back to signed-out rather than pretending to
        // be authenticated with no way to confirm it.
        if (!cancelled) {
          clearSession();
          setSession(null);
          setStatus("signed-out");
        }
      }
    }

    verifyStoredSession();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (email, password) => {
    const data = await apiLogin(email, password);
    setSession(getSession());
    setStatus("signed-in");
    return data;
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setSession(null);
    setStatus("signed-out");
  }, []);

  const value = {
    session,
    isAuthenticated: status === "signed-in" && !!session,
    isAdmin: !!session?.isAdmin,
    isChecking: status === "checking",
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
