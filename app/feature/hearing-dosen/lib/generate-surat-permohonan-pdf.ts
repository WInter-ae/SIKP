import { jsPDF } from "jspdf";
import { getAuthToken } from "~/lib/auth-client";

import type { MailEntry } from "../../hearing-dosen/types/dosen";

function getImageFormatFromDataUrl(dataUrl: string): "PNG" | "JPEG" {
  return dataUrl.startsWith("data:image/png") ? "PNG" : "JPEG";
}

async function toDataUrlFromImageUrl(imageUrl: string): Promise<string> {
  const token = getAuthToken();
  // Try plain GET first to avoid CORS preflight on storage URLs.
  // Only attach Authorization when server explicitly requires auth.
  let response = await fetch(imageUrl);

  if (!response.ok && (response.status === 401 || response.status === 403) && token) {
    response = await fetch(imageUrl, {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  if (!response.ok) throw new Error("Gagal memuat gambar tanda tangan");
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") resolve(reader.result);
      else reject(new Error("Format tanda tangan tidak valid"));
    };
    reader.onerror = () =>
      reject(new Error("Gagal membaca gambar tanda tangan"));
    reader.readAsDataURL(blob);
  });
}

/** Format "26 / Mei / 2025" */
function formatDateDisplay(dateStr?: string): string {
  if (!dateStr) return "-";
  const bulan = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return `${d.getDate()} / ${bulan[d.getMonth()]} / ${d.getFullYear()}`;
}

/** Format "20 Maret 2025" untuk tanggal surat */
function formatDateLong(dateStr?: string): string {
  if (!dateStr) return "";
  const bulan = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return `${d.getDate()} ${bulan[d.getMonth()]} ${d.getFullYear()}`;
}

/** Hitung selisih bulan antara dua tanggal, minimal 1 */
function calculateLamaKP(startStr?: string, endStr?: string): string {
  if (!startStr || !endStr) return "(-) bulan";
  const start = new Date(startStr);
  const end = new Date(endStr);
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return "(-) bulan";
  const months = Math.max(
    1,
    (end.getFullYear() - start.getFullYear()) * 12 +
      (end.getMonth() - start.getMonth()),
  );
  return `(${months}) bulan`;
}

/** Hitung tahun ajaran dari tahun berjalan, misal 2026 → "2026/2027" */
function getCurrentTahunAjaran(): string {
  const yr = new Date().getFullYear();
  return `${yr}/${yr + 1}`;
}

export async function generateSuratPermohonanPdf(
  entry: MailEntry,
): Promise<string> {
  const pdf = new jsPDF("portrait", "mm", "a4");
  const leftMargin = 20;
  const labelX = 25;
  const lineH = 7;
  const state = { y: 22 };

  /**
   * Tulis baris "Label    :   Value".
   * Colon diletakkan di max(fixedColonX, setelah label + 2mm)
   * agar label panjang tidak menabrak colon.
   */
  const writeField = (
    label: string,
    value: string,
    fixedColonX: number,
  ): void => {
    pdf.text(label, labelX, state.y);
    const labelWidth = pdf.getTextWidth(label);
    const colonX = Math.max(fixedColonX, labelX + labelWidth + 2);
    const valueX = colonX + 4;
    const valueWidth = 188 - valueX;
    pdf.text(":", colonX, state.y);
    const lines = pdf.splitTextToSize(value || "-", valueWidth);
    pdf.text(lines, valueX, state.y);
    state.y += lineH * Math.max(1, lines.length);
  };

  // ─── Judul ────────────────────────────────────────────
  pdf.setFont("times", "bold");
  pdf.setFontSize(14);
  pdf.text("FORM PERMOHONAN KERJA PRAKTIK", 105, state.y, { align: "center" });
  state.y += 14;

  // ─── Identitas Mahasiswa ──────────────────────────────
  pdf.setFont("times", "italic");
  pdf.setFontSize(11);
  pdf.text("Saya yang bertanda tangan di bawah ini", leftMargin, state.y);
  state.y += 9;

  pdf.setFont("times", "normal");
  const tahunAjaran = entry.tahunAjaran ?? getCurrentTahunAjaran();
  // colonX = 82 — cukup untuk "Jumlah SKS yang sudah diselesaikan" (ditangani
  // oleh writeField yang menggeser colon sesuai panjang label).
  const studentColonX = 82;
  writeField("Nama Mahasiswa", entry.namaMahasiswa, studentColonX);
  writeField("NIM", entry.nim, studentColonX);
  writeField("Program Studi", entry.programStudi, studentColonX);
  writeField("Semester", entry.semester ?? "-", studentColonX);
  writeField("Tahun Ajaran", tahunAjaran, studentColonX);
  writeField(
    "Jumlah SKS yang sudah diselesaikan",
    `${entry.jumlahSks ?? "-"} sks`,
    studentColonX,
  );
  state.y += 4;

  // ─── Data Perusahaan ──────────────────────────────────
  pdf.setFont("times", "italic");
  pdf.text("Memohon untuk melakukan Kerja Praktik pada :", leftMargin, state.y);
  state.y += 9;

  pdf.setFont("times", "normal");
  // colonX = 74 — cukup untuk "Unit/Bagian Tempat KP"
  const companyColonX = 74;
  writeField("Nama Perusahaan", entry.namaPerusahaan ?? "-", companyColonX);
  writeField("Alamat Perusahaan", entry.alamatPerusahaan ?? "-", companyColonX);
  writeField(
    "Telepon Perusahaan",
    entry.teleponPerusahaan ?? "-",
    companyColonX,
  );
  writeField(
    "Jenis Produk / Usaha",
    entry.jenisProdukUsaha ?? "-",
    companyColonX,
  );
  writeField("Unit/Bagian Tempat KP", entry.divisi ?? "-", companyColonX);
  state.y += 4;

  // ─── Periode KP ───────────────────────────────────────
  pdf.setFont("times", "italic");
  pdf.text("Dengan perincian sebagai berikut :", leftMargin, state.y);
  state.y += 9;

  pdf.setFont("times", "normal");
  const periodColonX = 66;
  const lamaKP = calculateLamaKP(entry.tanggalMulai, entry.tanggalSelesai);
  writeField("Lama Kerja Praktik", lamaKP, periodColonX);
  writeField(
    "Mulai Tanggal",
    formatDateDisplay(entry.tanggalMulai),
    periodColonX,
  );
  writeField(
    "Selesai Tanggal",
    formatDateDisplay(entry.tanggalSelesai),
    periodColonX,
  );
  state.y += 4;

  // ─── Pernyataan ────────────────────────────────────────
  pdf.setFont("times", "italic");
  pdf.text("Dan menyatakan bersedia :", leftMargin, state.y);
  state.y += 9;

  pdf.setFont("times", "normal");
  pdf.setFontSize(10.5);
  const bulletTextX = 35;
  const bulletTextWidth = 186 - bulletTextX;
  const bulletLineH = 5.8;
  const bulletGap = 1.2;

  const declarations = [
    "Menaati semua peraturan Kerja Praktik yang telah ditetapkan oleh Fakultas dan Perusahaan untuk pelaksanaan Kerja Praktik",
    "Tidak akan melakukan hal-hal yang dapat merugikan pihak lain serta mencemarkan nama baik diri sendiri, keluarga, pihak Fakultas serta perusahaan tempat melakukan Kerja Praktik",
    "Tidak akan menuntut atau meminta ganti rugi kepada pihak Fakultas dan Perusahaan apabila terjadi hal-hal yang tidak diinginkan saat Kerja Praktik (kehilangan, kecelakaan, dsb.) yang disebabkan oleh kecerobohan saya sendiri.",
  ];

  for (let i = 0; i < declarations.length; i++) {
    pdf.text(`${i + 1}.`, labelX, state.y);
    const lines = pdf.splitTextToSize(declarations[i], bulletTextWidth);
    pdf.text(lines, bulletTextX, state.y);
    state.y += bulletLineH * lines.length + bulletGap;
  }

  state.y += 3;

  // ─── Guard overflow halaman ────────────────────────────
  if (state.y > 258) {
    pdf.addPage();
    state.y = 22;
  }

  // ─── Tanda Tangan ─────────────────────────────────────
  pdf.setFontSize(11);
  const rightColumnX = 145;
  const tanggalSurat = entry.approvedAt
    ? formatDateLong(entry.approvedAt)
    : entry.tanggal
      ? formatDateLong(entry.tanggal)
      : formatDateLong(new Date().toISOString());

  pdf.text(`Palembang, ${tanggalSurat}`, rightColumnX, state.y);
  state.y += 8;

  const signatureTitleY = state.y;
  pdf.text("Dosen Pembimbing,", leftMargin + 5, signatureTitleY);
  pdf.text("Pemohon,", rightColumnX, signatureTitleY);
  state.y = signatureTitleY + 28;

  // Tanda tangan digital dosen (kiri)
  let hasRenderedSignature = false;
  if (entry.status === "disetujui" && entry.dosenEsignatureUrl) {
    try {
      const sigDataUrl = await toDataUrlFromImageUrl(entry.dosenEsignatureUrl);
      const sigFormat = getImageFormatFromDataUrl(sigDataUrl);
      pdf.addImage(
        sigDataUrl,
        sigFormat,
        leftMargin,
        signatureTitleY + 5,
        55,
        20,
      );
      hasRenderedSignature = true;
    } catch {
      hasRenderedSignature = false;
    }
  }

  if (!hasRenderedSignature) {
    pdf.setFont("times", "italic");
    pdf.setFontSize(10);
    pdf.text("[Tanda Tangan Digital]", leftMargin + 5, signatureTitleY + 18);
  }

  // Tanda tangan digital mahasiswa (kanan)
  let hasRenderedMahasiswaSignature = false;
  if (entry.mahasiswaEsignatureUrl) {
    try {
      const sigDataUrl = await toDataUrlFromImageUrl(entry.mahasiswaEsignatureUrl);
      const sigFormat = getImageFormatFromDataUrl(sigDataUrl);
      pdf.addImage(sigDataUrl, sigFormat, rightColumnX - 5, signatureTitleY + 5, 55, 20);
      hasRenderedMahasiswaSignature = true;
    } catch (error) {
      console.warn("Gagal render tanda tangan mahasiswa pada preview surat", {
        requestId: entry.id,
        nim: entry.nim,
        mahasiswaEsignatureUrl: entry.mahasiswaEsignatureUrl,
        error,
      });
      hasRenderedMahasiswaSignature = false;
    }
  } else {
    console.warn("URL tanda tangan mahasiswa tidak tersedia pada data request", {
      requestId: entry.id,
      nim: entry.nim,
    });
  }

  if (!hasRenderedMahasiswaSignature) {
    pdf.setFont("times", "italic");
    pdf.setFontSize(10);
    pdf.text("[Tanda Tangan Digital]", rightColumnX, signatureTitleY + 18);
  }

  // Nama dosen dan mahasiswa
  pdf.setFont("times", "normal");
  pdf.setFontSize(11);
  pdf.text(entry.dosenNama, leftMargin + 5, state.y);
  pdf.text(entry.namaMahasiswa, rightColumnX, state.y);
  state.y += 7;
  pdf.text(`NIP ${entry.dosenNip}`, leftMargin + 5, state.y);
  pdf.text(`NIM ${entry.nim}`, rightColumnX, state.y);

  // ─── Simpan file ──────────────────────────────────────
  const safeName = entry.namaMahasiswa
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const filename = `surat-permohonan-${safeName || entry.nim}-${entry.nim}.pdf`;
  pdf.save(filename);
  return filename;
}
