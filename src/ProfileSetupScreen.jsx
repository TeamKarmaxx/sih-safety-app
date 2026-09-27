import { useState, useRef } from "react";
import { useTranslation } from "react-i18next";

const DEFAULT_AVATARS = [
  "https://api.dicebear.com/7.x/bottts/svg?seed=Felix",
  "https://api.dicebear.com/7.x/bottts/svg?seed=Aneka",
  "https://api.dicebear.com/7.x/bottts/svg?seed=Zack",
  "https://api.dicebear.com/7.x/bottts/svg?seed=Maya",
];

function ProfileSetupScreen({ onComplete }) {
  const { t } = useTranslation();
  const fileInputRef = useRef(null);

  const [avatar, setAvatar] = useState(DEFAULT_AVATARS[0]);
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [department, setDepartment] = useState("");
  const [company, setCompany] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError("Image size should be under 2MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    if (!name || !role || !department || !company || !phone) {
      setError(t("common.error") || "Please fill all fields");
      return;
    }

    localStorage.setItem("profileComplete", "true");
    localStorage.setItem("userAvatar", avatar);
    localStorage.setItem("userName", name);
    localStorage.setItem("userRole", role);
    localStorage.setItem("userDepartment", department);
    localStorage.setItem("userCompany", company);
    localStorage.setItem("userPhone", phone);

    setError("");
    onComplete();
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        background: "#0d162b",
        color: "white",
        fontFamily: "sans-serif",
        padding: "24px 16px 80px",
        boxSizing: "border-box",
      }}
    >
      <div style={{ maxWidth: "500px", margin: "0 auto" }}>
        <div style={{ marginBottom: "24px", textAlign: "center" }}>
          <h1 style={{ fontSize: "28px", margin: "0 0 8px" }}>
            {t("profile.title") || "Complete Profile"}
          </h1>
          <p style={{ color: "#90a4ae", fontSize: "14px", margin: 0 }}>
            {t("app.title") || "Safety App"}
          </p>
        </div>

        <div
          style={{
            background: "#16233d",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: "16px",
            padding: "24px",
          }}
        >
          {/* TOP CENTER AVATAR SECTION */}
          <div style={{ textAlign: "center", marginBottom: "24px" }}>
            <div style={{ position: "relative", display: "inline-block" }}>
              <img
                src={avatar}
                alt="Profile Avatar"
                style={{
                  width: "100px",
                  height: "100px",
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: "3px solid #64b5f6",
                  background: "#0d162b",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                }}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current && fileInputRef.current.click()}
                style={{
                  position: "absolute",
                  bottom: "0",
                  right: "0",
                  background: "#64b5f6",
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
                title="Upload Photo"
              >
                📷
              </button>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              style={{ display: "none" }}
            />

            <p style={{ color: "#90a4ae", fontSize: "12px", margin: "8px 0 12px" }}>
              Upload your photo or select an avatar below:
            </p>

            {/* PRESET AVATAR CHOICES */}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "10px",
                flexWrap: "wrap",
              }}
            >
              {DEFAULT_AVATARS.map((avUrl, index) => (
                <img
                  key={index}
                  src={avUrl}
                  alt={`Preset ${index + 1}`}
                  onClick={() => setAvatar(avUrl)}
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    cursor: "pointer",
                    border: avatar === avUrl ? "2px solid #64b5f6" : "2px solid transparent",
                    background: "#0d162b",
                    padding: "2px",
                    transition: "transform 0.2s ease",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.15)")}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                />
              ))}
            </div>
          </div>

          {/* INPUT FIELDS */}
          <div style={{ marginBottom: "16px" }}>
            <label
              style={{
                color: "#90a4ae",
                fontSize: "12px",
                display: "block",
                marginBottom: "6px",
              }}
            >
              {t("profile.name") || "Full Name"} *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("profile.placeholder_name") || "e.g. John Doe"}
              style={{
                width: "100%",
                padding: "12px",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "8px",
                color: "white",
                fontSize: "14px",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label
              style={{
                color: "#90a4ae",
                fontSize: "12px",
                display: "block",
                marginBottom: "6px",
              }}
            >
              {t("profile.role") || "Job Role"} *
            </label>
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder={t("profile.placeholder_role") || "e.g. Safety Officer"}
              style={{
                width: "100%",
                padding: "12px",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "8px",
                color: "white",
                fontSize: "14px",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label
              style={{
                color: "#90a4ae",
                fontSize: "12px",
                display: "block",
                marginBottom: "6px",
              }}
            >
              {t("profile.department") || "Department"} *
            </label>
            <input
              type="text"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder={t("profile.placeholder_department") || "e.g. Operations"}
              style={{
                width: "100%",
                padding: "12px",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "8px",
                color: "white",
                fontSize: "14px",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label
              style={{
                color: "#90a4ae",
                fontSize: "12px",
                display: "block",
                marginBottom: "6px",
              }}
            >
              {t("profile.company") || "Company"} *
            </label>
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder={t("profile.placeholder_company") || "e.g. ABC Energy Ltd."}
              style={{
                width: "100%",
                padding: "12px",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "8px",
                color: "white",
                fontSize: "14px",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div style={{ marginBottom: "24px" }}>
            <label
              style={{
                color: "#90a4ae",
                fontSize: "12px",
                display: "block",
                marginBottom: "6px",
              }}
            >
              {t("profile.phone") || "Phone Number"} *
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder={t("profile.placeholder_phone") || "+91 9876543210"}
              style={{
                width: "100%",
                padding: "12px",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "8px",
                color: "white",
                fontSize: "14px",
                boxSizing: "border-box",
              }}
            />
          </div>

          {error && (
            <div
              style={{
                background: "rgba(244, 67, 54, 0.1)",
                color: "#f44336",
                padding: "10px",
                borderRadius: "6px",
                marginBottom: "16px",
                fontSize: "12px",
                textAlign: "center",
              }}
            >
              {error}
            </div>
          )}

          <button
            type="button"
            onClick={handleSubmit}
            style={{
              width: "100%",
              padding: "14px",
              background: "#64b5f6",
              color: "#0d162b",
              border: "none",
              borderRadius: "8px",
              fontSize: "15px",
              fontWeight: "bold",
              cursor: "pointer",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#42a5f5")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#64b5f6")}
          >
            {t("profile.submit") || "Save & Continue"} →
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProfileSetupScreen;