/**
 * Service exports
 * Import dari sini untuk kemudahan
 */

export * from './team.service';
export * from './submission.service';
export * from './admin.service';
export {
	getMyProfile,
	updateMyProfile,
	uploadESignature,
	deleteESignature,
	dataUrlToFile as dataUrlToDosenFile,
} from './dosen-api';
export {
	getMyMahasiswaProfile,
	updateMyMahasiswaProfile,
	uploadMahasiswaESignature,
	deleteMahasiswaESignature,
	dataUrlToFile as dataUrlToMahasiswaFile,
} from './mahasiswa-api';
