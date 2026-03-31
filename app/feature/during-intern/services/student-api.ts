/**
 * Student Data API Service
 * Handles student (mahasiswa) profile and information
 */

import { get, put, iget, iput } from "~/lib/api-client";
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
 * GET /api/mahasiswa/internship returns all context data
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
  };
  lecturer?: {
    id: string;
    name: string;
    email: string;
    nip: string;
    phone?: string;
  };
}

// ==================== API FUNCTIONS ====================

/**
 * Get current student profile
 * GET /api/mahasiswa/profile
 */
export async function getMyProfile(): Promise<ApiResponse<StudentProfile>> {
  return iget<StudentProfile>("/api/mahasiswa/profile");
}

/**
 * Get student by ID (for dosen/mentor)
 * GET /api/mahasiswa/:studentId
 */
export async function getStudentById(
  studentId: string
): Promise<ApiResponse<StudentDetailResponse>> {
  return iget<StudentDetailResponse>(`/api/mahasiswa/${studentId}`);
}

/**
 * Get student by NIM
 * GET /api/mahasiswa/nim/:nim
 */
export async function getStudentByNim(
  nim: string
): Promise<ApiResponse<StudentDetailResponse>> {
  return iget<StudentDetailResponse>(`/api/mahasiswa/nim/${nim}`);
}

/**
 * Update student profile
 * PUT /api/mahasiswa/profile
 */
export async function updateStudentProfile(
  data: Partial<Omit<StudentProfile, "id" | "userId" | "nim" | "createdAt" | "updatedAt">>
): Promise<ApiResponse<StudentProfile>> {
  return iput<StudentProfile>("/api/mahasiswa/profile", data);
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
    companyName: string; // ← Backend uses "companyName" not "company"
    companyAddress: string; // ← Backend uses "companyAddress" not "address"
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
    pembimbingLapanganId: number | null; // ← Backend uses different field names
    pembimbingDosenId: number | null;
    createdAt: string;
  } | null; // ← Can be null if not created yet
  mentor?: { // ← NEW: Mentor data from backend
    id: number;
    name: string;
    email: string;
    company: string;
    position: string;
    phone?: string;
    signature?: string | null; // ← Base64 Data URI for PDF paraf
  } | null;
  lecturer?: { // ← OPTIONAL: Lecturer/dosen data
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
function mapBackendToFrontend(backendData: BackendInternshipResponse): CompleteInternshipData {
  const { student, submission, internship, mentor, lecturer } = backendData;
  
  return {
    student: {
      id: student.id.toString(),
      userId: student.id.toString(), // Use student ID as userId
      nim: student.nim,
      name: student.name,
      email: student.email,
      phone: '', // Backend doesn't return phone in this endpoint
      prodi: student.prodi,
      fakultas: student.fakultas,
      angkatan: student.angkatan,
      semester: parseInt(student.semester) || 0, // Convert string to number
    },
    submission: {
      id: submission.id.toString(),
      teamId: submission.teamId?.toString(),
      company: submission.companyName, // ← Map companyName to company
      division: submission.division || '',
      address: submission.companyAddress || '', // ← Map companyAddress to address
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
          updatedAt: internship.createdAt, // Backend doesn't return updatedAt
        }
      : {
          // Default internship object when backend returns null
          id: 'pending',
          studentId: student.id.toString(),
          submissionId: submission.id.toString(),
          teamId: submission.teamId?.toString(),
          status: 'PENDING',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
    // ← NEW: Map mentor data (will be populated when backend implements it)
    mentor: mentor ? {
      id: mentor.id.toString(),
      name: mentor.name,
      email: mentor.email,
      company: mentor.company,
      position: mentor.position,
      phone: mentor.phone,
      signature: mentor.signature || undefined, // ← Base64 signature for PDF
    } : undefined,
    // ← OPTIONAL: Map lecturer data
    lecturer: lecturer ? {
      id: lecturer.id.toString(),
      name: lecturer.name,
      email: lecturer.email,
      nip: lecturer.nip,
      phone: lecturer.phone,
    } : undefined,
  };
}

/**
 * Get current student's complete internship data (⭐ MOST IMPORTANT ENDPOINT)
 * This endpoint returns ALL context data needed for internship pages:
 * - Student profile
 * - Internship details
 * - Submission data (company, division from original submission)
 * - Team info (if applicable)
 * - Mentor info (if assigned)
 * - Lecturer info (if assigned)
 * 
 * GET /api/mahasiswa/internship
 * 
 * ✅ NOW USING REAL BACKEND ENDPOINT (18 Feb 2026)
 * Fallback mechanism kept for safety but should not be needed.
 */
export async function getCompleteInternshipData(): Promise<ApiResponse<CompleteInternshipData>> {
  console.log('📡 Calling API: GET /api/mahasiswa/internship');
  
  try {
    // Call the real backend endpoint
    const response = await iget<BackendInternshipResponse>("/api/mahasiswa/internship");
    console.log('✅ Backend response received:', response);
    
    if (response.success && response.data) {
      // Map backend structure to frontend interface
      const mappedData = mapBackendToFrontend(response.data);
      console.log('✅ Data mapped to frontend structure:', mappedData);
      
      return {
        success: true,
        message: response.message || "Data loaded successfully",
        data: mappedData,
      };
    }
    
    // If response not successful, try fallback
    console.warn('⚠️ Backend response not successful, using fallback...');
    return await getCompleteInternshipDataFallback();
    
  } catch (error) {
    console.error('❌ Error calling backend endpoint:', error);
    console.warn('⚠️ Falling back to localStorage + submissions API...');
    return await getCompleteInternshipDataFallback();
  }
}

/**
 * Fallback function: Combine data from multiple endpoints
 * Used when /api/mahasiswa/internship is not available
 */
async function getCompleteInternshipDataFallback(): Promise<ApiResponse<CompleteInternshipData>> {
  console.log('🔄 Using fallback: Combining multiple endpoints...');
  
  try {
    // Try to get profile first
    let studentData = null;
    
    try {
      const profileResponse = await getMyProfile();
      console.log('📦 Profile response:', profileResponse);
      
      if (profileResponse.success && profileResponse.data) {
        studentData = profileResponse.data;
      }
    } catch (profileError) {
      console.warn('⚠️ Profile endpoint failed, using localStorage data');
    }
    
    // If profile endpoint failed, try to get user data from localStorage
    if (!studentData) {
      const userDataStr = typeof window !== 'undefined' ? localStorage.getItem('user_data') : null;
      if (userDataStr) {
        try {
          const userData = JSON.parse(userDataStr);
          console.log('📦 User data from localStorage:', userData);
          
          // Map user data to student structure
          studentData = {
            id: userData.id || '',
            userId: userData.id || '',
            nim: userData.nim || '',
            name: userData.name || userData.nama || '',
            email: userData.email || '',
            phone: userData.phone || '',
            prodi: userData.prodi || 'Manajemen Informatika',
            fakultas: userData.fakultas || 'Ilmu Komputer',
            angkatan: userData.angkatan || '',
            semester: userData.semester || 0,
          };
        } catch (e) {
          console.error('❌ Failed to parse user data from localStorage');
        }
      }
    }
    
    // Get submissions data
    const submissionsResponse = await get<any[]>("/api/submissions/my-submissions");
    console.log('📦 Submissions response:', submissionsResponse);
    
    // If we don't have student data at all, return error
    if (!studentData) {
      return {
        success: false,
        message: "Failed to load student data. Please login again.",
        data: null,
      };
    }
    
    // Find the latest approved submission
    let submission = null;
    if (submissionsResponse.success && submissionsResponse.data && submissionsResponse.data.length > 0) {
      const approved = submissionsResponse.data.find((s: any) => s.status === 'APPROVED');
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
    
    // Build complete data structure
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
        status: submission?.status === "APPROVED" ? "AKTIF" : "PENDING",
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
    
    console.log('✅ Fallback data compiled:', completeData);
    
    return {
      success: true,
      message: "Data loaded successfully (from fallback + localStorage)",
      data: completeData,
    };
    
  } catch (error) {
    console.error('❌ Fallback also failed:', error);
    return {
      success: false,
      message: "Failed to load data from all endpoints",
      data: null,
    };
  }
}

/**
 * Get current student's basic internship data
 * GET /api/mahasiswa/internship (legacy - use getCompleteInternshipData instead)
 */
export async function getMyInternship(): Promise<ApiResponse<InternshipData>> {
  return iget<InternshipData>("/api/mahasiswa/internship");
}

/**
 * Get internship data by student ID
 * GET /api/mahasiswa/:studentId/internship
 */
export async function getStudentInternship(
  studentId: string
): Promise<ApiResponse<InternshipData>> {
  return iget<InternshipData>(`/api/mahasiswa/${studentId}/internship`);
}

/**
 * Update internship period (periode magang)
 * PUT /api/mahasiswa/internship/period
 */
export async function updateInternshipPeriod(data: {
  startDate: string;
  endDate: string;
}): Promise<ApiResponse<InternshipData>> {
  return iput<InternshipData>("/api/mahasiswa/internship/period", data);
}
