import apiClient from "./client";

export const getModules = () => apiClient.get("/modules");

export const getModule = (moduleId) => apiClient.get(`/modules/${moduleId}`);

export const getModuleSummary = (moduleId) => apiClient.get(`/modules/${moduleId}/summary`);

/** Public quiz questions for a module (no correct answers included by the backend). */
export const getModuleQuestions = (moduleId, language = "en") =>
  apiClient.get(`/modules/${moduleId}/questions?language=${language}`);

/* ---- Admin only (backend enforces admin_required on all three) ---- */

export const createModule = (module) => apiClient.post("/modules", module);

export const updateModule = (moduleId, module) => apiClient.put(`/modules/${moduleId}`, module);

export const deleteModule = (moduleId) => apiClient.delete(`/modules/${moduleId}`);
