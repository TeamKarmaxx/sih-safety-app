import { useState } from "react";
import { useTranslation } from "react-i18next";

function NotificationsScreen() {
  const { t } = useTranslation();

  const [notifications, setNotifications] = useState([
    {
      id: 1,
      icon: "📚",
      type: "Module Available",
      title: "New Module: Gas Leak & Confined Space",
      message: "A new training module is now available for you.",
      timestamp: "2 hours ago",
      read: false,
      action: "View Module",
    },
    {
      id: 2,
      icon: "🎯",
      type: "Achievement",
      title: "Achievement Unlocked!",
      message: "You've completed your first module!",
      timestamp: "5 hours ago",
      read: false,
      action: "View Badge",
    },
    {
      id: 3,
      icon: "📈",
      type: "Progress",
      title: "Great Progress!",
      message: "You're making excellent progress in Fire Safety training.",
      timestamp: "1 day ago",
      read: true,
      action: "View Progress",
    },
    {
      id: 4,
      icon: "🚀",
      type: "Update",
      title: "App Update Available",
      message: "New features and improvements are now available.",
      timestamp: "2 days ago",
      read: true,
      action: "Update Now",
    },
    {
      id: 5,
      icon: "⏰",
      type: "Reminder",
      title: "Keep Your Streak Going!",
      message: "You haven't trained in the last 24 hours. Keep the momentum!",
      timestamp: "3 days ago",
      read: true,
      action: "Start Training",
    },
    {
      id: 6,
      icon: "✅",
      type: "Completion",
      title: "Assessment Complete",
      message: "Your Fire & Explosion Response assessment has been graded.",
      timestamp: "4 days ago",
      read: true,
      action: "View Results",
    },
  ]);

  const handleMarkAsRead = (id) => {
    setNotifications(
      notifications.map((notif) =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const handleDelete = (id) => {
    setNotifications(notifications.filter((notif) => notif.id !== id));
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getNotificationColor = (type) => {
    switch (type) {
      case "Module Available":
        return "#2196F3";
      case "Achievement":
        return "#FFB300";
      case "Progress":
        return "#4CAF50";
      case "Update":
        return "#FF9800";
      case "Reminder":
        return "#FF5722";
      case "Completion":
        return "#9C27B0";
      default:
        return "#FF9800";
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        background: "#0d162b",
        color: "white",
        fontFamily: "sans-serif",
        padding: "16px 16px 100px 16px",
        boxSizing: "border-box",
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: "20px", marginTop: "8px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <h1
              style={{
                fontSize: "24px",
                margin: "0 0 4px",
                color: "white",
              }}
            >
              NOTIFICATIONS
            </h1>
            <p
              style={{
                color: "#FF9800",
                fontSize: "12px",
                margin: 0,
                fontWeight: "bold",
              }}
            >
              {unreadCount} NEW
            </p>
          </div>

          {unreadCount > 0 && (
            <div
              style={{
                background: "#FF9800",
                color: "#0d162b",
                borderRadius: "50%",
                width: "40px",
                height: "40px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "bold",
                fontSize: "16px",
              }}
            >
              {unreadCount}
            </div>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "10px",
          marginBottom: "20px",
        }}
      >
        <button
          style={{
            padding: "10px 16px",
            background: "#FF9800",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontSize: "12px",
            fontWeight: "bold",
            cursor: "pointer",
            transition: "all 0.3s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#F57C00";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "#FF9800";
          }}
        >
          🔔 All Notifications
        </button>

        <button
          style={{
            padding: "10px 16px",
            background: "rgba(255, 152, 0, 0.2)",
            color: "#FF9800",
            border: "2px solid rgba(255, 152, 0, 0.3)",
            borderRadius: "8px",
            fontSize: "12px",
            fontWeight: "bold",
            cursor: "pointer",
            transition: "all 0.3s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(255, 152, 0, 0.3)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(255, 152, 0, 0.2)";
          }}
        >
          📖 Unread Only
        </button>
      </div>

      {/* Notifications List */}
      {notifications.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "40px 20px",
          }}
        >
          <p
            style={{
              fontSize: "40px",
              margin: "0 0 12px",
            }}
          >
            📭
          </p>
          <p
            style={{
              color: "#90a4ae",
              fontSize: "14px",
              margin: 0,
            }}
          >
            No notifications yet
          </p>
        </div>
      ) : (
        notifications.map((notification) => (
          <div
            key={notification.id}
            style={{
              background: notification.read
                ? "#16233d"
                : "rgba(255, 152, 0, 0.05)",
              border: notification.read
                ? "1px solid rgba(255, 152, 0, 0.1)"
                : `2px solid ${getNotificationColor(notification.type)}`,
              borderRadius: "12px",
              padding: "16px",
              marginBottom: "12px",
              display: "flex",
              gap: "12px",
              position: "relative",
            }}
          >
            {/* Icon */}
            <div
              style={{
                fontSize: "28px",
                flexShrink: 0,
              }}
            >
              {notification.icon}
            </div>

            {/* Content */}
            <div style={{ flex: 1 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: "4px",
                }}
              >
                <div>
                  <p
                    style={{
                      color: getNotificationColor(notification.type),
                      fontSize: "11px",
                      fontWeight: "bold",
                      margin: "0 0 4px",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    {notification.type}
                  </p>
                  <h3
                    style={{
                      color: "white",
                      fontSize: "14px",
                      fontWeight: "bold",
                      margin: "0 0 4px",
                    }}
                  >
                    {notification.title}
                  </h3>
                  <p
                    style={{
                      color: "#90a4ae",
                      fontSize: "12px",
                      margin: "0 0 8px",
                    }}
                  >
                    {notification.message}
                  </p>
                </div>

                {/* Unread Indicator */}
                {!notification.read && (
                  <div
                    style={{
                      width: "12px",
                      height: "12px",
                      borderRadius: "50%",
                      background: "#FF9800",
                      flexShrink: 0,
                      marginLeft: "8px",
                      marginTop: "4px",
                    }}
                  />
                )}
              </div>

              {/* Action Button */}
              <button
                onClick={() => handleMarkAsRead(notification.id)}
                style={{
                  padding: "6px 12px",
                  background: "rgba(255, 152, 0, 0.2)",
                  color: "#FF9800",
                  border: "1px solid rgba(255, 152, 0, 0.3)",
                  borderRadius: "6px",
                  fontSize: "11px",
                  fontWeight: "bold",
                  cursor: "pointer",
                  marginRight: "8px",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255, 152, 0, 0.3)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255, 152, 0, 0.2)";
                }}
              >
                {notification.action}
              </button>

              {/* Timestamp and Delete */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginTop: "8px",
                }}
              >
                <p
                  style={{
                    color: "#90a4ae",
                    fontSize: "10px",
                    margin: 0,
                  }}
                >
                  {notification.timestamp}
                </p>

                <button
                  onClick={() => handleDelete(notification.id)}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "#90a4ae",
                    cursor: "pointer",
                    fontSize: "14px",
                    padding: 0,
                    transition: "color 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = "#FF9800";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = "#90a4ae";
                  }}
                >
                  🗑️
                </button>
              </div>
            </div>
          </div>
        ))
      )}

      {/* Info Section */}
      <div
        style={{
          background: "rgba(255, 152, 0, 0.1)",
          border: "1px solid rgba(255, 152, 0, 0.3)",
          borderRadius: "12px",
          padding: "16px",
          marginTop: "20px",
          textAlign: "center",
        }}
      >
        <p
          style={{
            color: "#90a4ae",
            fontSize: "12px",
            margin: 0,
          }}
        >
          ℹ️ Keep track of your progress, achievements, and important updates!
        </p>
      </div>
    </div>
  );
}

export default NotificationsScreen;