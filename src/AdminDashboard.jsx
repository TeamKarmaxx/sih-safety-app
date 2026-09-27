import { useEffect, useState, useCallback } from "react";
import { useAuth } from "./context/useAuth.js";
import { getModules } from "./api/modules";
import { getAllUsers } from "./api/users";

/**
 * Only two real, honest numbers are shown here: total users and total
 * modules, both from existing endpoints (GET /users, GET /modules).
 *
 * The original mock version of this screen also showed "Active Today",
 * "New This Week", "Fire/Gas Completed", "Average Score", and "Completion
 * Rate" — none of these can be computed from the current backend. Every
 * per-user progress/quiz/drill endpoint (GET /users/{id}/progress,
 * /drill-progress, /quiz-attempts, /drill-quiz-attempts, /dashboard) checks
 * `current_user.id != user_id` and rejects with 403 for anyone other than
 * that user themselves — there is no admin bypass. Computing any
 * cross-worker statistic would require a new backend endpoint, which this
 * project has not added. Rather than show fabricated numbers, those cards
 * were removed.
 */
function AdminDashboard({ onNavigate, onLogout }) {
  const { session } = useAuth();
  const [counts, setCounts] = useState(null);
  const [state, setState] = useState("loading"); // loading | ready | error

  const load = useCallback(async () => {
    try {
      const [modules, users] = await Promise.all([getModules(), getAllUsers()]);
      setCounts({
        totalModules: Array.isArray(modules) ? modules.length : 0,
        totalUsers: Array.isArray(users) ? users.length : 0,
      });
      setState("ready");
    } catch {
      setState("error");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const menuItems = [
    { icon: "👥", title: "User Management", desc: "View & manage workers", screen: "admin-users" },
    { icon: "📚", title: "Module Management", desc: "Create & manage modules", screen: "admin-modules" },
    { icon: "📊", title: "Analytics & Reports", desc: "View statistics", screen: "admin-analytics" },
    { icon: "🔔", title: "Notifications", desc: "Not available yet", screen: "admin-notifications" },
    { icon: "💾", title: "Export Data", desc: "Download real data", screen: "admin-export" },
  ];

  return (
    <div style={{ minHeight: "100vh", width: "100%", background: "#0d162b", color: "white", fontFamily: "sans-serif", padding: "20px", boxSizing: "border-box" }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", justifyContent: "space-between", alignItems: "center", marginBottom: "30px", paddingBottom: "20px", borderBottom: "2px solid rgba(255, 152, 0, 0.3)" }}>
        <div style={{ minWidth: 0, flex: "1 1 auto" }}>
          <h1 style={{ fontSize: "22px", margin: "0 0 4px", color: "white", wordBreak: "break-word" }}>🎛️ ADMIN DASHBOARD</h1>
          <p style={{ color: "#FF9800", fontSize: "12px", margin: 0, fontWeight: "bold", wordBreak: "break-all" }}>
            Logged in as: {session?.email || session?.name}
          </p>
        </div>
        <button onClick={onLogout} style={{ padding: "10px 16px", background: "rgba(255, 87, 34, 0.2)", color: "#FF5722", border: "2px solid #FF5722", borderRadius: "8px", fontSize: "12px", fontWeight: "bold", cursor: "pointer", textTransform: "uppercase", flexShrink: 0 }}>
          🚪 Logout
        </button>
      </div>

      {state === "loading" && <p style={{ color: "#90a4ae", fontSize: "13px" }}>Loading real backend data...</p>}
      {state === "error" && (
        <p style={{ color: "#F44336", fontSize: "13px" }}>Unable to load counts from the training server.</p>
      )}

      {state === "ready" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "12px", marginBottom: "30px" }}>
          <div style={{ background: "linear-gradient(135deg, #FF9800 0%, #F57C00 100%)", borderRadius: "12px", padding: "20px", textAlign: "center" }}>
            <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "11px", margin: "0 0 8px", textTransform: "uppercase" }}>Total Users</p>
            <h2 style={{ fontSize: "32px", fontWeight: "bold", margin: 0, color: "white" }}>{counts.totalUsers}</h2>
            <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.7)", margin: "4px 0 0" }}>Registered accounts</p>
          </div>
          <div style={{ background: "linear-gradient(135deg, #2196F3 0%, #1976D2 100%)", borderRadius: "12px", padding: "20px", textAlign: "center" }}>
            <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "11px", margin: "0 0 8px", textTransform: "uppercase" }}>Total Modules</p>
            <h2 style={{ fontSize: "32px", fontWeight: "bold", margin: 0, color: "white" }}>{counts.totalModules}</h2>
            <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.7)", margin: "4px 0 0" }}>Published modules</p>
          </div>
        </div>
      )}

      <p style={{ color: "#90a4ae", fontSize: "11px", margin: "0 0 16px", fontStyle: "italic" }}>
        Per-worker progress, completion rate, and average score require a backend endpoint that doesn't exist yet
        (the current API only lets a user view their own progress). See Analytics for details.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "12px" }}>
        {menuItems.map((item, i) => (
          <button
            key={i}
            onClick={() => onNavigate(item.screen)}
            style={{ background: "#16233d", border: "2px solid rgba(255, 152, 0, 0.3)", borderRadius: "12px", padding: "20px", cursor: "pointer", textAlign: "center", color: "white" }}
          >
            <p style={{ fontSize: "32px", margin: "0 0 8px" }}>{item.icon}</p>
            <h3 style={{ fontSize: "14px", fontWeight: "bold", margin: "0 0 4px" }}>{item.title}</h3>
            <p style={{ color: "#90a4ae", fontSize: "11px", margin: 0 }}>{item.desc}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

export default AdminDashboard;
