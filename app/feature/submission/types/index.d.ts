export interface AdditionalInfoData {
  tujuanSurat: string;
  namaTempat: string;
  alamatTempat: string;
  tanggalMulai: string;
  tanggalSelesai: string;
  pembimbingLapangan: string;
}

export interface Member {
  id: number;
  name: string;
  role: string;
  nim?: string;
  prodi?: string;
}

export interface Document {
  id: number;
  title: string;
}

export interface DocumentFile {
  id: string;
  title: string;
  uploadedBy: string;
  uploadDate: string;
  status: "uploaded" | "missing";
  url?: string;
}

export interface Application {
  id: number;
  date: string;
  status: "pending" | "approved" | "rejected";
  rejectionComment?: string;
  documentReviews?: Record<string, "approved" | "rejected">;
  
  // Team Info
  members: Member[];
  supervisor: string;
  internship: AdditionalInfoData;
  documents: DocumentFile[];
}
