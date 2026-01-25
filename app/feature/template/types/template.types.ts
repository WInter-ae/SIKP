export type TemplateType = 
  | "berita-acara"
  | "form-nilai"
  | "surat-pengantar"
  | "surat-balasan"
  | "lembar-persetujuan"
  | "cover-laporan"
  | "form-evaluasi"
  | "sertifikat"
  | "lainnya";

export type TemplateCategory = {
  value: TemplateType;
  label: string;
};

export const TEMPLATE_CATEGORIES: TemplateCategory[] = [
  { value: "berita-acara", label: "Berita Acara" },
  { value: "form-nilai", label: "Form Nilai" },
  { value: "surat-pengantar", label: "Surat Pengantar" },
  { value: "surat-balasan", label: "Surat Balasan" },
  { value: "lembar-persetujuan", label: "Lembar Persetujuan" },
  { value: "cover-laporan", label: "Cover Laporan" },
  { value: "form-evaluasi", label: "Form Evaluasi" },
  { value: "sertifikat", label: "Sertifikat" },
  { value: "lainnya", label: "Lainnya" },
];

/**
 * Field metadata untuk dynamic form generation
 */
export type FieldType = "text" | "textarea" | "number" | "date" | "time" | "email" | "select";

export interface TemplateField {
  variable: string;           // Variable name di template: {{nama_mahasiswa}}
  label: string;              // Label untuk form: "Nama Mahasiswa"
  type: FieldType;            // Type input
  required: boolean;          // Wajib diisi atau tidak
  placeholder?: string;       // Placeholder text
  defaultValue?: string;      // Default value
  options?: string[];         // Options untuk select
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
  helpText?: string;          // Teks bantuan
  order: number;              // Urutan tampil di form
}

/**
 * Template dengan field metadata
 */
export interface Template {
  id: string;
  name: string;
  type: TemplateType;
  description?: string;
  content: string;
  fileExtension: "html" | "docx" | "txt";
  fields: TemplateField[];    // Field metadata untuk dynamic form
  version: number;            // Version untuk tracking perubahan
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  previousVersionId?: string; // Link ke version sebelumnya
}

export interface CreateTemplateData {
  name: string;
  type: TemplateType;
  description?: string;
  content: string;
  fileExtension: "html" | "docx" | "txt";
  fields: TemplateField[];
}

export interface UpdateTemplateData extends Partial<CreateTemplateData> {
  isActive?: boolean;
}
