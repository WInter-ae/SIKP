import { useState } from "react";
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

import type { FieldMentor, MentorRequest } from "../types";

const MENTOR_CODE_TIMESTAMP_LENGTH = 6;
const MENTOR_CODE_RANDOM_LENGTH = 4;
const MENTOR_CODE_RANDOM_MAX = 10000;

function FieldMentorPage() {
  const navigate = useNavigate();
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [mentorRequest, setMentorRequest] = useState<MentorRequest>({
    mentorName: "",
    mentorEmail: "",
    mentorPhone: "",
    company: "",
    position: "",
    address: "",
  });
  const [currentMentor, setCurrentMentor] = useState<FieldMentor | null>(null);
  const [showMentorCode, setShowMentorCode] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setMentorRequest((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitRequest = (e: React.FormEvent) => {
    e.preventDefault();

    const timestamp = Date.now();
    const random = Math.floor(Math.random() * MENTOR_CODE_RANDOM_MAX);
    const generatedCode = `MNT-${timestamp.toString().slice(-MENTOR_CODE_TIMESTAMP_LENGTH)}-${random.toString().padStart(MENTOR_CODE_RANDOM_LENGTH, "0")}`;

    const newMentor: FieldMentor = {
      id: Date.now().toString(),
      code: generatedCode,
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
    setShowMentorCode(true);
    setShowRequestForm(false);

    setMentorRequest({
      mentorName: "",
      mentorEmail: "",
      mentorPhone: "",
      company: "",
      position: "",
      address: "",
    });

    toast.success("Request mentor berhasil! Kode mentor telah digenerate.");
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Kode berhasil disalin!");
  };

  const getStatusBadge = (status: FieldMentor["status"]) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            <Clock className="mr-1 h-3 w-3" />
            Menunggu Mentor Registrasi
          </Badge>
        );
      case "registered":
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-100">
            <Info className="mr-1 h-3 w-3" />
            Menunggu Persetujuan Admin
          </Badge>
        );
      case "approved":
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100">
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
            Halaman ini digunakan untuk mendaftarkan mentor lapangan Anda di
            tempat Kerja Praktik.
          </p>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>Isi data mentor lapangan dengan lengkap</li>
            <li>Setelah submit, sistem akan generate kode unik untuk mentor</li>
            <li>Berikan kode tersebut kepada mentor untuk registrasi dan login</li>
            <li>Mentor dapat menggunakan kode untuk mengakses sistem</li>
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
                  <AvatarImage src={currentMentor.photo} alt={currentMentor.name} />
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
                  <Label className="text-muted-foreground text-sm">Nama Mentor</Label>
                  <p className="font-medium flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    {currentMentor.name}
                  </p>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground text-sm">NIP/NIK</Label>
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
                  <Label className="text-muted-foreground text-sm">No. Telepon</Label>
                  <p className="font-medium flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    {currentMentor.phone}
                  </p>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground text-sm">Perusahaan</Label>
                  <p className="font-medium flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    {currentMentor.company}
                  </p>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground text-sm">Jabatan</Label>
                  <p className="font-medium flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    {currentMentor.position}
                  </p>
                </div>
                <div className="md:col-span-2 space-y-1">
                  <Label className="text-muted-foreground text-sm">Status</Label>
                  <div>{getStatusBadge(currentMentor.status)}</div>
                </div>
              </div>
            </div>

            {/* Mentor Code Section */}
            {showMentorCode && (
              <Card className="bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800">
                <CardContent className="pt-6">
                  <Label className="text-muted-foreground text-sm">Kode Mentor</Label>
                  <div className="flex items-center gap-2 mt-2">
                    <code className="flex-1 text-2xl font-bold text-green-700 dark:text-green-400 bg-background p-3 rounded-md border">
                      {currentMentor.code}
                    </code>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => copyToClipboard(currentMentor.code)}
                      className="h-12 w-12"
                    >
                      <Copy className="h-5 w-5" />
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground mt-3">
                    ⚠️ Berikan kode ini kepada mentor untuk registrasi dan login ke sistem
                  </p>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
      )}

      {/* Empty State / Request Button */}
      {!currentMentor && !showRequestForm && (
        <Card className="text-center py-12">
          <CardContent className="space-y-6">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto">
              <UserPlus className="h-10 w-10 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Belum Ada Mentor Terdaftar</h3>
              <p className="text-muted-foreground">
                Anda belum memiliki mentor lapangan terdaftar. Klik tombol di bawah untuk mendaftarkan mentor.
              </p>
            </div>
            <Button size="lg" onClick={() => setShowRequestForm(true)}>
              <UserPlus className="mr-2 h-5 w-5" />
              Request Mentor Lapangan
            </Button>
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
                      placeholder="email@example.com"
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
                    Alamat Perusahaan <span className="text-destructive">*</span>
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
      <Card className="border-l-4 border-yellow-500 bg-yellow-50/50 dark:bg-yellow-950/20">
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
                <p className="font-medium">Mahasiswa Request Mentor</p>
                <p className="text-sm text-muted-foreground">
                  Isi form dan submit, sistem akan generate kode unik
                </p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                2
              </span>
              <div>
                <p className="font-medium">Status: Menunggu Mentor Registrasi</p>
                <p className="text-sm text-muted-foreground">
                  Berikan kode kepada mentor untuk registrasi
                </p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                3
              </span>
              <div>
                <p className="font-medium">Mentor Registrasi</p>
                <p className="text-sm text-muted-foreground">
                  Mentor menggunakan kode untuk membuat akun dan melengkapi data profil
                </p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                4
              </span>
              <div>
                <p className="font-medium">Status: Menunggu Persetujuan Admin</p>
                <p className="text-sm text-muted-foreground">
                  Setelah mentor registrasi, data lengkap akan muncul dan menunggu admin approve
                </p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                5
              </span>
              <div>
                <p className="font-medium">Admin Approve</p>
                <p className="text-sm text-muted-foreground">
                  Admin memeriksa dan menyetujui/menolak mentor
                </p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-green-600 text-white flex items-center justify-center text-sm font-medium">
                6
              </span>
              <div>
                <p className="font-medium">Status: Disetujui</p>
                <p className="text-sm text-muted-foreground">
                  Mentor dapat login dan mulai membimbing
                </p>
              </div>
            </li>
          </ol>
          <Alert variant="destructive" className="mt-6">
            <XCircle className="h-4 w-4" />
            <AlertDescription>
              Mentor tidak dapat login sebelum mendapat persetujuan dari admin
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}

export default FieldMentorPage;
