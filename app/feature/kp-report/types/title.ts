export interface PengajuanJudul {
  id: string;
  mahasiswa: {
    id: string;
    nama: string;
    nim: string;
    prodi: string;
    email?: string;
  };
  tim?: {
    id: string;
    nama: string;
    anggota: string[];
  };
  data: {
    judulLaporan: string;
    judulInggris?: string;
    tempatMagang: string;
    periode: {
      mulai: string;
      selesai: string;
    };
    deskripsi: string;
    metodologi?: string;
    teknologi?: string[];
  };
  status: "diajukan" | "disetujui" | "ditolak" | "revisi";
  tanggalPengajuan: string;
  tanggalVerifikasi?: string;
  catatanDosen?: string;
  revisi?: {
    count: number;
    history: Array<{
      tanggal: string;
      catatan: string;
    }>;
  };
}

export interface VerifikasiJudulFormData {
  status: "disetujui" | "ditolak" | "revisi";
  catatan: string;
}
