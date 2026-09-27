import apiClient from "./client";

export const getModuleLessons = (moduleId) => apiClient.get(`/modules/${moduleId}/lessons`);

export const getLesson = (lessonId) => apiClient.get(`/lessons/${lessonId}`);

/** Backend falls back to English and reports translated:false when no translation exists. */
export const getLessonContent = (lessonId, language = "English") =>
  apiClient.get(`/lessons/${lessonId}/content`, { query: { language } });

export const updateLessonProgress = (userId, lessonId, completed) =>
  apiClient.post(`/users/${userId}/lessons/${lessonId}/progress`, { completed });

export const getUserProgress = (userId) => apiClient.get(`/users/${userId}/progress`);

export const getModuleProgress = (userId, moduleId) =>
  apiClient.get(`/users/${userId}/modules/${moduleId}/progress`);

export const getModuleCompletion = (userId, moduleId) =>
  apiClient.get(`/users/${userId}/modules/${moduleId}/completion`);

/* ---- Admin only (backend enforces admin_required on all three) ---- */

export const createLesson = (moduleId, lesson) => apiClient.post(`/modules/${moduleId}/lessons`, lesson);

export const updateLesson = (lessonId, lesson) => apiClient.put(`/lessons/${lessonId}`, lesson);

export const deleteLesson = (lessonId) => apiClient.delete(`/lessons/${lessonId}`);
