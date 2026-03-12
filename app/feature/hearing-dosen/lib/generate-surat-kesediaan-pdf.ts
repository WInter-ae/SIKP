import { jsPDF } from "jspdf";

import type { MailEntry } from "../../hearing-dosen/types/dosen";

function getImageFormatFromDataUrl(dataUrl: string): "PNG" | "JPEG" {
  if (dataUrl.startsWith("data:image/png")) return "PNG";
  return "JPEG";
}

async function toDataUrlFromImageUrl(imageUrl: string): Promise<string> {
  const response = await fetch(imageUrl);
  if (!response.ok) {
    throw new Error("Gagal memuat gambar tanda tangan");
  }

  const blob = await response.blob();
  return await new Promise((resolve, reject) => {
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

export async function generateSuratKesediaanPdf(
  entry: MailEntry,
): Promise<string> {
  const letterDate = new Date(entry.tanggal.split("/").reverse().join("-"));
  const formattedDate = Number.isNaN(letterDate.getTime())
    ? entry.tanggal
    : new Intl.DateTimeFormat("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(letterDate);

  const pdf = new jsPDF("portrait", "mm", "a4");
  let y = 22;

  const lineGap = 8;
  const writeField = (label: string, value: string, indent = 25) => {
    pdf.text(label, indent, y);
    pdf.text(":", indent + 35, y);
    pdf.text(value, indent + 40, y);
    y += lineGap;
  };

  pdf.setFont("times", "bold");
  pdf.setFontSize(16);
  pdf.text("SURAT KESEDIAAN MEMBIMBING KP", 105, y, { align: "center" });

  y += 20;
  pdf.setFont("times", "normal");
  pdf.setFontSize(12);
  pdf.text("Yang bertanda tangan di bawah ini :", 20, y);

  y += 12;
  writeField("Nama", entry.dosenNama);
  writeField("NIP", entry.dosenNip);
  writeField("Jabatan", entry.dosenJabatan);

  y += 6;
  const intro =
    "dengan ini menyatakan bersedia untuk membimbing kerja praktik mahasiswa berikut :";
  const introLines = pdf.splitTextToSize(intro, 170);
  pdf.text(introLines, 20, y);
  y += introLines.length * 7 + 4;

  writeField("Nama", entry.namaMahasiswa);
  writeField("NIM", entry.nim);
  writeField("Program Studi", entry.programStudi);

  y += 8;
  pdf.text("Demikianlah pernyataan ini dibuat agar maklum.", 20, y);

  y += 32;
  pdf.text(`Palembang, ${formattedDate}`, 130, y);
  y += 7;
  pdf.text("Calon Dosen Pembimbing,", 130, y);
  y += 26;

  let hasRenderedSignature = false;
  if (entry.status === "disetujui" && entry.dosenEsignatureUrl) {
    try {
      const signatureDataUrl = await toDataUrlFromImageUrl(
        entry.dosenEsignatureUrl,
      );
      const signatureFormat = getImageFormatFromDataUrl(signatureDataUrl);

      // Draw signature image around signature placeholder area.
      pdf.addImage(signatureDataUrl, signatureFormat, 120, y - 18, 55, 20);
      hasRenderedSignature = true;
    } catch {
      hasRenderedSignature = false;
    }
  }

  if (!hasRenderedSignature) {
    pdf.setFont("times", "italic");
    pdf.text("[Tanda Tangan Digital]", 130, y);
  }

  y += 12;
  pdf.setFont("times", "normal");
  pdf.text(entry.dosenNama, 130, y);
  y += 7;
  pdf.text(`NIP ${entry.dosenNip}`, 130, y);

  const safeName = entry.namaMahasiswa
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const filename = `surat-kesediaan-${safeName || entry.nim}-${entry.nim}.pdf`;

  pdf.save(filename);
  return filename;
}
