import { useEffect, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "./context/useAuth.js";
import { getLessonContent, updateLessonProgress } from "./api/lessons";
import { Screen, BackButton, Card, Button } from "./components/ui/Layout.jsx";
import { LoadingState, ErrorState } from "./components/ui/AsyncStates.jsx";
import { toBackendLanguage } from "./lib/language.js";
import { ApiError } from "./api/client";
import { enqueueAction } from "./offline/db.js";
import { ACTION_TYPES } from "./offline/syncQueue.js";

function LessonScreen({ lessonId, alreadyCompleted, onBack, onCompleted }) {
  const { t, i18n } = useTranslation();
  const { session } = useAuth();
  const userId = session?.userId ?? null;

  const [content, setContent] = useState(null);
  const [loadState, setLoadState] = useState("loading"); // loading | ready | error
  const [savingProgress, setSavingProgress] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [completed, setCompleted] = useState(!!alreadyCompleted);
  // 'synced' = confirmed by the backend. 'queued' = saved locally, not yet
  // confirmed — shown distinctly so we never claim a queued action is done.
  const [syncStatus, setSyncStatus] = useState(alreadyCompleted ? "synced" : null);

  const load = useCallback(async () => {
    if (!lessonId) {
      setLoadState("error");
      return;
    }
    try {
      const language = toBackendLanguage(i18n.language);
      const data = await getLessonContent(lessonId, language);
      setContent(data);
      setLoadState("ready");
    } catch {
      setLoadState("error");
    }
  }, [lessonId, i18n.language]);

  useEffect(() => {
    load();
  }, [load]);

  const retry = useCallback(() => {
    setLoadState("loading");
    load();
  }, [load]);

  const handleMarkComplete = async () => {
    if (!userId || !lessonId) return;
    setSavingProgress(true);
    setSaveError("");

    const payload = { userId, lessonId, completed: true };

    // Offline-first: if the device has no network path at all, don't even
    // attempt the call — queue immediately rather than waiting on a request
    // we already know will fail.
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      await enqueueAction({ type: ACTION_TYPES.LESSON_PROGRESS, payload });
      setCompleted(true);
      setSyncStatus("queued");
      setSavingProgress(false);
      return;
    }

    try {
      await updateLessonProgress(userId, lessonId, true);
      setCompleted(true);
      setSyncStatus("synced");
      onCompleted?.(lessonId);
    } catch (err) {
      if (err instanceof ApiError && err.isNetworkError) {
        // Reported online but the request still failed to reach the
        // backend — queue it rather than losing the learner's action.
        await enqueueAction({ type: ACTION_TYPES.LESSON_PROGRESS, payload });
        setCompleted(true);
        setSyncStatus("queued");
      } else {
        setSaveError(
          t("lesson.save_error") || "Could not save your progress. Check your connection and try again."
        );
      }
    } finally {
      setSavingProgress(false);
    }
  };

  if (loadState === "loading") {
    return (
      <Screen>
        <BackButton onClick={onBack} label={t("common.back") || "Back"} />
        <LoadingState message={t("lesson.loading") || "Loading lesson..."} />
      </Screen>
    );
  }

  if (loadState === "error" || !content) {
    return (
      <Screen>
        <BackButton onClick={onBack} label={t("common.back") || "Back"} />
        <ErrorState
          title={t("lesson.error_title") || "Unable to load this lesson"}
          message={t("lesson.error_message") || "Unable to connect to training server. Retry."}
          onRetry={retry}
        />
      </Screen>
    );
  }

  return (
    <Screen>
      <div style={{ marginBottom: "16px" }}>
        <BackButton onClick={onBack} label={t("common.back") || "Back"} />
      </div>

      <Card raised style={{ marginBottom: "16px" }}>
        {content.translated === false && (
          <p
            style={{
              fontSize: "11px",
              color: "var(--color-text-muted)",
              margin: "0 0 10px",
              fontStyle: "italic",
            }}
          >
            {content.message || "Showing original lesson (no translation available for this language)."}
          </p>
        )}

        <h1 style={{ fontSize: "18px", margin: "0 0 12px", color: "var(--color-text-primary)" }}>
          {content.title}
        </h1>

        <p
          style={{
            fontSize: "14px",
            lineHeight: 1.6,
            color: "var(--color-text-primary)",
            margin: 0,
            whiteSpace: "pre-wrap",
          }}
        >
          {content.content}
        </p>
      </Card>

      {saveError && (
        <div
          style={{
            background: "var(--color-danger-soft)",
            color: "var(--color-danger)",
            padding: "10px",
            borderRadius: "var(--radius-sm)",
            marginBottom: "12px",
            fontSize: "12px",
          }}
        >
          {saveError}
        </div>
      )}

      {completed && syncStatus === "synced" && (
        <Card style={{ textAlign: "center", color: "var(--color-success)", fontWeight: 700, fontSize: "13px" }}>
          ✓ {t("lesson.completed") || "Lesson completed"}
        </Card>
      )}
      {completed && syncStatus === "queued" && (
        <Card style={{ textAlign: "center", color: "var(--color-warning)", fontWeight: 700, fontSize: "13px" }}>
          ⏳ {t("lesson.queued") || "Saved — will sync with the server once you're back online"}
        </Card>
      )}
      {!completed && (
        <Button onClick={handleMarkComplete} disabled={savingProgress}>
          {savingProgress
            ? t("lesson.saving") || "Saving..."
            : t("lesson.mark_complete") || "Mark as Complete"}
        </Button>
      )}
    </Screen>
  );
}

export default LessonScreen;
