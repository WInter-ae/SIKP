// Components
export { CreateTemplateDialog } from "./components/create-template-dialog";
export { EditTemplateDialog } from "./components/edit-template-dialog";
export { TemplateFieldConfigurator } from "./components/template-field-configurator";
export { DynamicFormFromTemplate } from "./components/dynamic-form-from-template";
export { TemplateUsageExample, GenerateBeritaAcara } from "./components/template-usage-example";

// Pages
export { default as TemplateManagementPage } from "./pages/admin-template-management-page";

// Services
export {
  getTemplates,
  getTemplateById,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  toggleTemplateActive,
  downloadTemplate,
  renderTemplate,
  extractTemplateVariables,
  autoGenerateFields,
  validateTemplateFields,
  createTemplateVersion,
  migrateFormData,
} from "./services/template.service";

// Types
export type {
  Template,
  TemplateType,
  TemplateCategory,
  TemplateField,
  FieldType,
  CreateTemplateData,
  UpdateTemplateData,
} from "./types/template.types";

export { TEMPLATE_CATEGORIES } from "./types/template.types";
