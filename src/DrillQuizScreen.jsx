import { useEffect, useState, useCallback } from "react";
import { useAuth } from "./context/useAuth.js";
import { getDrillQuestions, submitDrillQuiz } from "./api/quizzes";
import { StatusBadge } from "./components/ui/StatusBadge.jsx";
import { deriveQuizStatus } from "./lib/status.js";
import { ApiError } from "./api/client";
import { cachedGet } from "./offline/cachedFetch.js";
import { enqueueAction } from "./offline/db.js";
import { ACTION_TYPES } from "./offline/syncQueue.js";

import i18n from "./i18n";

/**
 * Reusable drill-quiz overlay, embedded inside the existing Fire/Gas AR
 * screens (and reusable elsewhere). Loads real questions from
 * GET /drills/{drillId}/questions — which the backend already strips of
 * correct_answer — and submits all answers in one call to
 * POST /users/{userId}/drills/{drillId}/quiz. The score, percentage, and
 * passed flag shown here come directly from that response; nothing is
 * graded, thresholded, or fabricated on the frontend.
 *
 * Unlike the old hardcoded Quiz component, correctness is never revealed
 * per-question — the backend has no endpoint to check a single answer, so
 * doing that would either leak answers or require inventing one.
 */
function DrillQuizScreen({ drillId, accentColor = "var(--color-accent)", onComplete }) {
  const { session } = useAuth();
  const userId = session?.userId ?? null;

  const [questions, setQuestions] = useState([]);
  const [loadState, setLoadState] = useState("loading"); // loading | ready | error | no-questions
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [result, setResult] = useState(null);
  const [queued, setQueued] = useState(false);
  const [usedCache, setUsedCache] = useState(false);

  const load = useCallback(async () => {
    if (!drillId) {
      setLoadState("error");
      return;
    }
    try {
      // Questions (with no correct answers included) are safe, static data
      // — cached so a previously-opened drill quiz can still be attempted
      // offline, with submission queued until connectivity returns.
     const languageMap = {
  en: "en",
  hi: "hi",
  sa: "sa",
};

const backendLanguage = languageMap[i18n.language] || "en";

const { data, fromCache } = await cachedGet(
  `drill-questions:${drillId}:${backendLanguage}`,
  () => getDrillQuestions(drillId, backendLanguage)
);
      if (!Array.isArray(data) || data.length === 0) {
        setLoadState("no-questions");
        return;
      }
      setQuestions(data);
      setUsedCache(fromCache);
      setLoadState("ready");
    } catch {
      setLoadState("error");
    }
  }, [drillId, i18n.language]);

  useEffect(() => {
    load();
  }, [load]);

  const retryLoad = useCallback(() => {
    setLoadState("loading");
    load();
  }, [load]);

  const handleSelect = (questionId, letter) => {
    setAnswers((prev) => ({ ...prev, [questionId]: letter }));
  };

  const allAnswered = questions.length > 0 && questions.every((q) => answers[q.id]);

  const handleSubmit = async () => {
    if (!userId || !drillId || !allAnswered) return;
    setSubmitting(true);
    setSubmitError("");

    // Quiz grading only exists on the backend — we never compute a score
    // locally. If there's no network path at all, queue the submission and
    // say so plainly rather than showing a fabricated result.
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      await enqueueAction({
        type: ACTION_TYPES.DRILL_QUIZ_SUBMIT,
        payload: { userId, drillId, answers },
      });
      setQueued(true);
      setSubmitting(false);
      return;
    }

    try {
      const data = await submitDrillQuiz(userId, drillId, answers);
      setResult(data);
    } catch (err) {
      if (err instanceof ApiError && err.isNetworkError) {
        await enqueueAction({
          type: ACTION_TYPES.DRILL_QUIZ_SUBMIT,
          payload: { userId, drillId, answers },
        });
        setQueued(true);
      } else {
        setSubmitError("Could not submit your answers. Check your connection and try again.");
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
      <div style={overlayStyle}>
        <p style={centerTextStyle}>Loading assessment questions...</p>
      </div>
    );
  }

  if (loadState === "error") {
    return (
      <div style={overlayStyle}>
        <div style={{ textAlign: "center", marginTop: "40px" }}>
          <p style={centerTextStyle}>Unable to load the assessment. Check your connection and retry.</p>
          <button onClick={retryLoad} style={buttonStyle}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (loadState === "no-questions") {
    return (
      <div style={overlayStyle}>
        <div style={{ textAlign: "center", marginTop: "40px" }}>
          <p style={centerTextStyle}>No assessment questions have been published for this drill yet.</p>
          <button onClick={() => onComplete?.(null)} style={{ ...buttonStyle, marginTop: "16px" }}>
            Continue
          </button>
        </div>
      </div>
    );
  }

  if (queued) {
    return (
      <div style={overlayStyle}>
        <div style={{ textAlign: "center", marginTop: "40px" }}>
          <div style={{ fontSize: "32px", marginBottom: "12px" }}>⏳</div>
          <h2 style={{ color: "var(--color-text-primary)", fontSize: "16px", margin: "0 0 8px" }}>
            Answers saved — queued for grading
          </h2>
          <p style={{ color: "var(--color-text-secondary)", marginBottom: "24px", fontSize: "13px" }}>
            You&apos;re offline right now, so this can&apos;t be scored yet. Your answers are saved on this device
            and will be submitted for real grading as soon as you&apos;re back online — no score is shown here
            because none has been calculated.
          </p>
          <button
            onClick={() => onComplete?.(null)}
            style={{ ...buttonStyle, background: accentColor, color: "#1a1200" }}
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  if (result) {
    const status =
      result.passed !== undefined ? (result.passed ? "passed" : "failed") : deriveQuizStatus(result.percentage);

    return (
      <div style={overlayStyle}>
        <div style={{ textAlign: "center", marginTop: "40px" }}>
          <div style={{ marginBottom: "12px" }}>
            <StatusBadge status={status} />
          </div>
          <h2 style={{ color: "var(--color-text-primary)", fontSize: "26px", margin: "0 0 8px" }}>
            {Math.round(result.percentage)}%
          </h2>
          <p style={{ color: "var(--color-text-secondary)", marginBottom: "24px" }}>
            {result.score} / {result.total_questions} correct
          </p>

          <div style={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap" }}>
            <button onClick={handleRetake} style={buttonStyle}>
              Retake Assessment
            </button>
            <button
              onClick={() => onComplete?.(result)}
              style={{ ...buttonStyle, background: accentColor, color: "#1a1200" }}
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={overlayStyle}>
      <h2 style={{ color: "var(--color-text-primary)", fontSize: "18px", marginBottom: "8px", textAlign: "center" }}>
        Drill Assessment
      </h2>
      {usedCache && (
        <p style={{ fontSize: "11px", color: "var(--color-text-muted)", textAlign: "center", marginBottom: "12px" }}>
          Showing questions saved from an earlier visit — you appear to be offline.
        </p>
      )}

      {questions.map((q, index) => (
        <div
          key={q.id}
          style={{
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: "12px",
            padding: "14px",
            marginBottom: "12px",
          }}
        >
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
                  answers[q.id] === letter ? `1px solid ${accentColor}` : "1px solid var(--color-border-strong)",
                background: answers[q.id] === letter ? "var(--color-accent-soft)" : "var(--color-surface-sunken)",
                color: "var(--color-text-primary)",
                fontSize: "13px",
                cursor: "pointer",
              }}
            >
              {letter}. {text}
            </button>
          ))}
        </div>
      ))}

      {submitError && <p style={{ color: "var(--color-danger)", fontSize: "12px", textAlign: "center" }}>{submitError}</p>}

      <button
        onClick={handleSubmit}
        disabled={!allAnswered || submitting}
        style={{
          ...buttonStyle,
          width: "100%",
          background: allAnswered ? accentColor : "var(--color-surface-raised)",
          color: allAnswered ? "#1a1200" : "var(--color-text-muted)",
          cursor: allAnswered && !submitting ? "pointer" : "not-allowed",
        }}
      >
        {submitting ? "Submitting..." : allAnswered ? "Submit Assessment" : `Answer all ${questions.length} questions`}
      </button>
    </div>
  );
}

const overlayStyle = {
  position: "fixed",
  inset: 0,
  background: "var(--color-bg)",
  zIndex: 40,
  overflowY: "auto",
  padding: "24px 16px 32px",
  boxSizing: "border-box",
};

const centerTextStyle = {
  color: "var(--color-text-secondary)",
  textAlign: "center",
  marginTop: "40px",
  fontSize: "14px",
};

const buttonStyle = {
  padding: "12px 20px",
  borderRadius: "10px",
  border: "none",
  fontWeight: 700,
  fontSize: "13px",
  cursor: "pointer",
  background: "var(--color-surface-raised)",
  color: "var(--color-text-primary)",
};

export default DrillQuizScreen;
