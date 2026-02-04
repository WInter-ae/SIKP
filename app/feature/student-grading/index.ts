export { default as StudentGradingPage } from "./pages/student-grading-page";
export { default as FieldMentorGradeCard } from "./components/field-mentor-grade-card";
export { default as AcademicSupervisorGradeCard } from "./components/academic-supervisor-grade-card";
export { default as CombinedGradeCard } from "./components/combined-grade-card";
export * from "./types/index.d";

// Approval workflow exports
export { default as DosenApprovalPage } from "./pages/dosen-approval-page";
export { default as KaprodiApprovalPage } from "./pages/kaprodi-approval-page";
export { default as ApprovalDialog } from "./components/approval-dialog";

export type {
  ApprovalStatus,
  ApprovalWorkflow,
  CombinedGradeWithApproval,
  ApprovalRequest,
  ApprovalResponse,
  RejectRequest,
} from "./types/approval.d";

export {
  getPendingDosenApprovals,
  approveGradeByDosen,
  rejectGradeByDosen,
  getPendingKaprodiApprovals,
  approveGradeByKaprodi,
  rejectGradeByKaprodi,
  getGradePdfDownloadUrl,
} from "./services/approval-api";
