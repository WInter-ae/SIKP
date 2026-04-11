/**
 * Service exports
 * Import dari sini untuk kemudahan
 */

export * from './team.service';
export * from './submission.service';
export * from './admin.service';

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
	type ApiResponse as DosenApiResponse,
} from './dosen-api';

export {
	getMyMahasiswaProfile,
	updateMyMahasiswaProfile,
	uploadMahasiswaESignature,
	deleteMahasiswaESignature,
	dataUrlToFile as dataUrlToFileMahasiswa,
	type MahasiswaProfile,
	type ESignatureUploadResponse as MahasiswaESignatureUploadResponse,
	type ApiResponse as MahasiswaApiResponse,
} from './mahasiswa-api';
