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
  namaPerusahaan?: string;
  alamatPerusahaan?: string;
  periodeKP?: string;
  fakultas?: string;
  universitas?: string;
  dosenNama: string;
  dosenNip: string;
  dosenJabatan: string;
  dosenEsignatureUrl?: string;
  signedFileUrl?: string;
  approvedAt?: string;
}
