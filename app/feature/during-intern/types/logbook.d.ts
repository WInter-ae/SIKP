// Types for Logbook with weekly grouping and generation

export interface LogbookEntry {
  id: string;
  studentId: string;
  internshipId: string;
  date: string;
  weekNumber: number;  // Minggu ke-
  activity: string;  // Jenis kegiatan (max 200 characters)
  description: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  mentorSignature?: string;  // Base64 dari database
  mentorSignedAt?: string;
  mentorNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LogbookWeekGroup {
  weekNumber: number;
  startDate: string;
  endDate: string;
  entries: LogbookEntry[];
}

export interface LogbookDocxData {
  // Student info (from database)
  studentName: string;
  nim: string;
  prodi: string;
  
  // Internship info (from database)
  company: string;
  division: string;  // Bagian/Bidang
  startDate: string;
  endDate: string;
  
  // Logbook entries (grouped by week)
  weeks: LogbookWeekGroup[];
  
  // Mentor signature (from database)
  mentorName: string;
  mentorSignature: string;  // Base64
  mentorSignedAt: string;
}

export interface GenerateLogbookRequest {
  studentId?: string;  // Optional - untuk mentor/dosen melihat logbook mahasiswa
  weekNumber?: number;  // Optional - generate specific week only
}

export interface GenerateLogbookResponse {
  success: boolean;
  message: string;
  data: {
    docxUrl: string;
    fileName: string;
    generatedAt: string;
  } | null;
}
