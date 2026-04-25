/**
 * Kumpulan Endpoint URL untuk SIKP API.
 * Digunakan secara terpusat untuk menghindari string literal hardcode.
 */

export const API_ENDPOINTS = {
  SUBMISSION: {
    GET_MY: "/api/submissions/my-submissions",
    CREATE: "/api/submissions",
    GET_BY_TEAM: (teamId: string) => `/api/submissions/team/${teamId}`,
    GET_BY_ID: (id: string) => `/api/submissions/${id}`,
    GET_ALL_ADMIN: "/api/submissions",
    GET_ALL_DOSEN: "/api/submissions/dosen",
    UPDATE_STATUS: (id: string) => `/api/submissions/${id}/status`,
    UPDATE: (id: string) => `/api/submissions/${id}`,
    RESET_TO_DRAFT: (id: string) => `/api/submissions/${id}/reset-to-draft`,
  },
  TEAM: {
    GET_MY: "/api/teams/my-teams",
    CREATE: "/api/teams",
    GET_BY_ID: (id: string) => `/api/teams/${id}`,
    ADD_MEMBER: (id: string) => `/api/teams/${id}/members`,
    REMOVE_MEMBER: (id: string, userId: string) =>
      `/api/teams/${id}/members/${userId}`,
  },
  DOSEN: {
    GET_MY_PROFILE: "/api/dosen/me",
    GET_DOSEN_BY_USER_ID: (userId: string) => `/api/dosen/user/${userId}`,
    GET_ALL: "/api/dosen",
  },
  MAHASISWA: {
    GET_MY_PROFILE: "/api/mahasiswa/me",
    GET_BY_USER_ID: (userId: string) => `/api/mahasiswa/user/${userId}`,
  },
  RESPONSE_LETTER: {
    GET_MY: "/api/response-letters/my-letters",
    GET_BY_SUBMISSION: (submissionId: string) =>
      `/api/response-letters/submission/${submissionId}`,
    CREATE: "/api/response-letters",
    UPDATE: (id: string) => `/api/response-letters/${id}`,
    GET_ALL_ADMIN: "/api/response-letters",
    UPDATE_ADMIN: (id: string) => `/api/response-letters/${id}`,
  },
  SURAT_KESEDIAAN: {
    GET_BY_SUBMISSION: (submissionId: string) =>
      `/api/surat-kesediaan/submission/${submissionId}`,
    CREATE: "/api/surat-kesediaan",
    VERIFY: (id: string) => `/api/surat-kesediaan/${id}/verify`,
    UPDATE: (id: string) => `/api/surat-kesediaan/${id}`,
    DELETE: (id: string) => `/api/surat-kesediaan/${id}`,
    DOSEN_GET_REQUESTS: "/api/dosen/surat-kesediaan/requests",
    DOSEN_APPROVE: (id: string) =>
      `/api/dosen/surat-kesediaan/requests/${id}/approve`,
    DOSEN_REJECT: (id: string) =>
      `/api/dosen/surat-kesediaan/requests/${id}/reject`,
    DOSEN_APPROVE_BULK: "/api/dosen/surat-kesediaan/requests/approve-bulk",
    MAHASISWA_REAPPLY: (id: string) =>
      `/api/mahasiswa/surat-kesediaan/requests/${id}/reapply`,
  },
  SURAT_PERMOHONAN: {
    GET_BY_SUBMISSION: (submissionId: string) =>
      `/api/surat-permohonan/submission/${submissionId}`,
    CREATE: "/api/surat-permohonan",
    UPDATE: (id: string) => `/api/surat-permohonan/${id}`,
    GENERATE_PDF: (submissionId: string) =>
      `/api/surat-permohonan/generate-pdf/${submissionId}`,
    DOSEN_GET_REQUESTS: "/api/dosen/surat-permohonan/requests",
    DOSEN_APPROVE: (id: string) =>
      `/api/dosen/surat-permohonan/requests/${id}/approve`,
    DOSEN_REJECT: (id: string) =>
      `/api/dosen/surat-permohonan/requests/${id}/reject`,
    DOSEN_APPROVE_BULK: "/api/dosen/surat-permohonan/requests/approve-bulk",
    MAHASISWA_REAPPLY: (id: string) =>
      `/api/mahasiswa/surat-permohonan/requests/${id}/reapply`,
    MAHASISWA_RESUBMIT: (id: string) =>
      `/api/mahasiswa/surat-permohonan/requests/${id}/resubmit`,
  },
  SURAT_PENGANTAR_DOSEN: {
    GET_BY_SUBMISSION: (submissionId: string) =>
      `/api/surat-pengantar-dosen/submission/${submissionId}`,
    CREATE: "/api/surat-pengantar-dosen",
    UPDATE: (id: string) => `/api/surat-pengantar-dosen/${id}`,
    DOSEN_GET_REQUESTS: "/api/dosen/surat-pengantar/requests",
    DOSEN_APPROVE: (id: string) =>
      `/api/dosen/surat-pengantar/requests/${id}/approve`,
    DOSEN_REJECT: (id: string) =>
      `/api/dosen/surat-pengantar/requests/${id}/reject`,
  },
  TEMPLATE: {
    GET_ALL: "/api/templates",
    GET_BY_TYPE: (type: string) => `/api/templates/type/${type}`,
    GET_BY_ID: (id: string) => `/api/templates/${id}`,
    CREATE: "/api/templates",
    UPDATE: (id: string) => `/api/templates/${id}`,
    DELETE: (id: string) => `/api/templates/${id}`,
  },
  STATUS: {
    GET_TIMELINE: (submissionId: string) =>
      `/api/status/timeline/${submissionId}`,
    GET_REQUIREMENTS: (submissionId: string) =>
      `/api/status/requirements/${submissionId}`,
  },
  LOGBOOK: {
    RESET: "/api/admin/logbooks/reset",
  },
  SIGNATURE: {
    GET_ACTIVE: "/api/signatures/active",
    UPLOAD: "/api/signatures/upload",
    MANAGE_URL: "/api/profile/signature/manage-url",
    GET_BY_ID: (signatureId: string) => `/api/signatures/${signatureId}`,
  },
};
