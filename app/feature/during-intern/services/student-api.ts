/**
 * Student Data API Service
 * Handles student (mahasiswa) profile and internship information
 *
 * Menggunakan internshipClient & sikpClient dari api-client sesuai pola main.
 */

import { sikpClient, internshipClient, get } from "~/lib/api-client";
import type { ApiResponse } from "~/lib/api-client";

// ==================== TYPES ====================

export interface StudentProfile {
  id: string;
  userId: string;
  nim: string;
  name: string;
  email: string;
  phone?: string;
  prodi: string;
  fakultas?: string;
  angkatan: string;
  semester: number;
  ipk?: number;
  address?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InternshipData {
  id: string;
  studentId: string;
  company: string;
  position: string;
  mentorId?: string;
  mentorName?: string;
  dosenPembimbingId?: string;
  dosenPembimbingName?: string;
  startDate: string;
  endDate: string;
  status: "PENDING" | "AKTIF" | "SELESAI" | "BATAL";
  progress: number;
  createdAt: string;
  updatedAt: string;
}

export interface StudentDetailResponse {
  student: StudentProfile;
  internship?: InternshipData;
}

/**
 * Complete Internship Data Response from Backend
 * GET /api/internships → data lengkap konteks magang mahasiswa
 */
export interface CompleteInternshipData {
  student: {
    id: string;
    userId: string;
    nim: string;
    name: string;
    email: string;
    phone?: string;
    prodi: string;
    fakultas: string;
    angkatan: string;
    semester: number;
  };
  internship: {
    id: string;
    studentId: string;
    submissionId: string;
    teamId?: string;
    status: "PENDING" | "AKTIF" | "SELESAI" | "BATAL";
    mentorId?: string;
    dosenPembimbingId?: string;
    createdAt: string;
    updatedAt: string;
  };
  submission: {
    id: string;
    teamId?: string;
    company: string;
    division?: string;
    address?: string;
    startDate: string;
    endDate: string;
    status: string;
  };
  team?: {
    id: string;
    name: string;
    totalMembers: number;
  };
  mentor?: {
    id: string;
    name: string;
    email: string;
    company: string;
    position: string;
    phone?: string;
    status?: string;
    companyAddress?: string;
    rejectionReason?: string;
    signature?: string;
    createdAt?: string;
  };
  lecturer?: {
    id: string;
    name: string;
    email: string;
    nip: string;
    phone?: string;
  };
}

/**
 * Backend Response Structure (raw from API)
 * This represents what the backend actually returns
 */
interface BackendInternshipResponse {
  student: {
    id: number;
    nim: string;
    name: string;
    email: string;
    prodi: string;
    fakultas: string;
    angkatan: string;
    semester: string; // Backend returns string
  };
  submission: {
    id: number;
    teamId: number;
    teamName: string;
    companyName?: string;
    company?: string;
    companyAddress?: string;
    address?: string;
    division?: string;
    startDate: string;
    endDate: string;
    status: string;
    submittedAt: string | null;
    approvedAt: string | null;
  };
  internship: {
    id: number;
    status: string;
    pembimbingLapanganId: number | null;
    pembimbingDosenId: number | null;
    createdAt: string;
  } | null;
  mentor?: {
    id: number;
    name: string;
    email: string;
    company: string;
    position: string;
    phone?: string;
    signature?: string | null;
  } | null;
  lecturer?: {
    id: number;
    name: string;
    email: string;
    nip: string;
    phone?: string;
  } | null;
}

/**
 * Map backend response to frontend interface
 * Handles field name differences and type conversions
 */
function mapBackendToFrontend(
  backendData: BackendInternshipResponse,
): CompleteInternshipData {
  const { student, submission, internship, mentor, lecturer } = backendData;

  const submissionAny = submission as Record<string, unknown>;
  const company =
    (typeof submission.companyName === "string" && submission.companyName) ||
    (typeof submission.company === "string" && submission.company) ||
    (typeof submissionAny.namaPerusahaan === "string"
      ? (submissionAny.namaPerusahaan as string)
      : "") ||
    "";
  const address =
    (typeof submission.companyAddress === "string" &&
      submission.companyAddress) ||
    (typeof submission.address === "string" && submission.address) ||
    (typeof submissionAny.alamatPerusahaan === "string"
      ? (submissionAny.alamatPerusahaan as string)
      : "") ||
    "";

  return {
    student: {
      id: student.id.toString(),
      userId: student.id.toString(),
      nim: student.nim,
      name: student.name,
      email: student.email,
      phone: "",
      prodi: student.prodi,
      fakultas: student.fakultas,
      angkatan: student.angkatan,
      semester: parseInt(student.semester) || 0,
    },
    submission: {
      id: submission.id.toString(),
      teamId: submission.teamId?.toString(),
      company,
      division: submission.division || "",
      address,
      startDate: submission.startDate,
      endDate: submission.endDate,
      status: submission.status,
    },
    internship: internship
      ? {
          id: internship.id.toString(),
          studentId: student.id.toString(),
          submissionId: submission.id.toString(),
          teamId: submission.teamId?.toString(),
          status: internship.status as "PENDING" | "AKTIF" | "SELESAI" | "BATAL",
          mentorId: internship.pembimbingLapanganId?.toString(),
          dosenPembimbingId: internship.pembimbingDosenId?.toString(),
          createdAt: internship.createdAt,
          updatedAt: internship.createdAt,
        }
      : {
          id: "pending",
          studentId: student.id.toString(),
          submissionId: submission.id.toString(),
          teamId: submission.teamId?.toString(),
          status: "PENDING",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
    mentor: mentor
      ? {
          id: mentor.id.toString(),
          name: mentor.name,
          email: mentor.email,
          company: mentor.company,
          position: mentor.position,
          phone: mentor.phone,
          status: (mentor as any).status,
          companyAddress: (mentor as any).companyAddress,
          rejectionReason: (mentor as any).rejectionReason,
          createdAt: (mentor as any).createdAt,
          signature: mentor.signature || undefined,
        }
      : undefined,
    lecturer: lecturer
      ? {
          id: lecturer.id.toString(),
          name: lecturer.name,
          email: lecturer.email,
          nip: lecturer.nip,
          phone: lecturer.phone,
        }
      : undefined,
  };
}

// ==================== API FUNCTIONS ====================

/**
 * Get current student profile
 * GET /api/mahasiswa/me (via sikpClient — profil umum mahasiswa)
 */
export async function getMyProfile(): Promise<ApiResponse<StudentProfile>> {
  return sikpClient.get<StudentProfile>("/api/mahasiswa/me");
}

/**
 * Get student by ID (for dosen/mentor)
 * GET /api/mahasiswa/:studentId
 */
export async function getStudentById(
  studentId: string,
): Promise<ApiResponse<StudentDetailResponse>> {
  return sikpClient.get<StudentDetailResponse>(`/api/mahasiswa/${studentId}`);
}

/**
 * Get student by NIM
 * GET /api/mahasiswa/nim/:nim
 */
export async function getStudentByNim(
  nim: string,
): Promise<ApiResponse<StudentDetailResponse>> {
  return sikpClient.get<StudentDetailResponse>(`/api/mahasiswa/nim/${nim}`);
}

/**
 * Update student profile
 * PUT /api/mahasiswa/me/profile
 */
export async function updateStudentProfile(
  data: Partial<
    Omit<StudentProfile, "id" | "userId" | "nim" | "createdAt" | "updatedAt">
  >,
): Promise<ApiResponse<StudentProfile>> {
  return sikpClient.put<StudentProfile>("/api/mahasiswa/me/profile", data);
}

/**
 * Get current student's complete internship data (⭐ MOST IMPORTANT ENDPOINT)
 * Menggabungkan data mahasiswa, submission, internship, mentor, dan dosen pembimbing.
 *
 * GET /api/internships
 */
export async function getCompleteInternshipData(): Promise<
  ApiResponse<CompleteInternshipData>
> {
  console.log("📡 Calling API: GET /api/internships");

  try {
    const response =
      await internshipClient.get<BackendInternshipResponse>("/api/internships");
    console.log("✅ Backend response received:", response);

    if (response.success && response.data) {
      const mappedData = mapBackendToFrontend(response.data);
      console.log("✅ Data mapped to frontend structure:", mappedData);
      return {
        success: true,
        message: response.message || "Data loaded successfully",
        data: mappedData,
      };
    }

    console.warn("⚠️ Backend response not successful, using fallback...");
    return await getCompleteInternshipDataFallback();
  } catch (error) {
    console.error("❌ Error calling backend endpoint:", error);
    console.warn("⚠️ Falling back to localStorage + submissions API...");
    return await getCompleteInternshipDataFallback();
  }
}

/**
 * Fallback: Combine data from multiple endpoints
 * Used when /api/internships is not available
 */
async function getCompleteInternshipDataFallback(): Promise<
  ApiResponse<CompleteInternshipData>
> {
  console.log("🔄 Using fallback: Combining multiple endpoints...");

  try {
    let studentData = null;

    try {
      const profileResponse = await getMyProfile();
      console.log("📦 Profile response:", profileResponse);
      if (profileResponse.success && profileResponse.data) {
        studentData = profileResponse.data;
      }
    } catch {
      console.warn("⚠️ Profile endpoint failed, using localStorage data");
    }

    if (!studentData) {
      const userDataStr =
        typeof window !== "undefined"
          ? localStorage.getItem("user_data")
          : null;
      if (userDataStr) {
        try {
          const userData = JSON.parse(userDataStr);
          studentData = {
            id: userData.id || "",
            userId: userData.id || "",
            nim: userData.nim || "",
            name: userData.name || userData.nama || "",
            email: userData.email || "",
            phone: userData.phone || "",
            prodi: userData.prodi || "Manajemen Informatika",
            fakultas: userData.fakultas || "Ilmu Komputer",
            angkatan: userData.angkatan || "",
            semester: userData.semester || 0,
          };
        } catch {
          console.error("❌ Failed to parse user data from localStorage");
        }
      }
    }

    const submissionsResponse = await get<any[]>("/api/submissions/my-submissions");
    console.log("📦 Submissions response:", submissionsResponse);

    if (!studentData) {
      return {
        success: false,
        message: "Failed to load student data. Please login again.",
        data: null,
      };
    }

    let submission = null;
    if (
      submissionsResponse.success &&
      submissionsResponse.data &&
      submissionsResponse.data.length > 0
    ) {
      const approved = submissionsResponse.data.find(
        (s: any) => s.status === "APPROVED" || s.adminVerificationStatus === "APPROVED",
      );
      const submissionToUse = approved || submissionsResponse.data[0];
      if (submissionToUse) {
        submission = {
          id: submissionToUse.id,
          teamId: submissionToUse.teamId,
          company: submissionToUse.companyName || submissionToUse.company || "",
          division: submissionToUse.division || "",
          address: submissionToUse.companyAddress || submissionToUse.address || "",
          startDate: submissionToUse.startDate || "",
          endDate: submissionToUse.endDate || "",
          status: submissionToUse.status,
        };
      }
    }

    const completeData: CompleteInternshipData = {
      student: {
        id: studentData.id,
        userId: studentData.userId || studentData.id,
        nim: studentData.nim,
        name: studentData.name,
        email: studentData.email,
        phone: studentData.phone,
        prodi: studentData.prodi,
        fakultas: studentData.fakultas || "Ilmu Komputer",
        angkatan: studentData.angkatan,
        semester: studentData.semester,
      },
      internship: {
        id: submission?.id || "pending",
        studentId: studentData.id,
        submissionId: submission?.id || "",
        teamId: submission?.teamId,
        status:
          submission?.status === "APPROVED" ||
          submission?.status === "PENDING_DOSEN_VERIFICATION" ||
          submission?.status === "COMPLETED"
            ? "AKTIF"
            : "PENDING",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      submission: submission || {
        id: "",
        company: "",
        division: "",
        address: "",
        startDate: "",
        endDate: "",
        status: "PENDING",
      },
    };

    console.log("✅ Fallback data compiled:", completeData);
    return {
      success: true,
      message: "Data loaded successfully (from fallback + localStorage)",
      data: completeData,
    };
  } catch (error) {
    console.error("❌ Fallback also failed:", error);
    return {
      success: false,
      message: "Failed to load data from all endpoints",
      data: null,
    };
  }
}

/**
 * Get current student's basic internship data
 * GET /api/internships
 */
export async function getMyInternship(): Promise<ApiResponse<InternshipData>> {
  return internshipClient.get<InternshipData>("/api/internships");
}

/**
 * Get internship data by student ID
 * GET /api/internships/:studentId
 */
export async function getStudentInternship(
  studentId: string,
): Promise<ApiResponse<InternshipData>> {
  return internshipClient.get<InternshipData>(`/api/internships/${studentId}`);
}

/**
 * Update internship period (periode magang)
 * PUT /api/internships/period
 */
export async function updateInternshipPeriod(data: {
  startDate: string;
  endDate: string;
}): Promise<ApiResponse<InternshipData>> {
  return internshipClient.put<InternshipData>("/api/internships/period", data);
}
