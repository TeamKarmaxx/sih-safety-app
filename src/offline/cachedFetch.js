import { ApiError } from "../api/client";
import { getCache, setCache } from "./db.js";

/**
 * Wraps a read-only API call with an IndexedDB fallback for when the
 * network is genuinely unreachable. This is intentionally used only for
 * "browse what exists" data (module lists, lesson/drill lists) — NOT for
 * dashboards, quiz results, or certificates, since those must reflect the
 * server's current state and showing stale cached progress as if it were
 * current would be actively misleading.
 *
 * Returns { data, fromCache, cachedAt } so callers can show an honest
 * "showing saved data from earlier" note rather than silently pretending
 * cached data is live.
 */
export async function cachedGet(cacheKey, fetchFn) {
  try {
    const data = await fetchFn();
    // Best-effort write-through; failure to cache never blocks the read.
    setCache(cacheKey, data);
    return { data, fromCache: false, cachedAt: Date.now() };
  } catch (err) {
    const isNetworkIssue = err instanceof ApiError && err.isNetworkError;
    if (isNetworkIssue) {
      const cached = await getCache(cacheKey);
      if (cached) {
        return { data: cached.value, fromCache: true, cachedAt: cached.cachedAt };
      }
    }
    // No usable cache (or a non-network error, e.g. 404) — let the caller's
    // normal error handling take over rather than fabricating a result.
    throw err;
  }
}
