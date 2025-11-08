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
}

export interface Document {
  id: number;
  title: string;
}

export interface DocumentDropdownProps {
  document: Document;
  members: Member[];
}

export interface FileUploadProps {
  label: string;
  onFileChange?: (file: File) => void;
}
