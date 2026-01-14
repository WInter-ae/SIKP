// Types for Mentor Feature Module

// Arsip Page Types
export interface ArchivedDocument {
  id: string;
  type: "penilaian" | "logbook" | "laporan";
  title: string;
  mentee: string;
  date: string;
  semester: string;
  status: "completed" | "archived";
}

// Mentee Page Types
export interface Mentee {
  id: string;
  name: string;
  nim: string;
  email: string;
  phone: string;
  company: string;
  progress: number;
  status: string;
}

// Notifikasi Page Types
export interface Notification {
  id: string;
  type: "info" | "success" | "warning" | "error";
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  link?: string; // Optional link to navigate to related page
}

// Penilaian Page Types
export interface AssessmentCriteria {
  id: string;
  category: string;
  score: number;
  maxScore: number;
  description: string;
}

export interface MenteeOption {
  id: string;
  name: string;
  nim: string;
}

// Profil Page Types
export interface ProfileData {
  name: string;
  nip: string;
  email: string;
  phone: string;
  company: string;
  position: string;
  address: string;
  bio: string;
  photo: string;
  signature: string;
}

// Pengaturan Page Types
export interface Settings {
  theme: string;
  language: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  weeklyReport: boolean;
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}
