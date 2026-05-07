import { API_ENDPOINTS } from "~/lib/constants/endpoints";
/**
 * Template Management Service
 * Menangani CRUD operasi template dengan Cloudflare R2 file storage.
 *
 * Semua operasi menggunakan sikpClient — termasuk upload file yang
 * sebelumnya bypass apiClient dengan fetch langsung.
 */

import { sikpClient, API_BASE_URL } from "~/lib/api-client";
import type { ApiResponse } from "~/lib/api-client";
import { getAuthToken } from "~/lib/auth-client";
import type {
  Template,
  TemplateType,
  TemplateField,
} from "~/feature/template/types/template.types";

// ==================== TYPES ====================

export interface CreateTemplateRequest {
  file: File;
  name: string;
  description?: string;
}

export interface UpdateTemplateRequest {
  file?: File;
  name?: string;
  description?: string;
}

export interface TemplateResponse extends Template {
  fileName: string;
  fileUrl: string;
  fileSize: number;
  fileType: string;
  originalName: string;
  createdBy: string;
  updatedBy?: string;
}

// ==================== CONSTANTS ====================

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

const ALLOWED_FILE_TYPES = [
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/pdf",
  "text/html",
  "text/plain",
];

// ==================== VALIDATION HELPERS ====================

function validateTemplateFile(
  file: File,
): { valid: true } | { valid: false; message: string } {
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      message: `Ukuran file terlalu besar. Maksimal 10 MB, file Anda ${(file.size / (1024 * 1024)).toFixed(2)} MB`,
    };
  }
  const baseFileType = file.type.split(";")[0].trim();
  if (!ALLOWED_FILE_TYPES.includes(baseFileType)) {
    return {
      valid: false,
      message:
        "Tipe file tidak didukung. Gunakan .doc, .docx, .pdf, .html, atau .txt",
    };
  }
  return { valid: true };
}

// ==================== API FUNCTIONS ====================

/**
 * Get all templates.
 * Admin: semua template (aktif & nonaktif). Mahasiswa: hanya isActive = true.
 */
export async function getAllTemplates(params?: {
  search?: string;
}): Promise<ApiResponse<TemplateResponse[]>> {
  const queryParams = new URLSearchParams();
  if (params?.search) queryParams.append("search", params.search);

  const endpoint = `/api/templates${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
  return sikpClient.get<TemplateResponse[]>(endpoint);
}

/**
 * Get active templates only (untuk mahasiswa).
 */
export async function getActiveTemplates(): Promise<
  ApiResponse<TemplateResponse[]>
> {
  return sikpClient.get<TemplateResponse[]>(API_ENDPOINTS.TEMPLATE.GET_ALL);
}

/**
 * Get template by ID.
 */
export async function getTemplateById(
  templateId: string,
): Promise<ApiResponse<TemplateResponse>> {
  return sikpClient.get<TemplateResponse>(`/api/templates/${templateId}`);
}

/**
 * Create new template (Admin only) — upload file via multipart POST.
 */
export async function createTemplate(
  data: CreateTemplateRequest,
): Promise<ApiResponse<TemplateResponse>> {
  const validation = validateTemplateFile(data.file);
  if (!validation.valid)
    return { success: false, message: validation.message, data: null };

  const formData = new FormData();
  formData.append("file", data.file);
  formData.append("name", data.name);
  if (data.description) formData.append("description", data.description);

  return sikpClient.upload<TemplateResponse>(
    API_ENDPOINTS.TEMPLATE.GET_ALL,
    formData,
  );
}

/**
 * Update template (Admin only) — PUT + FormData melalui sikpClient.request.
 */
export async function updateTemplate(
  templateId: string,
  data: UpdateTemplateRequest,
): Promise<ApiResponse<TemplateResponse>> {
  if (data.file) {
    const validation = validateTemplateFile(data.file);
    if (!validation.valid)
      return { success: false, message: validation.message, data: null };
  }

  const formData = new FormData();
  if (data.file) formData.append("file", data.file);
  if (data.name) formData.append("name", data.name);
  if (data.description !== undefined)
    formData.append("description", data.description);

  // PUT + FormData — gunakan request() karena upload() hanya POST
  return sikpClient.request<TemplateResponse>(`/api/templates/${templateId}`, {
    method: "PUT",
    body: formData,
  });
}

/**
 * Delete template (Admin only).
 */
export async function deleteTemplate(
  templateId: string,
): Promise<ApiResponse<void>> {
  return sikpClient.del<void>(`/api/templates/${templateId}`);
}



/**
 * Get template download URL.
 */
export function getTemplateDownloadUrl(templateId: string): string {
  return `${API_BASE_URL}/api/templates/${templateId}/download`;
}

/**
 * Download template file — trigger browser download or preview.
 * Menggunakan fetch langsung karena perlu streaming blob ke browser.
 */
export async function downloadTemplate(
  templateId: string,
  fileName: string,
  isPreview: boolean = false,
): Promise<void> {
  const token = await getAuthToken();

  const urlWithParams = new URL(
    `${API_BASE_URL}/api/templates/${templateId}/download`,
  );
  if (isPreview) {
    urlWithParams.searchParams.append("preview", "true");
  }

  const response = await fetch(urlWithParams.toString(), {
    method: "GET",
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    credentials: "include",
  });

  if (!response.ok) {
    let errorMessage = "Gagal memproses template";
    try {
      const errorData = await response.json();
      if (errorData && typeof errorData === "object" && "message" in errorData) {
        errorMessage = (errorData as { message: string }).message;
      }
    } catch {
      // Fallback to default message if JSON parsing fails
    }
    throw new Error(errorMessage);
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);

  if (isPreview) {
    // Untuk preview, buka di tab baru
    window.open(url, "_blank");
    // Kita tidak bisa revoke URL segera karena tab baru butuh waktu untuk load
    // Tapi browser biasanya handle blob URLs di tab baru dengan baik
  } else {
    // Untuk download, gunakan elemen <a>
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }
}

/**
 * Validate template fields.
 */
export function validateTemplateFields(fields: TemplateField[]): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!Array.isArray(fields)) {
    errors.push("Fields harus berupa array");
    return { isValid: false, errors };
  }

  if (fields.length === 0) {
    errors.push("Fields tidak boleh kosong");
    return { isValid: false, errors };
  }

  const orders = new Set<number>();
  const variables = new Set<string>();

  fields.forEach((field, index) => {
    if (!field.variable || field.variable.trim() === "") {
      errors.push(`Field ${index + 1}: Variable wajib diisi`);
    } else if (variables.has(field.variable)) {
      errors.push(
        `Field ${index + 1}: Variable "${field.variable}" sudah digunakan`,
      );
    } else {
      variables.add(field.variable);
    }

    if (!field.label || field.label.trim() === "")
      errors.push(`Field ${index + 1}: Label wajib diisi`);
    if (!field.type) errors.push(`Field ${index + 1}: Type wajib diisi`);
    if (field.required === undefined || field.required === null)
      errors.push(`Field ${index + 1}: Required wajib diisi`);

    if (field.order === undefined || field.order === null) {
      errors.push(`Field ${index + 1}: Order wajib diisi`);
    } else if (orders.has(field.order)) {
      errors.push(`Field ${index + 1}: Order ${field.order} sudah digunakan`);
    } else {
      orders.add(field.order);
    }

    if (
      field.type === "select" &&
      (!field.options || field.options.length === 0)
    ) {
      errors.push(`Field ${index + 1}: Options wajib diisi untuk tipe select`);
    }
  });

  return { isValid: errors.length === 0, errors };
}
