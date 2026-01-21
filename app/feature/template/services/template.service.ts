/**
 * Template API Service
 * 
 * Service untuk berkomunikasi dengan backend API untuk template management.
 * Saat ini menggunakan data mock, namun dapat dengan mudah diganti dengan actual API calls.
 */

import type { Template, CreateTemplateData, UpdateTemplateData, TemplateField } from "../types/template.types";

// Base URL untuk API (sesuaikan dengan backend Anda)
const API_BASE_URL = "/api/templates";

/**
 * Get all templates
 */
export async function getTemplates(): Promise<Template[]> {
  // TODO: Replace with actual API call
  // const response = await fetch(API_BASE_URL);
  // if (!response.ok) throw new Error("Failed to fetch templates");
  // return response.json();
  
  // Mock data untuk development
  return [
    {
      id: "1",
      name: "Berita Acara Sidang KP 2025",
      type: "berita-acara",
      description: "Template berita acara untuk sidang kerja praktek tahun 2025",
      content: `<!DOCTYPE html>
<html>
<head>
    <title>Berita Acara Sidang</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        h1 { text-align: center; }
        .info { margin: 20px 0; }
    </style>
</head>
<body>
    <h1>BERITA ACARA SIDANG KERJA PRAKTEK</h1>
    <div class="info">
        <p>Pada hari ini, {{tanggal}}, telah dilaksanakan sidang kerja praktek.</p>
        <p>Nama Mahasiswa: {{nama_mahasiswa}}</p>
        <p>NIM: {{nim}}</p>
        <p>Judul: {{judul}}</p>
        <p>Penguji: {{nama_penguji}}</p>
        <p>Nilai: {{nilai}}</p>
    </div>
</body>
</html>`,
      fileExtension: "html",
      fields: [
        { variable: "tanggal", label: "Tanggal Sidang", type: "date", required: true, order: 0 },
        { variable: "nama_mahasiswa", label: "Nama Mahasiswa", type: "text", required: true, order: 1 },
        { variable: "nim", label: "NIM", type: "text", required: true, order: 2 },
        { variable: "judul", label: "Judul KP", type: "textarea", required: true, order: 3 },
        { variable: "nama_penguji", label: "Nama Penguji", type: "text", required: true, order: 4 },
        { variable: "nilai", label: "Nilai", type: "select", required: true, order: 5, options: ["A", "A-", "B+", "B", "B-", "C+", "C", "D", "E"] },
      ],
      version: 1,
      createdAt: "2025-01-15T10:00:00Z",
      updatedAt: "2025-01-15T10:00:00Z",
      isActive: true,
    },
    {
      id: "2",
      name: "Form Nilai KP",
      type: "form-nilai",
      description: "Template form penilaian kerja praktek",
      content: `<!DOCTYPE html>
<html>
<head>
    <title>Form Nilai KP</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        table { border-collapse: collapse; width: 100%; margin: 20px 0; }
        td { padding: 8px; border: 1px solid #000; }
    </style>
</head>
<body>
    <h1>FORM PENILAIAN KERJA PRAKTEK</h1>
    <table>
        <tr>
            <td width="30%">Nama Mahasiswa</td>
            <td>: {{nama_mahasiswa}}</td>
        </tr>
        <tr>
            <td>NIM</td>
            <td>: {{nim}}</td>
        </tr>
        <tr>
            <td>Judul KP</td>
            <td>: {{judul}}</td>
        </tr>
        <tr>
            <td>Pembimbing</td>
            <td>: {{nama_pembimbing}}</td>
        </tr>
        <tr>
            <td>Nilai Akhir</td>
            <td>: {{nilai}}</td>
        </tr>
    </table>
</body>
</html>`,
      fileExtension: "html",
      fields: [
        { variable: "nama_mahasiswa", label: "Nama Mahasiswa", type: "text", required: true, order: 0 },
        { variable: "nim", label: "NIM", type: "text", required: true, order: 1 },
        { variable: "judul", label: "Judul KP", type: "textarea", required: true, order: 2 },
        { variable: "nama_pembimbing", label: "Nama Pembimbing", type: "text", required: true, order: 3 },
        { variable: "nilai", label: "Nilai Akhir", type: "number", required: true, order: 4, validation: { min: 0, max: 100 } },
      ],
      version: 1,
      createdAt: "2025-01-16T09:00:00Z",
      updatedAt: "2025-01-16T09:00:00Z",
      isActive: true,
    },
  ];
}

/**
 * Get template by ID
 */
export async function getTemplateById(id: string): Promise<Template | null> {
  // TODO: Replace with actual API call
  // const response = await fetch(`${API_BASE_URL}/${id}`);
  // if (!response.ok) return null;
  // return response.json();
  
  const templates = await getTemplates();
  return templates.find(t => t.id === id) || null;
}

/**
 * Create new template
 */
export async function createTemplate(data: CreateTemplateData): Promise<Template> {
  // TODO: Replace with actual API call
  // const response = await fetch(API_BASE_URL, {
  //   method: "POST",
  //   headers: { "Content-Type": "application/json" },
  //   body: JSON.stringify(data),
  // });
  // if (!response.ok) throw new Error("Failed to create template");
  // return response.json();
  
  // Mock implementation
  const newTemplate: Template = {
    id: Date.now().toString(),
    ...data,
    version: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isActive: true,
  };
  return newTemplate;
}

/**
 * Update template
 */
export async function updateTemplate(id: string, data: UpdateTemplateData): Promise<Template> {
  // TODO: Replace with actual API call
  // const response = await fetch(`${API_BASE_URL}/${id}`, {
  //   method: "PATCH",
  //   headers: { "Content-Type": "application/json" },
  //   body: JSON.stringify(data),
  // });
  // if (!response.ok) throw new Error("Failed to update template");
  // return response.json();
  
  // Mock implementation
  const template = await getTemplateById(id);
  if (!template) throw new Error("Template not found");
  
  return {
    ...template,
    ...data,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Delete template
 */
export async function deleteTemplate(id: string): Promise<void> {
  // TODO: Replace with actual API call
  // const response = await fetch(`${API_BASE_URL}/${id}`, {
  //   method: "DELETE",
  // });
  // if (!response.ok) throw new Error("Failed to delete template");
  
  // Mock implementation
  console.log(`Template ${id} deleted`);
}

/**
 * Toggle template active status
 */
export async function toggleTemplateActive(id: string): Promise<Template> {
  // TODO: Replace with actual API call
  const template = await getTemplateById(id);
  if (!template) throw new Error("Template not found");
  
  return updateTemplate(id, { isActive: !template.isActive });
}

/**
 * Download template as file
 */
export function downloadTemplate(template: Template): void {
  const blob = new Blob([template.content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${template.name}.${template.fileExtension}`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Render template with data
 * Replace placeholder variables like {{variable}} with actual values
 */
export function renderTemplate(template: Template, data: Record<string, string>): string {
  let content = template.content;
  
  // Replace all {{variable}} placeholders with actual data
  Object.entries(data).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, "g");
    content = content.replace(regex, value);
  });
  
  return content;
}

/**
 * Extract variables from template
 * Returns array of variable names found in template (e.g., ["nama", "nim", "tanggal"])
 */
export function extractTemplateVariables(content: string): string[] {
  const regex = /{{(\w+)}}/g;
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
 * Auto-generate field metadata dari template variables
 * Berguna untuk first-time setup atau quick start
 */
export function autoGenerateFields(content: string): TemplateField[] {
  const variables = extractTemplateVariables(content);
  
  return variables.map((variable, index) => {
    const label = formatVariableName(variable);
    
    // Smart type detection
    let type: TemplateField["type"] = "text";
    if (variable.includes("email")) type = "email";
    else if (variable.includes("tanggal") || variable.includes("date")) type = "date";
    else if (variable.includes("nilai") || variable.includes("score")) type = "number";
    else if (variable.includes("deskripsi") || variable.includes("keterangan")) type = "textarea";
    
    return {
      variable,
      label,
      type,
      required: true,
      placeholder: `Masukkan ${label.toLowerCase()}...`,
      order: index,
    };
  });
}

/**
 * Format variable name to readable label
 */
function formatVariableName(variable: string): string {
  return variable
    .split("_")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Validate fields against template content
 * Memastikan semua variables di template sudah memiliki field configuration
 */
export function validateTemplateFields(content: string, fields: TemplateField[]): {
  isValid: boolean;
  missingVariables: string[];
  unusedFields: string[];
} {
  const templateVariables = extractTemplateVariables(content);
  const configuredVariables = fields.map(f => f.variable);
  
  const missingVariables = templateVariables.filter(v => !configuredVariables.includes(v));
  const unusedFields = configuredVariables.filter(v => !templateVariables.includes(v));
  
  return {
    isValid: missingVariables.length === 0,
    missingVariables,
    unusedFields,
  };
}

/**
 * Create new version of template (untuk versioning system)
 */
export function createTemplateVersion(
  originalTemplate: Template, 
  updates: Partial<CreateTemplateData>
): Template {
  return {
    ...originalTemplate,
    ...updates,
    id: Date.now().toString(),
    version: originalTemplate.version + 1,
    previousVersionId: originalTemplate.id,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Migrate old form data to new template fields
 * Berguna ketika template diupdate dan ada perubahan fields
 */
export function migrateFormData(
  oldData: Record<string, string>,
  oldFields: TemplateField[],
  newFields: TemplateField[]
): Record<string, string> {
  const migratedData: Record<string, string> = {};
  
  newFields.forEach(newField => {
    // Cari matching field dari old fields
    const oldField = oldFields.find(f => 
      f.variable === newField.variable || 
      f.label === newField.label
    );
    
    if (oldField && oldData[oldField.variable]) {
      // Copy data dari old field
      migratedData[newField.variable] = oldData[oldField.variable];
    } else {
      // Use default value jika ada
      migratedData[newField.variable] = newField.defaultValue || "";
    }
  });
  
  return migratedData;
}
