import { useEffect, useState, useCallback } from "react";
import { getModules, createModule, updateModule, deleteModule } from "./api/modules";
import { getModuleSummary } from "./api/modules";

/**
 * Real fields only: title, description, difficulty, language (the actual
 * TrainingModule schema), plus total_lessons from GET /modules/{id}/summary.
 * The original mock also showed "Enrolled", "Completed", "Avg Score", and an
 * "Active"/"Coming Soon" status — none of these exist on the backend and
 * there is no endpoint to compute them across all workers, so they were
 * removed rather than faked. Create/Edit/Delete are real
 * (POST/PUT/DELETE /modules).
 */
function AdminModuleManagement({ onBack }) {
  const [modules, setModules] = useState([]);
  const [summaries, setSummaries] = useState({}); // moduleId -> total_lessons
  const [state, setState] = useState("loading");
  const [formOpen, setFormOpen] = useState(null); // null | 'create' | module being edited
  const [form, setForm] = useState({ title: "", description: "", difficulty: "", language: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const data = await getModules();
      const list = Array.isArray(data) ? data : [];
      setModules(list);

      const summaryEntries = await Promise.all(
        list.map((m) =>
          getModuleSummary(m.id)
            .then((s) => [m.id, s?.total_lessons ?? null])
            .catch(() => [m.id, null])
        )
      );
      setSummaries(Object.fromEntries(summaryEntries));
      setState("ready");
    } catch {
      setState("error");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setForm({ title: "", description: "", difficulty: "", language: "" });
    setFormOpen("create");
    setError("");
  };

  const openEdit = (module) => {
    setForm({
      title: module.title || "",
      description: module.description || "",
      difficulty: module.difficulty || "",
      language: module.language || "",
    });
    setFormOpen(module);
    setError("");
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      if (formOpen === "create") {
        await createModule(form);
      } else {
        await updateModule(formOpen.id, form);
      }
      setFormOpen(null);
      await load();
    } catch (err) {
      setError(err?.message || "Could not save this module.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (module) => {
    if (!window.confirm(`Delete "${module.title}"? This cannot be undone.`)) return;
    setError("");
    try {
      await deleteModule(module.id);
      await load();
    } catch (err) {
      setError(err?.message || "Could not delete this module.");
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0d162b", color: "white", fontFamily: "sans-serif", padding: "20px", boxSizing: "border-box" }}>
      <button onClick={onBack} style={{ background: "transparent", border: "none", color: "#FF9800", fontSize: "20px", cursor: "pointer", marginBottom: "16px" }}>← Back</button>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div style={{ minWidth: 0, flex: "1 1 auto" }}>
          <h1 style={{ fontSize: "22px", margin: "0 0 4px", color: "white", wordBreak: "break-word" }}>📚 MODULE MANAGEMENT</h1>
          <p style={{ color: "#90a4ae", fontSize: "12px", margin: 0 }}>{modules.length} modules total</p>
        </div>
        <button onClick={openCreate} style={{ padding: "10px 16px", background: "#FF9800", color: "white", border: "none", borderRadius: "8px", fontSize: "12px", fontWeight: "bold", cursor: "pointer", textTransform: "uppercase", flexShrink: 0 }}>
          ➕ Create
        </button>
      </div>

      {error && (
        <div style={{ background: "rgba(244, 67, 54, 0.15)", border: "1px solid #F44336", color: "#F44336", borderRadius: "8px", padding: "10px", marginBottom: "16px", fontSize: "12px" }}>
          {error}
        </div>
      )}

      {formOpen !== null && (
        <div style={{ background: "#16233d", border: "2px solid #FF9800", borderRadius: "12px", padding: "20px", marginBottom: "20px", textAlign: "left" }}>
          <h3 style={{ margin: "0 0 12px", fontSize: "14px" }}>{formOpen === "create" ? "New Module" : `Edit: ${formOpen.title}`}</h3>
          {["title", "description", "difficulty", "language"].map((field) => (
            <div key={field} style={{ marginBottom: "10px" }}>
              <label style={{ display: "block", color: "#FF9800", fontSize: "11px", fontWeight: "bold", marginBottom: "4px", textTransform: "uppercase" }}>{field}</label>
              {field === "description" ? (
                <textarea
                  value={form[field]}
                  onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                  rows={3}
                  style={{ width: "100%", padding: "10px", background: "#0d162b", border: "1px solid rgba(255,152,0,0.3)", borderRadius: "6px", color: "white", boxSizing: "border-box" }}
                />
              ) : (
                <input
                  type="text"
                  value={form[field]}
                  onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                  style={{ width: "100%", padding: "10px", background: "#0d162b", border: "1px solid rgba(255,152,0,0.3)", borderRadius: "6px", color: "white", boxSizing: "border-box" }}
                />
              )}
            </div>
          ))}
          <div style={{ display: "flex", gap: "10px", marginTop: "12px" }}>
            <button onClick={() => setFormOpen(null)} disabled={saving} style={{ padding: "10px 16px", background: "rgba(255,255,255,0.1)", color: "white", border: "none", borderRadius: "6px", cursor: "pointer" }}>Cancel</button>
            <button onClick={handleSave} disabled={saving || !form.title} style={{ padding: "10px 16px", background: "#FF9800", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}>
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      )}

      {state === "loading" && <p style={{ color: "#90a4ae", fontSize: "13px" }}>Loading modules...</p>}
      {state === "error" && <p style={{ color: "#F44336", fontSize: "13px" }}>Unable to load modules from the training server.</p>}

      {state === "ready" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "16px" }}>
          {modules.map((module) => (
            <div key={module.id} style={{ background: "#16233d", border: "1px solid rgba(255, 152, 0, 0.2)", borderRadius: "12px", padding: "20px" }}>
              <h3 style={{ fontSize: "14px", fontWeight: "bold", margin: "0 0 8px", color: "white", wordBreak: "break-word" }}>{module.title}</h3>
              <p style={{ color: "#90a4ae", fontSize: "12px", margin: "0 0 12px" }}>{module.description}</p>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px", paddingBottom: "12px", borderBottom: "1px solid rgba(255, 152, 0, 0.1)" }}>
                <div>
                  <p style={{ color: "#90a4ae", fontSize: "10px", margin: "0 0 4px", textTransform: "uppercase" }}>Difficulty</p>
                  <p style={{ fontSize: "14px", fontWeight: "bold", margin: 0, color: "white" }}>{module.difficulty || "—"}</p>
                </div>
                <div>
                  <p style={{ color: "#90a4ae", fontSize: "10px", margin: "0 0 4px", textTransform: "uppercase" }}>Language</p>
                  <p style={{ fontSize: "14px", fontWeight: "bold", margin: 0, color: "white" }}>{module.language || "—"}</p>
                </div>
                <div>
                  <p style={{ color: "#90a4ae", fontSize: "10px", margin: "0 0 4px", textTransform: "uppercase" }}>Lessons</p>
                  <p style={{ fontSize: "16px", fontWeight: "bold", margin: 0, color: "#2196F3" }}>{summaries[module.id] ?? "—"}</p>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                <button onClick={() => openEdit(module)} style={{ padding: "8px 12px", background: "rgba(255, 152, 0, 0.2)", color: "#FF9800", border: "1px solid rgba(255, 152, 0, 0.3)", borderRadius: "6px", fontSize: "11px", fontWeight: "bold", cursor: "pointer" }}>✏️ Edit</button>
                <button onClick={() => handleDelete(module)} style={{ padding: "8px 12px", background: "rgba(244, 67, 54, 0.2)", color: "#F44336", border: "1px solid rgba(244, 67, 54, 0.3)", borderRadius: "6px", fontSize: "11px", fontWeight: "bold", cursor: "pointer" }}>🗑️ Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <p style={{ color: "#90a4ae", fontSize: "11px", margin: "16px 0 0", fontStyle: "italic" }}>
        Enrollment, completion, and average score across all workers require a backend endpoint that doesn't exist
        yet, so they are not shown here. Manage each module's lessons, drills, and quiz questions from the main
        admin dashboard's per-module tools.
      </p>
    </div>
  );
}

export default AdminModuleManagement;
