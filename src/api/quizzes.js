import apiClient from "./client";

/* ---- Module (end-of-module) quiz ---- */

export const submitModuleQuiz = (userId, moduleId, answers) =>
  apiClient.post(`/users/${userId}/modules/${moduleId}/quiz`, { answers });

export const getQuizAttempts = (userId) => apiClient.get(`/users/${userId}/quiz-attempts`);

/* ---- Drill quiz (per-drill assessment, separate from the module quiz) ---- */

export const getDrillQuestions = (drillId, language = "en") =>
  apiClient.get(`/drills/${drillId}/questions?language=${language}`);

export const submitDrillQuiz = (userId, drillId, answers) =>
  apiClient.post(`/users/${userId}/drills/${drillId}/quiz`, { answers });

export const getDrillQuizAttempts = (userId) => apiClient.get(`/users/${userId}/drill-quiz-attempts`);

/* ---- Admin only: module quiz question CRUD ---- */

export const createModuleQuestion = (moduleId, question) =>
  apiClient.post(`/modules/${moduleId}/questions`, question);

export const updateModuleQuestion = (questionId, question) =>
  apiClient.put(`/questions/${questionId}`, question);

export const deleteModuleQuestion = (questionId) => apiClient.delete(`/questions/${questionId}`);

/* ---- Admin only: drill quiz question CRUD ---- */

export const createDrillQuestion = (drillId, question) =>
  apiClient.post(`/drills/${drillId}/questions`, question);

export const updateDrillQuestion = (questionId, question) =>
  apiClient.put(`/drill-questions/${questionId}`, question);

export const deleteDrillQuestion = (questionId) => apiClient.delete(`/drill-questions/${questionId}`);
