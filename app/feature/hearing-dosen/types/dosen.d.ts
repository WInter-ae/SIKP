// Types untuk halaman preview surat kesediaan dosen

export interface MailEntry {
  id: string;
  tanggal: string;
  nim: string;
  namaMahasiswa: string;
  programStudi: string;
  angkatan?: string;
  semester?: string;
  email?: string;
  noHp?: string;
  jenisSurat?: string;
  status: "menunggu" | "disetujui" | "ditolak";
  supervisor?: string;
  teamMembers?: Array<{
    id: string;
    name: string;
    nim?: string;
    prodi?: string;
    role: string;
  }>;
  namaPerusahaan?: string;
  tujuanSurat?: string;
  alamatPerusahaan?: string;
  periodeKP?: string;
  fakultas?: string;
  universitas?: string;
  dosenNama: string;
  dosenNip: string;
  dosenJabatan: string;
  dosenEsignatureUrl?: string;
  mahasiswaEsignatureUrl?: string;
  signedFileUrl?: string;
  approvedAt?: string;
  // Fields khusus Surat Permohonan
  jumlahSks?: string;
  tahunAjaran?: string;
  teleponPerusahaan?: string;
  jenisProdukUsaha?: string;
  divisi?: string;
  tanggalMulai?: string;
  tanggalSelesai?: string;
  nomorSurat?: string;
}
