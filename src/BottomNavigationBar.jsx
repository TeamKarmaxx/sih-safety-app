import { useTranslation } from "react-i18next";

function BottomNavigationBar({ activeScreen, onNavigate, isAdmin }) {
  const { t } = useTranslation();

  const navItems = [
    {
      id: "dashboard",
      icon: "🏠",
      label: t("nav.home") || "Home",
      screens: ["dashboard"],
    },
    {
      id: "modules",
      icon: "📚",
      label: t("nav.modules") || "Modules",
      screens: ["modules", "module-detail"],
    },
    {
      id: "assessments",
      icon: "✓",
      label: t("nav.certs") || "Certs",
      screens: ["assessments"],
    },
    {
      id: "achievements",
      icon: "🏆",
      label: t("nav.badges") || "Badges",
      screens: ["achievements"],
    },
    {
      id: "notifications",
      icon: "🔔",
      label: t("nav.alerts") || "Alerts",
      screens: ["notifications"],
    },
    {
      id: "profile",
      icon: "👤",
      label: t("nav.profile") || "Profile",
      screens: ["profile"],
    },
  ];

  if (isAdmin) {
    navItems.push({
      id: "admin",
      icon: "⚙️",
      label: t("nav.admin") || "Admin",
      screens: ["admin"],
    });
  }

  const isActive = (navItem) => {
    return navItem.screens.includes(activeScreen);
  };

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        height: "70px",
        background: "#16233d",
        borderTop: "2px solid rgba(255, 152, 0, 0.3)",
        display: "flex",
        justifyContent: "space-around",
        alignItems: "center",
        zIndex: 1000,
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      {navItems.map((item) => (
        <button
          key={item.id}
          onClick={() => onNavigate(item.id)}
          style={{
            flex: 1,
            height: "100%",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "4px",
            transition: "all 0.3s ease",
            color: isActive(item) ? "#FF9800" : "#90a4ae",
            borderTop: isActive(item)
              ? "3px solid #FF9800"
              : "3px solid transparent",
          }}
          onMouseEnter={(e) => {
            if (!isActive(item)) {
              e.currentTarget.style.color = "#FF9800";
            }
          }}
          onMouseLeave={(e) => {
            if (!isActive(item)) {
              e.currentTarget.style.color = "#90a4ae";
            }
          }}
        >
          <span style={{ fontSize: "20px" }}>{item.icon}</span>
          <span style={{ fontSize: "10px", fontWeight: "bold" }}>
            {item.label}
          </span>
        </button>
      ))}
    </div>
  );
}

export default BottomNavigationBar;