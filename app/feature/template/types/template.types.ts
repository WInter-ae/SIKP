export type TemplateType =
  | "Template Only"
  | "Generate & Template"
  | "berita-acara"
  | "form-nilai";

/**
 * Field metadata untuk dynamic form generation
 */
export type FieldType =
  | "text"
  | "textarea"
  | "number"
  | "date"
  | "time"
  | "email"
  | "select";

export interface TemplateField {
  variable: string; // Variable name di template: {{nama_mahasiswa}}
  label: string; // Label untuk form: "Nama Mahasiswa"
  type: FieldType; // Type input
  required: boolean; // Wajib diisi atau tidak
  placeholder?: string; // Placeholder text
  defaultValue?: string; // Default value
  options?: string[]; // Options untuk select
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
  helpText?: string; // Teks bantuan
  order: number; // Urutan tampil di form
}

/**
 * Template dengan field metadata
 */
export interface Template {
  id: string;
  name: string;
  type: TemplateType;
  fileExtension?: string;
  description?: string;
  content: string;
  fields: TemplateField[]; // Field metadata untuk dynamic form
  version: number; // Version untuk tracking perubahan
  createdAt: string;
  updatedAt: string;
  previousVersionId?: string; // Link ke version sebelumnya
}

export interface CreateTemplateData {
  name: string;
  type: TemplateType;
  description?: string;
  content: string;
  fields: TemplateField[];
}

export interface UpdateTemplateData extends Partial<CreateTemplateData> {}
