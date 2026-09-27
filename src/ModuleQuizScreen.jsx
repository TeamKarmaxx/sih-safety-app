import { useEffect, useState, useCallback } from "react";
import i18n from "./i18n";
import { useTranslation } from "react-i18next";
import { useAuth } from "./context/useAuth.js";
import { getModuleQuestions } from "./api/modules";
import { submitModuleQuiz } from "./api/quizzes";
import { Screen, BackButton, Card, Button } from "./components/ui/Layout.jsx";
import { StatusBadge } from "./components/ui/StatusBadge.jsx";
import { deriveQuizStatus } from "./lib/status.js";
import { LoadingState, ErrorState, EmptyState } from "./components/ui/AsyncStates.jsx";
import { ApiError } from "./api/client";
import { cachedGet } from "./offline/cachedFetch.js";
import { enqueueAction } from "./offline/db.js";
import { ACTION_TYPES } from "./offline/syncQueue.js";

/**
 * End-of-module assessment. Questions come from GET /modules/{id}/questions
 * (the backend's own response_model strips correct_answer before it ever
 * reaches the frontend). All answers are submitted together to
 * POST /users/{userId}/modules/{moduleId}/quiz; the score/percentage shown
 * is exactly what that endpoint returns. The 70% pass threshold used for the
 * status badge mirrors the threshold the backend itself applies elsewhere
 * (certificate eligibility, drill quiz `passed`) — this endpoint's own
 * response has no `passed` field, so we don't invent a different number.
 */
function ModuleQuizScreen({ moduleId, onBack, onCompleted }) {
  const { t } = useTranslation();
  const { session } = useAuth();
  const userId = session?.userId ?? null;

  const [questions, setQuestions] = useState([]);
  const [loadState, setLoadState] = useState("loading"); // loading | ready | error | empty
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [result, setResult] = useState(null);
  const [queued, setQueued] = useState(false);
  const [usedCache, setUsedCache] = useState(false);

  const load = useCallback(async () => {
    if (!moduleId) {
      setLoadState("error");
      return;
    }
    try {
      // Public questions (no correct answers) are safe, static data — cached
      // so a previously-opened assessment can still be attempted offline.
      const languageMap = {
  en: "en",
  hi: "hi",
  sa: "sa",
};

const backendLanguage = languageMap[i18n.language] || "en";

const { data, fromCache } = await cachedGet(
  `module-questions:${moduleId}:${backendLanguage}`,
  () => getModuleQuestions(moduleId, backendLanguage)
);
      if (!Array.isArray(data) || data.length === 0) {
        setLoadState("empty");
        return;
      }
      setQuestions(data);
      setUsedCache(fromCache);
      setLoadState("ready");
    } catch {
      setLoadState("error");
    }
  }, [moduleId]);

  useEffect(() => {
    load();
  }, [load]);

  const retry = useCallback(() => {
    setLoadState("loading");
    load();
  }, [load]);

  const handleSelect = (questionId, letter) => {
    setAnswers((prev) => ({ ...prev, [questionId]: letter }));
  };

  const allAnswered = questions.length > 0 && questions.every((q) => answers[q.id]);

  const handleSubmit = async () => {
    if (!userId || !moduleId || !allAnswered) return;
    setSubmitting(true);
    setSubmitError("");

    if (typeof navigator !== "undefined" && !navigator.onLine) {
      await enqueueAction({
        type: ACTION_TYPES.MODULE_QUIZ_SUBMIT,
        payload: { userId, moduleId, answers },
      });
      setQueued(true);
      setSubmitting(false);
      return;
    }

    try {
      const data = await submitModuleQuiz(userId, moduleId, answers);
      setResult(data);
      onCompleted?.(data);
    } catch (err) {
      if (err instanceof ApiError && err.isNetworkError) {
        await enqueueAction({
          type: ACTION_TYPES.MODULE_QUIZ_SUBMIT,
          payload: { userId, moduleId, answers },
        });
        setQueued(true);
      } else {
        setSubmitError(
          t("moduleQuiz.submit_error") || "Could not submit your answers. Check your connection and try again."
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetake = () => {
    setAnswers({});
    setResult(null);
  };

  if (loadState === "loading") {
    return (
      <Screen>
        <BackButton onClick={onBack} label={t("common.back") || "Back"} />
        <LoadingState message={t("moduleQuiz.loading") || "Loading assessment..."} />
      </Screen>
    );
  }

  if (loadState === "error") {
    return (
      <Screen>
        <BackButton onClick={onBack} label={t("common.back") || "Back"} />
        <ErrorState
          title={t("moduleQuiz.error_title") || "Unable to load the assessment"}
          message={t("moduleQuiz.error_message") || "Unable to connect to training server. Retry."}
          onRetry={retry}
        />
      </Screen>
    );
  }

  if (loadState === "empty") {
    return (
      <Screen>
        <BackButton onClick={onBack} label={t("common.back") || "Back"} />
        <EmptyState
          icon="📝"
          title={t("moduleQuiz.empty_title") || "No assessment yet"}
          message={t("moduleQuiz.empty_message") || "This module doesn't have quiz questions published yet."}
        />
      </Screen>
    );
  }

  if (queued) {
    return (
      <Screen>
        <BackButton onClick={onBack} label={t("common.back") || "Back"} />
        <Card raised style={{ textAlign: "center", marginTop: "20px" }}>
          <div style={{ fontSize: "32px", marginBottom: "12px" }}>⏳</div>
          <h2 style={{ color: "var(--color-text-primary)", fontSize: "16px", margin: "0 0 8px" }}>
            {t("moduleQuiz.queued_title") || "Answers saved — queued for grading"}
          </h2>
          <p style={{ color: "var(--color-text-secondary)", marginBottom: "24px", fontSize: "13px" }}>
            {t("moduleQuiz.queued_message") ||
              "You're offline right now, so this can't be scored yet. Your answers are saved on this device and will be submitted for real grading as soon as you're back online — no score is shown here because none has been calculated."}
          </p>
          <Button onClick={onBack}>{t("moduleQuiz.done") || "Back to Module"}</Button>
        </Card>
      </Screen>
    );
  }

  if (result) {
    const status = deriveQuizStatus(result.percentage);
    return (
      <Screen>
        <BackButton onClick={onBack} label={t("common.back") || "Back"} />
        <Card raised style={{ textAlign: "center", marginTop: "20px" }}>
          <div style={{ marginBottom: "12px" }}>
            <StatusBadge status={status} />
          </div>
          <h2 style={{ color: "var(--color-text-primary)", fontSize: "30px", margin: "0 0 8px" }}>
            {Math.round(result.percentage)}%
          </h2>
          <p style={{ color: "var(--color-text-secondary)", marginBottom: "24px" }}>
            {result.score} / {result.total_questions} {t("moduleQuiz.correct") || "correct"}
          </p>
          <div style={{ display: "flex", gap: "10px", flexDirection: "column" }}>
            <Button variant="secondary" onClick={handleRetake}>
              {t("moduleQuiz.retake") || "Retake Assessment"}
            </Button>
            <Button onClick={onBack}>{t("moduleQuiz.done") || "Back to Module"}</Button>
          </div>
        </Card>
      </Screen>
    );
  }

  return (
    <Screen>
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
        <BackButton onClick={onBack} label={t("common.back") || "Back"} />
        <h2 style={{ margin: 0, fontSize: "16px", fontWeight: 700 }}>
          {t("moduleQuiz.title") || "Module Assessment"}
        </h2>
      </div>

      {usedCache && (
        <p style={{ fontSize: "11px", color: "var(--color-text-muted)", marginBottom: "12px" }}>
          {t("moduleQuiz.offlineNotice") || "Showing questions saved from an earlier visit — you appear to be offline."}
        </p>
      )}

      {questions.map((q, index) => (
        <Card key={q.id} style={{ marginBottom: "12px" }}>
          <p style={{ color: "var(--color-text-primary)", fontSize: "13px", fontWeight: 600, marginBottom: "10px" }}>
            {index + 1}. {q.question}
          </p>
          {[
            ["A", q.option_a],
            ["B", q.option_b],
            ["C", q.option_c],
            ["D", q.option_d],
          ].map(([letter, text]) => (
            <button
              key={letter}
              onClick={() => handleSelect(q.id, letter)}
              style={{
                display: "block",
                width: "100%",
                textAlign: "left",
                padding: "10px 12px",
                marginBottom: "8px",
                borderRadius: "8px",
                border:
                  answers[q.id] === letter
                    ? "1px solid var(--color-accent-border)"
                    : "1px solid var(--color-border-strong)",
                background: answers[q.id] === letter ? "var(--color-accent-soft)" : "var(--color-surface-sunken)",
                color: "var(--color-text-primary)",
                fontSize: "13px",
                cursor: "pointer",
              }}
            >
              {letter}. {text}
            </button>
          ))}
        </Card>
      ))}

      {submitError && (
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
          {submitError}
        </div>
      )}

      <Button onClick={handleSubmit} disabled={!allAnswered || submitting}>
        {submitting
          ? t("moduleQuiz.submitting") || "Submitting..."
          : allAnswered
            ? t("moduleQuiz.submit") || "Submit Assessment"
            : t("moduleQuiz.answerAll", { count: questions.length }) || `Answer all ${questions.length} questions`}
      </Button>
    </Screen>
  );
}

export default ModuleQuizScreen;
