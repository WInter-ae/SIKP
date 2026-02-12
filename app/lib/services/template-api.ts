/**
 * Template Management API Service
 * Handles CRUD operations for templates with Cloudflare R2 file storage
 */

import { apiClient, axiosInstance, uploadFile } from "~/lib/api-client";
import type { AxiosError } from "axios";
import type {
  Template,
  TemplateField,
} from "~/feature/template/types/template.types";

// ==================== TYPES ====================

export interface CreateTemplateRequest {
  file: File;
  name: string;
  type: "Template Only" | "Generate & Template";
  description?: string;
  fields?: TemplateField[];
  isActive?: boolean;
}

export interface UpdateTemplateRequest {
  file?: File;
  name?: string;
  type?: "Template Only" | "Generate & Template";
  description?: string;
  fields?: TemplateField[];
  isActive?: boolean;
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

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T | null;
}

// ==================== CONSTANTS ====================

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

const ALLOWED_FILE_TYPES = [
  "application/msword", // .doc
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
  "application/pdf", // .pdf
  "text/html", // .html
  "text/plain", // .txt
];

// ==================== API FUNCTIONS ====================

/**
 * Get all templates
 * Admin: dapat melihat semua template (aktif & nonaktif)
 * Mahasiswa: hanya template dengan isActive = true
 */
export async function getAllTemplates(params?: {
  type?: "Template Only" | "Generate & Template";
  isActive?: boolean;
  search?: string;
}): Promise<ApiResponse<TemplateResponse[]>> {
  try {
    const queryParams = new URLSearchParams();

    if (params?.type) queryParams.append("type", params.type);
    if (params?.isActive !== undefined)
      queryParams.append("isActive", String(params.isActive));
    if (params?.search) queryParams.append("search", params.search);

    const endpoint = `/api/templates${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;

    const response = await apiClient<TemplateResponse[]>(endpoint);

    return response;
  } catch (error) {
    console.error("❌ Error fetching templates:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Gagal memuat templates",
      data: null,
    };
  }
}

/**
 * Get active templates only (untuk mahasiswa)
 */
export async function getActiveTemplates(): Promise<
  ApiResponse<TemplateResponse[]>
> {
  try {
    const response = await apiClient<TemplateResponse[]>(
      "/api/templates/active",
    );
    return response;
  } catch (error) {
    console.error("❌ Error fetching active templates:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Gagal memuat templates aktif",
      data: null,
    };
  }
}

/**
 * Get template by ID
 */
export async function getTemplateById(
  templateId: string,
): Promise<ApiResponse<TemplateResponse>> {
  try {
    const response = await apiClient<TemplateResponse>(
      `/api/templates/${templateId}`,
    );
    return response;
  } catch (error) {
    console.error("❌ Error fetching template:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Gagal memuat template",
      data: null,
    };
  }
}

/**
 * Create new template (Admin only)
 * Upload file ke R2 dan simpan metadata
 */
export async function createTemplate(
  data: CreateTemplateRequest,
): Promise<ApiResponse<TemplateResponse>> {
  try {
    // Validasi file size
    if (data.file.size > MAX_FILE_SIZE) {
      return {
        success: false,
        message: `Ukuran file terlalu besar. Maksimal 10 MB, file Anda ${(data.file.size / (1024 * 1024)).toFixed(2)} MB`,
        data: null,
      };
    }

    // Validasi file type
    const baseFileType = data.file.type.split(";")[0].trim();
    if (!ALLOWED_FILE_TYPES.includes(baseFileType)) {
      return {
        success: false,
        message:
          "Tipe file tidak didukung. Gunakan .doc, .docx, .pdf, .html, atau .txt",
        data: null,
      };
    }

    // Validasi fields untuk Generate & Template
    if (data.type === "Generate & Template") {
      if (!data.fields || data.fields.length === 0) {
        return {
          success: false,
          message: 'Fields wajib diisi untuk tipe "Generate & Template"',
          data: null,
        };
      }
    }

    const formData = new FormData();
    formData.append("file", data.file);
    formData.append("name", data.name);
    formData.append("type", data.type);

    if (data.description) {
      formData.append("description", data.description);
    }

    if (data.fields && data.fields.length > 0) {
      formData.append("fields", JSON.stringify(data.fields));
    }

    if (data.isActive !== undefined) {
      formData.append("isActive", String(data.isActive));
    }

    const result = await uploadFile<TemplateResponse>(
      "/api/templates",
      formData,
    );

    if (!result.success && result.message?.includes("403")) {
      return {
        success: false,
        message: "Forbidden: Hanya admin yang dapat membuat template",
        data: null,
      };
    }

    return result;
  } catch (error) {
    console.error("❌ Error creating template:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Gagal membuat template",
      data: null,
    };
  }
}

/**
 * Update template (Admin only)
 * Bisa update metadata saja atau sekaligus replace file
 */
export async function updateTemplate(
  templateId: string,
  data: UpdateTemplateRequest,
): Promise<ApiResponse<TemplateResponse>> {
  try {
    // Validasi file jika ada
    if (data.file) {
      if (data.file.size > MAX_FILE_SIZE) {
        return {
          success: false,
          message: `Ukuran file terlalu besar. Maksimal 10 MB, file Anda ${(data.file.size / (1024 * 1024)).toFixed(2)} MB`,
          data: null,
        };
      }

      const baseFileType = data.file.type.split(";")[0].trim();
      if (!ALLOWED_FILE_TYPES.includes(baseFileType)) {
        return {
          success: false,
          message:
            "Tipe file tidak didukung. Gunakan .doc, .docx, .pdf, .html, atau .txt",
          data: null,
        };
      }
    }

    // Validasi fields untuk Generate & Template
    if (data.type === "Generate & Template") {
      if (data.fields && data.fields.length === 0) {
        return {
          success: false,
          message: 'Fields tidak boleh kosong untuk tipe "Generate & Template"',
          data: null,
        };
      }
    }

    const formData = new FormData();

    if (data.file) {
      formData.append("file", data.file);
    }

    if (data.name) {
      formData.append("name", data.name);
    }

    if (data.type) {
      formData.append("type", data.type);
    }

    if (data.description !== undefined) {
      formData.append("description", data.description);
    }

    if (data.fields !== undefined) {
      formData.append("fields", JSON.stringify(data.fields));
    }

    if (data.isActive !== undefined) {
      formData.append("isActive", String(data.isActive));
    }

    const result = await apiClient<TemplateResponse>(
      `/api/templates/${templateId}`,
      {
        method: "PUT",
        data: formData,
      },
    );

    if (!result.success && result.message?.includes("403")) {
      return {
        success: false,
        message: "Forbidden: Hanya admin yang dapat mengupdate template",
        data: null,
      };
    }

    return result;
  } catch (error) {
    console.error("❌ Error updating template:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Gagal mengupdate template",
      data: null,
    };
  }
}

/**
 * Delete template (Admin only)
 * Menghapus file dari R2 dan record dari database
 */
export async function deleteTemplate(
  templateId: string,
): Promise<ApiResponse<void>> {
  try {
    const response = await apiClient<void>(`/api/templates/${templateId}`, {
      method: "DELETE",
    });
    return response;
  } catch (error) {
    console.error("❌ Error deleting template:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Gagal menghapus template",
      data: null,
    };
  }
}

/**
 * Toggle template active status (Admin only)
 */
export async function toggleTemplateActive(
  templateId: string,
): Promise<ApiResponse<TemplateResponse>> {
  try {
    const response = await apiClient<TemplateResponse>(
      `/api/templates/${templateId}/toggle-active`,
      {
        method: "PATCH",
      },
    );
    return response;
  } catch (error) {
    console.error("❌ Error toggling template status:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Gagal mengubah status template",
      data: null,
    };
  }
}

/**
 * Get template download URL
 */
export function getTemplateDownloadUrl(templateId: string): string {
  const API_BASE_URL =
    import.meta.env.VITE_API_URL ||
    import.meta.env.VITE_API_BASE_URL ||
    import.meta.env.VITE_APP_AUTH_URL ||
    "https://backend-sikp.backend-sikp.workers.dev";
  return `${API_BASE_URL}/api/templates/${templateId}/download`;
}

/**
 * Download template file
 * Trigger browser download
 */
export async function downloadTemplate(
  templateId: string,
  fileName: string,
): Promise<void> {
  try {
    const response = await axiosInstance.get(
      `/api/templates/${templateId}/download`,
      {
        responseType: "blob",
      },
    );

    const blob = new Blob([response.data]);
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("❌ Error downloading template:", error);
    throw error;
  }
}

/**
 * Validate template fields
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

    if (!field.label || field.label.trim() === "") {
      errors.push(`Field ${index + 1}: Label wajib diisi`);
    }

    if (!field.type) {
      errors.push(`Field ${index + 1}: Type wajib diisi`);
    }

    if (field.required === undefined || field.required === null) {
      errors.push(`Field ${index + 1}: Required wajib diisi`);
    }

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

  return {
    isValid: errors.length === 0,
    errors,
  };
}
