import apiClient from "./client";

export const generateCertificate = (userId, moduleId) =>
  apiClient.post(`/users/${userId}/modules/${moduleId}/certificate`);

/** Public verification — no auth required, matches backend (used by QR scan flow too). */
export const verifyCertificate = (certificateNumber) =>
  apiClient.get(`/certificates/${certificateNumber}`, { auth: false });

/** Returns a PNG Blob (backend responds with FileResponse image/png). */
export const getCertificateQrBlob = (certificateNumber) =>
  apiClient.get(`/certificates/${certificateNumber}/qr`, { auth: false });
