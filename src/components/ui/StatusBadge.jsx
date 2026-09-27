import "./ui.css";

const LABELS = {
  not_started: "Not Started",
  in_progress: "In Progress",
  completed: "Completed",
  passed: "Passed",
  failed: "Not Passed",
  locked: "Locked",
};

/**
 * Renders one of: not_started | in_progress | completed | passed | failed | locked
 * Callers should derive `status` from real backend fields (see
 * src/lib/status.js) rather than inventing new states.
 */
export function StatusBadge({ status, label }) {
  const safeStatus = LABELS[status] ? status : "not_started";
  return (
    <span className={`ss-status-badge ss-status-badge--${safeStatus}`}>
      <span className="ss-status-badge__dot" />
      {label || LABELS[safeStatus]}
    </span>
  );
}
