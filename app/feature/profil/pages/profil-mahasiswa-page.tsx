import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { Separator } from "~/components/ui/separator";
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
  User,
  Mail,
  Phone,
  IdCard,
  Building2,
  FileSignature,
  CheckCircle2,
  Edit,
  Save,
  Trash2,
} from "lucide-react";
import type { ESignatureSetupData } from "~/feature/esignature/types/esignature";
import { ESignatureDialog } from "~/feature/profil/components/esignature-dialog";
import {
  getMyMahasiswaProfile,
  updateMyMahasiswaProfile,
  uploadMahasiswaESignature,
  deleteMahasiswaESignature,
  dataUrlToFile,
} from "~/lib/services/mahasiswa-api";

interface MahasiswaProfile {
  id: string;
  nama: string;
  nim: string;
  email: string;
  phone: string;
  fakultas: string;
  prodi: string;
  semester: string;
  jumlahSksSelesai: string;
  angkatan: string;
  esignature?: {
    url: string;
    key: string;
    uploadedAt: string;
  };
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : {};
}

function pickString(...values: unknown[]): string {
  for (const value of values) {
    if (typeof value === "string" && value.trim().length > 0) {
      return value;
    }
  }
  return "";
}

function pickNumber(...values: unknown[]): number | null {
  for (const value of values) {
    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }
    if (typeof value === "string" && value.trim().length > 0) {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
  }
  return null;
}

function normalizeProfileResponse(
  rawData: unknown,
  fallback: MahasiswaProfile,
): MahasiswaProfile {
  const data = asRecord(rawData);
  const signature = asRecord(data.esignature);

  const signatureUrl = pickString(signature.url, data.esignatureUrl);

  const semesterValue = pickNumber(data.semester, fallback.semester);

  const jumlahSksSelesaiValue = pickNumber(
    data.jumlahSksSelesai,
    fallback.jumlahSksSelesai,
  );

  return {
    id: pickString(data.id, fallback.id),
    nama: pickString(data.nama, fallback.nama),
    nim: pickString(data.nim, fallback.nim),
    email: pickString(data.email, fallback.email),
    phone: pickString(data.phone, fallback.phone),
    fakultas: pickString(data.fakultas, fallback.fakultas),
    prodi: pickString(data.prodi, fallback.prodi),
    semester: semesterValue !== null ? String(semesterValue) : "",
    jumlahSksSelesai:
      jumlahSksSelesaiValue !== null ? String(jumlahSksSelesaiValue) : "",
    angkatan: pickString(data.angkatan, fallback.angkatan),
    esignature: signatureUrl
      ? {
          url: signatureUrl,
          key: pickString(signature.key),
          uploadedAt: pickString(
            signature.uploadedAt,
            new Date().toISOString(),
          ),
        }
      : undefined,
  };
}

export function MahasiswaProfilPage() {
  const [profile, setProfile] = useState<MahasiswaProfile>({
    id: "",
    nama: "",
    nim: "",
    email: "",
    phone: "",
    fakultas: "",
    prodi: "",
    semester: "",
    jumlahSksSelesai: "",
    angkatan: "",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showESignatureDialog, setShowESignatureDialog] = useState(false);
  const [showDeleteSignatureDialog, setShowDeleteSignatureDialog] =
    useState(false);
  const [signatureImageError, setSignatureImageError] = useState(false);
  const [notification, setNotification] = useState<{
    title: string;
    description: string;
    variant?: "default" | "destructive";
  } | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      setIsLoading(true);
      const response = await getMyMahasiswaProfile();

      if (response.success && response.data) {
        setProfile((prev) => normalizeProfileResponse(response.data, prev));
        setSignatureImageError(false);
      } else {
        setNotification({
          title: "⚠️ Gagal Memuat Profil",
          description:
            response.message || "Terjadi kesalahan saat memuat profil",
          variant: "destructive",
        });
        setTimeout(() => setNotification(null), 4000);
      }

      setIsLoading(false);
    };

    loadProfile();
  }, []);

  const handleSaveProfile = async () => {
    setIsSaving(true);

    try {
      const trimmedNama = profile.nama.trim();
      const trimmedEmail = profile.email.trim();
      const trimmedPhone = profile.phone.trim();
      const trimmedFakultas = profile.fakultas.trim();
      const trimmedProdi = profile.prodi.trim();
      const trimmedAngkatan = profile.angkatan.trim();

      const semesterNumber = pickNumber(profile.semester);
      const jumlahSksSelesaiNumber = pickNumber(profile.jumlahSksSelesai);

      const response = await updateMyMahasiswaProfile({
        nama: trimmedNama || undefined,
        email: trimmedEmail || undefined,
        phone: trimmedPhone || undefined,
        fakultas: trimmedFakultas || null,
        prodi: trimmedProdi || null,
        semester: semesterNumber,
        jumlahSksSelesai: jumlahSksSelesaiNumber,
        angkatan: trimmedAngkatan || null,
      });

      if (response.success && response.data) {
        setProfile((prev) => normalizeProfileResponse(response.data, prev));
        setIsEditing(false);
        setNotification({
          title: "✅ Profil Berhasil Disimpan",
          description: "Data profil Anda telah diperbarui.",
        });
        setTimeout(() => setNotification(null), 3000);
      } else {
        setNotification({
          title: "❌ Gagal Menyimpan Profil",
          description: response.message || "Terjadi kesalahan saat menyimpan",
          variant: "destructive",
        });
        setTimeout(() => setNotification(null), 4000);
      }
    } catch (error) {
      console.error("Error saving mahasiswa profile:", error);
      setNotification({
        title: "❌ Gagal Menyimpan Profil",
        description: "Terjadi kesalahan saat menyimpan profil",
        variant: "destructive",
      });
      setTimeout(() => setNotification(null), 4000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveESignature = async (data: ESignatureSetupData) => {
    try {
      setIsSaving(true);
      const signatureFile = await dataUrlToFile(
        data.signatureData,
        `signature-${Date.now()}.png`,
      );

      const response = await uploadMahasiswaESignature(signatureFile);

      if (response.success && response.data) {
        const uploadedData = response.data;
        setProfile((prev) => ({
          ...prev,
          esignature: {
            url: uploadedData.url,
            key: uploadedData.key,
            uploadedAt: uploadedData.uploadedAt,
          },
        }));
        setSignatureImageError(false);
        setShowESignatureDialog(false);
        setNotification({
          title: "✅ E-Signature Berhasil Disimpan",
          description:
            "Tanda tangan digital Anda telah tersimpan dan siap digunakan.",
        });
        setTimeout(() => setNotification(null), 3000);
      } else {
        setNotification({
          title: "❌ Gagal Menyimpan E-Signature",
          description: response.message || "Terjadi kesalahan saat menyimpan",
          variant: "destructive",
        });
        setTimeout(() => setNotification(null), 4000);
      }
    } catch (error) {
      console.error("Error saving mahasiswa e-signature:", error);
      setNotification({
        title: "❌ Gagal Menyimpan E-Signature",
        description: "Terjadi kesalahan saat menyimpan tanda tangan",
        variant: "destructive",
      });
      setTimeout(() => setNotification(null), 4000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteESignature = async () => {
    try {
      setIsSaving(true);
      const response = await deleteMahasiswaESignature();

      if (response.success) {
        setProfile((prev) => ({
          ...prev,
          esignature: undefined,
        }));
        setShowDeleteSignatureDialog(false);
        setNotification({
          title: "🗑️ E-Signature Berhasil Dihapus",
          description: "Tanda tangan digital Anda telah dihapus.",
        });
        setTimeout(() => setNotification(null), 3000);
      } else {
        setNotification({
          title: "❌ Gagal Menghapus E-Signature",
          description: response.message || "Terjadi kesalahan saat menghapus",
          variant: "destructive",
        });
        setTimeout(() => setNotification(null), 4000);
      }
    } catch (error) {
      console.error("Error deleting mahasiswa e-signature:", error);
      setNotification({
        title: "❌ Gagal Menghapus E-Signature",
        description: "Terjadi kesalahan saat menghapus tanda tangan",
        variant: "destructive",
      });
      setTimeout(() => setNotification(null), 4000);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground text-lg">Memuat profil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Profil Mahasiswa</h1>
          <p className="text-muted-foreground mt-1">
            Kelola data profil dan e-signature Anda
          </p>
        </div>
        {!isEditing && (
          <Button
            onClick={() => setIsEditing(true)}
            variant="outline"
            className="gap-2"
          >
            <Edit className="h-4 w-4" />
            Edit Profil
          </Button>
        )}
      </div>

      {notification && (
        <Alert variant={notification.variant} className="shadow-md">
          <CheckCircle2 className="h-5 w-5" />
          <AlertDescription>
            <div>
              <p className="font-semibold">{notification.title}</p>
              <p className="text-sm">{notification.description}</p>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Data Profil
          </CardTitle>
          <CardDescription>Informasi lengkap mahasiswa</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label
                htmlFor="nama"
                className="flex items-center gap-2 text-base font-bold"
              >
                <User className="h-5 w-5" />
                Nama Lengkap
              </Label>
              {isEditing ? (
                <Input
                  id="nama"
                  value={profile.nama}
                  onChange={(e) =>
                    setProfile({ ...profile, nama: e.target.value })
                  }
                  placeholder="Masukkan nama lengkap"
                />
              ) : (
                <p className="text-base font-medium">{profile.nama || "-"}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="nim"
                className="flex items-center gap-2 text-base font-bold"
              >
                <IdCard className="h-5 w-5" />
                NIM
              </Label>
              <Input id="nim" value={profile.nim} disabled />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="flex items-center gap-2 text-base font-bold"
              >
                <Mail className="h-5 w-5" />
                Email
              </Label>
              {isEditing ? (
                <Input
                  id="email"
                  type="email"
                  value={profile.email}
                  onChange={(e) =>
                    setProfile({ ...profile, email: e.target.value })
                  }
                  placeholder="Masukkan email"
                />
              ) : (
                <p className="text-base font-medium">{profile.email || "-"}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="phone"
                className="flex items-center gap-2 text-base font-bold"
              >
                <Phone className="h-5 w-5" />
                Telepon
              </Label>
              {isEditing ? (
                <Input
                  id="phone"
                  value={profile.phone}
                  onChange={(e) =>
                    setProfile({ ...profile, phone: e.target.value })
                  }
                  placeholder="Masukkan nomor telepon"
                />
              ) : (
                <p className="text-base font-medium">{profile.phone || "-"}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="fakultas"
                className="flex items-center gap-2 text-base font-bold"
              >
                <Building2 className="h-5 w-5" />
                Fakultas
              </Label>
              {isEditing ? (
                <Input
                  id="fakultas"
                  value={profile.fakultas}
                  onChange={(e) =>
                    setProfile({ ...profile, fakultas: e.target.value })
                  }
                  placeholder="Masukkan fakultas"
                />
              ) : (
                <p className="text-base font-medium">
                  {profile.fakultas || "-"}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="prodi"
                className="flex items-center gap-2 text-base font-bold"
              >
                <Building2 className="h-5 w-5" />
                Program Studi
              </Label>
              {isEditing ? (
                <Input
                  id="prodi"
                  value={profile.prodi}
                  onChange={(e) =>
                    setProfile({ ...profile, prodi: e.target.value })
                  }
                  placeholder="Masukkan program studi"
                />
              ) : (
                <p className="text-base font-medium">{profile.prodi || "-"}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="semester"
                className="flex items-center gap-2 text-base font-bold"
              >
                <Building2 className="h-5 w-5" />
                Semester
              </Label>
              {isEditing ? (
                <Input
                  id="semester"
                  inputMode="numeric"
                  value={profile.semester}
                  onChange={(e) =>
                    setProfile({ ...profile, semester: e.target.value })
                  }
                  placeholder="Masukkan semester"
                />
              ) : (
                <p className="text-base font-medium">
                  {profile.semester || "-"}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="jumlahSksSelesai"
                className="flex items-center gap-2 text-base font-bold"
              >
                <Building2 className="h-5 w-5" />
                Jumlah SKS Selesai
              </Label>
              {isEditing ? (
                <Input
                  id="jumlahSksSelesai"
                  inputMode="numeric"
                  value={profile.jumlahSksSelesai}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      jumlahSksSelesai: e.target.value,
                    })
                  }
                  placeholder="Masukkan jumlah SKS selesai"
                />
              ) : (
                <p className="text-base font-medium">
                  {profile.jumlahSksSelesai || "-"}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="angkatan"
                className="flex items-center gap-2 text-base font-bold"
              >
                <Building2 className="h-5 w-5" />
                Angkatan
              </Label>
              {isEditing ? (
                <Input
                  id="angkatan"
                  value={profile.angkatan}
                  onChange={(e) =>
                    setProfile({ ...profile, angkatan: e.target.value })
                  }
                  placeholder="Masukkan angkatan"
                />
              ) : (
                <p className="text-base font-medium">
                  {profile.angkatan || "-"}
                </p>
              )}
            </div>
          </div>

          {isEditing && (
            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleSaveProfile}
                disabled={isSaving}
                className="flex-1 gap-2"
              >
                <Save className="h-4 w-4" />
                {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
              </Button>
              <Button
                onClick={() => setIsEditing(false)}
                variant="outline"
                disabled={isSaving}
              >
                Batal
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Separator />

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSignature className="h-5 w-5" />
            Tanda Tangan Digital (E-Signature)
          </CardTitle>
          <CardDescription>
            Tanda tangan digital Anda untuk dokumen mahasiswa
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {profile.esignature ? (
            <div className="space-y-4">
              <div className="border rounded-lg p-6 bg-muted/30">
                <p className="text-sm text-muted-foreground mb-3">
                  Preview Tanda Tangan:
                </p>
                <div className="bg-white border-2 border-dashed rounded-lg p-4 flex items-center justify-center">
                  {signatureImageError ? (
                    <p className="text-xs text-red-600 break-all text-center">
                      Preview tanda tangan gagal dimuat. URL:{" "}
                      {profile.esignature.url}
                    </p>
                  ) : (
                    <img
                      src={profile.esignature.url}
                      alt="E-Signature"
                      className="max-h-32 max-w-full"
                      onError={() => setSignatureImageError(true)}
                    />
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Terakhir diupdate:{" "}
                  {new Date(profile.esignature.uploadedAt).toLocaleString(
                    "id-ID",
                  )}
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => setShowESignatureDialog(true)}
                  variant="outline"
                  className="flex-1 gap-2"
                >
                  <Edit className="h-4 w-4" />
                  Ubah Tanda Tangan
                </Button>
                <Button
                  onClick={() => setShowDeleteSignatureDialog(true)}
                  variant="outline"
                  className="gap-2 border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                  Hapus
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <Alert>
                <FileSignature className="h-5 w-5" />
                <AlertDescription>
                  <p className="font-semibold">Tanda Tangan Belum Dibuat</p>
                  <p className="text-sm mt-1">
                    Anda perlu membuat tanda tangan digital untuk kebutuhan
                    dokumen Anda.
                  </p>
                </AlertDescription>
              </Alert>

              <Button
                onClick={() => setShowESignatureDialog(true)}
                className="w-full gap-2 h-11"
              >
                <FileSignature className="h-5 w-5" />
                Buat Tanda Tangan Digital
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <ESignatureDialog
        open={showESignatureDialog}
        onOpenChange={setShowESignatureDialog}
        onSave={handleSaveESignature}
        dosenName={profile.nama}
        nip={profile.nim}
        existingSignature={profile.esignature?.url}
      />

      <AlertDialog
        open={showDeleteSignatureDialog}
        onOpenChange={setShowDeleteSignatureDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Tanda Tangan Digital?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini akan menghapus tanda tangan digital Anda.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteESignature}
              className="bg-red-600 hover:bg-red-700"
            >
              Ya, Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
