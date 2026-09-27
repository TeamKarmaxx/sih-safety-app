import { useState } from "react";
import { I18nextProvider } from "react-i18next";
import i18n from "./i18n";
import "./App.css";

import { useAuth } from "./context/useAuth.js";

import SplashScreen from "./SplashScreen";
import LoginScreen from "./LoginScreen";
import ProfileSetupScreen from "./ProfileSetupScreen";
import DashboardScreen from "./Dashboardscreen";
import AllmodulesScreen from "./Allmodulescreen";
import ModuleDetailScreen from "./Moduledetailscreen";
import CertificateScreen from "./Certificatescreen";
import ProfileScreen from "./ProfileScreen";
import AchievementsScreen from "./AchievementsScreen";
import NotificationsScreen from "./NotificationsScreen";
import FireModule from "./Firemodule";
import GasModule from "./Gasmodule";
import LessonScreen from "./LessonScreen";
import ModuleQuizScreen from "./ModuleQuizScreen";
import BottomNavigationBar from "./BottomNavigationBar";

// Admin screens
import AdminLogin from "./AdminLogin";
import AdminDashboard from "./AdminDashboard";
import AdminUsers from "./AdminUsers";
import AdminModules from "./AdminModuleManagement";
import AdminAnalytics from "./AdminAnalytics";
import AdminNotifications from "./AdminNotifications";
import AdminExport from "./AdminExport";

function App() {
  const { isAuthenticated, isChecking, isAdmin, logout } = useAuth();

  const [screen, setScreen] = useState("splash");
  // Real backend IDs (integers) — not the frontend-invented "fire"/"gas" strings
  // used before the backend integration.
  const [selectedModuleId, setSelectedModuleId] = useState(null);
  const [selectedLesson, setSelectedLesson] = useState(null); // { lessonId, alreadyCompleted }
  const [selectedDrillId, setSelectedDrillId] = useState(null);

  // Whether the person is currently trying to reach the admin area at all
  // (separate from `isAdmin`, which reflects the real backend is_admin flag
  // for whoever is currently logged in).
  const [adminMode, setAdminMode] = useState(false);

  const handleSplashFinish = () => {
    if (!isAuthenticated) {
      setScreen("login");
      return;
    }
    const profileComplete = localStorage.getItem("profileComplete") === "true";
    setScreen(profileComplete ? "dashboard" : "profile-setup");
  };

  const handleLogin = () => {
    const profileComplete = localStorage.getItem("profileComplete") === "true";
    setScreen(profileComplete ? "dashboard" : "profile-setup");
  };

  const handleProfileComplete = () => setScreen("dashboard");

  const handleNavigate = (nextScreen) => setScreen(nextScreen);

  const handleSelectModule = (moduleId) => setSelectedModuleId(moduleId);

  const handleSelectLesson = (lessonId, alreadyCompleted) => {
    setSelectedLesson({ lessonId, alreadyCompleted });
    setScreen("lesson-detail");
  };

  const handleSelectDrill = (drillId) => setSelectedDrillId(drillId);

  const handleLogout = () => {
    logout();
    setAdminMode(false);
    setScreen("splash");
  };

  const handleAdminLogout = () => {
    logout();
    setAdminMode(false);
    setScreen("splash");
  };

  const showBottomNav = [
    "dashboard",
    "modules",
    "assessments",
    "achievements",
    "notifications",
    "profile",
  ].includes(screen);

  const protectedScreens = [
    "dashboard",
    "modules",
    "module-detail",
    "lesson-detail",
    "module-quiz",
    "assessments",
    "achievements",
    "notifications",
    "profile",
    "fire",
    "gas",
    "profile-setup",
  ];

  if (!isChecking && !isAuthenticated && !adminMode && protectedScreens.includes(screen)) {
    setScreen("login");
  }

  // ==================== ADMIN AREA ====================
  if (adminMode) {
    const adminScreens = [
      "admin-login",
      "admin-dashboard",
      "admin-users",
      "admin-modules",
      "admin-analytics",
      "admin-notifications",
      "admin-export",
    ];

    // Defense in depth: never render real admin screens (anything other
    // than the login gate) for a session that isn't actually an admin,
    // regardless of how `screen` state got set. The backend's own
    // admin_required dependency remains the real authorization boundary
    // either way.
    if (!isChecking && screen !== "admin-login" && (!isAuthenticated || !isAdmin)) {
      setScreen("admin-login");
    }

    return (
      <I18nextProvider i18n={i18n}>
        <div>
          {screen === "admin-login" && (
            <AdminLogin onLogin={() => setScreen("admin-dashboard")} onBack={() => setAdminMode(false)} />
          )}
          {adminScreens.includes(screen) && screen !== "admin-login" && isAdmin && (
            <>
              {screen === "admin-dashboard" && (
                <AdminDashboard onNavigate={handleNavigate} onLogout={handleAdminLogout} />
              )}
              {screen === "admin-users" && <AdminUsers onBack={() => setScreen("admin-dashboard")} />}
              {screen === "admin-modules" && <AdminModules onBack={() => setScreen("admin-dashboard")} />}
              {screen === "admin-analytics" && <AdminAnalytics onBack={() => setScreen("admin-dashboard")} />}
              {screen === "admin-notifications" && (
                <AdminNotifications onBack={() => setScreen("admin-dashboard")} />
              )}
              {screen === "admin-export" && <AdminExport onBack={() => setScreen("admin-dashboard")} />}
            </>
          )}
        </div>
      </I18nextProvider>
    );
  }

  // ==================== WORKER APP ====================
  return (
    <I18nextProvider i18n={i18n}>
      <div className="app-container">
        {/* Admin access entry point (bottom-right gear) — preserved from the
            original UI. Uses the same real login as the worker app; it does
            not grant admin access by itself. */}
        <button
          onClick={() => {
            setAdminMode(true);
            setScreen("admin-login");
          }}
          style={{
            position: "fixed",
            bottom: "20px",
            right: "20px",
            width: "50px",
            height: "50px",
            borderRadius: "50%",
            background: "rgba(255, 152, 0, 0.1)",
            border: "2px solid rgba(255, 152, 0, 0.2)",
            color: "#FF9800",
            fontSize: "20px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 999,
          }}
          title="Admin Access"
        >
          ⚙️
        </button>

        <main className={`app-main-content ${showBottomNav ? "has-bottom-nav" : ""}`}>
          {screen === "splash" && <SplashScreen onFinish={handleSplashFinish} />}
          {screen === "login" && <LoginScreen onLogin={handleLogin} />}
          {screen === "profile-setup" && <ProfileSetupScreen onComplete={handleProfileComplete} />}
          {screen === "dashboard" && (
            <DashboardScreen onNavigate={handleNavigate} onSelectModule={handleSelectModule} />
          )}
          {screen === "modules" && (
            <AllmodulesScreen onNavigate={handleNavigate} onSelectModule={handleSelectModule} />
          )}
          {screen === "module-detail" && (
            <ModuleDetailScreen
              moduleId={selectedModuleId}
              onNavigate={handleNavigate}
              onSelectLesson={handleSelectLesson}
              onSelectDrill={handleSelectDrill}
              onBack={() => handleNavigate("modules")}
            />
          )}
          {screen === "lesson-detail" && (
            <LessonScreen
              lessonId={selectedLesson?.lessonId}
              alreadyCompleted={selectedLesson?.alreadyCompleted}
              onBack={() => handleNavigate("module-detail")}
              onCompleted={() => {}}
            />
          )}
          {screen === "module-quiz" && (
            <ModuleQuizScreen
              moduleId={selectedModuleId}
              onBack={() => handleNavigate("module-detail")}
              onCompleted={() => {}}
            />
          )}
          {screen === "assessments" && (
            <CertificateScreen moduleId={selectedModuleId} onBack={() => handleNavigate("dashboard")} />
          )}
          {screen === "achievements" && <AchievementsScreen />}
          {screen === "notifications" && <NotificationsScreen />}
          {screen === "profile" && <ProfileScreen onBack={handleLogout} />}
          {screen === "fire" && (
            <FireModule
              drillId={selectedDrillId}
              onBack={() => handleNavigate(selectedModuleId ? "module-detail" : "dashboard")}
            />
          )}
          {screen === "gas" && (
            <GasModule
              drillId={selectedDrillId}
              onBack={() => handleNavigate(selectedModuleId ? "module-detail" : "dashboard")}
            />
          )}
        </main>

        {showBottomNav && <BottomNavigationBar activeScreen={screen} onNavigate={handleNavigate} />}
      </div>
    </I18nextProvider>
  );
}

export default App;
