export interface AssessmentFormRow {
  category: string;
  weight: number;
  score: number;
  weightedScore: number;
}

export interface AssessmentFormData {
  studentName: string;
  nim: string;
  programStudi: string;
  fakultas?: string;
  companyName: string;
  assessmentPeriod: string;
  assessmentDate: string;
  mentorName: string;
  mentorPosition?: string;
  mentorSignature?: string;
  rows: AssessmentFormRow[];
  totalWeightedScore: number;
}

export async function normalizeSignatureForDocument(
  signatureDataUrl?: string | null
): Promise<string | undefined> {
  if (!signatureDataUrl) {
    console.debug("[normalizeSignature] No signature provided");
    return undefined;
  }

  try {
    console.debug("[normalizeSignature] Processing signature, length:", signatureDataUrl.length);
    
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        console.debug("[normalizeSignature] Image loaded successfully");
        resolve(img);
      };
      img.onerror = () => {
        console.error("[normalizeSignature] Failed to load image");
        reject(new Error("Gagal memuat gambar tanda tangan."));
      };
      img.src = signatureDataUrl;
    });

    const srcCanvas = document.createElement("canvas");
    srcCanvas.width = image.width;
    srcCanvas.height = image.height;
    const srcCtx = srcCanvas.getContext("2d");
    if (!srcCtx) return signatureDataUrl;

    srcCtx.drawImage(image, 0, 0);
    const { data, width, height } = srcCtx.getImageData(0, 0, srcCanvas.width, srcCanvas.height);

    let minX = width;
    let minY = height;
    let maxX = -1;
    let maxY = -1;

    // Find non-empty stroke area (transparent or near-white pixels are ignored).
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];
        const a = data[idx + 3];

        const isVisible = a > 20;
        const isNotWhite = r < 245 || g < 245 || b < 245;

        if (isVisible && isNotWhite) {
          if (x < minX) minX = x;
          if (y < minY) minY = y;
          if (x > maxX) maxX = x;
          if (y > maxY) maxY = y;
        }
      }
    }

    // If no stroke detected, keep original image.
    if (maxX < minX || maxY < minY) {
      console.debug("[normalizeSignature] No visible strokes detected, returning original");
      return signatureDataUrl;
    }

    const pad = 10;
    const cropX = Math.max(0, minX - pad);
    const cropY = Math.max(0, minY - pad);
    const cropW = Math.min(width - cropX, maxX - minX + 1 + pad * 2);
    const cropH = Math.min(height - cropY, maxY - minY + 1 + pad * 2);

    const cropCanvas = document.createElement("canvas");
    cropCanvas.width = cropW;
    cropCanvas.height = cropH;
    const cropCtx = cropCanvas.getContext("2d");
    if (!cropCtx) return signatureDataUrl;

    cropCtx.drawImage(srcCanvas, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);
    const result = cropCanvas.toDataURL("image/png");
    console.debug("[normalizeSignature] Signature cropped and normalized, new length:", result.length);
    return result;
  } catch (error) {
    console.error("[normalizeSignature] Error during normalization:", error);
    return signatureDataUrl;
  }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatDecimalId(value: number, fractionDigits = 1): string {
  return value.toLocaleString("id-ID", {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });
}

function buildAssessmentFormHtml(data: AssessmentFormData): string {
  const rowsHtml = data.rows
    .map((row, index) => {
      return `
        <tr>
          <td class="center">${index + 1}</td>
          <td>${escapeHtml(row.category)}</td>
          <td class="center">${row.weight}%</td>
          <td class="center">${row.score}</td>
          <td class="center">${formatDecimalId(row.weightedScore, 1)}</td>
        </tr>
      `;
    })
    .join("");

  const signatureBlock = data.mentorSignature
    ? `
      <div class="signature-space">
        <img src="${data.mentorSignature}" alt="Tanda tangan pembimbing" class="signature-image" />
      </div>
    `
    : `
      <div class="signature-space"></div>
    `;

  return `
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="UTF-8" />
      <title>Form Penilaian KP - ${escapeHtml(data.nim)}</title>
      <style>
        @page {
          size: A4;
          margin: 1.8cm;
        }

        body {
          font-family: "Times New Roman", serif;
          font-size: 12pt;
          color: #111827;
          margin: 0;
          background: #ffffff;
        }

        .container {
          position: relative;
          width: 100%;
          max-width: 780px;
          margin: 0 auto;
          padding-bottom: 24px;
        }

        .frame-line {
          position: absolute;
          width: 4px;
          background: #111827;
          z-index: 0;
        }

        .frame-line.left {
          left: 132px;
          top: 34px;
          bottom: 104px;
        }

        .frame-line.right {
          right: 98px;
          top: 206px;
          bottom: 62px;
        }

        .title {
          position: relative;
          z-index: 1;
          text-align: center;
          font-weight: 700;
          font-size: 18px;
          letter-spacing: 0.4px;
          margin-bottom: 18px;
          text-transform: uppercase;
          color: #334155;
        }

        .meta-table {
          position: relative;
          z-index: 1;
          width: 57%;
          border-collapse: collapse;
          margin: 0 0 16px 156px;
        }

        .meta-table td {
          padding: 2px 4px;
          vertical-align: top;
        }

        .meta-label {
          width: 160px;
        }

        .meta-sep {
          width: 12px;
          text-align: center;
        }

        .score-table {
          position: relative;
          z-index: 1;
          width: 74%;
          border-collapse: collapse;
          margin: 10px auto 0 auto;
        }

        .score-table th,
        .score-table td {
          border: 1px solid #6b7280;
          padding: 4px 6px;
        }

        .score-table th {
          text-align: center;
          background: #f3f4f6;
          font-weight: 700;
        }

        .center {
          text-align: center;
        }

        .total-label {
          text-align: center;
          font-weight: 700;
        }

        .signature-section {
          position: relative;
          z-index: 1;
          margin-top: 30px;
          display: flex;
          justify-content: flex-end;
        }

        .signature-box {
          width: 220px;
          text-align: left;
          margin-right: 0;
          transform: translateX(-40px);
        }

        .signature-space {
          width: 160px;
          height: 72px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 8px 0 6px 0;
          border: none;
          background: transparent;
        }

        .signature-image {
          max-height: 58px;
          max-width: 136px;
          object-fit: contain;
          transform: translateX(-8px);
        }

        .sign-name {
          margin-top: 8px;
          font-weight: 700;
          text-decoration: underline;
        }

        .sign-position {
          margin-top: 2px;
        }
      </style>
    </head>
    <body>
      <div class="container" id="assessment-form-root">
        <div class="frame-line left"></div>
        <div class="frame-line right"></div>
        <div class="title">Formulir Penilaian Kerja Praktik (KP)</div>

        <table class="meta-table">
          <tr><td class="meta-label">Nama</td><td class="meta-sep">:</td><td>${escapeHtml(data.studentName)}</td></tr>
          <tr><td class="meta-label">NIM</td><td class="meta-sep">:</td><td>${escapeHtml(data.nim)}</td></tr>
          <tr><td class="meta-label">Program Studi</td><td class="meta-sep">:</td><td>${escapeHtml(data.programStudi)}</td></tr>
          <tr><td class="meta-label">Fakultas</td><td class="meta-sep">:</td><td>${escapeHtml(data.fakultas || "-")}</td></tr>
          <tr><td class="meta-label">Tempat KP</td><td class="meta-sep">:</td><td>${escapeHtml(data.companyName)}</td></tr>
          <tr><td class="meta-label">Waktu KP</td><td class="meta-sep">:</td><td>${escapeHtml(data.assessmentPeriod)}</td></tr>
        </table>

        <table class="score-table">
          <thead>
            <tr>
              <th style="width:40px">No</th>
              <th>Penilaian</th>
              <th style="width:90px">Bobot (B)</th>
              <th style="width:90px">Nilai (N)</th>
              <th style="width:90px">BxN</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
            <tr>
              <td colspan="4" class="total-label">Jumlah</td>
              <td class="center"><strong>${formatDecimalId(data.totalWeightedScore, 1)}</strong></td>
            </tr>
          </tbody>
        </table>

        <div class="signature-section">
          <div class="signature-box">
            <div>Palembang, ${escapeHtml(data.assessmentDate)}</div>
            <div>Pembimbing Lapangan,</div>
            ${signatureBlock}
            <div class="sign-name">${escapeHtml(data.mentorName)}</div>
            <div class="sign-position">${escapeHtml(data.mentorPosition || "-")}</div>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

function openPrintFallback(html: string): void {
  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    throw new Error("Gagal membuka jendela print. Pastikan pop-up tidak diblokir browser.");
  }

  printWindow.document.write(html);
  printWindow.document.close();

  printWindow.onload = () => {
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.onafterprint = () => printWindow.close();
    }, 300);
  };
}

export async function generateAssessmentForm(data: AssessmentFormData): Promise<void> {
  const html = buildAssessmentFormHtml(data);
  const html2pdfInstance = (window as Window & { html2pdf?: any }).html2pdf;

  if (!html2pdfInstance) {
    openPrintFallback(html);
    return;
  }

  const wrapper = document.createElement("div");
  wrapper.style.position = "fixed";
  wrapper.style.left = "-99999px";
  wrapper.innerHTML = html;
  document.body.appendChild(wrapper);

  const element = wrapper.querySelector("#assessment-form-root") as HTMLElement | null;
  if (!element) {
    document.body.removeChild(wrapper);
    throw new Error("Gagal membangun dokumen penilaian.");
  }

  const fileDate = new Date().toISOString().slice(0, 10);
  const safeNim = data.nim.replace(/[^a-zA-Z0-9_-]/g, "");
  const fileName = `Form_Penilaian_KP_${safeNim || "mahasiswa"}_${fileDate}.pdf`;

  try {
    await html2pdfInstance()
      .set({
        margin: [10, 10, 10, 10],
        filename: fileName,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      })
      .from(element)
      .save();
  } finally {
    document.body.removeChild(wrapper);
  }
}

export function printAssessmentForm(data: AssessmentFormData): void {
  const html = buildAssessmentFormHtml(data);
  const printWindow = window.open("", "_blank");

  if (!printWindow) {
    throw new Error("Gagal membuka jendela print. Pastikan pop-up tidak diblokir browser.");
  }

  printWindow.document.write(html);
  printWindow.document.close();

  printWindow.onload = () => {
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.onafterprint = () => printWindow.close();
    }, 300);
  };
}
