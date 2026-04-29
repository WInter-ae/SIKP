import { z } from "zod";

// ==================== BASE SCHEMAS ====================

export const BaseUserSchema = z
  .object({
    id: z.string(),
    nama: z.string(),
    email: z.string().email(),
    role: z.string(),
  })
  .passthrough() as z.ZodType<any>;

export const TeamMemberSchema = z
  .object({
    id: z.string(),
    teamId: z.string(),
    userId: z.string(),
    role: z.string(),
    invitationStatus: z.string(),
  })
  .passthrough() as z.ZodType<any>;

export const TeamSchema = z
  .object({
    id: z.string(),
    code: z.string(),
    leaderId: z.string(),
    status: z.string(),
  })
  .passthrough() as z.ZodType<any>;

export const SubmissionDocumentSchema = z
  .object({
    id: z.string(),
    submissionId: z.string(),
    fileName: z.string(),
    originalName: z.string(),
    fileType: z.string(),
    fileSize: z.number(),
    fileUrl: z.string(),
    documentType: z.string(),
    uploadedBy: z.string(),
    createdAt: z.string(),
  })
  .passthrough() as z.ZodType<any>; // Using any here temporarily because we want to pass it smoothly to ZodType<SubmissionDocument>

export const SubmissionSchema = z
  .object({
    id: z.string(),
    teamId: z.string(),
    companyName: z.string(),
    companyAddress: z.string(),
    companyPhone: z.string().optional().nullable(),
    companyEmail: z.string().optional().nullable(),
    position: z.string(),
    startDate: z.string(),
    endDate: z.string(),
    status: z.string(),
    rejectionReason: z.string().optional().nullable(),
    approvedAt: z.string().optional().nullable(),
    submittedAt: z.string().optional().nullable(),
    createdAt: z.string(),
    updatedAt: z.string(),
  })
  .passthrough() as z.ZodType<any>;

export const TemplateSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    type: z.string(),
    isActive: z.boolean(),
  })
  .passthrough() as z.ZodType<any>;

// ==================== FEATURE SCHEMAS ====================

// Schemas for letter-request-status.service.ts
export const RawItemSchema = z
  .object({
    id: z.string().optional(),
    name: z.string().optional(),
    status: z.string().optional(),
    title: z.string().optional(),
    description: z.string().optional(),
    date: z.string().optional(),
    dosen: z.any().optional(), // Kept flexible to allow nested parses
  })
  .passthrough() as z.ZodType<any>;

export const TimelineDataSchema = z
  .object({
    items: z.array(z.any()).optional().nullable(),
    statuses: z.array(z.any()).optional().nullable(),
    records: z.array(z.any()).optional().nullable(),
  })
  .passthrough() as z.ZodType<any>;

export const StatusItemSchema = z
  .object({
    title: z.string(),
    description: z.string(),
    status: z.string(),
    date: z.string().nullable(),
  })
  .passthrough() as z.ZodType<any>;

// Schemas for signature.service.ts
export const SignaturePayloadSchema = z
  .object({
    id: z.string(),
    userId: z.string(),
    signatureUrl: z.string(),
    isActive: z.boolean(),
  })
  .passthrough() as z.ZodType<any>;

export const SignatureListPayloadSchema = z.array(SignaturePayloadSchema);

// Schemas for surat/letters
export const SuratRequestItemSchema = z
  .object({
    id: z.string(),
    submissionId: z.string(),
    status: z.string(),
    createdAt: z.string().optional(),
  })
  .passthrough() as z.ZodType<any>;

export const DosenProfileSchema = z
  .object({
    id: z.string(),
    userId: z.string(),
    nip: z.string().optional().nullable(),
    kodeDosen: z.string().optional().nullable(),
  })
  .passthrough() as z.ZodType<any>;

export const MahasiswaProfileSchema = z
  .object({
    id: z.string(),
    userId: z.string(),
    nim: z.string().optional().nullable(),
    prodi: z.string().optional().nullable(),
  })
  .passthrough() as z.ZodType<any>;
