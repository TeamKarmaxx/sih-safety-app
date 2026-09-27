/**
 * Offline data layer — raw IndexedDB, no external library.
 *
 * Two object stores:
 *  - "cache"      keyPath "key"              — safe, static, non-sensitive
 *                                               read data (module lists,
 *                                               lesson/drill lists, etc.)
 *  - "syncQueue"  keyPath "id" (autoIncrement) — queued mutating actions
 *                                               (lesson progress, drill
 *                                               progress, quiz submissions)
 *                                               made while offline.
 *
 * Deliberately NOT stored here: the JWT, password, or any credential. Auth
 * stays exactly where it already was (localStorage, via src/api/auth.js) —
 * this file only ever touches non-sensitive training content and queued
 * learner actions.
 */

const DB_NAME = "sih-safety-offline";
const DB_VERSION = 1;
const CACHE_STORE = "cache";
const QUEUE_STORE = "syncQueue";

let dbPromise = null;

function openDatabase() {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("IndexedDB is not available in this environment"));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(CACHE_STORE)) {
        db.createObjectStore(CACHE_STORE, { keyPath: "key" });
      }
      if (!db.objectStoreNames.contains(QUEUE_STORE)) {
        db.createObjectStore(QUEUE_STORE, { keyPath: "id", autoIncrement: true });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

  return dbPromise;
}

function requestToPromise(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function txToPromise(tx) {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

/* ---------------- Cache store (safe, static, read-only data) ---------------- */

export async function setCache(key, value) {
  try {
    const db = await openDatabase();
    const tx = db.transaction(CACHE_STORE, "readwrite");
    tx.objectStore(CACHE_STORE).put({ key, value, cachedAt: Date.now() });
    await txToPromise(tx);
  } catch {
    // Caching is a best-effort convenience — never let it break the caller.
  }
}

export async function getCache(key) {
  try {
    const db = await openDatabase();
    const tx = db.transaction(CACHE_STORE, "readonly");
    const result = await requestToPromise(tx.objectStore(CACHE_STORE).get(key));
    return result || null;
  } catch {
    return null;
  }
}

/* ---------------- Sync queue store (queued mutating actions) ---------------- */

export async function enqueueAction(action) {
  const db = await openDatabase();
  const tx = db.transaction(QUEUE_STORE, "readwrite");
  const record = {
    ...action,
    status: "queued",
    attempts: 0,
    createdAt: Date.now(),
    lastError: null,
  };
  const id = await requestToPromise(tx.objectStore(QUEUE_STORE).add(record));
  await txToPromise(tx);
  return { ...record, id };
}

export async function getQueuedActions() {
  try {
    const db = await openDatabase();
    const tx = db.transaction(QUEUE_STORE, "readonly");
    const all = await requestToPromise(tx.objectStore(QUEUE_STORE).getAll());
    return all || [];
  } catch {
    return [];
  }
}

export async function updateQueuedAction(id, patch) {
  const db = await openDatabase();
  const tx = db.transaction(QUEUE_STORE, "readwrite");
  const store = tx.objectStore(QUEUE_STORE);
  const existing = await requestToPromise(store.get(id));
  if (existing) {
    store.put({ ...existing, ...patch });
  }
  await txToPromise(tx);
}

export async function removeQueuedAction(id) {
  const db = await openDatabase();
  const tx = db.transaction(QUEUE_STORE, "readwrite");
  tx.objectStore(QUEUE_STORE).delete(id);
  await txToPromise(tx);
}
