import { useEffect, useState } from "react";
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
  XCircle,
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

import { getCompleteInternshipData } from "~/feature/during-intern/services/student-api";
import type { FieldMentor, MentorRequest } from "../types";

function FieldMentorPage() {
  const navigate = useNavigate();
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [isLoadingMentor, setIsLoadingMentor] = useState(true);
  const [mentorRequest, setMentorRequest] = useState<MentorRequest>({
    mentorName: "",
    mentorEmail: "",
    mentorPhone: "",
    company: "",
    position: "",
    address: "",
  });
  const [currentMentor, setCurrentMentor] = useState<FieldMentor | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadMentorData() {
      setIsLoadingMentor(true);

      try {
        const response = await getCompleteInternshipData();

        if (!isMounted || !response.success || !response.data?.mentor) {
          return;
        }

        const mentor = response.data.mentor;
        const internshipStatus = response.data.internship.status;

        setCurrentMentor({
          id: mentor.id,
          code: `AUTO-${mentor.id}`,
          name: mentor.name,
          email: mentor.email,
          company: mentor.company,
          position: mentor.position,
          phone: mentor.phone || "-",
          status: internshipStatus === "AKTIF" ? "approved" : "registered",
          createdAt: response.data.internship.createdAt,
          registeredAt: response.data.internship.updatedAt,
          approvedAt:
            internshipStatus === "AKTIF"
              ? response.data.internship.updatedAt
              : undefined,
          photo: undefined,
          nip: "",
        });
      } catch {
        // Keep empty state when backend data is unavailable or user is not authenticated.
      } finally {
        if (isMounted) {
          setIsLoadingMentor(false);
        }
      }
    }

    loadMentorData();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setMentorRequest((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitRequest = (e: React.FormEvent) => {
    e.preventDefault();

    const newMentor: FieldMentor = {
      id: Date.now().toString(),
      code: `AUTO-${Date.now()}`,
      name: mentorRequest.mentorName,
      email: mentorRequest.mentorEmail,
      company: mentorRequest.company,
      position: mentorRequest.position,
      phone: mentorRequest.mentorPhone,
      status: "pending",
      createdAt: new Date().toISOString(),
      nip: "",
    };

    setCurrentMentor(newMentor);
    setShowRequestForm(false);

    setMentorRequest({
      mentorName: "",
      mentorEmail: "",
      mentorPhone: "",
      company: "",
      position: "",
      address: "",
    });

    toast.success(
      "Pengajuan mentor berhasil dikirim! Menunggu persetujuan dari Dosen PA.",
    );
  };

  const getStatusBadge = (status: FieldMentor["status"]) => {
    switch (status) {
      case "pending":
        return (
          <Badge
            variant="secondary"
            className="bg-amber-100 text-amber-800 hover:bg-amber-100"
          >
            <Clock className="mr-1 h-3 w-3" />
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
            variant="secondary"
            className="bg-green-100 text-green-800 hover:bg-green-100"
          >
            <CheckCircle className="mr-1 h-3 w-3" />
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
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header Section */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Mentor Lapangan</h1>
        <p className="text-muted-foreground">
          Kelola data mentor lapangan untuk kerja praktik Anda
        </p>
      </div>

      {/* Back Button */}
      <Button variant="secondary" onClick={() => navigate(-1)}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Kembali
      </Button>

      {/* Info Section */}
      <Alert className="border-l-4 border-primary bg-primary/5">
        <UserPlus className="h-5 w-5" />
        <AlertTitle>Informasi Mentor Lapangan</AlertTitle>
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
      {currentMentor && (
        <Card className="border-l-4 border-green-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Mentor Lapangan Terdaftar
            </CardTitle>
            <CardDescription>
              Data mentor lapangan yang telah didaftarkan
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
              <Card className="bg-amber-50 border-amber-200 dark:bg-amber-950 dark:border-amber-800">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-amber-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-amber-900 dark:text-amber-200">
                        Menunggu Persetujuan Dosen PA
                      </p>
                      <p className="text-sm text-amber-800 dark:text-amber-300 mt-1">
                        Pengajuan sedang ditinjau oleh Dosen PA. Anda akan
                        menerima notifikasi setelah ada keputusan. Mentor akan
                        mendapat email aktivasi jika pengajuan disetujui.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
      )}

      {/* Empty State / Request Button */}
      {!currentMentor && !showRequestForm && !isLoadingMentor && (
        <Card className="text-center py-12">
          <CardContent className="space-y-6">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto">
              <UserPlus className="h-10 w-10 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">
                Belum Ada Mentor Terdaftar
              </h3>
              <p className="text-muted-foreground">
                Anda belum memiliki mentor lapangan terdaftar. Klik tombol di
                bawah untuk mendaftarkan mentor.
              </p>
            </div>
            <Button size="lg" onClick={() => setShowRequestForm(true)}>
              <UserPlus className="mr-2 h-5 w-5" />
              Request Mentor Lapangan
            </Button>
          </CardContent>
        </Card>
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
                    Nama Perusahaan <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="company"
                      name="company"
                      required
                      className="pl-10"
                      placeholder="PT. Example Indonesia"
                      value={mentorRequest.company}
                      onChange={handleInputChange}
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
                    <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Textarea
                      id="address"
                      name="address"
                      required
                      rows={3}
                      className="pl-10"
                      placeholder="Alamat lengkap perusahaan"
                      value={mentorRequest.address}
                      onChange={handleInputChange}
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
                <Button type="submit">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Submit Request
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
    </div>
  );
}

export default FieldMentorPage;
