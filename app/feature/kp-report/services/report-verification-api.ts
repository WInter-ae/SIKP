import { internshipClient } from "~/lib/api-client";
import type { ApiResponse } from "~/lib/api-client";

export interface LaporanMahasiswa {
  id: string;
  internshipId: string;
  title: string;
  abstract: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  originalName: string;
  status: "DRAFT" | "SUBMITTED" | "APPROVED" | "REJECTED";
  submittedAt: string;
  mahasiswaId: string;
  companyName: string;
  studentName: string;
  studentNim: string;
}

export async function getReportsForLecturer(): Promise<ApiResponse<LaporanMahasiswa[]>> {
  return internshipClient.get<LaporanMahasiswa[]>("/api/reporting/lecturer/reports");
}

export async function verifyReport(
  reportId: string, 
  data: { action: "APPROVE" | "REJECT"; reason?: string }
): Promise<ApiResponse<any>> {
  const endpoint = data.action === "APPROVE" ? "approve" : "reject";
  return internshipClient.post<any>(`/api/reporting/report/${reportId}/${endpoint}`, { 
    reason: data.reason 
  });
}
