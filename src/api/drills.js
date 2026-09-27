import apiClient from "./client";

/**
 * NOTE: the backend registers GET /modules/{module_id}/drills twice
 * (get_drills, then get_module_drills). FastAPI only ever serves the first
 * registration, so the live response is the plain array from get_drills —
 * NOT the {module_id, module_title, total_drills, drills: [...]} wrapper
 * defined later in main.py. That wrapper is server-side dead code.
 * We build against the plain array, per the audit findings.
 */
export const getModuleDrills = (moduleId) =>
  apiClient.get(`/modules/${moduleId}/drills`).then((data) => {
    if (Array.isArray(data)) return data;
    return Array.isArray(data?.drills) ? data.drills : [];
  });

export const getDrill = (drillId) => apiClient.get(`/drills/${drillId}`);

/** Drill metadata + public questions (no correct answers). */
export const getDrillDetails = (drillId) => apiClient.get(`/drills/${drillId}/details`);

export const updateDrillProgress = (userId, drillId, completed) =>
  apiClient.post(`/users/${userId}/drills/${drillId}/progress`, { completed });

export const getUserDrillProgress = (userId) => apiClient.get(`/users/${userId}/drill-progress`);

/* ---- Admin only (backend enforces admin_required on all three) ---- */

export const createDrill = (moduleId, drill) => apiClient.post(`/modules/${moduleId}/drills`, drill);

export const updateDrill = (drillId, drill) => apiClient.put(`/drills/${drillId}`, drill);

export const deleteDrill = (drillId) => apiClient.delete(`/drills/${drillId}`);
