import "./ui.css";
import { Button } from "./Layout";

export function LoadingState({ message = "Loading..." }) {
  return (
    <div className="ss-state-block">
      <div className="ss-spinner" role="status" aria-label={message} />
      <p className="ss-state-block__message">{message}</p>
    </div>
  );
}

export function EmptyState({ icon = "📭", title = "Nothing here yet", message }) {
  return (
    <div className="ss-state-block">
      <div className="ss-state-block__icon" aria-hidden="true">{icon}</div>
      <p className="ss-state-block__title">{title}</p>
      {message && <p className="ss-state-block__message">{message}</p>}
    </div>
  );
}

export function ErrorState({
  title = "Unable to connect to training server",
  message = "Check your connection and try again.",
  onRetry,
}) {
  return (
    <div className="ss-state-block">
      <div className="ss-state-block__icon" aria-hidden="true">⚠️</div>
      <p className="ss-state-block__title">{title}</p>
      <p className="ss-state-block__message">{message}</p>
      {onRetry && (
        <div style={{ width: "100%", maxWidth: "220px", marginTop: "8px" }}>
          <Button variant="secondary" onClick={onRetry}>
            Retry
          </Button>
        </div>
      )}
    </div>
  );
}
