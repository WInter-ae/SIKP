/**
 * Document Type Constants
 * 
 * PENTING: SURAT_PENGANTAR adalah dokumen yang di-generate otomatis oleh sistem
 * setelah approval. Dokumen ini TIDAK boleh muncul di form upload atau review accordion.
 * 
 * Hanya 6 dokumen di bawah ini yang boleh di-upload oleh mahasiswa.
 */

export const UPLOADABLE_DOCUMENT_TYPES = [
  "PROPOSAL_KETUA",
  "SURAT_KESEDIAAN",
  "FORM_PERMOHONAN",
  "KRS_SEMESTER_4",
  "DAFTAR_KUMPULAN_NILAI",
  "BUKTI_PEMBAYARAN_UKT",
] as const;

export const DOCUMENT_TYPE_LABELS: Record<string, string> = {
  PROPOSAL_KETUA: "Surat Proposal",
  SURAT_KESEDIAAN: "Surat Kesediaan",
  FORM_PERMOHONAN: "Form Permohonan",
  KRS_SEMESTER_4: "KRS Semester 4",
  DAFTAR_KUMPULAN_NILAI: "Daftar Kumpulan Nilai",
  BUKTI_PEMBAYARAN_UKT: "Bukti Pembayaran UKT",
};

export const STANDARD_DOCUMENT_TITLES = [
  "Surat Proposal",
  "Surat Kesediaan",
  "Form Permohonan",
  "KRS Semester 4",
  "Daftar Kumpulan Nilai",
  "Bukti Pembayaran UKT",
] as const;

/**
 * Helper function untuk mengecek apakah sebuah string adalah SURAT_PENGANTAR
 * dengan berbagai variasi format
 */
export function isSuratPengantarDocument(text: string): boolean {
  if (!text) return false;
  const normalized = text.trim().toLowerCase().replace(/[_\s-]/g, "");
  return (
    normalized === "suratpengantar" ||
    normalized === "suratpengantarkerjapraktik" ||
    normalized.includes("suratpengantar")
  );
}
