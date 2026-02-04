import type {
  Submission,
  SubmissionDocument,
} from "~/feature/submission/types";
import type {
  Application,
  DocumentFile,
  Member,
} from "~/feature/submission/types";

/**
 * Mapping document type dari backend ke display title
 */
const DOCUMENT_TYPE_MAPPING: Record<string, string> = {
  PROPOSAL_KETUA: "Surat Proposal",
  SURAT_KESEDIAAN: "Surat Kesediaan",
  FORM_PERMOHONAN: "Form Permohonan",
  KRS_SEMESTER_4: "KRS Semester 4",
  DAFTAR_KUMPULAN_NILAI: "Daftar Kumpulan Nilai",
  BUKTI_PEMBAYARAN_UKT: "Bukti Pembayaran UKT",
};

/**
 * Mapping submission document dari backend ke DocumentFile untuk review modal
 */
function mapSubmissionDocumentToDocumentFile(
  doc: SubmissionDocument,
  memberName: string,
): DocumentFile {
  return {
    id: doc.id,
    title: DOCUMENT_TYPE_MAPPING[doc.documentType] || doc.documentType,
    uploadedBy: memberName,
    uploadDate: new Date(doc.createdAt).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }),
    status: "uploaded",
    url: doc.fileUrl,
  };
}

/**
 * Format tanggal dari ISO string ke format Indonesia
 */
function formatDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

/**
 * Interface untuk Team Member dari backend
 */
interface TeamMemberFromBackend {
  user: {
    id: string;
    name: string;
    nim: string;
    email?: string;
    prodi?: string;
  };
  role: "KETUA" | "ANGGOTA";
  status: string;
}

/**
 * Interface untuk Team dari backend
 */
interface TeamFromBackend {
  id: string;
  name: string;
  code: string;
  status: string;
  members: TeamMemberFromBackend[];
  academicSupervisor?: string;
}

/**
 * Interface untuk Submission dengan relasi Team dari backend
 */
export interface SubmissionWithTeam extends Submission {
  team?: TeamFromBackend;
}

/**
 * Map submission dari backend ke Application untuk admin page
 *
 * @param submission - Submission object dari backend (harus include team & documents)
 * @returns Application object untuk ditampilkan di admin page
 */
export function mapSubmissionToApplication(
  submission: SubmissionWithTeam,
): Application | null {
  if (!submission.team) {
    console.error("❌ Submission missing team data:", submission.id);
    return null;
  }

  // Filter hanya accepted members
  const acceptedMembers = submission.team.members.filter(
    (m) => m.status === "ACCEPTED",
  );

  if (acceptedMembers.length === 0) {
    console.error("❌ No accepted members in team:", submission.team.id);
    return null;
  }

  // Map members ke format yang dibutuhkan
  const members: Member[] = acceptedMembers.map((m) => ({
    id: m.user.id,
    name: m.user.name,
    nim: m.user.nim,
    prodi: m.user.prodi,
    role: m.role === "KETUA" ? "Ketua" : "Anggota",
  }));

  // Sort: Ketua first
  members.sort((a, b) => {
    if (a.role === "Ketua") return -1;
    if (b.role === "Ketua") return 1;
    return 0;
  });

  // Map documents
  const documents: DocumentFile[] = (submission.documents || []).map((doc) => {
    // Cari member yang upload dokumen ini
    const uploader = acceptedMembers.find(
      (m) => m.user.id === doc.uploadedByUserId,
    );
    const uploaderName = uploader?.user.name || "Unknown";

    return mapSubmissionDocumentToDocumentFile(doc, uploaderName);
  });

  // Map status
  let status: "pending" | "approved" | "rejected" = "pending";
  if (submission.status === "APPROVED") {
    status = "approved";
  } else if (submission.status === "REJECTED") {
    status = "rejected";
  }

  // Supervisor dummy (TODO: ambil dari team.academicSupervisor jika ada)
  const supervisor =
    submission.team.academicSupervisor || "Dr. Ahmad Fauzi, M.Kom"; // Dummy supervisor

  return {
    id: parseInt(submission.id, 10) || Math.floor(Math.random() * 10000),
    date: submission.submittedAt
      ? new Date(submission.submittedAt).toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })
      : new Date(submission.createdAt).toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }),
    status,
    supervisor,
    members,
    internship: {
      tujuanSurat: submission.letterPurpose,
      namaTempat: submission.companyName,
      alamatTempat: submission.companyAddress,
      divisi: submission.division,
      tanggalMulai: formatDate(submission.startDate),
      tanggalSelesai: formatDate(submission.endDate),
    },
    documents,
    rejectionComment: submission.rejectionReason,
    // documentReviews akan dikelola di state lokal admin page
  };
}

/**
 * Map array submissions ke applications
 */
export function mapSubmissionsToApplications(
  submissions: SubmissionWithTeam[],
): Application[] {
  return submissions
    .map(mapSubmissionToApplication)
    .filter((app): app is Application => app !== null);
}
