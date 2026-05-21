import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router";
import {
  UserPlus,
  CheckCircle,
  Copy,
  User,
  ArrowLeft,
  Building2,
  Mail,
  Phone,
  Briefcase,
  MapPin,
  Info,
  Clock,
  UserCircle,
  XCircle,
  AlertCircle,
  Pencil,
  Trash,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { Badge } from "~/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";

import { 
  getCompleteInternshipData, 
  requestMentor, 
  editMentorRequest,
  deleteMentorRequest,
  joinLeaderMentor,
  type CompleteInternshipData,
  type MentorRequestPayload 
} from "~/feature/during-intern/services/student-api";

// Local types for the page
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
  nip?: string;
  address?: string;
  rejectionReason?: string;
}

export interface MentorRequest {
  mentorName: string;
  mentorEmail: string;
  mentorPhone: string;
  mentorNip?: string;
  company: string;
  position: string;
  address: string;
}

function FieldMentorPage() {
  const navigate = useNavigate();
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [isLoadingMentor, setIsLoadingMentor] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showJoinDialog, setShowJoinDialog] = useState(false);
  const [completeData, setCompleteData] = useState<CompleteInternshipData | null>(null);
  const [mentorRequest, setMentorRequest] = useState<MentorRequest>({
    mentorName: "",
    mentorEmail: "",
    mentorPhone: "",
    mentorNip: "",
    company: "",
    position: "",
    address: "",
  });
  const [currentMentor, setCurrentMentor] = useState<FieldMentor | null>(null);
  const [isEditingPending, setIsEditingPending] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const loadMentorData = useCallback(async () => {
    setIsLoadingMentor(true);
    try {
      const response = await getCompleteInternshipData();

      if (!response.success || !response.data) {
        setIsLoadingMentor(false);
        return;
      }

      setCompleteData(response.data);
      const internship = response.data.internship;
      const mentor = response.data.mentor;
      const submission = response.data.submission;
      const internshipStatus = internship?.status;

      // Pre-fill company and address from submission if available
      if (submission) {
        setMentorRequest((prev) => ({
          ...prev,
          company: submission.company || "",
          address: submission.address || "",
        }));
      }

      if (mentor) {
        // Normalize status to lowercase to match UI switch logic
        const rawStatus = (mentor.status || "pending").toLowerCase();
        const status = (["pending", "registered", "approved", "rejected"].includes(rawStatus) 
          ? rawStatus 
          : (internshipStatus === "AKTIF" ? "approved" : "pending")) as FieldMentor["status"];

        setCurrentMentor({
          id: mentor.id,
          code: (mentor as any).code || `REQ-${mentor.id.slice(0, 8)}`,
          name: mentor.name || "-",
          email: mentor.email || "-",
          company: mentor.company || "-",
          position: mentor.position || "-",
          phone: mentor.phone || "-",
          status: status,
          createdAt: mentor.createdAt || internship.createdAt,
          registeredAt: mentor.createdAt || internship.updatedAt,
          approvedAt: status === "approved" ? internship.updatedAt : undefined,
          photo: (mentor as any).photo || (mentor as any).photoUrl,
          nip: (mentor as any).nip || "",
          address: (mentor as any).address || (mentor as any).companyAddress || mentor.company || "-",
          rejectionReason: mentor.rejectionReason,
        });
      } else {
        setCurrentMentor(null);
      }
    } catch (error) {
      console.error("Error loading mentor data:", error);
      toast.error("Gagal memuat data mentor.");
    } finally {
      setIsLoadingMentor(false);
    }
  }, []);

  useEffect(() => {
    loadMentorData();
  }, [loadMentorData]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setMentorRequest((prev) => ({ ...prev, [name]: value }));
  };

  const handleJoinLeaderMentor = async () => {
    setShowJoinDialog(false);
    setIsSubmitting(true);
    try {
      const response = await joinLeaderMentor();
      if (response.success) {
        toast.success("Berhasil mengikuti pembimbing lapangan ketua tim!");
        await loadMentorData();
      } else {
        toast.error(response.message || "Gagal mengikuti mentor ketua tim.");
      }
    } catch (error) {
      console.error("Error joining leader mentor:", error);
      toast.error("Terjadi kesalahan sistem.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple validation
    if (!mentorRequest.mentorEmail.includes('@')) {
      toast.error("Email mentor tidak valid.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: MentorRequestPayload = {
        mentorName: mentorRequest.mentorName,
        mentorEmail: mentorRequest.mentorEmail,
        mentorPhone: mentorRequest.mentorPhone,
        mentorNip: mentorRequest.mentorNip || undefined,
        companyName: mentorRequest.company,
        position: mentorRequest.position,
        companyAddress: mentorRequest.address,
      };

      let response;
      if (isEditingPending && currentMentor?.id) {
        response = await editMentorRequest(currentMentor.id, payload);
      } else {
        response = await requestMentor(payload);
      }

      if (response.success) {
        toast.success(
          isEditingPending
            ? "Pengajuan mentor berhasil diperbarui!"
            : "Pengajuan mentor berhasil dikirim! Menunggu persetujuan dari Dosen PA.",
        );
        setShowRequestForm(false);
        setIsEditingPending(false);
        setMentorRequest({
          mentorName: "",
          mentorEmail: "",
          mentorPhone: "",
          mentorNip: "",
          company: mentorRequest.company, // Keep company info
          position: "",
          address: mentorRequest.address, // Keep address info
        });
        // Refresh data to show pending status
        await loadMentorData();
      } else {
        toast.error(response.message || "Gagal mengirim pengajuan mentor.");
      }
    } catch (error) {
      console.error("Error submitting mentor request:", error);
      toast.error("Terjadi kesalahan saat mengirim pengajuan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditPendingRequest = () => {
    if (!currentMentor) return;
    setMentorRequest({
      mentorName: currentMentor.name,
      mentorEmail: currentMentor.email,
      mentorPhone: currentMentor.phone !== "-" ? currentMentor.phone : "",
      mentorNip: currentMentor.nip || "",
      company: currentMentor.company,
      position: currentMentor.position,
      address: currentMentor.address !== "-" ? (currentMentor.address ?? "") : "",
    });
    setIsEditingPending(true);
    setShowRequestForm(true);
  };

  const handleDeletePendingRequest = async () => {
    if (!currentMentor?.id) return;
    setIsSubmitting(true);
    try {
      const response = await deleteMentorRequest(currentMentor.id);
      if (response.success) {
        toast.success("Pengajuan mentor berhasil dibatalkan dan dihapus.");
        setCurrentMentor(null);
        await loadMentorData();
      } else {
        toast.error(response.message || "Gagal membatalkan pengajuan");
      }
    } catch (error) {
      console.error("Error deleting mentor request:", error);
      toast.error("Terjadi kesalahan saat membatalkan pengajuan.");
    } finally {
      setIsSubmitting(false);
      setShowDeleteDialog(false);
    }
  };

  const getStatusBadge = (status: FieldMentor["status"]) => {
    switch (status) {
      case "pending":
        return (
          <Badge
            variant="outline"
            className="bg-amber-50 text-amber-700 border-amber-200 px-3 py-1 font-medium animate-pulse"
          >
            <Clock className="mr-2 h-3.5 w-3.5" />
            Menunggu Persetujuan Dosen PA
          </Badge>
        );
      case "registered":
        return (
          <Badge
            variant="secondary"
            className="bg-blue-100 text-blue-800 hover:bg-blue-100"
          >
            <Info className="mr-1 h-3 w-3" />
            Email Aktivasi Terkirim
          </Badge>
        );
      case "approved":
        return (
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200 px-3 py-1 font-medium"
          >
            <CheckCircle className="mr-2 h-3.5 w-3.5" />
            Disetujui - Aktif
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="destructive">
            <XCircle className="mr-1 h-3 w-3" />
            Ditolak
          </Badge>
        );
      default:
        return null;
    }
  };

  const getInitials = (name: string) => {
    if (!name) return "??";
    return name
      .split(" ")
      .filter(Boolean)
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const HeroSection = () => (
    <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-blue-900 via-indigo-950 to-slate-950 p-8 sm:p-10 text-white shadow-xl mb-8 border border-white/10">
      {/* Background decorative glow elements */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500 rounded-full blur-[100px] opacity-25 mix-blend-screen pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-indigo-500 rounded-full blur-[80px] opacity-20 mix-blend-screen pointer-events-none" />
      <Sparkles className="absolute top-6 right-6 h-6 w-6 text-blue-300 opacity-40 pointer-events-none" />
      
      <div className="relative z-10 space-y-3 max-w-3xl">
        <div className="inline-flex items-center rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold text-blue-200 backdrop-blur-md border border-white/20 shadow-xs">
          <UserCircle className="mr-2 h-4 w-4 text-blue-400" />
          Fase Pelaksanaan Magang
        </div>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight bg-linear-to-r from-white via-blue-50 to-blue-200 bg-clip-text text-transparent animate-fade-in">
          Pendaftaran Pembimbing Lapangan
        </h1>
        <p className="text-blue-100/80 leading-relaxed text-sm sm:text-base font-medium max-w-2xl">
          Daftarkan pembimbing lapangan (mentor) dari instansi tempat Anda melaksanakan Kerja Praktik. Pengajuan Anda akan ditinjau dan divalidasi oleh Dosen PA.
        </p>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-8 bg-slate-50/10 dark:bg-slate-950/10 min-h-[calc(100svh-3.5rem)]">
      <HeroSection />

      {/* Action Header & Back Button */}
      <div className="flex items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800/60 pb-5">
        <Button 
          variant="outline" 
          onClick={() => navigate(-1)}
          className="border-slate-200/60 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100/50 dark:hover:bg-slate-950/40 rounded-xl font-bold shadow-2xs"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali ke Pelaksanaan
        </Button>
      </div>

      {/* Rejection Alert */}
      {currentMentor?.status === "rejected" && (
        <Alert variant="destructive" className="bg-red-50/70 border-red-200/60 text-red-950 dark:bg-red-950/20 dark:border-red-900/30 dark:text-red-300 rounded-2xl shadow-sm">
          <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
          <AlertTitle className="font-extrabold text-base">Pengajuan Mentor Ditolak</AlertTitle>
          <AlertDescription className="mt-2 text-sm">
            <p className="font-semibold text-red-900 dark:text-red-400">Alasan Penolakan: {currentMentor.rejectionReason || "Data mentor tidak sesuai kriteria Kerja Praktik."}</p>
            <p className="mt-2 opacity-90">Silakan ajukan kembali dengan data mentor yang baru atau diskusikan dengan Dosen PA Anda.</p>
            <Button 
              variant="destructive" 
              size="sm" 
              className="mt-4 bg-red-650 hover:bg-red-700 text-white font-extrabold shadow-sm rounded-xl px-4"
              onClick={() => {
                setCurrentMentor(null);
                setShowRequestForm(true);
              }}
            >
              Ajukan Mentor Baru
            </Button>
          </AlertDescription>
        </Alert>
      )}



      {/* Current Mentor Section — hidden while editing */}
      {currentMentor && currentMentor.status !== "rejected" && !showRequestForm && (
        <Card className="relative overflow-hidden rounded-2xl border border-slate-200/60 dark:border-slate-800/60 bg-white/85 dark:bg-slate-900/85 shadow-md backdrop-blur-xl mb-8">
          <div className={`absolute top-0 left-0 w-1.5 h-full bg-linear-to-b ${currentMentor.status === "approved" ? "from-emerald-450 to-teal-600" : "from-amber-400 to-orange-550"}`} />
          <CardHeader className="pt-6 pb-4 border-b border-slate-100 dark:border-slate-800">
            <CardTitle className="text-xl font-bold flex items-center gap-2.5">
              <CheckCircle className={`h-5 w-5 ${currentMentor.status === "approved" ? "text-emerald-500" : "text-amber-500"}`} />
              Pembimbing Lapangan Terdaftar
            </CardTitle>
            <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
              Detail data pembimbing lapangan (mentor) dari instansi magang Anda.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 sm:p-8 space-y-6">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              {/* Profile Photo */}
              <div className="flex flex-col items-center shrink-0">
                <Avatar className="h-28 w-28 border-4 border-slate-50 shadow-sm">
                  <AvatarImage
                    src={currentMentor.photo}
                    alt={currentMentor.name}
                  />
                  <AvatarFallback className="text-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-650 dark:text-indigo-455 font-extrabold">
                    {getInitials(currentMentor.name)}
                  </AvatarFallback>
                </Avatar>
                {currentMentor.status === "pending" && (
                  <p className="text-[10px] text-slate-450 dark:text-slate-500 mt-3 text-center max-w-[120px] leading-tight font-medium">
                    Foto & detail tambahan akan aktif setelah mentor registrasi SSO
                  </p>
                )}
              </div>

              {/* Mentor Data Grid */}
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                <div className="rounded-xl border border-slate-100 dark:border-slate-850 p-4 bg-slate-50/50 dark:bg-slate-950/40">
                  <Label className="text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                    Nama Mentor
                  </Label>
                  <p className="font-extrabold text-slate-850 dark:text-slate-100 mt-0.5 leading-tight flex items-center gap-2 text-sm sm:text-base">
                    <User className="h-4 w-4 text-slate-400" />
                    {currentMentor.name}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-100 dark:border-slate-850 p-4 bg-slate-50/50 dark:bg-slate-950/40">
                  <Label className="text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-wider font-sans">
                    NIP / NIK Karyawan
                  </Label>
                  <p className="font-extrabold text-slate-800 dark:text-slate-200 mt-0.5 text-sm sm:text-base">
                    {currentMentor.nip || <span className="text-slate-400 italic font-normal text-xs">Akan diverifikasi mentor saat aktivasi</span>}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-100 dark:border-slate-850 p-4 bg-slate-50/50 dark:bg-slate-950/40">
                  <Label className="text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-wider">Email Mentor</Label>
                  <p className="font-extrabold text-slate-850 dark:text-slate-200 mt-0.5 leading-tight flex items-center gap-2 text-xs sm:text-sm">
                    <Mail className="h-4 w-4 text-slate-400" />
                    {currentMentor.email}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-100 dark:border-slate-850 p-4 bg-slate-50/50 dark:bg-slate-950/40">
                  <Label className="text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                    No. Telepon / WhatsApp
                  </Label>
                  <p className="font-extrabold text-slate-850 dark:text-slate-200 mt-0.5 leading-tight flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-slate-400" />
                    {currentMentor.phone}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-100 dark:border-slate-850 p-4 bg-slate-50/50 dark:bg-slate-950/40">
                  <Label className="text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                    Nama Perusahaan / Instansi
                  </Label>
                  <p className="font-extrabold text-slate-850 dark:text-slate-200 mt-0.5 leading-tight flex items-center gap-2 text-sm">
                    <Building2 className="h-4 w-4 text-slate-400" />
                    {currentMentor.company}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-100 dark:border-slate-850 p-4 bg-slate-50/50 dark:bg-slate-950/40">
                  <Label className="text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                    Jabatan Kerja
                  </Label>
                  <p className="font-extrabold text-slate-850 dark:text-slate-200 mt-0.5 leading-tight flex items-center gap-2 text-sm">
                    <Briefcase className="h-4 w-4 text-slate-400" />
                    {currentMentor.position}
                  </p>
                </div>
                <div className="md:col-span-2 rounded-xl border border-slate-100 dark:border-slate-850 p-4 bg-slate-50/50 dark:bg-slate-950/40 space-y-1">
                  <Label className="text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-wider flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5" />
                    Alamat Lengkap Perusahaan
                  </Label>
                  <p className="font-extrabold text-slate-700 dark:text-slate-300 leading-relaxed text-sm">
                    {currentMentor.address || "-"}
                  </p>
                </div>
                <div className="md:col-span-2 space-y-2 pt-2">
                  <Label className="text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-wider block">
                    Status Pengajuan
                  </Label>
                  <div>{getStatusBadge(currentMentor.status)}</div>
                </div>
              </div>
            </div>

            {/* Approval Waiting Section with Edit/Delete actions */}
            {currentMentor.status === "pending" && (
              <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                <div className="p-5 bg-amber-50/40 border border-amber-250/50 dark:bg-amber-950/10 dark:border-amber-900/30 rounded-xl flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="bg-amber-100/80 dark:bg-amber-950/50 p-2.5 rounded-xl shrink-0 shadow-2xs">
                      <Clock className="h-5 w-5 text-amber-600 dark:text-amber-450" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-amber-900 dark:text-amber-300 text-sm sm:text-base">
                        Sedang Ditinjau Dosen PA
                      </h4>
                      <p className="text-slate-500 dark:text-slate-400 mt-1 leading-relaxed text-xs">
                        Pengajuan sedang dalam proses evaluasi oleh Dosen PA Anda. Selama proses ini berlangsung, Anda masih dapat mengubah detail atau membatalkan pengajuan ini.
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-row sm:flex-col gap-2.5 w-full sm:w-auto shrink-0 self-center">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 sm:flex-none border-amber-300 text-amber-800 hover:bg-amber-100 dark:border-amber-900 dark:text-amber-400 dark:hover:bg-amber-950/40 gap-2 font-bold shadow-2xs"
                      onClick={handleEditPendingRequest}
                      disabled={isSubmitting}
                    >
                      <Pencil className="h-4 w-4" />
                      Edit Data
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 sm:flex-none border-red-200 text-red-700 hover:bg-red-50 dark:border-red-950 dark:text-red-400 dark:hover:bg-red-950/20 gap-2 font-bold shadow-2xs"
                      onClick={() => setShowDeleteDialog(true)}
                      disabled={isSubmitting}
                    >
                      <Trash className="h-4 w-4" />
                      Batalkan
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Empty State / Join Leader / Request Button */}
      {!currentMentor && !showRequestForm && !isLoadingMentor && (
        <div className="space-y-6">
          {/* Join Leader Mentor Option */}
          {completeData?.team?.leaderMentor && (
            <Card className="relative overflow-hidden rounded-2xl border-2 border-indigo-500/30 bg-indigo-50/30 dark:bg-indigo-950/10 shadow-md mb-6">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-500" />
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2.5 text-indigo-950 dark:text-indigo-300 font-bold">
                  <UserCircle className="h-5 w-5 text-indigo-500" />
                  Gunakan Mentor Ketua Tim ({completeData.team.leaderMentor.name})?
                </CardTitle>
                <CardDescription className="text-xs text-indigo-900/70 dark:text-slate-400">
                  Ketua tim Anda sudah memiliki mentor lapangan yang terdaftar dan disetujui Dosen PA. Anda disarankan mengikuti mentor yang sama demi sinkronisasi tim.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col md:flex-row items-stretch md:items-center gap-6">
                <div className="flex-1 grid grid-cols-2 gap-3 text-xs bg-white/70 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                  <div className="space-y-1">
                    <span className="text-slate-400 uppercase tracking-wider text-[10px] font-bold">Nama Mentor</span>
                    <p className="font-extrabold text-slate-800 dark:text-slate-200">{completeData.team.leaderMentor.name}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-slate-400 uppercase tracking-wider text-[10px] font-bold">Perusahaan / Instansi</span>
                    <p className="font-extrabold text-slate-800 dark:text-slate-200">{completeData.team.leaderMentor.company}</p>
                  </div>
                </div>
                <Button 
                  size="lg" 
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold shadow-md shrink-0 self-center rounded-xl"
                  onClick={() => setShowJoinDialog(true)}
                  disabled={isSubmitting}
                >
                  <Copy className="mr-2 h-4 w-4" />
                  {isSubmitting ? "Memproses..." : "Ikuti Mentor Ketua"}
                </Button>
              </CardContent>
            </Card>
          )}

          <Card className="text-center py-12 border border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-slate-900 rounded-2xl shadow-sm">
            <CardContent className="space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-slate-950/40 text-slate-400 dark:text-slate-600 flex items-center justify-center mx-auto border border-slate-100 dark:border-slate-850 shadow-2xs">
                <UserPlus className="h-8 w-8 text-indigo-500" />
              </div>
              <div className="space-y-2 max-w-md mx-auto">
                <h3 className="text-lg font-black text-slate-800 dark:text-slate-200">
                  {completeData?.team?.leaderMentor ? "Atau Daftarkan Mentor Berbeda" : "Belum Ada Mentor Terdaftar"}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {completeData?.team?.leaderMentor 
                    ? "Jika Anda memiliki mentor lapangan yang berbeda dengan ketua tim, silakan daftarkan dengan mengisi formulir baru."
                    : "Anda belum memiliki mentor lapangan yang terdaftar di sistem SIKP. Silakan ajukan pembimbing lapangan untuk memulai pengawasan Kerja Praktik."}
                </p>
              </div>
              <Button 
                size="lg" 
                variant={completeData?.team?.leaderMentor ? "outline" : "default"}
                className={completeData?.team?.leaderMentor 
                  ? "border-slate-300 hover:bg-slate-50 dark:border-slate-800 font-bold rounded-xl" 
                  : "bg-linear-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 font-extrabold shadow-md rounded-xl"}
                onClick={() => setShowRequestForm(true)}
              >
                <UserPlus className="mr-2 h-5 w-5" />
                {completeData?.team?.leaderMentor ? "Daftarkan Mentor Sendiri" : "Ajukan Mentor Lapangan"}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {!currentMentor && !showRequestForm && isLoadingMentor && (
        <Card className="text-center py-12 border border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-slate-900 rounded-2xl shadow-sm">
          <CardContent className="space-y-4">
            <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-950/40 text-slate-400 dark:text-slate-650 flex items-center justify-center mx-auto animate-pulse">
              <UserPlus className="h-8 w-8 text-indigo-500" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-extrabold text-slate-800 dark:text-slate-200">Memuat Data Mentor</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Kami sedang memproses data mentor yang terkait dengan Kerja Praktik Anda. Mohon tunggu...
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Request Form */}
      {showRequestForm && (
        <Card className="relative overflow-hidden rounded-2xl border border-slate-200/60 dark:border-slate-800/60 bg-white/90 dark:bg-slate-900/90 shadow-md backdrop-blur-xl">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-linear-to-b from-blue-400 to-indigo-600" />
          <CardHeader className="pt-6 pb-4 border-b border-slate-100 dark:border-slate-800">
            <CardTitle className="text-xl font-bold flex items-center gap-2.5">
              {isEditingPending ? (
                <Pencil className="h-5 w-5 text-amber-500" />
              ) : (
                <UserPlus className="h-5 w-5 text-indigo-500" />
              )}
              {isEditingPending
                ? "Perbarui Pengajuan Mentor Lapangan"
                : "Formulir Pendaftaran Mentor Lapangan"}
            </CardTitle>
            <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
              {isEditingPending
                ? "Sesuaikan kembali informasi mentor lapangan instansi Kerja Praktik Anda."
                : "Masukkan data lengkap mentor/pembimbing lapangan dari instansi tempat Kerja Praktik Anda dilaksanakan."}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 sm:p-8">
            <form onSubmit={handleSubmitRequest} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="mentorName" className="text-slate-700 dark:text-slate-350 text-xs font-bold uppercase tracking-wider">
                    Nama Lengkap Mentor <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
                    <Input
                      id="mentorName"
                      name="mentorName"
                      required
                      className="pl-11 rounded-xl border-slate-200 focus:border-indigo-500"
                      placeholder="Contoh: Budi Santoso, S.Kom."
                      value={mentorRequest.mentorName}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mentorEmail" className="text-slate-700 dark:text-slate-350 text-xs font-bold uppercase tracking-wider">
                    Email Aktif Mentor <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
                    <Input
                      id="mentorEmail"
                      name="mentorEmail"
                      type="email"
                      required
                      className="pl-11 rounded-xl border-slate-200 focus:border-indigo-500"
                      placeholder="budi.santoso@perusahaanmagang.com"
                      value={mentorRequest.mentorEmail}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mentorPhone" className="text-slate-700 dark:text-slate-350 text-xs font-bold uppercase tracking-wider">
                    No. Telepon / WhatsApp <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
                    <Input
                      id="mentorPhone"
                      name="mentorPhone"
                      type="tel"
                      required
                      className="pl-11 rounded-xl border-slate-200 focus:border-indigo-500"
                      placeholder="08xxxxxxxxxx"
                      value={mentorRequest.mentorPhone}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company" className="text-slate-700 dark:text-slate-350 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                    Nama Perusahaan / Instansi <span className="text-slate-400 text-[10px] font-normal uppercase tracking-normal">(Auto-fill dari Pengajuan)</span>
                  </Label>
                  <div className="relative">
                    <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
                    <Input
                      id="company"
                      name="company"
                      readOnly
                      className="pl-11 bg-slate-50/70 dark:bg-slate-950/20 cursor-not-allowed border-dashed rounded-xl"
                      placeholder="PT. Telekomunikasi Indonesia"
                      value={mentorRequest.company}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="position" className="text-slate-700 dark:text-slate-350 text-xs font-bold uppercase tracking-wider">
                    Jabatan Kerja <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
                    <Input
                      id="position"
                      name="position"
                      required
                      className="pl-11 rounded-xl border-slate-200 focus:border-indigo-500"
                      placeholder="Contoh: Manager IT, Senior Web Developer"
                      value={mentorRequest.position}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mentorNip" className="text-slate-700 dark:text-slate-350 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                    NIP / NIK Pegawai <span className="text-slate-400 text-[10px] font-normal uppercase tracking-normal">(Opsional)</span>
                  </Label>
                  <div className="relative">
                    <UserCircle className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
                    <Input
                      id="mentorNip"
                      name="mentorNip"
                      className="pl-11 rounded-xl border-slate-200 focus:border-indigo-500"
                      placeholder="Nomor Induk Kepegawaian (jika ada)"
                      value={mentorRequest.mentorNip}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="address" className="text-slate-700 dark:text-slate-350 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                    Alamat Lengkap Perusahaan <span className="text-slate-400 text-[10px] font-normal uppercase tracking-normal">(Auto-fill dari Pengajuan)</span>
                  </Label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-400" />
                    <Textarea
                      id="address"
                      name="address"
                      readOnly
                      rows={3}
                      className="pl-11 bg-slate-50/70 dark:bg-slate-950/20 cursor-not-allowed border-dashed rounded-xl leading-relaxed"
                      placeholder="Alamat kantor / lokasi magang Anda"
                      value={mentorRequest.address}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3.5 pt-4 border-t border-slate-100 dark:border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-xl border-slate-200 hover:bg-slate-50 font-bold"
                  onClick={() => {
                    setShowRequestForm(false);
                    setIsEditingPending(false);
                    setMentorRequest({
                      mentorName: "",
                      mentorEmail: "",
                      mentorPhone: "",
                      mentorNip: "",
                      company: mentorRequest.company,
                      position: "",
                      address: mentorRequest.address,
                    });
                  }}
                >
                  Batal
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="bg-linear-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 font-extrabold shadow-md rounded-xl px-5"
                >
                  {isEditingPending ? (
                    <Pencil className="mr-2 h-4 w-4" />
                  ) : (
                    <UserPlus className="mr-2 h-4 w-4" />
                  )}
                  {isSubmitting
                    ? "Menyimpan..."
                    : isEditingPending
                    ? "Simpan Perubahan"
                    : "Kirim Pengajuan Mentor"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Panduan & Status Guide Section (Always Visible) */}
      <div className="space-y-6 pt-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="relative overflow-hidden rounded-2xl border border-slate-200/60 dark:border-slate-800/60 bg-white/80 dark:bg-slate-900/80 shadow-md backdrop-blur-xl">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-linear-to-b from-blue-400 to-indigo-600" />
              <CardHeader className="pt-6 pb-4 border-b border-slate-100 dark:border-slate-800">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Info className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  Panduan Pendaftaran Pembimbing Lapangan
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-5">
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                  Demi kelancaran pemantauan logbook harian, rekapitulasi penilaian industri, dan koordinasi dengan instansi magang, silakan ikuti panduan berikut:
                </p>
                
                <div className="space-y-5">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-650 dark:text-blue-400 flex items-center justify-center font-extrabold text-sm shadow-2xs border border-blue-100/50">
                      1
                    </div>
                    <div>
                      <p className="font-extrabold text-slate-800 dark:text-slate-200 text-sm">Input Detail Mentor dengan Akurat</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                        Pastikan <strong className="text-indigo-600 dark:text-indigo-400 font-semibold">Email Mentor</strong> yang dimasukkan adalah email aktif. Email ini akan didaftarkan sebagai username SSO mereka.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-655 dark:text-blue-400 flex items-center justify-center font-extrabold text-sm shadow-2xs border border-blue-100/50">
                      2
                    </div>
                    <div>
                      <p className="font-extrabold text-slate-800 dark:text-slate-200 text-sm">Persetujuan & Verifikasi Dosen PA</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                        Setelah diajukan, Dosen PA (Pembimbing Akademik) Anda akan memverifikasi permohonan. Anda dapat memantau status persetujuan secara real-time di halaman ini.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-650 dark:text-blue-400 flex items-center justify-center font-extrabold text-sm shadow-2xs border border-blue-100/50">
                      3
                    </div>
                    <div>
                      <p className="font-extrabold text-slate-800 dark:text-slate-200 text-sm">Aktivasi SSO & Bimbingan Aktif</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                        Setelah disetujui, akun SSO mentor akan otomatis dibuat dan email pemberitahuan dikirimkan. Mentor dapat langsung masuk ke sistem dan mulai memberikan penilaian untuk Anda.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Info Card on Right */}
          <div className="space-y-6">
            <Card className="relative overflow-hidden rounded-2xl border border-slate-200/60 dark:border-slate-800/60 bg-linear-to-br from-indigo-50/60 to-blue-50/60 dark:from-slate-950/40 dark:to-slate-900/40 p-6 shadow-md">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500 text-white shrink-0 shadow-md mb-4 animate-bounce">
                <CheckCircle className="h-5.5 w-5.5" />
              </div>
              <h4 className="font-extrabold text-indigo-950 dark:text-indigo-300 text-base">Bebas Kode Registrasi</h4>
              <p className="text-xs text-indigo-900/70 dark:text-slate-400 leading-relaxed mt-2.5">
                Sistem SIKP terintegrasi dengan SSO terpadu. Pembimbing lapangan Anda tidak perlu repot memasukkan kode registrasi manual. Pastikan mereka memeriksa kotak masuk (atau spam) email setelah pengajuan Anda disetujui Dosen PA.
              </p>
            </Card>
          </div>
        </div>

        {/* Informasi Status Pengajuan Mentor */}
        <Card className="relative overflow-hidden rounded-2xl border border-slate-200/60 dark:border-slate-800/60 bg-white/80 dark:bg-slate-900/80 shadow-md">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-linear-to-b from-indigo-550 to-blue-600" />
          <CardHeader className="pt-6 pb-4 border-b border-slate-100 dark:border-slate-800">
            <CardTitle className="text-base font-extrabold flex items-center gap-2">
              <Info className="h-4.5 w-4.5 text-indigo-500" />
              Informasi Arti & Keterangan Status Pengajuan
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="p-4 bg-amber-50/45 dark:bg-amber-950/10 border border-amber-250/30 rounded-xl space-y-2">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                  <strong className="text-amber-800 dark:text-amber-400 font-extrabold text-xs">Menunggu Persetujuan</strong>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                  Pengajuan mentor sedang dalam antrean verifikasi oleh Dosen PA Anda. Silakan hubungi Dosen PA Anda agar segera diperiksa.
                </p>
              </div>

              <div className="p-4 bg-blue-50/45 dark:bg-blue-950/10 border border-blue-250/30 rounded-xl space-y-2">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                  <strong className="text-blue-800 dark:text-blue-400 font-extrabold text-xs">Email Aktivasi Terkirim</strong>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                  Dosen PA telah menyetujui pengajuan. Kredensial SSO mentor lapangan sedang diproses dan dikirimkan via email terdaftar.
                </p>
              </div>

              <div className="p-4 bg-emerald-50/45 dark:bg-emerald-950/10 border border-emerald-250/30 rounded-xl space-y-2">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <strong className="text-emerald-800 dark:text-emerald-400 font-extrabold text-xs">Disetujui - Aktif</strong>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                  Akun SSO mentor lapangan telah aktif penuh. Mentor dapat login menggunakan email untuk membimbing & menilai Kerja Praktik Anda.
                </p>
              </div>

              <div className="p-4 bg-red-50/45 dark:bg-red-950/10 border border-red-250/30 rounded-xl space-y-2">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                  <strong className="text-red-800 dark:text-red-400 font-extrabold text-xs">Ditolak Dosen PA</strong>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                  Pengajuan ditolak oleh Dosen PA karena ketidaksesuaian data instansi atau mentor. Silakan klik Ajukan Ulang kembali.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AlertDialog for Delete/Cancel Confirmation */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="max-w-[450px]">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-xl text-destructive">
              <Trash className="h-5 w-5" />
              Batalkan Pengajuan Mentor?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base pt-2">
              Pengajuan mentor lapangan atas nama{" "}
              <span className="font-bold text-foreground">
                {currentMentor?.name}
              </span>{" "}
              akan dihapus secara permanen. Anda perlu mengajukan ulang jika
              ingin mendaftarkan mentor baru.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4">
            <AlertDialogCancel disabled={isSubmitting}>Kembali</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeletePendingRequest}
              disabled={isSubmitting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isSubmitting ? "Menghapus..." : "Ya, Batalkan Pengajuan"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* AlertDialog for Join Leader Confirmation */}
      <AlertDialog open={showJoinDialog} onOpenChange={setShowJoinDialog}>
        <AlertDialogContent className="max-w-[500px]">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-xl">
              <UserCircle className="h-6 w-6 text-primary" />
              Konfirmasi Sinkronisasi Mentor
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base pt-2">
              Apakah Anda yakin ingin menggunakan pembimbing lapangan yang sama dengan 
              <span className="font-bold text-foreground"> Ketua Tim ({completeData?.team?.leaderMentor?.name})</span>?
            </AlertDialogDescription>
            <div className="mt-4 p-4 bg-slate-50 rounded-lg border border-slate-100 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Nama Mentor:</span>
                <span className="font-medium text-foreground">{completeData?.team?.leaderMentor?.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Perusahaan:</span>
                <span className="font-medium text-foreground">{completeData?.team?.leaderMentor?.company}</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-4 italic">
              * Anda tidak perlu lagi mengisi formulir pendaftaran mentor secara manual.
            </p>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6">
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleJoinLeaderMentor}
              className="bg-primary hover:bg-primary/90"
            >
              Ya, Gunakan Mentor Ini
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default FieldMentorPage;
