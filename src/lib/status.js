/**
 * Given a module entry from GET /users/{id}/dashboard, derive a single
 * canonical status. Mirrors the backend's own completion rules — it does not
 * invent a different notion of "done" than the server already computed.
 */
export function deriveModuleStatus(moduleEntry) {
  if (!moduleEntry) return "not_started";
  if (moduleEntry.completed) return "completed";

  const hasAnyProgress =
    (moduleEntry.completed_lessons || 0) > 0 ||
    (moduleEntry.completed_drills || 0) > 0 ||
    moduleEntry.quiz_percentage !== null ||
    moduleEntry.latest_drill_quiz_percentage !== null;

  return hasAnyProgress ? "in_progress" : "not_started";
}

export function deriveQuizStatus(percentage, passThreshold = 70) {
  if (percentage === null || percentage === undefined) return "not_started";
  return percentage >= passThreshold ? "passed" : "failed";
}
