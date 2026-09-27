import "./ui.css";

export function Screen({ children, noBottomPadding = false, className = "" }) {
  return (
    <div className={`ss-screen ${noBottomPadding ? "ss-screen--no-bottom-pad" : ""} ${className}`}>
      {children}
    </div>
  );
}

export function ScreenHeader({ title, subtitle, right = null }) {
  return (
    <div className="ss-header">
      <div>
        <h1 className="ss-header__title">{title}</h1>
        {subtitle && <p className="ss-header__subtitle">{subtitle}</p>}
      </div>
      {right}
    </div>
  );
}

export function BackButton({ onClick, label = "Back" }) {
  return (
    <button type="button" onClick={onClick} className="ss-back-button">
      <span aria-hidden="true">←</span> {label}
    </button>
  );
}

export function Card({ children, interactive = false, disabled = false, raised = false, onClick, style, className = "" }) {
  const classes = [
    "ss-card",
    raised ? "ss-card--raised" : "",
    interactive ? "ss-card--interactive" : "",
    disabled ? "ss-card--disabled" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes} style={style} onClick={disabled ? undefined : onClick}>
      {children}
    </div>
  );
}

export function Eyebrow({ children }) {
  return <p className="ss-eyebrow">{children}</p>;
}

export function Button({ children, variant = "primary", onClick, disabled, type = "button", style }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`ss-button ss-button--${variant}`}
      style={style}
    >
      {children}
    </button>
  );
}

export function ProgressBar({ percent = 0 }) {
  const clamped = Math.max(0, Math.min(100, percent));
  return (
    <div className="ss-progress-bar">
      <div className="ss-progress-bar__fill" style={{ width: `${clamped}%` }} />
    </div>
  );
}
