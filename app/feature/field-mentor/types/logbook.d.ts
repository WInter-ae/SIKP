export interface LogbookEntry {
  id: string;
  studentId: string;
  studentName: string;
  date: string;
  description: string;
  activities: string;
  createdAt: string;
  mentorSignature?: MentorSignature;
}

export interface MentorSignature {
  signedAt: string;
  signedBy: string;
  mentorName: string;
  mentorPosition: string;
  signatureData?: string; // Base64 signature image
  notes?: string;
  status: "approved" | "revision" | "rejected";
}

export interface Student {
  id: string;
  name: string;
  nim: string;
  email: string;
  university: string;
  major: string; // Program Studi
  fakultas?: string; // Fakultas
  company?: string; // Tempat KP
  position?: string; // Bagian/Bidang
  startDate: string;
  endDate: string;
  photo?: string;
}
