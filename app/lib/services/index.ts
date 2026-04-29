/**
 * Service Layer Barrel Exports
 *
 * Import dari sini untuk kemudahan akses semua service.
 * Semua file menggunakan konvensi *.service.ts dan memanfaatkan
 * sikpClient / internshipClient dari api-client.ts secara terpusat.
 */

// ==================== CORE SERVICES ====================

export * from "./team.service";
export * from "./submission.service";
export * from "./admin.service";

// ==================== SUBMISSION KP SERVICES ====================

// export * from "./submission-api.service"; // Conflict with submission.service.ts
export * from "./letter-request-status.service";
export * from "./response-letter.service";
export * from "./surat-kesediaan.service";
export * from "./surat-permohonan.service";
export * from "./surat-pengantar-dosen.service";

// ==================== TEMPLATE SERVICES ====================

export * from "./template.service";

// ==================== PROFILE & SIGNATURE SERVICES ====================

export {
  getMyProfile,
  getDosenDashboard,
  getWakdekDashboard,
  updateMyProfile,
  uploadESignature,
  deleteESignature,
  dataUrlToFile as dataUrlToFileDosen,
  type DosenProfile,
  type DosenDashboardData,
  type WakdekDashboardData,
  type ESignatureUploadResponse as DosenESignatureUploadResponse,
} from "./dosen.service";

export {
  getMyMahasiswaProfile,
  updateMyMahasiswaProfile,
  uploadMahasiswaESignature,
  deleteMahasiswaESignature,
  dataUrlToFile as dataUrlToFileMahasiswa,
  type MahasiswaProfile,
  type ESignatureUploadResponse as MahasiswaESignatureUploadResponse,
} from "./mahasiswa.service";

export {
  getSignatureManageUrl,
  getActiveProfileSignature,
  uploadProfileSignature,
  activateProfileSignature,
  deleteProfileSignatureById,
  deleteActiveProfileSignature,
  dataUrlToFile as dataUrlToFileSignature,
  type SignatureAsset,
} from "./signature.service";

// ==================== INTERNSHIP SERVICES ====================

export * from "./admin-logbook.service";
