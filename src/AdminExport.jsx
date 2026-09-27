import { useState } from "react";
import { getAllUsers } from "./api/users";
import { getModules } from "./api/modules";

/**
 * "Users" and "Modules" exports are real: they fetch the actual data from
 * GET /users / GET /modules and generate a real CSV file client-side.
 *
 * "Progress" and "Scores" exports are NOT available: every relevant
 * endpoint (GET /users/{id}/progress, /drill-progress, /quiz-attempts,
 * /drill-quiz-attempts) rejects requests from anyone but that user
 * themselves, with no admin override. The original mock exported
 * fabricated rows for these; that has been removed.
 */
function toCsv(rows, headers) {
  const escape = (val) => `"${String(val ?? "").replace(/"/g, '""')}"`;
  const lines = [headers.join(","), ...rows.map((row) => headers.map((h) => escape(row[h])).join(","))];
  return lines.join("\n");
}

function downloadCsv(filename, csvContent) {
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

const AVAILABLE_TYPES = [
  { value: "users", label: "👥 All Users", desc: "Real data from GET /users", available: true },
  { value: "modules", label: "📚 Modules", desc: "Real data from GET /modules", available: true },
  { value: "progress", label: "📊 Progress Data", desc: "Not available — see note below", available: false },
  { value: "scores", label: "🎯 Scores & Results", desc: "Not available — see note below", available: false },
];

function AdminExport({ onBack }) {
  const [exportType, setExportType] = useState("users");
  const [status, setStatus] = useState(""); // "", "exporting", "done", "error"
  const [error, setError] = useState("");

  const handleExport = async () => {
    const type = AVAILABLE_TYPES.find((t) => t.value === exportType);
    if (!type?.available) return;

    setStatus("exporting");
    setError("");

    try {
      if (exportType === "users") {
        const users = await getAllUsers();
        const csv = toCsv(users || [], ["id", "name", "email", "is_admin"]);
        downloadCsv("users.csv", csv);
      } else if (exportType === "modules") {
        const modules = await getModules();
        const csv = toCsv(modules || [], ["id", "title", "description", "difficulty", "language"]);
        downloadCsv("modules.csv", csv);
      }
      setStatus("done");
      setTimeout(() => setStatus(""), 2000);
    } catch (err) {
      setError(err?.message || "Export failed.");
      setStatus("error");
    }
  };

  const selected = AVAILABLE_TYPES.find((t) => t.value === exportType);

  return (
    <div style={{ minHeight: "100vh", background: "#0d162b", color: "white", fontFamily: "sans-serif", padding: "20px", boxSizing: "border-box" }}>
      <button onClick={onBack} style={{ background: "transparent", border: "none", color: "#FF9800", fontSize: "20px", cursor: "pointer", marginBottom: "16px" }}>← Back</button>
      <h1 style={{ fontSize: "24px", margin: "0 0 4px", color: "white", wordBreak: "break-word" }}>💾 EXPORT DATA</h1>

      <div style={{ background: "#16233d", border: "1px solid rgba(255, 152, 0, 0.2)", borderRadius: "12px", padding: "20px", marginTop: "24px", maxWidth: "460px" }}>
        <label style={{ display: "block", color: "#FF9800", fontSize: "12px", fontWeight: "bold", marginBottom: "12px", textTransform: "uppercase" }}>What to Export</label>
        {AVAILABLE_TYPES.map((option) => (
          <div
            key={option.value}
            onClick={() => option.available && setExportType(option.value)}
            style={{
              marginBottom: "12px",
              padding: "12px",
              background: exportType === option.value ? "rgba(255, 152, 0, 0.1)" : "transparent",
              border: exportType === option.value ? "2px solid #FF9800" : "1px solid rgba(255, 152, 0, 0.1)",
              borderRadius: "8px",
              cursor: option.available ? "pointer" : "not-allowed",
              opacity: option.available ? 1 : 0.5,
            }}
          >
            <p style={{ fontSize: "14px", fontWeight: "bold", margin: "0 0 2px", color: "white" }}>{option.label}</p>
            <p style={{ fontSize: "11px", color: "#90a4ae", margin: 0 }}>{option.desc}</p>
          </div>
        ))}

        {error && (
          <div style={{ background: "rgba(244,67,54,0.15)", border: "1px solid #F44336", color: "#F44336", borderRadius: "8px", padding: "10px", marginBottom: "12px", fontSize: "12px" }}>
            {error}
          </div>
        )}

        <button
          onClick={handleExport}
          disabled={!selected?.available || status === "exporting"}
          style={{
            width: "100%",
            padding: "14px",
            background: status === "done" ? "#4CAF50" : "#FF9800",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: "bold",
            cursor: selected?.available ? "pointer" : "not-allowed",
            textTransform: "uppercase",
            opacity: selected?.available ? 1 : 0.5,
          }}
        >
          {status === "exporting" ? "Exporting..." : status === "done" ? "✅ Downloaded!" : "📥 Export as CSV"}
        </button>
      </div>

      <p style={{ color: "#90a4ae", fontSize: "11px", margin: "16px 0 0", fontStyle: "italic", maxWidth: "460px" }}>
        Progress and score exports need per-worker data that no existing endpoint lets an admin read (each
        progress/quiz-attempt endpoint only allows a user to see their own results). Adding these would require a
        new backend endpoint.
      </p>
    </div>
  );
}

export default AdminExport;
