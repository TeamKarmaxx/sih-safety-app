import { useEffect, useState } from "react";

/**
 * Tracks real browser connectivity via navigator.onLine + the online/offline
 * window events. This reflects whether the device has a network path at
 * all — it does NOT guarantee the backend at VITE_API_BASE_URL is reachable
 * (e.g. dev server not running would still show "online"). Actual API
 * calls still handle their own network failures via ApiError.isNetworkError
 * regardless of what this hook reports.
 */
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(() =>
    typeof navigator !== "undefined" ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return isOnline;
}
