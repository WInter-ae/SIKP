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
    company: "",
    position: "",
    address: "",
  });
  const [currentMentor, setCurrentMentor] = useState<FieldMentor | null>(null);

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
        companyName: mentorRequest.company,
        position: mentorRequest.position,
        companyAddress: mentorRequest.address,
      };

      const response = await requestMentor(payload);

      if (response.success) {
        toast.success(
          "Pengajuan mentor berhasil dikirim! Menunggu persetujuan dari Dosen PA.",
        );
        setShowRequestForm(false);
        setMentorRequest({
          mentorName: "",
          mentorEmail: "",
          mentorPhone: "",
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

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header Section */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Pembimbing Lapangan</h1>
        <p className="text-muted-foreground">
          Kelola data mentor lapangan untuk kerja praktik Anda
        </p>
      </div>

      {/* Back Button */}
      <Button variant="secondary" onClick={() => navigate(-1)}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Kembali
      </Button>

      {/* Rejection Alert */}
      {currentMentor?.status === "rejected" && (
        <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-900">
          <AlertCircle className="h-5 w-5" />
          <AlertTitle className="font-bold">Pengajuan Mentor Ditolak</AlertTitle>
          <AlertDescription className="mt-2">
            <p className="font-medium">Alasan: {currentMentor.rejectionReason || "Data mentor tidak sesuai kriteria."}</p>
            <p className="mt-2 text-sm">Silakan ajukan kembali dengan data mentor yang baru atau hubungi Dosen PA Anda.</p>
            <Button 
              variant="destructive" 
              size="sm" 
              className="mt-4"
              onClick={() => {
                setCurrentMentor(null);
                setShowRequestForm(true);
              }}
            >
              Ajukan Ulang
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Info Section */}
      <Alert className="border-l-4 border-primary bg-primary/5">
        <UserPlus className="h-5 w-5" />
        <AlertTitle>Informasi Pembimbing Lapangan (Mentor)</AlertTitle>
        <AlertDescription className="mt-2">
          <p className="mb-2">
            Halaman ini digunakan untuk mengajukan mentor lapangan Anda kepada
            Dosen PA.
          </p>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>Isi data mentor lapangan dengan lengkap dan akurat</li>
            <li>
              Setelah submit, pengajuan akan dikirim ke Dosen PA untuk
              persetujuan
            </li>
            <li>
              Mentor akan menerima email aktivasi dari sistem saat pengajuan
              disetujui
            </li>
            <li>
              Mentor dapat langsung login dan mulai bekerja tanpa perlu kode
              registrasi
            </li>
          </ul>
        </AlertDescription>
      </Alert>

      {/* Current Mentor Section */}
      {currentMentor && currentMentor.status !== "rejected" && (
        <Card className="border-l-4 border-green-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Pembimbing Lapangan Terdaftar
            </CardTitle>
            <CardDescription>
              Data pembimbing lapangan yang telah didaftarkan
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Profile Photo */}
              <div className="flex flex-col items-center">
                <Avatar className="h-32 w-32">
                  <AvatarImage
                    src={currentMentor.photo}
                    alt={currentMentor.name}
                  />
                  <AvatarFallback className="text-2xl bg-primary/10">
                    {currentMentor.photo ? (
                      <User className="h-12 w-12 text-muted-foreground" />
                    ) : (
                      getInitials(currentMentor.name)
                    )}
                  </AvatarFallback>
                </Avatar>
                {!currentMentor.photo && currentMentor.status === "pending" && (
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    Foto akan muncul setelah mentor registrasi
                  </p>
                )}
              </div>

              {/* Mentor Data */}
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-muted-foreground text-sm">
                    Nama Mentor
                  </Label>
                  <p className="font-medium flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    {currentMentor.name}
                  </p>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground text-sm">
                    NIP/NIK
                  </Label>
                  {currentMentor.nip ? (
                    <p className="font-medium">{currentMentor.nip}</p>
                  ) : (
                    <p className="text-muted-foreground italic text-sm">
                      Akan diisi saat registrasi
                    </p>
                  )}
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground text-sm">Email</Label>
                  <p className="font-medium flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    {currentMentor.email}
                  </p>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground text-sm">
                    No. Telepon
                  </Label>
                  <p className="font-medium flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    {currentMentor.phone}
                  </p>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground text-sm">
                    Perusahaan
                  </Label>
                  <p className="font-medium flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    {currentMentor.company}
                  </p>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground text-sm">
                    Jabatan
                  </Label>
                  <p className="font-medium flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    {currentMentor.position}
                  </p>
                </div>
                <div className="md:col-span-2 space-y-1 pt-2 border-t border-slate-50">
                  <Label className="text-muted-foreground text-sm flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5" />
                    Alamat Perusahaan
                  </Label>
                  <p className="font-medium text-slate-700 leading-relaxed">
                    {currentMentor.address || "-"}
                  </p>
                </div>
                <div className="md:col-span-2 space-y-1">
                  <Label className="text-muted-foreground text-sm">
                    Status
                  </Label>
                  <div>{getStatusBadge(currentMentor.status)}</div>
                </div>
              </div>
            </div>

            {/* Approval Waiting Section */}
            {currentMentor.status === "pending" && (
              <div className="mt-4 p-5 bg-amber-50/80 border border-amber-200 rounded-xl flex items-start gap-4">
                <div className="bg-amber-100 p-2 rounded-full">
                  <Clock className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <h4 className="font-bold text-amber-900 text-lg">
                    Menunggu Persetujuan Dosen PA
                  </h4>
                  <p className="text-amber-800 mt-1 leading-relaxed">
                    Pengajuan sedang ditinjau oleh Dosen PA. Anda akan
                    menerima notifikasi setelah ada keputusan. Mentor akan
                    mendapat email aktivasi jika pengajuan disetujui.
                  </p>
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
            <Card className="border-2 border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2 text-primary">
                  <UserCircle className="h-6 w-6" />
                  Gunakan Mentor Ketua Tim?
                </CardTitle>
                <CardDescription>
                  Ketua tim Anda ({completeData.team.leaderMentor.name}) sudah memiliki mentor lapangan yang disetujui.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col md:flex-row items-center gap-6">
                <div className="flex-1 space-y-2">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <span className="text-muted-foreground">Nama Mentor:</span>
                    <span className="font-medium">{completeData.team.leaderMentor.name}</span>
                    <span className="text-muted-foreground">Perusahaan:</span>
                    <span className="font-medium">{completeData.team.leaderMentor.company}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    * Jika Anda memilih ini, Anda tidak perlu mengisi formulir pengajuan lagi.
                  </p>
                </div>
                <Button 
                  size="lg" 
                  className="w-full md:w-auto shadow-lg"
                  onClick={() => setShowJoinDialog(true)}
                  disabled={isSubmitting}
                >
                  <Copy className="mr-2 h-5 w-5" />
                  {isSubmitting ? "Memproses..." : "Ya, Ikuti Mentor Ketua"}
                </Button>
              </CardContent>
            </Card>
          )}

          <Card className="text-center py-12">
            <CardContent className="space-y-6">
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto">
                <UserPlus className="h-10 w-10 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">
                  {completeData?.team?.leaderMentor ? "Atau Ajukan Mentor Berbeda" : "Belum Ada Mentor Terdaftar"}
                </h3>
                <p className="text-muted-foreground">
                  {completeData?.team?.leaderMentor 
                    ? "Jika mentor Anda berbeda dengan ketua tim, silakan isi formulir pengajuan baru."
                    : "Anda belum memiliki mentor lapangan terdaftar. Klik tombol di bawah untuk mendaftarkan mentor."}
                </p>
              </div>
              <Button 
                size="lg" 
                variant={completeData?.team?.leaderMentor ? "outline" : "default"}
                onClick={() => setShowRequestForm(true)}
              >
                <UserPlus className="mr-2 h-5 w-5" />
                {completeData?.team?.leaderMentor ? "Ajukan Mentor Sendiri" : "Request Mentor Lapangan"}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {!currentMentor && !showRequestForm && isLoadingMentor && (
        <Card className="text-center py-12">
          <CardContent className="space-y-4">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto animate-pulse">
              <UserPlus className="h-10 w-10 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Memuat Data Mentor</h3>
              <p className="text-muted-foreground">
                Kami sedang mengambil data mentor yang sudah terkait dengan
                internship Anda.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Request Form */}
      {showRequestForm && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Form Request Mentor Lapangan
            </CardTitle>
            <CardDescription>
              Lengkapi data mentor lapangan Anda dengan informasi yang valid
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitRequest} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="mentorName">
                    Nama Mentor <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="mentorName"
                      name="mentorName"
                      required
                      className="pl-10"
                      placeholder="Nama lengkap mentor"
                      value={mentorRequest.mentorName}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mentorEmail">
                    Email Mentor <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="mentorEmail"
                      name="mentorEmail"
                      type="email"
                      required
                      className="pl-10"
                      placeholder="email@perusahaan.com"
                      value={mentorRequest.mentorEmail}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mentorPhone">
                    No. Telepon <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="mentorPhone"
                      name="mentorPhone"
                      type="tel"
                      required
                      className="pl-10"
                      placeholder="08xxxxxxxxxx"
                      value={mentorRequest.mentorPhone}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">
                    Nama Perusahaan <span className="text-muted-foreground text-xs font-normal">(Auto-fill dari Pengajuan)</span>
                  </Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="company"
                      name="company"
                      readOnly
                      className="pl-10 bg-slate-50 cursor-not-allowed border-dashed"
                      placeholder="PT. Example Indonesia"
                      value={mentorRequest.company}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="position">
                    Jabatan <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="position"
                      name="position"
                      required
                      className="pl-10"
                      placeholder="Supervisor, Manager, dll"
                      value={mentorRequest.position}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="address">
                    Alamat Perusahaan{" "}
                    <span className="text-muted-foreground text-xs font-normal">(Auto-fill dari Pengajuan)</span>
                  </Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Textarea
                      id="address"
                      name="address"
                      readOnly
                      rows={3}
                      className="pl-10 bg-slate-50 cursor-not-allowed border-dashed"
                      placeholder="Alamat lengkap perusahaan"
                      value={mentorRequest.address}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowRequestForm(false)}
                >
                  Batal
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  <UserPlus className="mr-2 h-4 w-4" />
                  {isSubmitting ? "Submitting..." : "Submit Request"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Process Flow Info Section */}
      <Card className="border-l-4 border-blue-500 bg-blue-50/50 dark:bg-blue-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            📌 Alur Proses Mentor Lapangan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-3">
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                1
              </span>
              <div>
                <p className="font-medium">Anda Mengajukan Mentor</p>
                <p className="text-sm text-muted-foreground">
                  Lengkapi form dengan data mentor dari perusahaan tempat magang
                </p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                2
              </span>
              <div>
                <p className="font-medium">Pengajuan Dikirim ke Dosen PA</p>
                <p className="text-sm text-muted-foreground">
                  Data mentor Anda dikirimkan untuk ditinjau oleh Dosen
                  Pembimbing Akademik
                </p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                3
              </span>
              <div>
                <p className="font-medium">Dosen PA Melakukan Review</p>
                <p className="text-sm text-muted-foreground">
                  Dosen PA memeriksa kelengkapan dan keabsahan data mentor yang
                  diajukan
                </p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                4
              </span>
              <div>
                <p className="font-medium">Keputusan Persetujuan</p>
                <p className="text-sm text-muted-foreground">
                  Dosen PA menyetujui atau menolak pengajuan mentor Anda
                </p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                5
              </span>
              <div>
                <p className="font-medium">Mentor Menerima Email Aktivasi</p>
                <p className="text-sm text-muted-foreground">
                  Jika disetujui, mentor akan menerima email undangan dan dapat
                  mulai login
                </p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-green-600 text-white flex items-center justify-center text-sm font-medium">
                6
              </span>
              <div>
                <p className="font-medium">Mentor Sudah Aktif</p>
                <p className="text-sm text-muted-foreground">
                  Mentor dapat login ke sistem dan mulai membimbing Anda di
                  perusahaan
                </p>
              </div>
            </li>
          </ol>
          <Alert className="mt-6 border-blue-200 bg-blue-50 dark:bg-blue-950">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Mentor tidak perlu kode registrasi. Sistem otomatis mengirim email
              aktivasi saat persetujuan Dosen PA selesai.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
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
