import { translateTraining } from "./trainingTranslation";
import { useEffect, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import LanguageToggle from "./LanguageToggle";
import { useAuth } from "./context/useAuth.js";
import { getDashboard } from "./api/progress";
import { Screen, Card, Eyebrow, Button } from "./components/ui/Layout.jsx";
import { ProgressRing } from "./components/ui/ProgressRing.jsx";
import { StatusBadge } from "./components/ui/StatusBadge.jsx";
import { deriveModuleStatus } from "./lib/status.js";
import { LoadingState, ErrorState, EmptyState } from "./components/ui/AsyncStates.jsx";
import { hazardIconFor, hazardColorFor } from "./lib/hazard.js";

function DashboardScreen({ onNavigate, onSelectModule }) {
  const { t } = useTranslation();
  const { session } = useAuth();
  const userId = session?.userId ?? null;
  const [dashboard, setDashboard] = useState(null);
  const [loadState, setLoadState] = useState("loading");

  const load = useCallback(async () => {
    if (!userId) {
      setLoadState("error");
      return;
    }
    try {
      const data = await getDashboard(userId);
      setDashboard(data);
      setLoadState("ready");
    } catch {
      setLoadState("error");
    }
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  const retry = useCallback(() => {
    setLoadState("loading");
    load();
  }, [load]);

  if (loadState === "loading") {
    return (
      <Screen>
        <LoadingState message={t("dashboard.loading") || "Loading your progress..."} />
      </Screen>
    );
  }

  if (loadState === "error" || !dashboard) {
    return (
      <Screen>
        <ErrorState
          title={t("dashboard.error_title") || "Unable to load your dashboard"}
          message={t("dashboard.error_message") || "Unable to connect to training server. Retry."}
          onRetry={retry}
        />
      </Screen>
    );
  }

  const {
    user_name: userName,
    total_modules: totalModules,
    completed_modules: completedModules,
    overall_progress: overallProgress,
    modules = [],
  } = dashboard;

  // "Next up" = first module that isn't complete yet, else the first module.
  const nextModule = modules.find((m) => !m.completed) || modules[0] || null;

  return (
    <Screen>
      <div
        style={{
          marginBottom: "24px",
          marginTop: "4px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <div style={{ textAlign: "left" }}>
          <h1 style={{ fontSize: "22px", margin: "0 0 4px", color: "var(--color-text-primary)" }}>
            {t("dashboard.title") || "Dashboard"}
          </h1>
          <p style={{ color: "var(--color-accent)", fontSize: "12px", margin: 0, fontWeight: 700 }}>
            {t("dashboard.welcome") || "Welcome back"}, {userName}
          </p>
        </div>
        <LanguageToggle />
      </div>

      {/* Overall progress card */}
      <Card raised style={{ marginBottom: "20px", display: "flex", alignItems: "center", gap: "20px" }}>
        <ProgressRing progress={overallProgress} size={128} label={t("dashboard.progress") || "Progress"} />

        <div style={{ flex: 1, textAlign: "left" }}>
          <p
            style={{
              color: "var(--color-text-secondary)",
              fontSize: "11px",
              margin: "0 0 6px",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              fontWeight: 700,
            }}
          >
            {t("dashboard.overallProgress") || "Overall Progress"}
          </p>
          <p style={{ color: "var(--color-text-primary)", fontSize: "13px", margin: "0 0 12px" }}>
            {completedModules} / {totalModules} {t("dashboard.modulesLabel") || "modules completed"}
          </p>

          <Button onClick={() => onNavigate("modules")}>
            {t("dashboard.continueTraining") || "Continue Training"}
          </Button>
        </div>
      </Card>

      {/* Next up */}
      {nextModule && (
        <>
          <Eyebrow>{t("dashboard.nextUp") || "Next Up"}</Eyebrow>
          <Card
            interactive
            style={{ marginBottom: "20px" }}
            onClick={() => {
              onSelectModule?.(nextModule.module_id);
              onNavigate("module-detail");
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ fontSize: "30px" }}>{hazardIconFor(nextModule.title)}</div>
              <div style={{ flex: 1, textAlign: "left" }}>
                <p style={{ margin: "0 0 4px", fontWeight: 700, fontSize: "14px", color: "var(--color-text-primary)" }}>
                   {translateTraining(nextModule.title)}
                </p>
                <p style={{ margin: 0, fontSize: "12px", color: "var(--color-text-secondary)" }}>
                  {nextModule.progress}% {t("dashboard.complete") || "complete"}
                </p>
              </div>
              <StatusBadge status={deriveModuleStatus(nextModule)} />
            </div>
          </Card>
        </>
      )}

      {/* Module summary list */}
      <Eyebrow>{t("dashboard.yourModules") || "Your Modules"}</Eyebrow>

      {modules.length === 0 && (
        <EmptyState
          icon="📚"
          title={t("dashboard.no_modules_title") || "No modules yet"}
          message={t("dashboard.no_modules_message") || "Training modules will appear here once published."}
        />
      )}

      {modules.map((m) => {
        const accent = hazardColorFor(m.title);
        return (
          <Card
            key={m.module_id}
            interactive
            style={{ marginBottom: "12px", borderColor: `${accent}30` }}
            onClick={() => {
              onSelectModule?.(m.module_id);
              onNavigate("module-detail");
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px" }}>
              <div style={{ textAlign: "left", flex: 1, minWidth: 0 }}>
                <p style={{ margin: "0 0 4px", fontSize: "13px", fontWeight: 700, color: "var(--color-text-primary)" }}>
                  {hazardIconFor(m.title)} {translateTraining(m.title)}
                </p>
                <p style={{ margin: 0, fontSize: "11px", color: "var(--color-text-secondary)" }}>
                  {m.completed_lessons}/{m.total_lessons} lessons · {m.completed_drills}/{m.total_drills} drills
                  {m.quiz_percentage !== null ? ` · Quiz ${Math.round(m.quiz_percentage)}%` : ""}
                </p>
              </div>
              <StatusBadge status={deriveModuleStatus(m)} />
            </div>
          </Card>
        );
      })}
    </Screen>
  );
}

export default DashboardScreen;
