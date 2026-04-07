import { jsPDF } from "jspdf";
import { getAuthToken } from "~/lib/auth-client";
import unsriLogoUrl from "~/assets/images/unsri.png";

import type { MailEntry } from "../../hearing-dosen/types/dosen";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_APP_AUTH_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  "https://backend-sikp.backend-sikp.workers.dev";

function getImageFormatFromDataUrl(dataUrl: string): "PNG" | "JPEG" {
  return dataUrl.startsWith("data:image/png") ? "PNG" : "JPEG";
}

function toSignatureProxyUrl(imageUrl: string): string {
  try {
    const parsed = new URL(imageUrl);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      return `${API_BASE_URL}/api/assets/r2/${encodeURIComponent(imageUrl)}`;
    }
    return imageUrl;
  } catch {
    return imageUrl;
  }
}

async function toDataUrlFromImageUrl(imageUrl: string): Promise<string> {
  const token = getAuthToken();
  const fetchUrl = toSignatureProxyUrl(imageUrl);

  let response: Response;
  try {
    response = await fetch(fetchUrl);
  } catch {
    throw new Error("Gagal memuat gambar tanda tangan");
  }

  if (
    !response.ok &&
    (response.status === 401 || response.status === 403) &&
    token
  ) {
    try {
      response = await fetch(fetchUrl, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {
      throw new Error("Gagal memuat gambar tanda tangan");
    }
  }

  if (!response.ok) throw new Error("Gagal memuat gambar tanda tangan");
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

function formatDateLong(dateStr?: string): string {
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

  const normalized = dateStr.trim();

  let d: Date;
  // Handle DD/MM/YYYY or DD-MM-YYYY explicitly so it won't be interpreted as MM/DD/YYYY.
  const localDateMatch = normalized.match(
    /^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/,
  );
  if (localDateMatch) {
    const [, dd, mm, yyyy] = localDateMatch;
    d = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
  } else {
    d = new Date(normalized);
  }

  if (Number.isNaN(d.getTime())) return dateStr;
  return `${d.getDate()} ${bulan[d.getMonth()]} ${d.getFullYear()}`;
}

function formatRangeDate(startDate?: string, endDate?: string): string {
  const start = formatDateLong(startDate).replace(/\s+/g, ' ').trim();
  const end = formatDateLong(endDate).replace(/\s+/g, ' ').trim();
  if (start === end) return start;
  return `${start} - ${end}`;
}

function sanitizeText(value?: string): string {
  if (!value) return "";
  return value.replace(/\s+/g, " ").trim();
}

function buildRecipientLine(entry: MailEntry): string {
  const tujuan = sanitizeText(entry.tujuanSurat);
  const company = sanitizeText(entry.namaPerusahaan);

  if (tujuan && company) {
    if (tujuan.toLowerCase().includes(company.toLowerCase())) return tujuan;
    return `${tujuan} ${company}`;
  }

  return tujuan || company || "-";
}

async function toPngDataUrlFromImageUrl(imageUrl: string): Promise<string> {
  return await new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";

    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        reject(new Error("Gagal membuat canvas untuk logo"));
        return;
      }

      ctx.drawImage(image, 0, 0);
      resolve(canvas.toDataURL("image/png"));
    };

    image.onerror = () => reject(new Error("Gagal memuat logo UNSRI"));
    image.src = imageUrl;
  });
}

function drawLogoFallback(
  pdf: jsPDF,
  x: number,
  y: number,
  size: number,
): void {
  const centerX = x + size / 2;
  const centerY = y + size / 2;

  pdf.setDrawColor(30, 58, 138);
  pdf.setLineWidth(0.6);
  pdf.circle(centerX, centerY, size / 2, "S");

  pdf.setFillColor(255, 255, 255);
  pdf.circle(centerX, centerY, size / 2 - 1.6, "F");

  pdf.setFont("times", "bold");
  pdf.setFontSize(7);
  pdf.text("UNSRI", centerX, centerY + 1.8, { align: "center" });
}

function drawStampPlaceholder(
  pdf: jsPDF,
  x: number,
  y: number,
  size: number,
): void {
  const centerX = x + size / 2;
  const centerY = y + size / 2;

  pdf.setDrawColor(25, 64, 175);
  pdf.setLineWidth(0.6);
  pdf.circle(centerX, centerY, size / 2, "S");
  pdf.circle(centerX, centerY, size / 2 - 3, "S");

  pdf.setFont("times", "bold");
  pdf.setTextColor(25, 64, 175);
  pdf.setFontSize(8);
  pdf.text("STEMPEL", centerX, centerY - 1, { align: "center" });
  pdf.text("PLACEHOLDER", centerX, centerY + 4, { align: "center" });
  pdf.setTextColor(0, 0, 0);
}

export async function generateSuratPengantarPdf(
  entry: MailEntry,
): Promise<string> {
  const pdf = new jsPDF("portrait", "mm", "a4");
  const left = 20;
  const right = 190;
  const state = { y: 20 };

  const ensureSpace = (requiredHeight: number) => {
    if (state.y + requiredHeight <= 275) return;
    pdf.addPage();
    state.y = 20;
  };

  // 11pt * 1.15 ~= 12.65pt ~= 4.46mm
  const lineHeight115 = 4.5;

  const writeJustifiedParagraph = (
    text: string,
    x: number,
    width: number,
    lineHeight = lineHeight115,
  ) => {
    const lines = pdf.splitTextToSize(text, width) as string[];

    lines.forEach((line, index) => {
      const value = line.trim();
      const isLastLine = index === lines.length - 1;
      const words = value.split(/\s+/).filter(Boolean);

      if (!isLastLine && words.length > 1) {
        const wordsWidth = words.reduce(
          (total, word) => total + pdf.getTextWidth(word),
          0,
        );
        const extraSpace = (width - wordsWidth) / (words.length - 1);

        let cursorX = x;
        words.forEach((word, wordIndex) => {
          pdf.text(word, cursorX, state.y);
          if (wordIndex < words.length - 1) {
            cursorX += pdf.getTextWidth(word) + extraSpace;
          }
        });
      } else {
        pdf.text(value, x, state.y);
      }

      state.y += lineHeight;
    });
  };

  const writeParagraphWithBoldToken = (
    fullText: string,
    boldToken: string,
    x: number,
    width: number,
    lineHeight = lineHeight115,
  ) => {
    const marker = "__BOLD_TOKEN__";
    // Gunakan regex agar semua variasi spasi tergantikan
    const escaped = boldToken.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(escaped.replace(/\s+/g, '\\s+'), 'g');
    const normalizedText = fullText.replace(regex, marker);

    const segments = normalizedText
      .split(marker)
      .flatMap((part, index, arr) => {
        const result: Array<{ text: string; bold: boolean }> = [];
        if (part.trim().length > 0) result.push({ text: part, bold: false });
        if (index < arr.length - 1 && boldToken.trim().length > 0) {
          result.push({ text: boldToken, bold: true });
        }
        return result;
      });

    const chunks: Array<{ text: string; bold: boolean }> = [];
    segments.forEach((segment) => {
      if (segment.bold) {
        if (segment.text.length > 0) {
          chunks.push({ text: segment.text, bold: true });
        }
      }

      segment.text
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .forEach((word) => chunks.push({ text: word, bold: false }));
    });

    const lines: Array<Array<{ text: string; bold: boolean }>> = [];
    let currentLine: Array<{ text: string; bold: boolean }> = [];
    let currentWidth = 0;

    chunks.forEach((item) => {
      pdf.setFont("times", item.bold ? "bold" : "normal");
      const textWidth = pdf.getTextWidth(item.text);
      pdf.setFont("times", "normal");
      const spaceWidth = pdf.getTextWidth(" ");

      const candidateWidth =
        currentLine.length === 0
          ? textWidth
          : currentWidth + spaceWidth + textWidth;

      if (candidateWidth > width && currentLine.length > 0) {
        lines.push(currentLine);
        currentLine = [item];
        currentWidth = textWidth;
      } else {
        currentLine.push(item);
        currentWidth = candidateWidth;
      }
    });

    if (currentLine.length > 0) {
      lines.push(currentLine);
    }

    lines.forEach((line) => {
      let cursorX = x;
      line.forEach((item, index) => {
        pdf.setFont("times", item.bold ? "bold" : "normal");
        pdf.text(item.text, cursorX, state.y);
        const textWidth = pdf.getTextWidth(item.text);
        if (index < line.length - 1) {
          pdf.setFont("times", "normal");
          cursorX += textWidth + pdf.getTextWidth(" ");
        }
      });
      state.y += lineHeight;
    });

    pdf.setFont("times", "normal");
  };

  const teamMembers =
    entry.teamMembers && entry.teamMembers.length > 0
      ? entry.teamMembers
      : [
          {
            id: `fallback-${entry.id}`,
            name: entry.namaMahasiswa || "-",
            nim: entry.nim || "-",
            prodi: entry.programStudi || "-",
            role: "Ketua",
          },
        ];

  const tujuanSurat = buildRecipientLine(entry);
  const alamatPerusahaan = entry.alamatPerusahaan || "-";
  const nomorSurat = entry.nomorSurat || "-";
  const tanggalSurat = formatDateLong(entry.approvedAt || entry.tanggal);

  const logoX = 12;
  const logoY = 14;
  const logoSize = 36;

  try {
    const logoDataUrl = await toPngDataUrlFromImageUrl(unsriLogoUrl);
    pdf.addImage(logoDataUrl, "PNG", logoX, logoY, logoSize, logoSize);
  } catch {
    drawLogoFallback(pdf, logoX, logoY, logoSize);
  }

  // Header surat
  pdf.setFont("times", "normal");
  pdf.setFontSize(16);
  pdf.text("KEMENTERIAN PENDIDIKAN TINGGI,", 105, state.y, { align: "center" });
  state.y += 6;
  pdf.text("SAINS, DAN TEKNOLOGI", 105, state.y, { align: "center" });
  state.y += 7;

  pdf.setFont("times", "normal");
  pdf.setFontSize(14);
  pdf.text("UNIVERSITAS SRIWIJAYA", 105, state.y, { align: "center" });
  state.y += 5;
  pdf.setFont("times", "bold");
  pdf.text("FAKULTAS ILMU KOMPUTER", 105, state.y, { align: "center" });
  state.y += 7;

  pdf.setFont("times", "normal");
  pdf.setFontSize(11);
  pdf.text(
    "Jalan Palembang - Prabumulih Km. 32 Inderalaya Ogan Ilir Kode Pos 30662",
    105,
    state.y,
    { align: "center" },
  );
  state.y += 5;
  pdf.text(
    "Telepon (+62711) 379249. Pos-el humas@ilkom.unsri.ac.id",
    105,
    state.y,
    {
      align: "center",
    },
  );
  state.y += 5;
  pdf.setLineWidth(0.5);
  pdf.line(left, state.y, right, state.y);
  state.y += 10;

  // Metadata surat
  const contentLeft = left + 10;
  const contentRight = right - 10;
  const contentWidth = contentRight - contentLeft;
  const metadataLeft = contentLeft;
  pdf.setFontSize(12);
  pdf.text("Nomor", metadataLeft, state.y);
  pdf.text(":", metadataLeft + 22, state.y);
  pdf.text(nomorSurat, metadataLeft + 26, state.y);
  pdf.text(tanggalSurat, contentRight, state.y, { align: "right" });
  state.y += lineHeight115;

  pdf.text("Lampiran", metadataLeft, state.y);
  pdf.text(":", metadataLeft + 22, state.y);
  pdf.text("1 (satu) berkas", metadataLeft + 26, state.y);
  state.y += lineHeight115;

  pdf.text("Perihal", metadataLeft, state.y);
  pdf.text(":", metadataLeft + 22, state.y);
  pdf.setFont("times", "normal");
  pdf.text("Izin Kerja Praktik", metadataLeft + 26, state.y);
  pdf.setFont("times", "normal");
  state.y += lineHeight115 * 2;

  // Tujuan surat
  pdf.setFont("times", "bold");
  const recipientLabelX = contentLeft;
  const recipientValueX = contentLeft + 20;
  const recipientWidth = contentWidth - (recipientValueX - contentLeft);

  pdf.text("Yth.", recipientLabelX, state.y);
  const tujuanLines = pdf.splitTextToSize(
    tujuanSurat,
    recipientWidth,
  ) as string[];
  pdf.text(tujuanLines, recipientValueX, state.y);
  state.y += Math.max(1, tujuanLines.length) * lineHeight115;

  const alamatLines = pdf.splitTextToSize(
    alamatPerusahaan,
    recipientWidth,
  ) as string[];
  pdf.text(alamatLines, recipientValueX, state.y);
  state.y += Math.max(1, alamatLines.length) * lineHeight115;

  pdf.text("di", recipientValueX, state.y);
  state.y += lineHeight115;
  pdf.setFont("times", "normal");
  pdf.text("Tempat", recipientValueX + 12, state.y);
  state.y += lineHeight115 * 3;

  // Isi pembuka
  pdf.setFont("times", "normal");
  const openingText =
    "Dengan hormat, kami sampaikan bahwa salah satu syarat mahasiswa Fakultas Ilmu Komputer Universitas Sriwijaya untuk menyelesaikan pendidikannya adalah melakukan Kerja Praktik (KP). Kerja Praktik ini bertujuan untuk memberikan pengalaman kerja sesuai kompetensi atau program studi mahasiswa berkaitan Teknologi Informasi dan Komunikasi (TIK). Berkenaan hal tersebut, mahasiswa berikut ini :";
  writeJustifiedParagraph(
    openingText,
    contentLeft,
    contentWidth,
    lineHeight115,
  );
  state.y += 3;

  const labelX = contentLeft + 18;
  const colonX = contentLeft + 63;
  const valueX = contentLeft + 67;
  const fieldValueWidth = contentRight - valueX - 2;
  const fieldLineH = lineHeight115;

  teamMembers.forEach((member, index) => {
    ensureSpace(40);
    pdf.setFont("times", "normal");
    pdf.text(`${index + 1}.`, contentLeft + 2, state.y);
    pdf.setFont("times", "normal");

    const writeField = (label: string, value: string) => {
      pdf.text(label, labelX, state.y);
      pdf.text(":", colonX, state.y);
      const lines = pdf.splitTextToSize(value || "-", fieldValueWidth);
      pdf.text(lines, valueX, state.y);
      state.y += Math.max(1, lines.length) * fieldLineH;
    };

    writeField("Nama", member.name || "-");
    writeField("NIM", member.nim || "-");
    writeField("Program Studi", member.prodi || entry.programStudi || "-");
    writeField("Dosen Pembimbing", entry.supervisor || "-");
    state.y += lineHeight115 * 0.65;
  });

  ensureSpace(65);

  const periodText = formatRangeDate(entry.tanggalMulai, entry.tanggalSelesai).replace(/\s+/g, ' ').trim();
  const penutupText = `Merencanakan Kerja Praktik (KP) di unit/bagian/subbagian ${entry.divisi || "-"} yang Bapak/Ibu pimpin pada tanggal ${periodText} dengan proposal KP terlampir. Mohon kiranya Bapak/Ibu dapat memperkenankan/memfasilitasi mahasiswa tersebut.`.replace(/\s+/g, ' ');

  // Word wrap manual dengan highlight bold pada periodText
  const words = penutupText.split(' ');
  let line = '';
  let y = state.y;
  const spaceWidth = pdf.getTextWidth(' ');
  pdf.setFontSize(12);
  for (let i = 0; i < words.length; i++) {
    let testLine = line.length > 0 ? line + ' ' + words[i] : words[i];
    let testWidth = pdf.getTextWidth(testLine);
    if (testWidth > contentWidth && line.length > 0) {
      // Render line
      let x = contentLeft;
      let idx = 0;
      while (idx < line.length) {
        // Cari periodText di line
        const periodIdx = line.indexOf(periodText, idx);
        if (periodIdx === -1) {
          pdf.setFont("times", "normal");
          pdf.text(line.substring(idx), x, y);
          break;
        } else {
          // Render sebelum periodText
          if (periodIdx > idx) {
            pdf.setFont("times", "normal");
            const before = line.substring(idx, periodIdx);
            pdf.text(before, x, y);
            x += pdf.getTextWidth(before);
          }
          // Render periodText bold
          pdf.setFont("times", "bold");
          pdf.text(periodText, x, y);
          x += pdf.getTextWidth(periodText);
          idx = periodIdx + periodText.length;
        }
      }
      y += lineHeight115;
      line = words[i];
    } else {
      line = testLine;
    }
  }
  // Render sisa line terakhir
  if (line.length > 0) {
    let x = contentLeft;
    let idx = 0;
    while (idx < line.length) {
      const periodIdx = line.indexOf(periodText, idx);
      if (periodIdx === -1) {
        pdf.setFont("times", "normal");
        pdf.text(line.substring(idx), x, y);
        break;
      } else {
        if (periodIdx > idx) {
          pdf.setFont("times", "normal");
          const before = line.substring(idx, periodIdx);
          pdf.text(before, x, y);
          x += pdf.getTextWidth(before);
        }
        pdf.setFont("times", "bold");
        pdf.text(periodText, x, y);
        x += pdf.getTextWidth(periodText);
        idx = periodIdx + periodText.length;
      }
    }
    y += lineHeight115;
  }
  state.y = y + 3;

  writeJustifiedParagraph(
    "Atas perkenan dan bantuannya, kami mengucapkan terima kasih.",
    contentLeft,
    contentWidth,
    lineHeight115,
  );
  state.y += 8;

  // Blok tanda tangan dosen
  const signX = contentRight - 53;
  pdf.setFont("times", "normal");
  pdf.text("Wakil Dekan Bidang Akademik,", signX, state.y);
  const signatureTopY = state.y + 4;
  state.y += 28;

  let hasRenderedSignature = false;
  if (entry.status === "disetujui" && entry.dosenEsignatureUrl) {
    try {
      const signatureDataUrl = await toDataUrlFromImageUrl(
        entry.dosenEsignatureUrl,
      );
      const format = getImageFormatFromDataUrl(signatureDataUrl);
      pdf.addImage(signatureDataUrl, format, signX - 8, signatureTopY, 55, 20);
      hasRenderedSignature = true;
    } catch {
      hasRenderedSignature = false;
    }
  }

  if (!hasRenderedSignature) {
    pdf.setFont("times", "italic");
    pdf.text("[Tanda Tangan Digital]", signX, signatureTopY + 13);
  }

  drawStampPlaceholder(pdf, 84, signatureTopY + -25, 56);

  pdf.setFontSize(12);
  pdf.setFont("times", "normal");
  pdf.text(entry.dosenNama || "-", signX, state.y);
  state.y += 7;
  pdf.text(`NIP ${entry.dosenNip || "-"}`, signX, state.y);

  const safeName = (entry.namaPerusahaan || entry.namaMahasiswa || "surat")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const filename = `surat-pengantar-${safeName || entry.id}.pdf`;
  pdf.save(filename);
  return filename;
}
