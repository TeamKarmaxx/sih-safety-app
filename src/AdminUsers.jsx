import { useEffect, useState, useCallback } from "react";
import { getAllUsers, deleteUser } from "./api/users";

/**
 * Real fields only: id, name, email, is_admin — that is the complete
 * backend User model (see main.py's User/UserCreate schema). The original
 * mock version also showed role, department, company, phone, fire/gas
 * progress percentages, a total score, and a status badge, plus "View" and
 * "Message" buttons — none of that exists on the backend or has a
 * supporting endpoint, so it has been removed rather than shown as fake
 * data. Delete is real (DELETE /users/{id}).
 */
function AdminUsers({ onBack }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [state, setState] = useState("loading"); // loading | ready | error
  const [deletingId, setDeletingId] = useState(null);
  const [actionError, setActionError] = useState("");

  const load = useCallback(async () => {
    try {
      const data = await getAllUsers();
      setUsers(Array.isArray(data) ? data : []);
      setState("ready");
    } catch {
      setState("error");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = async (user) => {
    if (!window.confirm(`Delete user "${user.name}"? This cannot be undone.`)) return;
    setDeletingId(user.id);
    setActionError("");
    try {
      await deleteUser(user.id);
      await load();
    } catch (err) {
      setActionError(err?.message || "Could not delete this user.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0d162b", color: "white", fontFamily: "sans-serif", padding: "20px", boxSizing: "border-box" }}>
      <div style={{ marginBottom: "30px" }}>
        <button onClick={onBack} style={{ background: "transparent", border: "none", color: "#FF9800", fontSize: "20px", cursor: "pointer", marginBottom: "16px" }}>← Back</button>
        <h1 style={{ fontSize: "24px", margin: "0 0 4px", color: "white", wordBreak: "break-word" }}>👥 USERS</h1>
        <p style={{ color: "#90a4ae", fontSize: "12px", margin: 0 }}>
          {state === "ready" ? `Total: ${filteredUsers.length} / ${users.length}` : "Loading..."}
        </p>
      </div>

      {state === "loading" && <p style={{ color: "#90a4ae", fontSize: "13px" }}>Loading users...</p>}
      {state === "error" && <p style={{ color: "#F44336", fontSize: "13px" }}>Unable to load users from the training server.</p>}

      {state === "ready" && (
        <>
          <div style={{ marginBottom: "24px" }}>
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ padding: "12px 16px", background: "#16233d", border: "2px solid rgba(255, 152, 0, 0.3)", borderRadius: "8px", color: "white", fontSize: "14px", boxSizing: "border-box", width: "100%" }}
            />
          </div>

          {actionError && (
            <div style={{ background: "rgba(244, 67, 54, 0.15)", border: "1px solid #F44336", color: "#F44336", borderRadius: "8px", padding: "10px", marginBottom: "16px", fontSize: "12px" }}>
              {actionError}
            </div>
          )}

          <div>
            {filteredUsers.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 20px", background: "#16233d", borderRadius: "12px" }}>
                <p style={{ color: "#90a4ae", fontSize: "16px", margin: 0 }}>No users found</p>
              </div>
            ) : (
              filteredUsers.map((user) => (
                <div key={user.id} style={{ background: "#16233d", border: "1px solid rgba(255, 152, 0, 0.2)", borderRadius: "12px", padding: "16px", marginBottom: "12px" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "16px", alignItems: "center" }}>
                    <div>
                      <p style={{ color: "#90a4ae", fontSize: "10px", margin: "0 0 4px", textTransform: "uppercase" }}>Name</p>
                      <h3 style={{ fontSize: "14px", fontWeight: "bold", margin: "0 0 4px", color: "white" }}>{user.name}</h3>
                      <p style={{ color: "#FF9800", fontSize: "12px", margin: 0, wordBreak: "break-word" }}>{user.email}</p>
                    </div>
                    <div>
                      <p style={{ color: "#90a4ae", fontSize: "10px", margin: "0 0 4px", textTransform: "uppercase" }}>Role</p>
                      <p style={{ fontSize: "14px", fontWeight: "bold", margin: 0, color: user.is_admin ? "#FF9800" : "white" }}>
                        {user.is_admin ? "Admin" : "Worker"}
                      </p>
                    </div>
                    <div>
                      <button
                        onClick={() => handleDelete(user)}
                        disabled={deletingId === user.id}
                        style={{ width: "100%", padding: "8px 12px", background: "rgba(244, 67, 54, 0.2)", color: "#F44336", border: "1px solid rgba(244, 67, 54, 0.3)", borderRadius: "6px", fontSize: "12px", fontWeight: "bold", cursor: "pointer" }}
                      >
                        {deletingId === user.id ? "Deleting..." : "🗑️ Delete"}
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <p style={{ color: "#90a4ae", fontSize: "11px", margin: "16px 0 0", fontStyle: "italic" }}>
            Role, department, company, phone, and per-worker training progress are not part of the current backend
            User model and are not shown here rather than being fabricated.
          </p>
        </>
      )}
    </div>
  );
}

export default AdminUsers;
