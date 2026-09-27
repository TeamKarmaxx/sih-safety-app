import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "./context/useAuth.js";
import { ApiError } from "./api/client";
import { Button } from "./components/ui/Layout.jsx";

function LoginScreen({ onLogin }) {
  const { t } = useTranslation();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      setError(t("login.missing_fields") || "Enter your email and password.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      await login(email, password);
      onLogin();
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.isNetworkError) {
          setError(
            t("login.network_error") ||
              "Unable to reach the training server. Check your connection and try again."
          );
        } else if (err.status === 401) {
          setError(t("login.invalid_credentials") || "Invalid email or password.");
        } else {
          setError(err.message || t("common.generic_error") || "Something went wrong.");
        }
      } else {
        setError(t("common.generic_error") || "Something went wrong.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !submitting) handleLogin();
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        background: "var(--color-bg)",
        color: "var(--color-text-primary)",
        fontFamily: "var(--font-sans)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "400px",
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-lg)",
          padding: "32px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: "56px",
            height: "56px",
            margin: "0 auto 16px",
            borderRadius: "var(--radius-md)",
            background: "var(--color-accent-soft)",
            border: "1px solid var(--color-accent-border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "26px",
          }}
        >
          ⛑️
        </div>

        <h1 style={{ fontSize: "24px", margin: "0 0 8px", color: "var(--color-text-primary)" }}>
          {t("login.title") || "Sign In"}
        </h1>

        <p style={{ color: "var(--color-text-secondary)", fontSize: "14px", margin: "0 0 28px" }}>
          {t("app.title") || "Industrial Safety Training"}
        </p>

        <div style={{ marginBottom: "16px", textAlign: "left" }}>
          <label
            style={{
              color: "var(--color-text-secondary)",
              fontSize: "12px",
              display: "block",
              marginBottom: "6px",
              fontWeight: 600,
            }}
          >
            {t("login.email") || "Email"}
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t("login.placeholder_email") || "you@company.com"}
            autoComplete="username"
            disabled={submitting}
            style={inputStyle}
          />
        </div>

        <div style={{ marginBottom: "24px", textAlign: "left" }}>
          <label
            style={{
              color: "var(--color-text-secondary)",
              fontSize: "12px",
              display: "block",
              marginBottom: "6px",
              fontWeight: 600,
            }}
          >
            {t("login.password") || "Password"}
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t("login.placeholder_password") || "••••••••"}
            autoComplete="current-password"
            disabled={submitting}
            style={inputStyle}
          />
        </div>

        {error && (
          <div
            style={{
              background: "var(--color-danger-soft)",
              color: "var(--color-danger)",
              padding: "10px",
              borderRadius: "var(--radius-sm)",
              marginBottom: "16px",
              fontSize: "12px",
              textAlign: "left",
            }}
          >
            {error}
          </div>
        )}

        <Button onClick={handleLogin} disabled={submitting}>
          {submitting ? "Signing in…" : t("login.login") || "Log In"}
        </Button>
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "12px",
  background: "var(--color-surface-sunken)",
  border: "1px solid var(--color-border-strong)",
  borderRadius: "var(--radius-sm)",
  color: "var(--color-text-primary)",
  fontSize: "14px",
  boxSizing: "border-box",
};

export default LoginScreen;
