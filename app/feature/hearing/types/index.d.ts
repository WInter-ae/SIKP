export interface BeritaAcara {
  id?: string;
  judulLaporan: string;
  tempatPelaksanaan: string;
  tanggalSidang: string;
  waktuMulai: string;
  waktuSelesai: string;
  dosenPenguji?: DosenPenguji[];
  nilaiAkhir?: number;
  catatanDosen?: string;
  status: "draft" | "submitted" | "approved" | "rejected" | "jadwal_approved";
  createdAt?: string;
  updatedAt?: string;
  tanggalVerifikasi?: string;
  tanggalApproval?: string;
  // E-signature fields
  dosenSignature?: {
    nama: string;
    nip: string;
    signatureImage: string;
    signedAt: string;
  };
  documentUrl?: string;
}

export interface DosenPenguji {
  id: number;
  nama: string;
  nip: string;
  jabatan: "pembimbing" | "penguji";
}

export interface DataSidang {
  beritaAcara: BeritaAcara;
  mahasiswa: {
    nama: string;
    nim: string;
    prodi: string;
  };
  tim: {
    id: string;
    nama: string;
    anggota: string[];
  };
  dosenPenguji: DosenPenguji[];
}

export interface SuratBeritaAcara {
  nomorSurat: string;
  tanggalDibuat: string;
  beritaAcara: BeritaAcara;
  ttdDosen: {
    nama: string;
    nip: string;
    tanggal: string;
    jabatan: "pembimbing" | "penguji";
  }[];
}
