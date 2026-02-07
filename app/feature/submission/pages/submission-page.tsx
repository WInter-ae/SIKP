import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";

import { Alert, AlertDescription } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";

import FileUpload from "../components/file-upload";
import DocumentDropdown from "../components/document-dropdown";
import AdditionalInfoForm from "../components/add-info-form";
import { ConfirmDialog } from "../components/confirm-dialog";
import { FileUploadDialog } from "../components/file-upload-dialog";

import type {
  AdditionalInfoData,
  Member,
  Submission,
  SubmissionDocument,
} from "../types";
import { getMyTeams } from "~/feature/create-teams/services/team-api";
import { apiClient } from "~/lib/api-client";
import {
  getSubmissionByTeamId,
  createSubmission,
  uploadSubmissionDocument,
  updateSubmission,
  submitSubmission,
} from "~/lib/services/submission-api";
import { useUser } from "~/contexts/user-context";
import { ArrowLeft, ArrowRight, Eye, Info } from "lucide-react";

function SubmissionPage() {
  const navigate = useNavigate();
  const { user, isLoading: isUserLoading, isAuthenticated } = useUser();

  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [teamName, setTeamName] = useState<string>("");
  const [teamStatus, setTeamStatus] = useState<string>("");
  const [teamId, setTeamId] = useState<string>("");
  const [isCurrentUserLeader, setIsCurrentUserLeader] =
    useState<boolean>(false);

  const [submission, setSubmission] = useState<Submission | null>(null);
  const [submissionDocuments, setSubmissionDocuments] = useState<
    SubmissionDocument[]
  >([]);

  const [additionalInfo, setAdditionalInfo] = useState<AdditionalInfoData>({
    tujuanSurat: "",
    namaTempat: "",
    alamatTempat: "",
    tanggalMulai: "",
    tanggalSelesai: "",
    divisi: "",
  });

  const [proposalFile, setProposalFile] = useState<File | null>(null);
  const [teamMembers, setTeamMembers] = useState<Member[]>([]);
  const [isProposalReuploadConfirmOpen, setIsProposalReuploadConfirmOpen] =
    useState(false);
  const [isProposalUploadDialogOpen, setIsProposalUploadDialogOpen] =
    useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");
  const [autoSaveError, setAutoSaveError] = useState<string | null>(null);

  const proposalDocument = submissionDocuments.find(
    (doc) => doc.documentType === "PROPOSAL_KETUA",
  );

  const documents = [
    { id: 1, title: "Surat Kesediaan", type: "SURAT_KESEDIAAN" as const },
    { id: 2, title: "Form Permohonan", type: "FORM_PERMOHONAN" as const },
    { id: 3, title: "KRS Semester 4", type: "KRS_SEMESTER_4" as const },
    {
      id: 4,
      title: "Daftar Kumpulan Nilai",
      type: "DAFTAR_KUMPULAN_NILAI" as const,
    },
    {
      id: 5,
      title: "Bukti Pembayaran UKT",
      type: "BUKTI_PEMBAYARAN_UKT" as const,
    },
  ];

  // Fetch team data (finalized) for current user
  useEffect(() => {
    if (isUserLoading) return;
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    const loadTeam = async () => {
      try {
        setIsLoading(true);
        setLoadError(null);
        const response = await getMyTeams();

        if (response.success && Array.isArray(response.data)) {
          const fixedTeam =
            response.data.find((t) => t.status?.toUpperCase() === "FIXED") ||
            response.data[0];

          if (!fixedTeam) {
            setLoadError(
              "Tim tidak ditemukan. Silakan buat tim terlebih dahulu.",
            );
            setTeamMembers([]);
            return;
          }

          const acceptedMembers = (fixedTeam.members || []).filter(
            (m) => m.status === "ACCEPTED",
          );

          const mappedMembers: Member[] = acceptedMembers.map((m) => ({
            id: m.user.id,
            name: m.user.name,
            nim: m.user.nim,
            role: m.role === "KETUA" ? "Ketua" : "Anggota",
          }));

          // Sort: Ketua urutan atas, baru anggota
          mappedMembers.sort((a, b) => {
            if (a.role === "Ketua" && b.role !== "Ketua") return -1;
            if (a.role !== "Ketua" && b.role === "Ketua") return 1;
            return 0;
          });

          setTeamMembers(mappedMembers);
          setTeamName(fixedTeam.name || fixedTeam.code || "Tim KP");
          setTeamStatus(fixedTeam.status || "");
          setTeamId(fixedTeam.id);

          // Tentukan apakah user adalah ketua
          const currentUserMember = mappedMembers.find(
            (m) => m.id === user?.id,
          );
          setIsCurrentUserLeader(currentUserMember?.role === "Ketua");

          // Fetch submission dari database
          const submissionResponse = await getSubmissionByTeamId(fixedTeam.id);
          if (submissionResponse.success && submissionResponse.data) {
            setSubmission(submissionResponse.data);
            if (submissionResponse.data.documents) {
              setSubmissionDocuments(submissionResponse.data.documents);
            }
            // form dengan data submission pada db yang ada
            setAdditionalInfo({
              tujuanSurat: submissionResponse.data.letterPurpose || "",
              namaTempat: submissionResponse.data.companyName || "",
              alamatTempat: submissionResponse.data.companyAddress || "",
              tanggalMulai: submissionResponse.data.startDate || "",
              tanggalSelesai: submissionResponse.data.endDate || "",
              divisi: submissionResponse.data.division || "",
            });
          } else {
            // Jika belum ada submission, siapkan form kosong
            setSubmission(null);
            setSubmissionDocuments([]);
          }
        } else {
          setLoadError(response.message || "Gagal memuat data tim");
        }
      } catch (error) {
        console.error("❌ Error loading team members:", error);
        setLoadError(
          error instanceof Error ? error.message : "Gagal memuat data tim",
        );
      } finally {
        setIsLoading(false);
      }
    };

    void loadTeam();
  }, [isUserLoading, isAuthenticated, navigate]);

  const handleProposalUpload = async (file: File) => {
    if (!user) return;

    try {
      setIsLoading(true);

      // Auto-create submission hanya oleh ketua
      let currentSubmission = submission;
      if (!currentSubmission) {
        if (!isCurrentUserLeader) {
          toast.error("Submission belum dibuat oleh ketua");
          return;
        }

        const createResponse = await createSubmission(teamId, {
          letterPurpose: additionalInfo.tujuanSurat || "Draft",
          companyName: additionalInfo.namaTempat || "Belum diisi",
          companyAddress: additionalInfo.alamatTempat || "Belum diisi",
          division: additionalInfo.divisi || "Belum diisi",
          startDate: additionalInfo.tanggalMulai || new Date().toISOString(),
          endDate: additionalInfo.tanggalSelesai || new Date().toISOString(),
        });

        if (!createResponse.success || !createResponse.data) {
          toast.error(createResponse.message || "Gagal membuat submission");
          return;
        }

        currentSubmission = createResponse.data;
        setSubmission(currentSubmission);
      }

      const response = await uploadSubmissionDocument(
        currentSubmission.id,
        "PROPOSAL_KETUA",
        user.id,
        file,
        user.id,
      );

      if (response.success && response.data) {
        const docToAdd = response.data;
        setSubmissionDocuments((prev) => {
          // Hapus proposal lama jika ada
          const filtered = prev.filter(
            (doc) => doc.documentType !== "PROPOSAL_KETUA",
          );
          return [...filtered, docToAdd];
        });
        setProposalFile(file);
        toast.success("Proposal berhasil diupload");
      } else {
        toast.error(response.message || "Gagal mengupload proposal");
      }
    } catch (error) {
      console.error("❌ Error uploading proposal:", error);
      toast.error("Terjadi kesalahan saat mengupload proposal");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Fetch & refresh semua documents untuk submission dari backend
   * Ini dipanggil setelah upload untuk sync dengan dokumen dari anggota lain
   */
  const refreshSubmissionDocuments = async (submissionId: string) => {
    try {
      const docsResponse = await apiClient<SubmissionDocument[]>(
        `/api/submissions/${submissionId}/documents`,
      );

      if (docsResponse.success && docsResponse.data) {
        console.log(
          `📄 Fetched ${docsResponse.data.length} documents from server`,
          docsResponse.data,
        );
        setSubmissionDocuments(docsResponse.data);
      } else {
        console.warn("⚠️ Failed to refresh documents:", docsResponse.message);
      }
    } catch (error) {
      console.error("❌ Error refreshing documents:", error);
    }
  };

  const handleDocumentUpload = async (
    docId: number,
    memberId: string,
    file: File,
  ) => {
    try {
      setIsLoading(true);

      // Auto-create submission hanya oleh ketua; anggota harus pakai submission yang sudah ada
      let currentSubmission = submission;
      if (!currentSubmission) {
        if (!isCurrentUserLeader) {
          toast.error("Submission belum dibuat oleh ketua");
          return;
        }

        const createResponse = await createSubmission(teamId, {
          letterPurpose: additionalInfo.tujuanSurat || "Draft",
          companyName: additionalInfo.namaTempat || "Belum diisi",
          companyAddress: additionalInfo.alamatTempat || "Belum diisi",
          division: additionalInfo.divisi || "Belum diisi",
          startDate: additionalInfo.tanggalMulai || new Date().toISOString(),
          endDate: additionalInfo.tanggalSelesai || new Date().toISOString(),
        });

        if (!createResponse.success || !createResponse.data) {
          toast.error(createResponse.message || "Gagal membuat submission");
          return;
        }

        currentSubmission = createResponse.data;
        setSubmission(currentSubmission);
      }

      const docInfo = documents.find((d) => d.id === docId);
      if (!docInfo) {
        toast.error("Tipe dokumen tidak dikenali");
        return;
      }

      const response = await uploadSubmissionDocument(
        currentSubmission.id,
        docInfo.type,
        memberId,
        file,
        user?.id,
      );

      if (response.success && response.data) {
        toast.success(`${docInfo.title} berhasil diupload`);

        // ✅ KEY FIX: Re-fetch semua documents dari server
        // Ini memastikan dokumen dari user lain juga terlihat
        console.log("🔄 Re-fetching all documents from server...");
        await refreshSubmissionDocuments(currentSubmission.id);
      } else {
        toast.error(response.message || "Gagal mengupload dokumen");
      }
    } catch (error) {
      console.error("❌ Error uploading document:", error);
      toast.error("Terjadi kesalahan saat mengupload dokumen");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdditionalInfoChange = async (data: AdditionalInfoData) => {
    setAdditionalInfo(data);

    // Auto-save ke database dengan user feedback
    if (submission) {
      try {
        setAutoSaveStatus("saving");
        setAutoSaveError(null);

        const response = await updateSubmission(submission.id, {
          letterPurpose: data.tujuanSurat,
          companyName: data.namaTempat,
          companyAddress: data.alamatTempat,
          division: data.divisi,
          startDate: data.tanggalMulai,
          endDate: data.tanggalSelesai,
        });

        if (response.success) {
          console.log("✅ Auto-saved successfully");
          setAutoSaveStatus("saved");
          // Tampilkan status saved selama 2 detik
          setTimeout(() => setAutoSaveStatus("idle"), 2000);
        } else {
          throw new Error(response.message || "Gagal menyimpan perubahan");
        }
      } catch (error) {
        console.error("❌ Error auto-saving submission:", error);
        const errorMessage =
          error instanceof Error ? error.message : "Gagal menyimpan perubahan";
        setAutoSaveError(errorMessage);
        setAutoSaveStatus("error");
      }
    }
  };

  const handleSubmit = async () => {
    if (isLoading) return;
    if (!teamMembers.length) {
      toast.error(
        "Tim belum tersedia atau belum final. Lengkapi tim terlebih dahulu.",
      );
      return;
    }

    try {
      setIsLoading(true);

      // Jika submission belum ada, buat baru
      if (!submission) {
        const createResponse = await createSubmission(teamId, {
          letterPurpose: additionalInfo.tujuanSurat,
          companyName: additionalInfo.namaTempat,
          companyAddress: additionalInfo.alamatTempat,
          division: additionalInfo.divisi,
          startDate: additionalInfo.tanggalMulai,
          endDate: additionalInfo.tanggalSelesai,
        });

        if (!createResponse.success || !createResponse.data) {
          toast.error(createResponse.message || "Gagal membuat submission");
          return;
        }

        setSubmission(createResponse.data);
      }

      // Submit submission (ubah status ke PENDING_REVIEW)
      const submissionId = submission?.id || "";
      console.log("📤 Submitting submission:", { submissionId, teamId });

      if (!submissionId) {
        toast.error("Submission ID tidak valid. Silakan coba ulang.");
        return;
      }

      const submitResponse = await submitSubmission(submissionId);
      console.log("📥 Submit response:", submitResponse);

      if (submitResponse.success) {
        toast.success("Surat pengantar berhasil diajukan!");
        console.log("✅ Submission berhasil di-submit:", submitResponse.data);
        navigate("/mahasiswa/kp/surat-pengantar");
      } else {
        const errorMsg =
          submitResponse.message || "Gagal mengajukan surat pengantar";
        console.error("❌ Submit failed:", errorMsg);
        toast.error(errorMsg);
      }

      setIsConfirmDialogOpen(false);
    } catch (error) {
      console.error("❌ Error submitting:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat mengajukan surat pengantar";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreviewProposal = () => {
    if (proposalDocument?.fileUrl) {
      window.open(proposalDocument.fileUrl, "_blank", "noopener,noreferrer");
      return;
    }

    if (proposalFile) {
      try {
        const fileURL = URL.createObjectURL(proposalFile);
        window.open(fileURL, "_blank", "noopener,noreferrer");
        setTimeout(() => URL.revokeObjectURL(fileURL), 100);
        return;
      } catch {
        toast.error("Tidak dapat menampilkan pratinjau file.");
        return;
      }
    }

    toast.error("File proposal belum tersedia untuk dipreview.");
  };

  const handleConfirmProposalReupload = () => {
    setIsProposalReuploadConfirmOpen(false);
    setIsProposalUploadDialogOpen(true);
  };

  // Validasi kelengkapan dokumen dan form
  const validateSubmission = () => {
    const missingItems: string[] = [];

    // 1. Cek proposal ketua
    if (!proposalDocument) {
      missingItems.push("Surat Proposal (Ketua Tim)");
    }

    // 2. Cek dokumen pribadi setiap anggota
    teamMembers.forEach((member) => {
      documents.forEach((doc) => {
        const uploaded = submissionDocuments.some(
          (submittedDoc) =>
            submittedDoc.documentType === doc.type &&
            submittedDoc.memberUserId === member.id,
        );
        if (!uploaded) {
          missingItems.push(`${doc.title} - ${member.name}`);
        }
      });
    });

    // 3. Cek keterangan lain
    if (!additionalInfo.tujuanSurat?.trim()) {
      missingItems.push("Tujuan Surat");
    }
    if (!additionalInfo.namaTempat?.trim()) {
      missingItems.push("Nama Tempat KP");
    }
    if (!additionalInfo.alamatTempat?.trim()) {
      missingItems.push("Alamat Tempat KP");
    }
    if (!additionalInfo.divisi?.trim()) {
      missingItems.push("Nama Unit/Divisi");
    }
    if (!additionalInfo.tanggalMulai) {
      missingItems.push("Tanggal Mulai KP");
    }
    if (!additionalInfo.tanggalSelesai) {
      missingItems.push("Tanggal Selesai KP");
    }

    return {
      isValid: missingItems.length === 0,
      missingItems,
    };
  };

  if (isUserLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Memuat data tim...</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="space-y-4">
        <Alert variant="destructive">
          <AlertDescription>{loadError}</AlertDescription>
        </Alert>
        <Button onClick={() => navigate("/mahasiswa/kp/buat-tim")}>
          Kembali ke Buat Tim
        </Button>
      </div>
    );
  }

  return (
    <>
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Halaman Pengajuan Syarat Kerja Praktik
        </h1>
        <p className="text-muted-foreground">
          Upload dokumen-dokumen yang diperlukan untuk melaksanakan Kerja
          Praktik
        </p>
        {teamName && (
          <p className="text-sm text-muted-foreground mt-2">
            Tim: {teamName} ({teamMembers.length} anggota, status{" "}
            {teamStatus || "-"})
          </p>
        )}
      </div>

      {/* Info Alert */}
      <Alert className="mb-8 border-l-4 border-primary bg-primary/5">
        <Info className="h-5 w-5 text-primary" />
        <AlertDescription className="text-foreground">
          Pastikan semua dokumen telah diupload sebelum melakukan pengajuan
        </AlertDescription>
      </Alert>

      <Card className="mb-8">
        <CardContent className="p-6">
          {/* Surat Proposal Section */}
          <div className="mb-8">
            <CardHeader className="px-0 pt-0">
              <CardTitle className="text-xl font-semibold text-foreground">
                Surat Proposal
              </CardTitle>
            </CardHeader>
            <Separator className="mb-4" />
            <div className="flex flex-wrap items-start gap-3">
              <div
                className={
                  isCurrentUserLeader && !proposalDocument ? "flex-grow" : ""
                }
              >
                {isCurrentUserLeader ? (
                  proposalDocument ? (
                    <div className="mb-2">
                      <p className="block font-medium mb-2">
                        Upload Surat Proposal (Ketua Tim)
                      </p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Button
                          size="sm"
                          className="w-full sm:w-auto"
                          onClick={() => setIsProposalReuploadConfirmOpen(true)}
                          disabled={submission?.status === "PENDING_REVIEW"}
                        >
                          Terupload
                        </Button>
                        {(proposalDocument || proposalFile) && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={handlePreviewProposal}
                                  className="text-muted-foreground hover:text-foreground"
                                >
                                  <Eye className="size-5" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Preview File</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Klik untuk upload ulang proposal ketua tim.
                      </p>
                    </div>
                  ) : (
                    <FileUpload
                      label="Upload Surat Proposal (Ketua Tim)"
                      onFileChange={handleProposalUpload}
                      disabled={submission?.status === "PENDING_REVIEW"}
                    />
                  )
                ) : (
                  <div className="mb-2">
                    <p className="block font-medium mb-2">
                      Upload Surat Proposal (Ketua Tim)
                    </p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Button
                        size="sm"
                        className={
                          proposalDocument
                            ? "w-full sm:w-auto opacity-50 cursor-not-allowed"
                            : "w-full sm:w-auto opacity-50 cursor-not-allowed"
                        }
                        variant={proposalDocument ? "default" : "destructive"}
                        disabled
                      >
                        {proposalDocument ? "Terupload" : "Belum diupload"}
                      </Button>
                      {proposalDocument && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={handlePreviewProposal}
                                className="text-muted-foreground hover:text-foreground"
                              >
                                <Eye className="size-5" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Preview File</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Proposal hanya bisa diupload oleh ketua tim.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Lampiran Berkas Pribadi Section */}
          <div className="mb-8">
            <CardHeader className="px-0 pt-0">
              <CardTitle className="text-xl font-semibold text-foreground">
                Lampiran Berkas Pribadi
              </CardTitle>
            </CardHeader>
            <Separator className="mb-4" />
            {documents.map((document) => (
              <DocumentDropdown
                key={document.id}
                document={document}
                members={teamMembers}
                documents={submissionDocuments}
                currentUserId={user?.id}
                onUpload={handleDocumentUpload}
                disabled={submission?.status === "PENDING_REVIEW"}
              />
            ))}
          </div>

          {/* Keterangan Lain Section */}
          <div className="mb-8">
            <AdditionalInfoForm
              initialData={additionalInfo}
              onDataChange={handleAdditionalInfoChange}
              isEditable={
                isCurrentUserLeader && submission?.status !== "PENDING_REVIEW"
              }
            />

            {/* Auto-save Status Indicator
            {autoSaveStatus !== "idle" && (
              <div className="mt-4 flex items-center gap-2">
                {autoSaveStatus === "saving" && (
                  <>
                    <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-blue-600">Menyimpan...</span>
                  </>
                )}
                {autoSaveStatus === "saved" && (
                  <>
                    <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-green-600">Tersimpan</span>
                  </>
                )}
                {autoSaveStatus === "error" && (
                  <>
                    <div className="h-2 w-2 bg-red-500 rounded-full"></div>
                    <span className="text-sm text-red-600">
                      {autoSaveError || "Gagal menyimpan"}
                    </span>
                  </>
                )}
              </div>
            )} */}
          </div>

          {/* Submit Button */}
          <div className="text-center mt-8">
            <Button
              onClick={() => {
                const validation = validateSubmission();
                if (!validation.isValid) {
                  toast.error(`Harap lengkapi semua data yang diperlukan!`, {
                    duration: 6000,
                  });
                  return;
                }
                setIsConfirmDialogOpen(true);
              }}
              size="lg"
              className="px-8 py-3 font-medium text-lg"
              disabled={
                !isCurrentUserLeader || submission?.status === "PENDING_REVIEW"
              }
            >
              {submission?.status === "PENDING_REVIEW"
                ? "Diajukan"
                : "Ajukan Surat Pengantar"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Navigation Buttons - Always show */}
      <div className="flex justify-between mt-8">
        <Button variant="secondary" asChild className="px-6 py-3 font-medium">
          <Link to="/mahasiswa/kp/buat-tim">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Sebelumnya
          </Link>
        </Button>
        <Button
          className="px-6 py-3 font-medium"
          disabled={submission?.status !== "PENDING_REVIEW"}
          onClick={() => {
            if (submission?.status === "PENDING_REVIEW") {
              navigate("/mahasiswa/kp/surat-pengantar");
            }
          }}
        >
          Selanjutnya
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
      <ConfirmDialog
        open={isProposalReuploadConfirmOpen}
        onOpenChange={setIsProposalReuploadConfirmOpen}
        title="Upload Ulang Proposal?"
        description="File proposal yang lama akan diganti. Lanjutkan upload ulang?"
        onConfirm={handleConfirmProposalReupload}
        confirmText="Ya, Upload Ulang"
        cancelText="Batal"
      />

      <FileUploadDialog
        open={isProposalUploadDialogOpen}
        onOpenChange={setIsProposalUploadDialogOpen}
        onFileUpload={(file) => void handleProposalUpload(file)}
        memberName="Ketua Tim"
        documentTitle="Surat Proposal"
      />

      <ConfirmDialog
        open={isConfirmDialogOpen}
        onOpenChange={setIsConfirmDialogOpen}
        title="Konfirmasi Pengajuan"
        description={
          <>
            Apakah Anda yakin ingin mengajukan surat pengantar? Pastikan semua
            data dan dokumen yang Anda masukkan sudah benar.
            <br />
            <br />
            <span className="block">
              <span className="font-semibold text-red-700">Peringatan:</span>{" "}
              <span className="font-semibold inline-block">
                Anda tidak akan dapat mengubah data pengajuan hingga proses
                review selesai.
              </span>
            </span>
          </>
        }
        onConfirm={handleSubmit}
        confirmText="Ya, Ajukan"
        cancelText="Batal"
        variant="default"
      />
    </>
  );
}

export default SubmissionPage;
