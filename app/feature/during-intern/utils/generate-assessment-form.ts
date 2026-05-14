import { UNSRI_LOGO_BW_BASE64 } from "~/lib/constants/images";

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
  coordinatorName?: string;
  coordinatorNip?: string;
  coordinatorSignature?: string;
  rows: AssessmentFormRow[];
  totalWeightedScore: number;
  role?: "MENTOR" | "DOSEN_PA";
  title?: string;
  signerLabel?: string;
}

export async function normalizeSignatureForDocument(
  signatureDataUrl?: string | null,
): Promise<string | undefined> {
  if (!signatureDataUrl) return undefined;

  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = () =>
        reject(new Error("Gagal memuat gambar tanda tangan."));
      img.src = signatureDataUrl;
    });

    const srcCanvas = document.createElement("canvas");
    srcCanvas.width = image.width;
    srcCanvas.height = image.height;
    const srcCtx = srcCanvas.getContext("2d");
    if (!srcCtx) return signatureDataUrl;

    srcCtx.drawImage(image, 0, 0);
    const { data, width, height } = srcCtx.getImageData(
      0,
      0,
      srcCanvas.width,
      srcCanvas.height,
    );

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

    cropCtx.drawImage(
      srcCanvas,
      cropX,
      cropY,
      cropW,
      cropH,
      0,
      0,
      cropW,
      cropH,
    );
    return cropCanvas.toDataURL("image/png");
  } catch {
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
          width: 200px;
        }

        .meta-sep {
          width: 30px;
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
        <div class="title">${escapeHtml(data.title || "Formulir Penilaian Kerja Praktik (KP)")}</div>

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
            <div>${escapeHtml(data.signerLabel || "Pembimbing Lapangan")},</div>
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
    throw new Error(
      "Gagal membuka jendela print. Pastikan pop-up tidak diblokir browser.",
    );
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

export async function generateAssessmentForm(
  data: AssessmentFormData,
): Promise<void> {
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

  const element = wrapper.querySelector(
    "#assessment-form-root",
  ) as HTMLElement | null;
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
  } catch {
    if (wrapper.parentNode) {
      document.body.removeChild(wrapper);
    }
    openPrintFallback(html);
    return;
  } finally {
    if (wrapper.parentNode) {
      document.body.removeChild(wrapper);
    }
  }
}

function buildDosenAssessmentFormHtml(data: AssessmentFormData & { reportTitle?: string; coordinatorName?: string; coordinatorNip?: string }): string {
  const rowsHtml = data.rows
    .map((row, index) => {
      return `
        <tr>
          <td class="center">${index + 1}.</td>
          <td>${escapeHtml(row.category)}</td>
          <td class="center">${row.weight} %</td>
          <td class="center">${row.score}</td>
          <td class="center">${formatDecimalId(row.weightedScore, 1)}</td>
        </tr>
      `;
    })
    .join("");

  const signatureBlock = data.mentorSignature
    ? `
      <div class="signature-space">
        <img src="${data.mentorSignature}" alt="Tanda tangan" class="signature-image" />
      </div>
    `
    : `
      <div class="signature-space" style="height: 60px;"></div>
    `;

  return `
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="UTF-8" />
      <title>Form Penilaian Dosen PA - ${escapeHtml(data.nim)}</title>
      <style>
        @page {
          size: A4;
          margin: 1.5cm;
        }

        body {
          font-family: "Times New Roman", serif;
          font-size: 12pt;
          color: #000;
          margin: 0;
          background: #ffffff;
          line-height: 1.3;
        }

        .header {
          display: flex;
          align-items: center;
          justify-content: center;
          border-bottom: 3px double #000;
          padding-bottom: 10px;
          margin-bottom: 15px;
          position: relative;
          min-height: 100px;
        }

        .logo-container {
          position: absolute;
          left: 0;
          top: 0;
        }

        .logo {
          width: 130px;
          height: 130px;
        }

        .header-text {
          text-align: center;
          width: 100%;
          padding-left: 100px;
        }

        .header-text h1 {
          font-size: 14pt;
          margin: 0 0 2px 0;
          font-weight: normal;
          line-height: 1.2;
          text-transform: uppercase;
        }

        .header-text h2 {
          font-size: 13pt;
          margin: 0 0 2px 0;
          font-weight: normal;
          line-height: 1.2;
          text-transform: uppercase;
        }

        .header-text .bold {
          font-weight: bold;
        }

        .header-text .prodi-name {
          font-size: 15pt;
          font-weight: bold;
          margin: 4px 0;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          line-height: 1.2;
        }

        .header-text p {
          font-size: 9pt;
          margin: 1px 0;
          line-height: 1.2;
        }

        .title {
          text-align: center;
          font-weight: bold;
          font-size: 13pt;
          margin: 20px 0 25px 0;
          text-transform: uppercase;
        }

        .meta-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 15px;
          font-size: 13pt;
        }

        .meta-table td {
          padding: 2px 0;
          vertical-align: top;
        }

        .meta-label {
          width: 200px;
        }

        .meta-sep {
          width: 30px;
          text-align: center;
        }

        .score-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 15px;
          font-size: 13pt;
        }

        .score-table th, .score-table td {
          border: 1px solid #000;
          padding: 4px 6px;
        }

        .score-table th {
          background: #f0f0f0;
          font-weight: bold;
        }

        .center {
          text-align: center;
        }

        .footer-info {
          margin-bottom: 25px;
        }

        .signature-container {
          display: flex;
          justify-content: space-between;
          margin-top: 30px;
        }

        .signature-box {
          width: 250px;
          text-align: left;
        }

        .signature-space {
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 5px 0;
        }

        .signature-image {
          max-height: 60px;
          max-width: 150px;
          object-fit: contain;
        }

        .name-underline {
          font-weight: bold;
          margin-top: 5px;
          display: block;
        }
      </style>
    </head>
    <body>
      <div class="container" id="assessment-form-root">
        <div class="header">
          <div class="logo-container">
            <img src="data:image/png;base64,${UNSRI_LOGO_BW_BASE64}" class="logo" alt="Logo UNSRI" />
          </div>
          <div class="header-text">
            <h1>KEMENTERIAN PENDIDIKAN TINGGI,</h1>
            <h1>SAINS, DAN TEKNOLOGI</h1>
            <h2>UNIVERSITAS SRIWIJAYA</h2>
            <h2 class="bold">FAKULTAS ILMU KOMPUTER</h2>
            <div class="prodi-name">PROGRAM STUDI MANAJEMEN INFORMATIKA</div>
            <p>Kampus Unsri, Jalan Srijaya Negara Bukit Besar Palembang, Kode Pos : 30139</p>
            <p>Telepon (+62711) 379249 Pos-el : humas@ilkom.unsri.ac.id</p>
          </div>
        </div>

        <div class="title">${escapeHtml(data.title || "FORM PENILAIAN KERJA PRAKTEK (KP)")}</div>

        <table class="meta-table">
          <tr><td class="meta-label">Nama Mahasiswa</td><td class="meta-sep">:</td><td>${escapeHtml(data.studentName)}</td></tr>
          <tr><td class="meta-label">NIM</td><td class="meta-sep">:</td><td>${escapeHtml(data.nim)}</td></tr>
          <tr><td class="meta-label">Program Studi</td><td class="meta-sep">:</td><td>${escapeHtml(data.programStudi)}</td></tr>
          <tr><td class="meta-label">Tempat KP</td><td class="meta-sep">:</td><td>${escapeHtml(data.companyName)}</td></tr>
          <tr><td class="meta-label">Judul Laporan KP</td><td class="meta-sep">:</td><td>${escapeHtml(data.reportTitle || "-")}</td></tr>
          <tr><td class="meta-label">Waktu Pelaksanaan KP</td><td class="meta-sep">:</td><td>${escapeHtml(data.assessmentPeriod)}</td></tr>
          <tr><td class="meta-label">Dosen Pembimbing</td><td class="meta-sep">:</td><td>${escapeHtml(data.mentorName)}</td></tr>
          <tr><td class="meta-label">Pembimbing Lapangan</td><td class="meta-sep">:</td><td>${escapeHtml((data.signerLabel === "Dosen Pembimbing" ? "-" : data.signerLabel) || "-")}</td></tr>
        </table>

        <table class="score-table">
          <thead>
            <tr>
              <th style="width:40px">No.</th>
              <th>Penilaian</th>
              <th style="width:100px">Bobot (B)</th>
              <th style="width:100px">Nilai (N)</th>
              <th style="width:100px">BxN</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>

        <div class="footer-info">
          <div>Rata-rata Nilai : ${formatDecimalId(data.totalWeightedScore, 1)}</div>
          <div>Dinyatakan dengan indeks nilai : <strong>${data.totalWeightedScore >= 80 ? "A" : data.totalWeightedScore >= 70 ? "B" : data.totalWeightedScore >= 60 ? "C" : data.totalWeightedScore >= 50 ? "D" : "E"}</strong></div>
        </div>

        <div class="signature-container">
          <div class="signature-box">
            <div>Mengetahui,</div>
            <div>Koordinator Program Studi</div>
            <div>${escapeHtml(data.programStudi || "Manajemen Informatika")},</div>
            <div class="signature-space">
              ${data.coordinatorSignature 
                ? `<img src="${data.coordinatorSignature}" alt="Tanda tangan Kaprodi" class="signature-image" />`
                : ''}
            </div>
            <span class="name-underline">${escapeHtml(data.coordinatorName || "Dr. Abdiansah, S.Kom., M.Cs.")}</span>
            <div>NIP ${escapeHtml(data.coordinatorNip || "198410012009121005")}</div>
          </div>

          <div class="signature-box">
            <div>Palembang, ${escapeHtml(data.assessmentDate)}</div>
            <div>Dosen Pembimbing,</div>
            ${signatureBlock}
            <span class="name-underline">${escapeHtml(data.mentorName)}</span>
            <div>NIP ${escapeHtml(data.mentorPosition || "....................................")}</div>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

export async function generateDosenAssessmentForm(
  data: AssessmentFormData & { 
    reportTitle?: string;  
    coordinatorName?: string;
    coordinatorNip?: string;
    coordinatorSignature?: string;
  }
): Promise<void> {
  const html = buildDosenAssessmentFormHtml(data);
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

  const fileName = `Form_Penilaian_Dosen_PA_${data.nim}_${new Date().toISOString().slice(0, 10)}.pdf`;

  try {
    await html2pdfInstance()
      .set({
        margin: [5, 5, 5, 5],
        filename: fileName,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      })
      .from(element)
      .save();
  } catch {
    openPrintFallback(html);
  } finally {
    if (wrapper.parentNode) {
      document.body.removeChild(wrapper);
    }
  }
}

export function printAssessmentForm(data: AssessmentFormData): void {
  const html = buildAssessmentFormHtml(data);
  const printWindow = window.open("", "_blank");

  if (!printWindow) {
    throw new Error(
      "Gagal membuka jendela print. Pastikan pop-up tidak diblokir browser.",
    );
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

