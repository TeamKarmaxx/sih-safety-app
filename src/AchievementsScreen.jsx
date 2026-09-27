import { useState } from "react";
import { useTranslation } from "react-i18next";

function AchievementsScreen() {
  const { t } = useTranslation();

  const [achievements] = useState([
    {
      id: 1,
      icon: "🔥",
      title: "Fire Safety Master",
      description: "Complete Fire & Explosion Response",
      status: "locked",
      progress: 0,
      requirement: "Complete 1 module",
    },
    {
      id: 2,
      icon: "💨",
      title: "Gas Leak Expert",
      description: "Master Gas Leak & Confined Space",
      status: "locked",
      progress: 0,
      requirement: "Complete 2 modules",
    },
    {
      id: 3,
      icon: "⚡",
      title: "Speed Runner",
      description: "Complete simulation in under 2 minutes",
      status: "locked",
      progress: 0,
      requirement: "Fast completion",
    },
    {
      id: 4,
      icon: "🎯",
      title: "Perfect Score",
      description: "Score 100% on any assessment",
      status: "locked",
      progress: 0,
      requirement: "Score 100%",
    },
    {
      id: 5,
      icon: "🏆",
      title: "Champion",
      description: "Complete all training modules",
      status: "locked",
      progress: 0,
      requirement: "Complete all 8 modules",
    },
    {
      id: 6,
      icon: "🌟",
      title: "Consistent Learner",
      description: "Train 5 days in a row",
      status: "locked",
      progress: 0,
      requirement: "5 day streak",
    },
  ]);

  const [streak] = useState({
    current: 0,
    best: 0,
    days: [],
  });

  const [points] = useState({
    total: 0,
    earned: "0/500",
    level: 1,
  });

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
        <h1
          style={{
            fontSize: "24px",
            margin: "0 0 4px",
            color: "white",
          }}
        >
          ACHIEVEMENTS
        </h1>
        <p
          style={{
            color: "#FF9800",
            fontSize: "12px",
            margin: 0,
            fontWeight: "bold",
          }}
        >
          BADGES & REWARDS
        </p>
      </div>

      {/* Stats Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "12px",
          marginBottom: "24px",
        }}
      >
        {/* Level Card */}
        <div
          style={{
            background: "linear-gradient(135deg, #FF9800 0%, #F57C00 100%)",
            borderRadius: "12px",
            padding: "16px",
            textAlign: "center",
          }}
        >
          <p
            style={{
              color: "rgba(255,255,255,0.8)",
              fontSize: "11px",
              margin: "0 0 4px",
              textTransform: "uppercase",
            }}
          >
            Current Level
          </p>
          <h2
            style={{
              fontSize: "28px",
              fontWeight: "bold",
              margin: 0,
              color: "white",
            }}
          >
            {points.level}
          </h2>
          <p
            style={{
              fontSize: "10px",
              color: "rgba(255,255,255,0.7)",
              margin: 0,
            }}
          >
            Beginner
          </p>
        </div>

        {/* Points Card */}
        <div
          style={{
            background: "linear-gradient(135deg, #D4A574 0%, #C19A6B 100%)",
            borderRadius: "12px",
            padding: "16px",
            textAlign: "center",
          }}
        >
          <p
            style={{
              color: "rgba(255,255,255,0.8)",
              fontSize: "11px",
              margin: "0 0 4px",
              textTransform: "uppercase",
            }}
          >
            Total Points
          </p>
          <h2
            style={{
              fontSize: "28px",
              fontWeight: "bold",
              margin: 0,
              color: "white",
            }}
          >
            {points.total}
          </h2>
          <p
            style={{
              fontSize: "10px",
              color: "rgba(255,255,255,0.7)",
              margin: 0,
            }}
          >
            {points.earned}
          </p>
        </div>
      </div>

      {/* Streak Section */}
      <p
        style={{
          color: "#90a4ae",
          fontSize: "12px",
          letterSpacing: "1px",
          textTransform: "uppercase",
          margin: "0 0 12px",
        }}
      >
        Your Streak 🔥
      </p>

      <div
        style={{
          background: "linear-gradient(135deg, #16233d 0%, #1a2a47 100%)",
          border: "1px solid rgba(255, 152, 0, 0.3)",
          borderRadius: "12px",
          padding: "16px",
          marginBottom: "24px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "12px",
            marginBottom: "16px",
          }}
        >
          <div>
            <p
              style={{
                color: "#90a4ae",
                fontSize: "11px",
                margin: "0 0 4px",
                textTransform: "uppercase",
              }}
            >
              Current Streak
            </p>
            <h3
              style={{
                fontSize: "24px",
                fontWeight: "bold",
                color: "#FF9800",
                margin: 0,
              }}
            >
              {streak.current} 🔥
            </h3>
          </div>

          <div>
            <p
              style={{
                color: "#90a4ae",
                fontSize: "11px",
                margin: "0 0 4px",
                textTransform: "uppercase",
              }}
            >
              Best Streak
            </p>
            <h3
              style={{
                fontSize: "24px",
                fontWeight: "bold",
                color: "#D4A574",
                margin: 0,
              }}
            >
              {streak.best} ⭐
            </h3>
          </div>
        </div>

        <p
          style={{
            color: "#90a4ae",
            fontSize: "12px",
            margin: 0,
            fontStyle: "italic",
          }}
        >
          Start training to build your streak!
        </p>
      </div>

      {/* Achievements Section */}
      <p
        style={{
          color: "#90a4ae",
          fontSize: "12px",
          letterSpacing: "1px",
          textTransform: "uppercase",
          margin: "0 0 12px",
        }}
      >
        Badges & Achievements (0/6)
      </p>

      {achievements.map((achievement) => (
        <div
          key={achievement.id}
          style={{
            background: "#16233d",
            border: "1px solid rgba(255, 152, 0, 0.2)",
            borderRadius: "12px",
            padding: "16px",
            marginBottom: "12px",
            opacity: achievement.status === "locked" ? 0.6 : 1,
          }}
        >
          <div style={{ display: "flex", gap: "12px" }}>
            {/* Badge Icon */}
            <div
              style={{
                fontSize: "40px",
                flexShrink: 0,
                filter:
                  achievement.status === "locked"
                    ? "grayscale(100%)"
                    : "none",
              }}
            >
              {achievement.icon}
            </div>

            {/* Achievement Info */}
            <div style={{ flex: 1 }}>
              <h3
                style={{
                  color: "white",
                  fontSize: "14px",
                  fontWeight: "bold",
                  margin: "0 0 4px",
                }}
              >
                {achievement.title}
              </h3>
              <p
                style={{
                  color: "#90a4ae",
                  fontSize: "12px",
                  margin: "0 0 8px",
                }}
              >
                {achievement.description}
              </p>

              {/* Progress Bar */}
              <div
                style={{
                  width: "100%",
                  height: "6px",
                  background: "rgba(255, 152, 0, 0.1)",
                  borderRadius: "3px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${achievement.progress}%`,
                    height: "100%",
                    background: "#FF9800",
                  }}
                />
              </div>

              <p
                style={{
                  color: "#90a4ae",
                  fontSize: "10px",
                  margin: "6px 0 0",
                  fontStyle: "italic",
                }}
              >
                {achievement.requirement}
              </p>
            </div>

            {/* Status Badge */}
            <div
              style={{
                flexShrink: 0,
                textAlign: "center",
              }}
            >
              {achievement.status === "locked" ? (
                <span style={{ fontSize: "24px" }}>🔒</span>
              ) : (
                <span style={{ fontSize: "24px" }}>✓</span>
              )}
              <p
                style={{
                  fontSize: "10px",
                  color: "#FF9800",
                  margin: "4px 0 0",
                  fontWeight: "bold",
                }}
              >
                {achievement.status === "locked"
                  ? "Locked"
                  : "Unlocked"}
              </p>
            </div>
          </div>
        </div>
      ))}

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
          ℹ️ Complete modules and challenges to unlock badges and earn points!
        </p>
      </div>
    </div>
  );
}

export default AchievementsScreen;