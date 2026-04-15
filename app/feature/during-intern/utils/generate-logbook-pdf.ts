import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { convertLogbookDOCXBlobToHtml, createLogbookDOCXBlob } from "~/feature/during-intern/utils/generate-logbook-docx";

interface StudentData {
  name: string;
  nim: string;
  prodi: string;
  fakultas?: string;
}

interface InternshipInfo {
  company: string;
  division?: string;
  position: string;
  mentorName?: string;
  mentorSignature?: string;
  startDate?: string;
  endDate?: string;
}

interface LogbookEntry {
  id: string;
  date: string;
  description: string;
  mentorSignature?: {
    status: "approved" | "revision" | "rejected";
    signedAt: string;
    mentorName: string;
    notes?: string;
  };
}

interface WorkPeriod {
  startDate: string;
  endDate: string;
  startDay?: string;
  endDay?: string;
}

export interface LogbookData {
  student: StudentData | null;
  internship: InternshipInfo | null;
  workPeriod: WorkPeriod;
  generatedDates: string[];
  entries: LogbookEntry[];
}

export const getLogbookPdfFileName = (data: LogbookData): string =>
  data.student?.nim
    ? `LogBook_KP_${data.student.nim}_${new Date().toISOString().split("T")[0]}.pdf`
    : `LogBook_KP_${new Date().toISOString().split("T")[0]}.pdf`;

const createPdfFromHtml = async (htmlContent: string): Promise<Blob> => {
  const container = document.createElement("div");
  container.innerHTML = htmlContent;
  container.style.position = "absolute";
  container.style.left = "-9999px";
  container.style.top = "0";
  container.style.width = "210mm";
  container.style.padding = "18mm";
  container.style.backgroundColor = "white";
  document.body.appendChild(container);

  try {
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
    });

    const pdf = new jsPDF("portrait", "mm", "a4");
    const pageWidth = 210;
    const pageHeight = 297;
    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    const imageData = canvas.toDataURL("image/png");

    let remainingHeight = imgHeight;
    let position = 0;

    pdf.addImage(imageData, "PNG", 0, position, imgWidth, imgHeight);
    remainingHeight -= pageHeight;

    while (remainingHeight > 0) {
      position = remainingHeight - imgHeight;
      pdf.addPage();
      pdf.addImage(imageData, "PNG", 0, position, imgWidth, imgHeight);
      remainingHeight -= pageHeight;
    }

    return pdf.output("blob");
  } finally {
    document.body.removeChild(container);
  }
};

export const createLogbookPDFBlob = async (data: LogbookData): Promise<Blob> => {
  try {
    const docxBlob = await createLogbookDOCXBlob(data);
    const docxHtml = await convertLogbookDOCXBlobToHtml(docxBlob);

    const htmlContent = `
      <div style="font-family: 'Times New Roman', serif; color: #0f172a; background: #ffffff;">
        <style>
          * { box-sizing: border-box; }
          .docx-preview { font-size: 12pt; line-height: 1.45; }
          .docx-preview h1, .docx-preview h2, .docx-preview h3, .docx-preview p { margin-top: 0; }
          .docx-preview table { width: 100%; border-collapse: collapse; table-layout: fixed; }
          .docx-preview td, .docx-preview th { border: 1px solid #111827; padding: 6px 8px; vertical-align: top; word-break: break-word; }
          .docx-preview th { background: #f8fafc; text-align: center; }
          .docx-preview img { max-width: 100%; height: auto; }
        </style>
        <div class="docx-preview">${docxHtml}</div>
      </div>
    `;

    return await createPdfFromHtml(htmlContent);
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw error;
  }
};

export const generateLogbookPDF = async (data: LogbookData) => {
  const blob = await createLogbookPDFBlob(data);
  const fileName = getLogbookPdfFileName(data);

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
};
