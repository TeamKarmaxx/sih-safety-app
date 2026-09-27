import apiClient from "./client";

export const getMe = () => apiClient.get("/me");

export const getUser = (userId) => apiClient.get(`/users/${userId}`);

/** Admin only (backend enforces admin_required). */
export const getAllUsers = () => apiClient.get("/users");

/**
 * Admin only. NOTE: there is no PUT-based "edit user" action wired into the
 * admin UI — the backend's PUT /users/{id} (UserCreate schema) requires a
 * full name+email+password body and will overwrite the user's password
 * with whatever is submitted. Exposing "edit" without that being extremely
 * clear risks accidentally resetting a learner's password, so it's left out
 * of this stage; deleting (which has no such side effect) is supported.
 */
export const deleteUser = (userId) => apiClient.delete(`/users/${userId}`);
