import { useState } from "react";
import { useTranslation } from "react-i18next";

function ProgressScreen({ onBack }) {
  const { t } = useTranslation();

  const [userName] = useState(() => {
    return localStorage.getItem("userName") || "User";
  });

  const modules = [
    {
      id: "fire",
      title: t('home.fire'),
      icon: "🔥",
      progress: 75,
      status: "In Progress",
      attempts: 3,
      score: 85,
    },
    {
      id: "gas",
      title: t('home.gas'),
      icon: "💨",
      progress: 40,
      status: "In Progress",
      attempts: 2,
      score: 72,
    },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        background: "#0d162b",
        color: "white",
        fontFamily: "sans-serif",
        padding: "16px",
        boxSizing: "border-box",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
          marginTop: "8px",
        }}
      >
        <button
          type="button"
          onClick={onBack}
          style={{
            background: "transparent",
            border: "1px solid rgba(255,255,255,0.2)",
            color: "#b0bec5",
            borderRadius: "8px",
            padding: "8px 12px",
            cursor: "pointer",
            fontSize: "13px",
            transition: "all 0.3s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "rgba(100, 181, 246, 0.5)";
            e.currentTarget.style.color = "#64b5f6";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)";
            e.currentTarget.style.color = "#b0bec5";
          }}
        >
          ← {t('app.back')}
        </button>

        <h1
          style={{
            fontSize: "20px",
            margin: 0,
            flex: 1,
            textAlign: "center",
          }}
        >
          {t('home.progress')}
        </h1>

        <div style={{ width: "60px" }} />
      </div>

      {/* Overview Card */}
      <div
        style={{
          background: "#16233d",
          border: "1px solid rgba(100, 181, 246, 0.3)",
          borderRadius: "12px",
          padding: "18px",
          marginBottom: "24px",
          textAlign: "center",
        }}
      >
        <p
          style={{
            color: "#90a4ae",
            fontSize: "12px",
            margin: "0 0 6px",
            textTransform: "uppercase",
          }}
        >
          {t('common.user')}
        </p>
        <h2
          style={{
            color: "white",
            fontSize: "20px",
            fontWeight: "bold",
            margin: 0,
          }}
        >
          {userName}
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "12px",
            marginTop: "16px",
          }}
        >
          <div
            style={{
              background: "rgba(100, 181, 246, 0.1)",
              borderRadius: "8px",
              padding: "12px",
            }}
          >
            <p
              style={{
                color: "#64b5f6",
                fontSize: "12px",
                margin: "0 0 4px",
                fontWeight: "bold",
              }}
            >
              Overall
            </p>
            <p
              style={{
                color: "white",
                fontSize: "18px",
                fontWeight: "bold",
                margin: 0,
              }}
            >
              57%
            </p>
          </div>

          <div
            style={{
              background: "rgba(129, 199, 132, 0.1)",
              borderRadius: "8px",
              padding: "12px",
            }}
          >
            <p
              style={{
                color: "#81c784",
                fontSize: "12px",
                margin: "0 0 4px",
                fontWeight: "bold",
              }}
            >
              {t('common.completed')}
            </p>
            <p
              style={{
                color: "white",
                fontSize: "18px",
                fontWeight: "bold",
                margin: 0,
              }}
            >
              1
            </p>
          </div>
        </div>
      </div>

      {/* Modules Progress */}
      <p
        style={{
          color: "#90a4ae",
          fontSize: "12px",
          letterSpacing: "1px",
          textTransform: "uppercase",
          margin: "0 0 16px",
        }}
      >
        {t('home.trainingModules')}
      </p>

      {modules.map((module) => (
        <div
          key={module.id}
          style={{
            background: "#16233d",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: "12px",
            padding: "16px",
            marginBottom: "12px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "12px",
            }}
          >
            <div
              style={{
                fontSize: "24px",
              }}
            >
              {module.icon}
            </div>

            <div style={{ flex: 1 }}>
              <h3
                style={{
                  color: "white",
                  fontSize: "16px",
                  fontWeight: "bold",
                  margin: "0 0 4px",
                }}
              >
                {module.title}
              </h3>
              <p
                style={{
                  color: "#90a4ae",
                  fontSize: "12px",
                  margin: 0,
                }}
              >
                {module.status}
              </p>
            </div>

            <div
              style={{
                textAlign: "right",
              }}
            >
              <p
                style={{
                  color: "#64b5f6",
                  fontSize: "18px",
                  fontWeight: "bold",
                  margin: 0,
                }}
              >
                {module.progress}%
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div
            style={{
              width: "100%",
              height: "8px",
              background: "rgba(255,255,255,0.1)",
              borderRadius: "4px",
              overflow: "hidden",
              marginBottom: "12px",
            }}
          >
            <div
              style={{
                width: `${module.progress}%`,
                height: "100%",
                background: "linear-gradient(90deg, #64b5f6, #42a5f5)",
                borderRadius: "4px",
              }}
            />
          </div>

          {/* Stats */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "8px",
            }}
          >
            <div
              style={{
                background: "rgba(255,255,255,0.05)",
                borderRadius: "6px",
                padding: "8px",
                textAlign: "center",
              }}
            >
              <p
                style={{
                  color: "#90a4ae",
                  fontSize: "11px",
                  margin: "0 0 4px",
                }}
              >
                Attempts
              </p>
              <p
                style={{
                  color: "white",
                  fontSize: "14px",
                  fontWeight: "bold",
                  margin: 0,
                }}
              >
                {module.attempts}
              </p>
            </div>

            <div
              style={{
                background: "rgba(255,255,255,0.05)",
                borderRadius: "6px",
                padding: "8px",
                textAlign: "center",
              }}
            >
              <p
                style={{
                  color: "#90a4ae",
                  fontSize: "11px",
                  margin: "0 0 4px",
                }}
              >
                Best Score
              </p>
              <p
                style={{
                  color: "#81c784",
                  fontSize: "14px",
                  fontWeight: "bold",
                  margin: 0,
                }}
              >
                {module.score}%
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default ProgressScreen;