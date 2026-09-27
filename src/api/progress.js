import apiClient from "./client";

/** The single aggregate endpoint the dashboard/progress screens are built on. */
export const getDashboard = (userId) => apiClient.get(`/users/${userId}/dashboard`);
