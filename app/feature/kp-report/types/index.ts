export interface LaporanKPData {
  judul: string;
  dosenPembimbing?: string;
  statusJudul: "draft" | "diajukan" | "disetujui" | "ditolak";
  alasanPerubahan?: string;
  judulBaru?: string;
  laporanFile?: File | null;
  tanggalPengajuan?: string;
  tanggalDisetujui?: string;
  keterangan?: string;
}

export interface DosenPembimbing {
  id: string;
  nama: string;
  nip: string;
  email: string;
}

export interface TitleSubmission {
  judul: string;
  tanggalPengajuan: string;
  status: "menunggu" | "disetujui" | "ditolak";
  keterangan?: string;
}

export interface TitleChangeSubmission {
  judulLama: string;
  judulBaru: string;
  alasanPerubahan: string;
  tanggalPengajuan: string;
  status: "menunggu" | "disetujui" | "ditolak";
  keterangan?: string;
}

export interface ReportUpload {
  namaFile: string;
  tanggalUpload: string;
  ukuranFile: string;
  status: "draft" | "disubmit" | "revisi" | "disetujui";
}
