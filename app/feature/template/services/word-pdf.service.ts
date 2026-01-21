/**
 * Word & PDF Template Service
 * 
 * Service untuk handle Word (.docx) templates dan PDF generation
 */

import Docxtemplater from "docxtemplater";
import PizZip from "pizzip";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import type { Template } from "../types/template.types";

/**
 * Generate Word document dari template .docx
 * 
 * @example
 * const wordBlob = await generateWordDocument(template, {
 *   nama_mahasiswa: "John Doe",
 *   nim: "12345678",
 *   tanggal: "20 Januari 2026"
 * });
 * downloadBlob(wordBlob, "Berita_Acara.docx");
 */
export async function generateWordDocument(
  template: Template,
  data: Record<string, string>
): Promise<Blob> {
  try {
    // Load template content (base64 or binary)
    const content = template.content;
    
    // Create PizZip instance
    const zip = new PizZip(content);
    
    // Create docxtemplater instance
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
    });

    // Render document dengan data
    doc.render(data);

    // Generate binary blob
    const blob = doc.getZip().generate({
      type: "blob",
      mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    });

    return blob;
  } catch (error) {
    console.error("Error generating Word document:", error);
    throw new Error("Gagal generate dokumen Word");
  }
}

/**
 * Generate PDF dari HTML template
 * Menggunakan html2canvas + jsPDF
 * 
 * @example
 * const pdfBlob = await generatePDFFromHTML(htmlContent);
 * downloadBlob(pdfBlob, "Berita_Acara.pdf");
 */
export async function generatePDFFromHTML(htmlContent: string): Promise<Blob> {
  try {
    // Create temporary container
    const container = document.createElement("div");
    container.innerHTML = htmlContent;
    container.style.position = "absolute";
    container.style.left = "-9999px";
    container.style.width = "210mm"; // A4 width
    container.style.padding = "20mm";
    container.style.backgroundColor = "white";
    document.body.appendChild(container);

    // Convert HTML to canvas
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      logging: false,
    });

    // Remove temporary container
    document.body.removeChild(container);

    // Calculate PDF dimensions
    const imgWidth = 210; // A4 width in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    // Create PDF
    const pdf = new jsPDF({
      orientation: imgHeight > imgWidth ? "portrait" : "landscape",
      unit: "mm",
      format: "a4",
    });

    // Add image to PDF
    const imgData = canvas.toDataURL("image/png");
    pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);

    // Convert to blob
    const pdfBlob = pdf.output("blob");
    return pdfBlob;
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw new Error("Gagal generate PDF");
  }
}

/**
 * Generate PDF dari HTML dengan multiple pages
 * Untuk dokumen yang panjang
 */
export async function generatePDFFromHTMLMultiPage(htmlContent: string): Promise<Blob> {
  try {
    // Create temporary container
    const container = document.createElement("div");
    container.innerHTML = htmlContent;
    container.style.position = "absolute";
    container.style.left = "-9999px";
    container.style.width = "210mm";
    container.style.padding = "20mm";
    container.style.backgroundColor = "white";
    document.body.appendChild(container);

    // Convert to canvas
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      logging: false,
    });

    document.body.removeChild(container);

    // PDF dimensions
    const pdf = new jsPDF("portrait", "mm", "a4");
    const pageWidth = 210;
    const pageHeight = 297;
    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    // Add first page
    const imgData = canvas.toDataURL("image/png");
    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    // Add additional pages if needed
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    return pdf.output("blob");
  } catch (error) {
    console.error("Error generating multi-page PDF:", error);
    throw new Error("Gagal generate PDF");
  }
}

/**
 * Download blob as file
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Read Word file dan extract text content
 * Berguna untuk upload Word template
 */
export async function readWordFile(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const zip = new PizZip(arrayBuffer);
    const doc = new Docxtemplater(zip);
    
    // Get raw text content
    // Note: This is simplified, for full text extraction need xml parsing
    return arrayBuffer.toString();
  } catch (error) {
    console.error("Error reading Word file:", error);
    throw new Error("Gagal membaca file Word");
  }
}

/**
 * Convert Word file to base64
 * Untuk simpan di database
 */
export async function wordFileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      resolve(base64.split(",")[1]); // Remove data:*/*;base64, prefix
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Extract variables dari Word template
 * Deteksi {variable} format
 */
export function extractWordVariables(content: string): string[] {
  const regex = /{(\w+)}/g;
  const variables: string[] = [];
  let match;

  while ((match = regex.exec(content)) !== null) {
    if (!variables.includes(match[1])) {
      variables.push(match[1]);
    }
  }

  return variables;
}

/**
 * Render Word template dengan data
 * Untuk preview atau validation
 */
export function renderWordTemplate(
  content: string,
  data: Record<string, string>
): string {
  let rendered = content;

  // Replace {variable} dengan data
  Object.entries(data).forEach(([key, value]) => {
    const regex = new RegExp(`{${key}}`, "g");
    rendered = rendered.replace(regex, value);
  });

  return rendered;
}

/**
 * Validate Word template format
 */
export function isValidWordTemplate(file: File): boolean {
  const validTypes = [
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/msword",
  ];
  return validTypes.includes(file.type) && file.name.endsWith(".docx");
}

/**
 * Get file size in readable format
 */
export function getReadableFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
}
