// Types untuk halaman verifikasi dosen

export interface PengajuanSidang {
  id: string;
  mahasiswa: {
    id: string;
    nama: string;
    nim: string;
    prodi: string;
    foto?: string;
  };
  data: {
    judulLaporan: string;
    tempatPelaksanaan: string;
    tanggalSidang: string;
    waktuMulai: string;
    waktuSelesai: string;
  };
  status: "submitted" | "approved" | "rejected";
  tanggalPengajuan: string;
  tanggalVerifikasi?: string;
  catatanDosen?: string;
  nilaiAkhir?: number;
}

export interface VerifikasiFormData {
  status: "approved" | "rejected";
  catatanDosen: string;
  nilaiAkhir?: number;
}
