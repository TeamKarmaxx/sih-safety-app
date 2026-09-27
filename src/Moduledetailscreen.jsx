import { useEffect, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "./context/useAuth.js";
import { getModule, getModuleSummary } from "./api/modules";
import { getModuleLessons, getUserProgress } from "./api/lessons";
import { getModuleDrills, getUserDrillProgress } from "./api/drills";
import { getQuizAttempts, getDrillQuizAttempts } from "./api/quizzes";
import { Screen, BackButton, Card, Button, Eyebrow } from "./components/ui/Layout.jsx";
import { StatusBadge } from "./components/ui/StatusBadge.jsx";
import { deriveQuizStatus } from "./lib/status.js";
import { LoadingState, ErrorState, EmptyState } from "./components/ui/AsyncStates.jsx";
import { hazardIconFor, hazardColorFor } from "./lib/hazard.js";
import { resolveDrillScreen } from "./ar/sceneRegistry.js";
import { cachedGet } from "./offline/cachedFetch.js";

/** Most recent attempt for a given id, assuming attempts are returned in any
 * order — we pick the one with the highest `id` (backend orders by id desc
 * for drill-quiz-attempts already, but module quiz-attempts are not
 * explicitly ordered, so we sort defensively here rather than assume). */
function latestById(attempts, matchField, matchValue) {
  const matches = (attempts || []).filter((a) => a[matchField] === matchValue);
  if (matches.length === 0) return null;
  return matches.reduce((latest, current) => (current.id > latest.id ? current : latest));
}

function ModuleDetailScreen({ moduleId, onNavigate, onSelectLesson, onSelectDrill, onBack }) {
  const { t } = useTranslation();
  const { session } = useAuth();
  const userId = session?.userId ?? null;

  const [module, setModule] = useState(null);
  const [summary, setSummary] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [drills, setDrills] = useState([]);
  const [completedLessonIds, setCompletedLessonIds] = useState(() => new Set());
  const [drillProgressById, setDrillProgressById] = useState(() => new Map());
  const [drillQuizAttempts, setDrillQuizAttempts] = useState([]);
  const [moduleQuizAttempt, setModuleQuizAttempt] = useState(null);
  const [loadState, setLoadState] = useState("loading"); // loading | ready | error
  const [usedCache, setUsedCache] = useState(false);

  const load = useCallback(async () => {
    if (!moduleId) {
      setLoadState("error");
      return;
    }
    try {
      // Module/summary/lessons/drills are safe, static structure — cached so
      // a module already browsed once can still be viewed offline. Progress,
      // drill-progress, and quiz attempts are the learner's real state and
      // must stay live; each is fetched independently and simply omitted
      // (never faked) if unreachable, rather than blocking the cached
      // static content behind them.
      const [moduleResult, summaryResult, lessonsResult, drillsResult] = await Promise.all([
        cachedGet(`module:${moduleId}`, () => getModule(moduleId)),
        cachedGet(`module-summary:${moduleId}`, () => getModuleSummary(moduleId)),
        cachedGet(`module-lessons:${moduleId}`, () => getModuleLessons(moduleId)),
        cachedGet(`module-drills:${moduleId}`, () => getModuleDrills(moduleId)),
      ]);

      const moduleData = moduleResult.data;
      const summaryData = summaryResult.data;
      const lessonList = lessonsResult.data;
      const drillList = drillsResult.data;
      const anyFromCache =
        moduleResult.fromCache || summaryResult.fromCache || lessonsResult.fromCache || drillsResult.fromCache;

      if (!moduleData || moduleData.message === "Module not found") {
        setLoadState("error");
        return;
      }

      const [userProgress, drillProgressList, drillQuizAttemptList, moduleQuizAttemptList] = await Promise.all([
        userId ? getUserProgress(userId).catch(() => []) : Promise.resolve([]),
        userId ? getUserDrillProgress(userId).catch(() => []) : Promise.resolve([]),
        userId ? getDrillQuizAttempts(userId).catch(() => []) : Promise.resolve([]),
        userId ? getQuizAttempts(userId).catch(() => []) : Promise.resolve([]),
      ]);

      const lessonIdsInModule = new Set((lessonList || []).map((lesson) => lesson.id));
      const completedIds = new Set(
        (userProgress || [])
          .filter((entry) => entry.completed && lessonIdsInModule.has(entry.lesson_id))
          .map((entry) => entry.lesson_id)
      );

      const progressMap = new Map(
        (drillProgressList || []).map((entry) => [entry.drill_id, entry.completed])
      );

      const latestModuleAttempt = latestById(moduleQuizAttemptList, "module_id", moduleId);

      setModule(moduleData);
      setSummary(summaryData);
      setLessons(Array.isArray(lessonList) ? lessonList : []);
      setDrills(Array.isArray(drillList) ? drillList : []);
      setCompletedLessonIds(completedIds);
      setDrillProgressById(progressMap);
      setDrillQuizAttempts(Array.isArray(drillQuizAttemptList) ? drillQuizAttemptList : []);
      setModuleQuizAttempt(latestModuleAttempt);
      setUsedCache(anyFromCache);
      setLoadState("ready");
    } catch {
      setLoadState("error");
    }
  }, [moduleId, userId]);

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
        <BackButton onClick={onBack} label={t("common.back") || "Back"} />
        <LoadingState message={t("moduleDetail.loading") || "Loading module..."} />
      </Screen>
    );
  }

  if (loadState === "error" || !module) {
    return (
      <Screen>
        <BackButton onClick={onBack} label={t("common.back") || "Back"} />
        <ErrorState
          title={t("moduleDetail.error_title") || "Unable to load this module"}
          message={t("moduleDetail.error_message") || "It may not exist, or the server is unreachable."}
          onRetry={retry}
        />
      </Screen>
    );
  }

  const accent = hazardColorFor(module.title);
  const totalLessons = lessons.length;
  const completedLessonCount = completedLessonIds.size;
  const moduleQuizStatus = moduleQuizAttempt ? deriveQuizStatus(moduleQuizAttempt.percentage) : "not_started";

  return (
    <Screen>
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
        <BackButton onClick={onBack} label={t("common.back") || "Back"} />
        <h2 style={{ margin: 0, fontSize: "16px", fontWeight: 700 }}>
          {t("moduleDetail.title") || "Module Details"}
        </h2>
      </div>

      {usedCache && (
        <p style={{ fontSize: "11px", color: "var(--color-text-muted)", marginTop: "-12px", marginBottom: "16px" }}>
          {t("moduleDetail.offlineNotice") ||
            "You're offline — showing content saved from an earlier visit. Progress shown may be out of date."}
        </p>
      )}

      <Card raised style={{ textAlign: "center", marginBottom: "16px", borderColor: `${accent}40` }}>
        <div style={{ fontSize: "44px", marginBottom: "8px" }}>{hazardIconFor(module.title)}</div>
        <h1 style={{ fontSize: "19px", margin: "0 0 8px", color: "var(--color-text-primary)" }}>
          {module.title}
        </h1>
        <span
          style={{
            display: "inline-block",
            padding: "4px 12px",
            borderRadius: "var(--radius-full)",
            background: `${accent}20`,
            border: `1px solid ${accent}60`,
            color: accent,
            fontSize: "12px",
            fontWeight: 700,
          }}
        >
          {module.difficulty || "—"} · {module.language || "English"}
        </span>
      </Card>

      <Card style={{ marginBottom: "20px" }}>
        <h3
          style={{
            fontSize: "13px",
            color: "var(--color-text-secondary)",
            margin: "0 0 8px",
            textTransform: "uppercase",
          }}
        >
          {t("moduleDetail.overview") || "Overview"}
        </h3>
        <p style={{ fontSize: "14px", lineHeight: 1.5, margin: 0, color: "var(--color-text-primary)" }}>
          {module.description}
        </p>
        {summary && (
          <p style={{ fontSize: "12px", color: "var(--color-text-muted)", margin: "10px 0 0" }}>
            {completedLessonCount}/{totalLessons} {t("moduleDetail.lessonsCompleted") || "lessons completed"}
          </p>
        )}
      </Card>

      {/* Lessons */}
      <Eyebrow>{t("moduleDetail.lessons") || "Lessons"}</Eyebrow>

      {lessons.length === 0 ? (
        <div style={{ marginBottom: "20px" }}>
          <EmptyState
            icon="📖"
            title={t("moduleDetail.no_lessons_title") || "No lessons yet"}
            message={t("moduleDetail.no_lessons_message") || "Lessons for this module haven't been published yet."}
          />
        </div>
      ) : (
        <div style={{ marginBottom: "20px" }}>
          {lessons.map((lesson) => {
            const isCompleted = completedLessonIds.has(lesson.id);
            return (
              <Card
                key={lesson.id}
                interactive
                style={{ marginBottom: "10px" }}
                onClick={() => onSelectLesson(lesson.id, isCompleted)}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px" }}>
                  <p style={{ margin: 0, fontSize: "13px", fontWeight: 600, color: "var(--color-text-primary)" }}>
                    {lesson.title}
                  </p>
                  <StatusBadge status={isCompleted ? "completed" : "not_started"} />
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Drills */}
      <Eyebrow>{t("moduleDetail.drills") || "AR Training Drills"}</Eyebrow>

      {drills.length === 0 ? (
        <div style={{ marginBottom: "20px" }}>
          <EmptyState
            icon="🛠️"
            title={t("moduleDetail.no_drills_title") || "No drills yet"}
            message={t("moduleDetail.no_drills_message") || "Training drills for this module haven't been published yet."}
          />
        </div>
      ) : (
        <div style={{ marginBottom: "24px" }}>
          {drills.map((drill) => {
            const targetScreen = resolveDrillScreen(drill);
            const practicalCompleted = !!drillProgressById.get(drill.id);
            const latestAttempt = latestById(drillQuizAttempts, "drill_id", drill.id);

            let drillStatus = "not_started";
            if (latestAttempt) {
              drillStatus = latestAttempt.passed ? "passed" : "failed";
            } else if (practicalCompleted) {
              drillStatus = "completed";
            }

            return (
              <Card key={drill.id} style={{ marginBottom: "12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px" }}>
                  <div style={{ textAlign: "left", flex: 1 }}>
                    <p style={{ margin: "0 0 4px", fontSize: "14px", fontWeight: 700, color: "var(--color-text-primary)" }}>
                      {drill.title}
                    </p>
                    <p style={{ margin: "0 0 8px", fontSize: "12px", color: "var(--color-text-secondary)" }}>
                      {drill.description}
                    </p>
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", fontSize: "11px", color: "var(--color-text-muted)" }}>
                      {drill.difficulty && <span>Difficulty: {drill.difficulty}</span>}
                      {drill.hazard_type && <span>· Hazard: {drill.hazard_type}</span>}
                      {drill.equipment && <span>· Equipment: {drill.equipment}</span>}
                    </div>
                  </div>
                  <StatusBadge status={drillStatus} />
                </div>

                <div style={{ marginTop: "12px" }}>
                  {targetScreen ? (
                    <Button
                      onClick={() => {
                        onSelectDrill(drill.id);
                        onNavigate(targetScreen);
                      }}
                    >
                      {t("moduleDetail.startDrill") || "Start AR Training"} →
                    </Button>
                  ) : (
                    <div
                      style={{
                        fontSize: "12px",
                        color: "var(--color-text-muted)",
                        textAlign: "center",
                        padding: "10px",
                        background: "var(--color-surface-sunken)",
                        borderRadius: "var(--radius-sm)",
                      }}
                    >
                      {t("moduleDetail.noArScene") ||
                        `No AR training experience is mapped for this drill yet (ar_scene: "${drill.ar_scene || "none"}").`}
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Module assessment */}
      <Eyebrow>{t("moduleDetail.assessment") || "Module Assessment"}</Eyebrow>
      <Card style={{ marginBottom: "8px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
          <div style={{ textAlign: "left" }}>
            <p style={{ margin: "0 0 4px", fontSize: "13px", fontWeight: 600, color: "var(--color-text-primary)" }}>
              {t("moduleDetail.finalAssessment") || "Final Assessment"}
            </p>
            {moduleQuizAttempt && (
              <p style={{ margin: 0, fontSize: "12px", color: "var(--color-text-secondary)" }}>
                {t("moduleDetail.lastScore") || "Last score"}: {Math.round(moduleQuizAttempt.percentage)}%
              </p>
            )}
          </div>
          <StatusBadge status={moduleQuizStatus} />
        </div>
        <Button onClick={() => onNavigate("module-quiz")}>
          {moduleQuizAttempt
            ? t("moduleDetail.retakeAssessment") || "Retake Assessment"
            : t("moduleDetail.takeAssessment") || "Take Assessment"}
        </Button>
      </Card>

      {/* Certificate — eligibility itself is decided entirely by the
          backend on the certificate screen; this is just a way in. */}
      <Card style={{ marginBottom: "8px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px" }}>
          <div style={{ textAlign: "left" }}>
            <p style={{ margin: "0 0 4px", fontSize: "13px", fontWeight: 600, color: "var(--color-text-primary)" }}>
              🏆 {t("moduleDetail.certificate") || "Certificate"}
            </p>
            <p style={{ margin: 0, fontSize: "12px", color: "var(--color-text-secondary)" }}>
              {t("moduleDetail.certificateHint") ||
                "Check eligibility and view your certificate once training is complete."}
            </p>
          </div>
          <Button variant="secondary" onClick={() => onNavigate("assessments")} style={{ width: "auto", flexShrink: 0, padding: "10px 16px" }}>
            {t("moduleDetail.viewCertificate") || "View"}
          </Button>
        </div>
      </Card>
    </Screen>

  );
}

export default ModuleDetailScreen;
