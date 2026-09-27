import { useState, useRef } from "react";
import { useTranslation } from "react-i18next";

function ProfileScreen({ onBack }) {
  const { t } = useTranslation();
  const fileInputRef = useRef(null);

  const [avatar, setAvatar] = useState(
    localStorage.getItem("userAvatar") ||
      "https://api.dicebear.com/7.x/bottts/svg?seed=Felix"
  );
  const name = localStorage.getItem("userName") || "Safety Champion";
  const role = localStorage.getItem("userRole") || "Safety Officer";
  const department = localStorage.getItem("userDepartment") || "Operations";
  const company = localStorage.getItem("userCompany") || "Industry Partner";
  const phone = localStorage.getItem("userPhone") || "Not provided";
  const email = localStorage.getItem("userEmail") || "user@example.com";

  const handleUpdateAvatar = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result);
        localStorage.setItem("userAvatar", reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("sihLoggedIn");
    localStorage.removeItem("profileComplete");
    if (onBack) onBack();
  };

  return (
    <div
      style={{
        width: "100%",
        minHeight: "100%",
        background: "#0d162b",
        color: "white",
        fontFamily: "sans-serif",
        padding: "24px 16px 100px",
        boxSizing: "border-box",
      }}
    >
      <div style={{ maxWidth: "500px", margin: "0 auto" }}>
        {/* TOP CENTER PROFILE HEADER */}
        <div
          style={{
            textAlign: "center",
            padding: "24px 16px",
            background: "#16233d",
            borderRadius: "16px",
            border: "1px solid rgba(255,255,255,0.12)",
            marginBottom: "20px",
          }}
        >
          <div style={{ position: "relative", display: "inline-block", marginBottom: "12px" }}>
            <img
              src={avatar}
              alt="Profile"
              style={{
                width: "110px",
                height: "110px",
                borderRadius: "50%",
                objectFit: "cover",
                border: "4px solid #FF9800",
                background: "#0d162b",
                boxShadow: "0 4px 16px rgba(0,0,0,0.5)",
              }}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current && fileInputRef.current.click()}
              style={{
                position: "absolute",
                bottom: "4px",
                right: "4px",
                background: "#FF9800",
                color: "#0d162b",
                border: "none",
                borderRadius: "50%",
                width: "32px",
                height: "32px",
                cursor: "pointer",
                fontWeight: "bold",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 2px 6px rgba(0,0,0,0.4)",
              }}
              title="Change Picture"
            >
              📷
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleUpdateAvatar}
              accept="image/*"
              style={{ display: "none" }}
            />
          </div>

          <h2 style={{ fontSize: "22px", margin: "0 0 4px", color: "white" }}>
            {name}
          </h2>
          <p style={{ color: "#FF9800", fontSize: "14px", fontWeight: "600", margin: "0 0 6px" }}>
            {role}
          </p>
          <p style={{ color: "#90a4ae", fontSize: "13px", margin: 0 }}>
            {company} • {department}
          </p>
        </div>

        {/* DETAILS SECTION */}
        <div
          style={{
            background: "#16233d",
            borderRadius: "16px",
            border: "1px solid rgba(255,255,255,0.12)",
            padding: "20px",
            marginBottom: "20px",
            textAlign: "left",
          }}
        >
          <h3 style={{ fontSize: "15px", margin: "0 0 16px", color: "#90a4ae", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            {t("settings.profile") || "Personal Information"}
          </h3>

          <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
            <span style={{ color: "#90a4ae", fontSize: "14px" }}>Email</span>
            <span style={{ color: "white", fontSize: "14px", fontWeight: "500" }}>{email}</span>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
            <span style={{ color: "#90a4ae", fontSize: "14px" }}>Phone</span>
            <span style={{ color: "white", fontSize: "14px", fontWeight: "500" }}>{phone}</span>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
            <span style={{ color: "#90a4ae", fontSize: "14px" }}>Department</span>
            <span style={{ color: "white", fontSize: "14px", fontWeight: "500" }}>{department}</span>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0" }}>
            <span style={{ color: "#90a4ae", fontSize: "14px" }}>Organization</span>
            <span style={{ color: "white", fontSize: "14px", fontWeight: "500" }}>{company}</span>
          </div>
        </div>

        {/* LOGOUT BUTTON */}
        <button
          type="button"
          onClick={handleLogout}
          style={{
            width: "100%",
            padding: "14px",
            background: "rgba(244, 67, 54, 0.15)",
            color: "#f44336",
            border: "1px solid rgba(244, 67, 54, 0.3)",
            borderRadius: "8px",
            fontSize: "15px",
            fontWeight: "bold",
            cursor: "pointer",
            transition: "all 0.3s ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(244, 67, 54, 0.25)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(244, 67, 54, 0.15)")}
        >
          {t("settings.logout") || "Log Out"}
        </button>
      </div>
    </div>
  );
}

export default ProfileScreen;