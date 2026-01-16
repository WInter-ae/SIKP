// E-Signature types for dosen

export interface DosenESignature {
  id: string;
  dosenId: string;
  signatureImage: string; // base64 or URL
  createdAt: string;
  updatedAt: string;
}

export interface BeritaAcaraDocument {
  id: string;
  mahasiswaId: string;
  mahasiswaNama: string;
  judulLaporan: string;
  tempatPelaksanaan: string;
  tanggalSidang: string;
  waktuMulai: string;
  waktuSelesai: string;
  status: "draft" | "submitted" | "approved" | "rejected";
  dosenPembimbingSignature?: DosenESignature;
  signedAt?: string;
  documentUrl?: string; // URL to generated PDF/DOCX
  createdAt: string;
  updatedAt: string;
}

export interface ESignatureSetupData {
  signatureType: "draw" | "upload" | "text";
  signatureData: string; // base64 for draw/upload, text for text type
  dosenName: string;
  nip: string;
}
