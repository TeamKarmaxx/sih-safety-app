import { useState } from "react";
import { useAuth } from "./context/useAuth.js";
import { ApiError } from "./api/client";

function AdminLogin({ onLogin, onBack }) {
  const { login, logout } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      setError("❌ Enter your email and password");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      // login() returns the raw /login response, which includes is_admin
      // directly — using that return value (not the `isAdmin` from
      // useAuth()) avoids a stale-closure read, since the context's state
      // hasn't necessarily re-rendered this component yet at this point.
      const data = await login(email, password);
      if (data?.is_admin) {
        onLogin();
      } else {
        setError("❌ This account does not have admin access.");
        logout();
      }
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.isNetworkError) {
          setError("❌ Unable to reach the training server. Check your connection.");
        } else if (err.status === 401) {
          setError("❌ Invalid email or password.");
        } else {
          setError(`❌ ${err.message || "Something went wrong."}`);
        }
      } else {
        setError("❌ Something went wrong.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !submitting) handleLogin();
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        background: "linear-gradient(135deg, #0d162b 0%, #16233d 100%)",
        color: "white",
        fontFamily: "sans-serif",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "400px",
          background: "#16233d",
          border: "2px solid #FF9800",
          borderRadius: "16px",
          padding: "40px 30px",
          textAlign: "center",
          boxShadow: "0 8px 32px rgba(255, 152, 0, 0.2)",
          position: "relative",
        }}
      >
        {onBack && (
          <button
            onClick={onBack}
            style={{
              position: "absolute",
              top: "16px",
              left: "16px",
              background: "transparent",
              border: "none",
              color: "#90a4ae",
              fontSize: "13px",
              cursor: "pointer",
            }}
          >
            ← Back
          </button>
        )}

        <h1 style={{ fontSize: "32px", margin: "0 0 8px", color: "#FF9800" }}>🔐</h1>

        <h2 style={{ fontSize: "24px", fontWeight: "bold", margin: "0 0 8px", color: "white" }}>
          Admin Login
        </h2>

        <p
          style={{
            color: "#90a4ae",
            fontSize: "12px",
            margin: "0 0 30px",
            letterSpacing: "1px",
            textTransform: "uppercase",
          }}
        >
          Safety Training Portal
        </p>

        {error && (
          <div
            style={{
              background: "rgba(255, 87, 34, 0.2)",
              border: "1px solid #FF5722",
              borderRadius: "8px",
              padding: "12px",
              marginBottom: "20px",
              color: "#FF5722",
              fontSize: "12px",
            }}
          >
            {error}
          </div>
        )}

        <div style={{ marginBottom: "16px", textAlign: "left" }}>
          <label
            style={{
              display: "block",
              color: "#FF9800",
              fontSize: "12px",
              fontWeight: "bold",
              marginBottom: "6px",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            📧 Admin Email
          </label>
          <input
            type="email"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={handleKeyPress}
            disabled={submitting}
            style={{
              width: "100%",
              padding: "12px 14px",
              background: "#0d162b",
              border: "2px solid rgba(255, 152, 0, 0.3)",
              borderRadius: "8px",
              color: "white",
              fontSize: "14px",
              boxSizing: "border-box",
            }}
          />
        </div>

        <div style={{ marginBottom: "24px", textAlign: "left" }}>
          <label
            style={{
              display: "block",
              color: "#FF9800",
              fontSize: "12px",
              fontWeight: "bold",
              marginBottom: "6px",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            🔑 Password
          </label>
          <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyPress}
              disabled={submitting}
              style={{
                flex: 1,
                padding: "12px 14px",
                background: "#0d162b",
                border: "2px solid rgba(255, 152, 0, 0.3)",
                borderRadius: "8px",
                color: "white",
                fontSize: "14px",
                boxSizing: "border-box",
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: "absolute",
                right: "12px",
                background: "transparent",
                border: "none",
                color: "#FF9800",
                cursor: "pointer",
                fontSize: "16px",
              }}
            >
              {showPassword ? "🙈" : "👁️"}
            </button>
          </div>
        </div>

        <button
          onClick={handleLogin}
          disabled={submitting}
          style={{
            width: "100%",
            padding: "14px",
            background: "#FF9800",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: "bold",
            cursor: submitting ? "not-allowed" : "pointer",
            textTransform: "uppercase",
            letterSpacing: "1px",
            opacity: submitting ? 0.7 : 1,
          }}
        >
          {submitting ? "Signing in..." : "🔓 Login as Admin"}
        </button>
      </div>
    </div>
  );
}

export default AdminLogin;
