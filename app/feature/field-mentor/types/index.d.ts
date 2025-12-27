export interface FieldMentor {
  id: string;
  code: string;
  name: string;
  email: string;
  company: string;
  position: string;
  phone: string;
  status: "pending" | "registered" | "approved" | "rejected";
  createdAt: string;
  registeredAt?: string;
  approvedAt?: string;
  photo?: string;
  nip: string;
}

export interface MentorRequest {
  mentorName: string;
  mentorEmail: string;
  mentorPhone: string;
  company: string;
  position: string;
  address: string;
}
