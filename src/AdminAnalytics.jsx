import { useEffect, useState, useCallback } from "react";
import { getModules } from "./api/modules";
import { getAllUsers } from "./api/users";

/**
 * The original mock version of this screen showed a completion-by-module
 * breakdown, a performance distribution, and a 7-day training trend — all
 * entirely fabricated numbers with no backend behind them.
 *
 * This could not be made real: the backend has no endpoint that aggregates
 * data across users. GET /users/{id}/progress, /drill-progress,
 * /quiz-attempts, /drill-quiz-attempts, and /dashboard all check
 * `current_user.id != user_id` and return 403 for anyone but that user —
 * there is no admin override. Building real analytics would require a new
 * backend endpoint (e.g. something like GET /admin/analytics aggregating
 * completion/scores across all users), which this project has not added,
 * per instructions not to invent backend endpoints.
 *
 * What's shown instead: the two real numbers that ARE available (total
 * users, total modules) plus an honest explanation, rather than fabricated
 * charts.
 */
function AdminAnalytics({ onBack }) {
  const [counts, setCounts] = useState(null);
  const [state, setState] = useState("loading");

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

  return (
    <div style={{ minHeight: "100vh", background: "#0d162b", color: "white", fontFamily: "sans-serif", padding: "20px", boxSizing: "border-box" }}>
      <button onClick={onBack} style={{ background: "transparent", border: "none", color: "#FF9800", fontSize: "20px", cursor: "pointer", marginBottom: "16px" }}>← Back</button>

      <h1 style={{ fontSize: "28px", margin: "0 0 4px", color: "white" }}>📊 ANALYTICS & REPORTS</h1>
      <p style={{ color: "#90a4ae", fontSize: "12px", margin: "0 0 24px" }}>
        Real data only — no fabricated charts.
      </p>

      {state === "ready" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "12px", marginBottom: "24px" }}>
          <div style={{ background: "#16233d", border: "1px solid rgba(255,152,0,0.2)", borderRadius: "12px", padding: "20px", textAlign: "center" }}>
            <p style={{ color: "#90a4ae", fontSize: "11px", margin: "0 0 8px", textTransform: "uppercase" }}>Total Users</p>
            <h2 style={{ fontSize: "28px", fontWeight: "bold", margin: 0, color: "#FF9800" }}>{counts.totalUsers}</h2>
          </div>
          <div style={{ background: "#16233d", border: "1px solid rgba(255,152,0,0.2)", borderRadius: "12px", padding: "20px", textAlign: "center" }}>
            <p style={{ color: "#90a4ae", fontSize: "11px", margin: "0 0 8px", textTransform: "uppercase" }}>Total Modules</p>
            <h2 style={{ fontSize: "28px", fontWeight: "bold", margin: 0, color: "#FF9800" }}>{counts.totalModules}</h2>
          </div>
        </div>
      )}

      <div style={{ background: "#16233d", border: "2px dashed rgba(255, 152, 0, 0.3)", borderRadius: "12px", padding: "24px", textAlign: "center" }}>
        <div style={{ fontSize: "36px", marginBottom: "12px" }}>🚧</div>
        <h2 style={{ fontSize: "16px", margin: "0 0 12px", color: "white" }}>Cross-Worker Analytics Not Available</h2>
        <p style={{ color: "#90a4ae", fontSize: "13px", lineHeight: 1.6, maxWidth: "480px", margin: "0 auto" }}>
          Completion rates, average scores, and per-module performance across all workers cannot be shown here.
          The backend's progress and quiz-attempt endpoints only allow a user to see their own data — there is no
          endpoint that lets an admin read another worker's results. Adding real analytics would require a new
          backend endpoint (for example, an admin-only route that aggregates progress across all users), which
          hasn't been built, so no numbers are shown here rather than fabricated ones.
        </p>
      </div>
    </div>
  );
}

export default AdminAnalytics;
