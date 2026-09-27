import { getQueuedActions, updateQueuedAction, removeQueuedAction } from "./db.js";
import { updateLessonProgress } from "../api/lessons.js";
import { updateDrillProgress } from "../api/drills.js";
import { submitModuleQuiz, submitDrillQuiz } from "../api/quizzes.js";

export const ACTION_TYPES = {
  LESSON_PROGRESS: "lesson-progress",
  DRILL_PROGRESS: "drill-progress",
  MODULE_QUIZ_SUBMIT: "module-quiz-submit",
  DRILL_QUIZ_SUBMIT: "drill-quiz-submit",
};

const MAX_ATTEMPTS = 5;

async function replay(action) {
  const { type, payload } = action;

  switch (type) {
    case ACTION_TYPES.LESSON_PROGRESS:
      return updateLessonProgress(payload.userId, payload.lessonId, payload.completed);
    case ACTION_TYPES.DRILL_PROGRESS:
      return updateDrillProgress(payload.userId, payload.drillId, payload.completed);
    case ACTION_TYPES.MODULE_QUIZ_SUBMIT:
      return submitModuleQuiz(payload.userId, payload.moduleId, payload.answers);
    case ACTION_TYPES.DRILL_QUIZ_SUBMIT:
      return submitDrillQuiz(payload.userId, payload.drillId, payload.answers);
    default:
      throw new Error(`Unknown queued action type: ${type}`);
  }
}

let isProcessing = false;

/**
 * Replays every queued action against the real backend, in the order they
 * were created. Guarded against concurrent invocation (e.g. the browser's
 * "online" event firing while a manual "Sync now" tap is already running)
 * so the same action can't be submitted twice in parallel.
 *
 * Quiz submissions (module + drill) are NOT idempotent server-side — each
 * successful call creates a new attempt row — so this function only ever
 * processes one action at a time, sequentially, and removes an action from
 * the queue immediately after a confirmed success before moving to the
 * next. This is a best-effort guarantee, not a cryptographic one: it
 * protects against double-firing from this tab, but can't protect against
 * e.g. the app being killed mid-request before the response arrives. Lesson
 * and drill *progress* actions are naturally idempotent on the backend
 * (they update-or-create a single row per user+lesson/drill), so replaying
 * one twice is harmless even in that edge case.
 */
export async function processSyncQueue() {
  if (isProcessing) return { processed: 0, remaining: null };
  if (typeof navigator !== "undefined" && !navigator.onLine) return { processed: 0, remaining: null };

  isProcessing = true;
  let processed = 0;

  try {
    const queued = (await getQueuedActions())
      .filter((a) => a.status !== "syncing")
      .sort((a, b) => a.createdAt - b.createdAt);

    for (const action of queued) {
      if (action.attempts >= MAX_ATTEMPTS) continue; // leave for manual review, don't hammer the backend

      await updateQueuedAction(action.id, { status: "syncing" });

      try {
        await replay(action);
        await removeQueuedAction(action.id);
        processed += 1;
      } catch (err) {
        await updateQueuedAction(action.id, {
          status: "failed",
          attempts: (action.attempts || 0) + 1,
          lastError: err?.message || "Sync failed",
        });
      }
    }

    const remaining = await getQueuedActions();
    return { processed, remaining: remaining.length };
  } finally {
    isProcessing = false;
  }
}
