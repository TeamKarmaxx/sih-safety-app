/**
 * The original mock version of this screen let an admin "send" a
 * notification with a fake success alert — nothing was ever actually sent
 * anywhere. There is no notification-related route anywhere in main.py
 * (no POST /notifications, no way to reach a user's device). Building this
 * for real would require adding a new backend endpoint and a delivery
 * mechanism (push notifications, in-app inbox, etc.), which this project
 * has not done, per instructions not to invent backend endpoints. Rather
 * than keep a "send" button that does nothing real, this screen now says so
 * plainly.
 */
function AdminNotifications({ onBack }) {
  return (
    <div style={{ minHeight: "100vh", background: "#0d162b", color: "white", fontFamily: "sans-serif", padding: "20px", boxSizing: "border-box" }}>
      <button onClick={onBack} style={{ background: "transparent", border: "none", color: "#FF9800", fontSize: "20px", cursor: "pointer", marginBottom: "16px" }}>← Back</button>
      <h1 style={{ fontSize: "24px", margin: "0 0 4px", color: "white", wordBreak: "break-word" }}>🔔 NOTIFICATIONS</h1>

      <div style={{ background: "#16233d", border: "2px dashed rgba(255, 152, 0, 0.3)", borderRadius: "12px", padding: "24px", textAlign: "center", marginTop: "24px" }}>
        <div style={{ fontSize: "36px", marginBottom: "12px" }}>🚧</div>
        <h2 style={{ fontSize: "16px", margin: "0 0 12px", color: "white" }}>Not Available Yet</h2>
        <p style={{ color: "#90a4ae", fontSize: "13px", lineHeight: 1.6, maxWidth: "480px", margin: "0 auto" }}>
          Sending notifications to workers isn't possible with the current backend — there is no notification
          endpoint or delivery mechanism implemented on the server. This would require adding a real backend route
          and a way to reach each worker's device, neither of which exists yet. The previous version of this screen
          showed a "Sent!" confirmation that didn't actually send anything; that has been removed rather than kept
          as a false success message.
        </p>
      </div>
    </div>
  );
}

export default AdminNotifications;
