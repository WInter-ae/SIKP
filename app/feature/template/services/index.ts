/**
 * Template Services
 * 
 * Export all template-related services for easy import
 */

// Template operations
export {
  extractTemplateVariables,
  autoGenerateFields,
  validateTemplateFields,
  migrateFormData,
  createTemplateVersion,
} from "./template.service";

// Word and PDF operations
export {
  generateWordDocument,
  generatePDFFromHTML,
  generatePDFFromHTMLMultiPage,
  downloadBlob,
  wordFileToBase64,
  extractWordVariables,
  isValidWordTemplate,
} from "./word-pdf.service";

// Type exports
export type {
  Template,
  TemplateField,
  TemplateType,
  FieldType,
} from "../types/template.types";
