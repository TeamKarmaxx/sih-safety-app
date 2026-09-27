import { useEffect, useState, useCallback } from "react";
import { useOnlineStatus } from "./network.js";
import { getQueuedActions } from "./db.js";
import { processSyncQueue } from "./syncQueue.js";

/**
 * Always-visible, small status strip: online/offline dot + label, and — only
 * when there's something queued — a pending-count and a manual "Sync now"
 * button. Deliberately understated (per the design system's "restrained
 * animation" rule) rather than a banner that steals attention every time
 * connectivity blips.
 */
function OfflineStatusBar() {
  const isOnline = useOnlineStatus();
  const [queuedCount, setQueuedCount] = useState(0);
  const [syncing, setSyncing] = useState(false);

  const refreshQueueCount = useCallback(async () => {
    const queued = await getQueuedActions();
    setQueuedCount(queued.length);
  }, []);

  useEffect(() => {
    refreshQueueCount();
  }, [refreshQueueCount]);

  useEffect(() => {
    if (!isOnline) return;

    let cancelled = false;
    (async () => {
      setSyncing(true);
      await processSyncQueue();
      if (!cancelled) {
        await refreshQueueCount();
        setSyncing(false);
      }
    })();

    return () => {
      cancelled = true;
    };
    // Re-run whenever we come back online.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOnline]);

  const handleManualSync = async () => {
    setSyncing(true);
    await processSyncQueue();
    await refreshQueueCount();
    setSyncing(false);
  };

  if (isOnline && queuedCount === 0) {
    // Nothing worth showing — fully synced and online.
    return null;
  }

  return (
    <div
      style={{
        position: "relative",
        // Fire/Gas AR screens render a full-viewport `position: fixed`
        // camera layer (.camera-screen, z-index: auto) later in the DOM,
        // which would otherwise visually cover this bar since fixed
        // elements without an explicit z-index paint in DOM order. This
        // bar needs to stay visible during AR training too (offline status
        // matters most exactly when a drill/quiz submission is about to be
        // queued), so it's pinned above every other z-index used in the
        // app (back button: 50, tutorial dialog: 80, quiz overlays: 100).
        zIndex: 200,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        padding: "6px 12px",
        fontSize: "11px",
        fontWeight: 600,
        background: isOnline ? "var(--color-warning-soft)" : "var(--color-danger-soft)",
        color: isOnline ? "var(--color-warning)" : "var(--color-danger)",
      }}
    >
      <span
        style={{
          width: "6px",
          height: "6px",
          borderRadius: "50%",
          background: isOnline ? "var(--color-warning)" : "var(--color-danger)",
          flexShrink: 0,
        }}
      />
      <span>
        {isOnline
          ? syncing
            ? "Syncing pending actions..."
            : `${queuedCount} action${queuedCount === 1 ? "" : "s"} pending sync`
          : `Offline${queuedCount > 0 ? ` — ${queuedCount} action${queuedCount === 1 ? "" : "s"} queued` : ""}`}
      </span>
      {isOnline && queuedCount > 0 && !syncing && (
        <button
          onClick={handleManualSync}
          style={{
            background: "none",
            border: "1px solid currentColor",
            color: "inherit",
            borderRadius: "999px",
            padding: "2px 10px",
            fontSize: "10px",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Sync now
        </button>
      )}
    </div>
  );
}

export default OfflineStatusBar;
