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

type DocxModule = typeof import("docx");

const formatDateId = (value?: string): string => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const parseSignatureDataUri = (dataUri?: string): Uint8Array | null => {
  if (!dataUri) return null;
  const match = dataUri.match(/^data:image\/(png|jpe?g);base64,(.+)$/i);
  if (!match) return null;
  const base64 = match[2];
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
};

export async function normalizeSignatureForDocument(
  signatureDataUrl?: string | null,
): Promise<string | undefined> {
  if (!signatureDataUrl) return undefined;

  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
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
  } finally {
    document.body.removeChild(wrapper);
  }
}

export async function generateAssessmentDocxForm(
  data: AssessmentFormData,
): Promise<void> {
  const docx = (await import("docx")) as DocxModule;
  const {
    Document,
    Packer,
    Paragraph,
    TextRun,
    Table,
    TableRow,
    TableCell,
    WidthType,
    AlignmentType,
    BorderStyle,
    ImageRun,
  } = docx;

  const baseFontSize = 24;
  const makeRun = (
    text: string,
    options?: { bold?: boolean; underline?: boolean },
  ) =>
    new TextRun({
      text,
      size: baseFontSize,
      bold: options?.bold,
      underline: options?.underline ? {} : undefined,
    });

  const rows = data.rows.map((row, index) =>
    new TableRow({
      children: [
        new TableCell({
          children: [
            new Paragraph({
              children: [makeRun(String(index + 1))],
              alignment: AlignmentType.CENTER,
            }),
          ],
        }),
        new TableCell({
          children: [new Paragraph({ children: [makeRun(row.category)] })],
        }),
        new TableCell({
          children: [
            new Paragraph({
              children: [makeRun(`${row.weight}%`)],
              alignment: AlignmentType.CENTER,
            }),
          ],
        }),
        new TableCell({
          children: [
            new Paragraph({
              children: [makeRun(String(row.score))],
              alignment: AlignmentType.CENTER,
            }),
          ],
        }),
        new TableCell({
          children: [
            new Paragraph({
              children: [makeRun(formatDecimalId(row.weightedScore, 1))],
              alignment: AlignmentType.CENTER,
            }),
          ],
        }),
      ],
    }),
  );

  const totalRow = new TableRow({
    children: [
      new TableCell({
        columnSpan: 4,
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [makeRun("Jumlah", { bold: true })],
          }),
        ],
      }),
      new TableCell({
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              makeRun(formatDecimalId(data.totalWeightedScore, 1), {
                bold: true,
              }),
            ],
          }),
        ],
      }),
    ],
  });

  const borderStyle = {
    style: BorderStyle.SINGLE,
    size: 8,
    color: "6B7280",
  } as const;

  const scoreTable = new Table({
    width: { size: 78, type: WidthType.PERCENTAGE },
    alignment: AlignmentType.CENTER,
    rows: [
      new TableRow({
        tableHeader: true,
        children: [
          new TableCell({
            children: [
              new Paragraph({
                children: [makeRun("No")],
                alignment: AlignmentType.CENTER,
              }),
            ],
          }),
          new TableCell({
            children: [
              new Paragraph({
                children: [makeRun("Penilaian")],
                alignment: AlignmentType.CENTER,
              }),
            ],
          }),
          new TableCell({
            children: [
              new Paragraph({
                children: [makeRun("Bobot (B)")],
                alignment: AlignmentType.CENTER,
              }),
            ],
          }),
          new TableCell({
            children: [
              new Paragraph({
                children: [makeRun("Nilai (N)")],
                alignment: AlignmentType.CENTER,
              }),
            ],
          }),
          new TableCell({
            children: [
              new Paragraph({
                children: [makeRun("BxN")],
                alignment: AlignmentType.CENTER,
              }),
            ],
          }),
        ],
      }),
      ...rows,
      totalRow,
    ],
    borders: {
      top: borderStyle,
      bottom: borderStyle,
      left: borderStyle,
      right: borderStyle,
      insideHorizontal: borderStyle,
      insideVertical: borderStyle,
    },
  });

  // Adjust mentor signature image sizing here.
  const signatureImage = parseSignatureDataUri(data.mentorSignature);
  const signatureParagraph = signatureImage
    ? new Paragraph({
        alignment: AlignmentType.RIGHT,
        children: [
          new ImageRun({
            data: signatureImage,
            transformation: { width: 140, height: 60 },
          } as any),
        ],
      })
    : new Paragraph({ alignment: AlignmentType.RIGHT, text: "" });

  const docxDocument = new Document({
    sections: [
      {
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              makeRun("FORMULIR PENILAIAN KERJA PRAKTIK (KP)", {
                bold: true,
              }),
            ],
          }),
          new Paragraph({ text: "" }),
          // Adjust student meta table size/centering here.
          new Table({
            width: { size: 70, type: WidthType.PERCENTAGE },
            alignment: AlignmentType.CENTER,
            rows: [
              ["Nama", data.studentName],
              ["NIM", data.nim],
              ["Program Studi", data.programStudi],
              ["Fakultas", data.fakultas || "-"],
              ["Tempat KP", data.companyName],
              ["Waktu KP", data.assessmentPeriod],
            ].map(([label, value]) =>
              new TableRow({
                children: [
                  new TableCell({
                    width: { size: 35, type: WidthType.PERCENTAGE },
                    children: [
                      new Paragraph({ children: [makeRun(String(label))] }),
                    ],
                    borders: {
                      top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                      bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                      left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                      right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                    },
                  }),
                  new TableCell({
                    width: { size: 5, type: WidthType.PERCENTAGE },
                    children: [
                      new Paragraph({
                        children: [makeRun(":")],
                        alignment: AlignmentType.CENTER,
                      }),
                    ],
                    borders: {
                      top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                      bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                      left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                      right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                    },
                  }),
                  new TableCell({
                    width: { size: 60, type: WidthType.PERCENTAGE },
                    children: [
                      new Paragraph({ children: [makeRun(String(value))] }),
                    ],
                    borders: {
                      top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                      bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                      left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                      right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                    },
                  }),
                ],
              }),
            ),
          }),
          new Paragraph({ text: "" }),
          scoreTable,
          new Paragraph({ text: "" }),
          // Adjust signature block position (date/title/name) here.
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    width: { size: 50, type: WidthType.PERCENTAGE },
                    children: [new Paragraph({ text: "" })],
                    borders: {
                      top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                      bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                      left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                      right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                    },
                  }),
                  new TableCell({
                    width: { size: 50, type: WidthType.PERCENTAGE },
                    borders: {
                      top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                      bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                      left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                      right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                    },
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.LEFT,
                        children: [
                          makeRun(
                            `Palembang, ${formatDateId(data.assessmentDate)}`,
                          ),
                        ],
                      }),
                      new Paragraph({
                        alignment: AlignmentType.LEFT,
                        children: [makeRun("Pembimbing Lapangan,")],
                      }),
                      signatureParagraph,
                      new Paragraph({
                        alignment: AlignmentType.LEFT,
                        children: [
                          makeRun(data.mentorName, {
                            bold: true,
                            underline: true,
                          }),
                        ],
                      }),
                      new Paragraph({
                        alignment: AlignmentType.LEFT,
                        children: [makeRun(data.mentorPosition || "-")],
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(docxDocument);
  const safeNim = data.nim.replace(/[^a-zA-Z0-9_-]/g, "");
  const fileDate = new Date().toISOString().slice(0, 10);
  const fileName = `Form_Penilaian_KP_${safeNim || "mahasiswa"}_${fileDate}.docx`;

  const { saveAs } = await import("file-saver");
  saveAs(blob, fileName);
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
