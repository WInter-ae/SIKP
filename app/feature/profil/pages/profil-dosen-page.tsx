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
  getMyProfile,
  updateMyProfile,
  uploadESignature,
  deleteESignature,
  dataUrlToFile,
} from "~/lib/services/dosen-api";

interface DosenProfile {
  id: string;
  nama: string;
  nip: string;
  email: string;
  telepon: string;
  jabatan: string;
  fakultas: string;
  programStudi: string;
  esignature?: {
    url: string;
    key: string;
    uploadedAt: string;
  };
}

function pickString(...values: unknown[]): string {
  for (const value of values) {
    if (typeof value === "string" && value.trim().length > 0) {
      return value;
    }
  }
  return "";
}

function normalizeProfileResponse(
  rawData: unknown,
  fallback: DosenProfile,
): DosenProfile {
  const data = (rawData ?? {}) as Record<string, unknown>;
  const signature = (data.esignature ?? {}) as Record<string, unknown>;

  const signatureUrl = pickString(
    signature.url,
    signature.signatureImage,
    data.esignature_url,
    data.esignatureUrl,
    data.signatureUrl,
  );

  const next: DosenProfile = {
    id: pickString(data.id, data.dosenId, fallback.id),
    nama: pickString(data.nama, data.name, data.fullName, fallback.nama),
    nip: pickString(data.nip, fallback.nip),
    email: pickString(data.email, fallback.email),
    telepon: pickString(
      data.telepon,
      data.phone,
      data.no_telp,
      data.no_telepon,
      fallback.telepon,
    ),
    jabatan: pickString(data.jabatan, fallback.jabatan),
    fakultas: pickString(data.fakultas, fallback.fakultas),
    programStudi: pickString(
      data.programStudi,
      data.program_studi,
      data.prodi,
      fallback.programStudi,
    ),
    esignature: signatureUrl
      ? {
          url: signatureUrl,
          key: pickString(signature.key, data.esignature_key),
          uploadedAt: pickString(
            signature.uploadedAt,
            signature.uploaded_at,
            data.esignature_uploaded_at,
            new Date().toISOString(),
          ),
        }
      : undefined,
  };

  return next;
}

export function DosenProfilPage() {
  const [profile, setProfile] = useState<DosenProfile>({
    id: "",
    nama: "",
    nip: "",
    email: "",
    telepon: "",
    jabatan: "",
    fakultas: "",
    programStudi: "",
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

  // Load profile dari API
  useEffect(() => {
    const loadProfile = async () => {
      setIsLoading(true);
      const response = await getMyProfile();

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
      // Update profile via API
      const response = await updateMyProfile({
        nama: profile.nama,
        email: profile.email,
        telepon: profile.telepon,
        jabatan: profile.jabatan,
        fakultas: profile.fakultas,
        programStudi: profile.programStudi,
      });

      if (response.success && response.data) {
        // Update state with normalized response (supports alias keys)
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
      console.error("Error saving profile:", error);
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

      // Convert data URL to File
      const signatureFile = await dataUrlToFile(
        data.signatureData,
        `signature-${Date.now()}.png`,
      );

      // Upload to backend API
      const response = await uploadESignature(signatureFile);

      if (response.success && response.data) {
        // Update profile state with API response
        setProfile((prev) => ({
          ...prev,
          esignature: {
            url: response.data!.url,
            key: response.data!.key,
            uploadedAt: response.data!.uploadedAt,
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
      console.error("Error saving e-signature:", error);
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

      // Delete via backend API
      const response = await deleteESignature();

      if (response.success) {
        // Update profile state
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
      console.error("Error deleting e-signature:", error);
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

  // Show loading state
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
    <div className="relative space-y-8 overflow-hidden p-4 md:p-6 lg:p-8">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-16 -top-24 h-56 w-56 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -right-16 top-24 h-64 w-64 rounded-full bg-sky-500/10 blur-3xl" />
      </div>

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1.5">
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
            Profil Dosen
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground md:text-base">
            Kelola data profil dan e-signature Anda
          </p>
        </div>
        {!isEditing && (
          <Button
            onClick={() => setIsEditing(true)}
            variant="outline"
            className="gap-2 self-start"
          >
            <Edit className="h-4 w-4" />
            Edit Profil
          </Button>
        )}
      </div>

      {/* Notification */}
      {notification && (
        <Alert
          variant={notification.variant}
          className="border-border/70 shadow-sm backdrop-blur"
        >
          <CheckCircle2 className="h-5 w-5" />
          <AlertDescription>
            <div>
              <p className="font-semibold">{notification.title}</p>
              <p className="text-sm">{notification.description}</p>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Data Profil Card */}
      <Card className="border-border/70 bg-card/90 shadow-sm">
        <CardHeader className="">
          <CardTitle className="flex items-center gap-2 text-lg">
            <User className="h-6 w-6" />
            Data Profil
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2 md:gap-5">
            {/* Nama Lengkap */}
            <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
              <Label
                htmlFor="nama"
                className="mb-2 flex items-center gap-2 text-sm font-medium text-muted-foreground"
              >
                <User className="h-4 w-4" />
                Nama Lengkap
              </Label>
              {isEditing ? (
                <Input
                  id="nama"
                  className="h-11 bg-background/80"
                  value={profile.nama}
                  onChange={(e) =>
                    setProfile({ ...profile, nama: e.target.value })
                  }
                  placeholder="Masukkan nama lengkap"
                />
              ) : (
                <p className="text-base font-semibold tracking-tight">
                  {profile.nama}
                </p>
              )}
            </div>

            {/* NIP */}
            <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
              <Label
                htmlFor="nip"
                className="mb-2 flex items-center gap-2 text-sm font-medium text-muted-foreground"
              >
                <IdCard className="h-4 w-4" />
                NIP
              </Label>
              {isEditing ? (
                <Input
                  id="nip"
                  className="h-11 bg-background/80"
                  value={profile.nip}
                  onChange={(e) =>
                    setProfile({ ...profile, nip: e.target.value })
                  }
                  placeholder="Masukkan NIP"
                />
              ) : (
                <p className="text-base font-semibold tracking-tight">
                  {profile.nip}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
              <Label
                htmlFor="email"
                className="mb-2 flex items-center gap-2 text-sm font-medium text-muted-foreground"
              >
                <Mail className="h-4 w-4" />
                Email
              </Label>
              {isEditing ? (
                <Input
                  id="email"
                  type="email"
                  className="h-11 bg-background/80"
                  value={profile.email}
                  onChange={(e) =>
                    setProfile({ ...profile, email: e.target.value })
                  }
                  placeholder="Masukkan email"
                />
              ) : (
                <p className="text-base font-semibold tracking-tight">
                  {profile.email}
                </p>
              )}
            </div>

            {/* Telepon */}
            <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
              <Label
                htmlFor="telepon"
                className="mb-2 flex items-center gap-2 text-sm font-medium text-muted-foreground"
              >
                <Phone className="h-4 w-4" />
                Telepon
              </Label>
              {isEditing ? (
                <Input
                  id="telepon"
                  className="h-11 bg-background/80"
                  value={profile.telepon}
                  onChange={(e) =>
                    setProfile({ ...profile, telepon: e.target.value })
                  }
                  placeholder="Masukkan nomor telepon"
                />
              ) : (
                <p className="text-base font-semibold tracking-tight">
                  {profile.telepon}
                </p>
              )}
            </div>

            {/* Fakultas */}
            <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
              <Label
                htmlFor="fakultas"
                className="mb-2 flex items-center gap-2 text-sm font-medium text-muted-foreground"
              >
                <Building2 className="h-4 w-4" />
                Fakultas
              </Label>
              {isEditing ? (
                <Input
                  id="fakultas"
                  className="h-11 bg-background/80"
                  value={profile.fakultas}
                  onChange={(e) =>
                    setProfile({ ...profile, fakultas: e.target.value })
                  }
                  placeholder="Masukkan fakultas"
                />
              ) : (
                <p className="text-base font-semibold tracking-tight">
                  {profile.fakultas}
                </p>
              )}
            </div>

            {/* Program Studi */}
            <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
              <Label
                htmlFor="programStudi"
                className="mb-2 flex items-center gap-2 text-sm font-medium text-muted-foreground"
              >
                <Building2 className="h-4 w-4" />
                Program Studi
              </Label>
              {isEditing ? (
                <Input
                  id="programStudi"
                  className="h-11 bg-background/80"
                  value={profile.programStudi}
                  onChange={(e) =>
                    setProfile({ ...profile, programStudi: e.target.value })
                  }
                  placeholder="Masukkan program studi"
                />
              ) : (
                <p className="text-base font-semibold tracking-tight">
                  {profile.programStudi}
                </p>
              )}
            </div>
          </div>

          {/* Jabatan */}
          <div className="rounded-xl border border-border/60 bg-muted/20 p-4 md:col-span-2">
            <Label
              htmlFor="jabatan"
              className="mb-2 flex items-center gap-2 text-sm font-medium text-muted-foreground"
            >
              <Building2 className="h-4 w-4" />
              Jabatan
            </Label>
            {isEditing ? (
              <Input
                id="jabatan"
                className="h-11 bg-background/80"
                value={profile.jabatan}
                onChange={(e) =>
                  setProfile({ ...profile, jabatan: e.target.value })
                }
                placeholder="Masukkan jabatan"
              />
            ) : (
              <p className="text-base font-semibold tracking-tight">
                {profile.jabatan}
              </p>
            )}
          </div>
          {/* Action Buttons saat Edit */}
          {isEditing && (
            <div className="flex flex-col gap-3 border-t pt-5 sm:flex-row sm:justify-end">
              <Button
                onClick={handleSaveProfile}
                disabled={isSaving}
                className="gap-2 sm:min-w-44"
              >
                <Save className="h-4 w-4" />
                {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
              </Button>
              <Button
                onClick={() => setIsEditing(false)}
                variant="outline"
                disabled={isSaving}
                className="sm:min-w-28"
              >
                Batal
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Separator />

      {/* E-Signature Card */}
      <Card className="border-border/70 bg-card/90 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <FileSignature className="h-5 w-5" />
            Tanda Tangan Digital (E-Signature)
          </CardTitle>
          <CardDescription>
            Tanda tangan digital digunakan untuk menyetujui dokumen mahasiswa
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {profile.esignature ? (
            <div className="space-y-4">
              {/* Preview Signature */}
              <div className="rounded-xl border border-border/70 bg-muted/20 p-5">
                <p className="mb-3 text-sm font-medium text-muted-foreground">
                  Preview Tanda Tangan:
                </p>
                <div className="flex min-h-32 items-center justify-center rounded-lg border-2 border-dashed bg-white p-4">
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

              {/* Action Buttons */}
              <div className="flex flex-col gap-3 sm:flex-row">
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
                    Anda perlu membuat tanda tangan digital untuk dapat
                    menyetujui dokumen mahasiswa.
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

      {/* E-Signature Dialog */}
      <ESignatureDialog
        open={showESignatureDialog}
        onOpenChange={setShowESignatureDialog}
        onSave={handleSaveESignature}
        dosenName={profile.nama}
        nip={profile.nip}
        existingSignature={profile.esignature?.url}
      />

      {/* Delete E-Signature Confirmation Dialog */}
      <AlertDialog
        open={showDeleteSignatureDialog}
        onOpenChange={setShowDeleteSignatureDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Tanda Tangan Digital?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini akan menghapus tanda tangan digital Anda. Anda tidak
              akan bisa menyetujui dokumen mahasiswa sampai membuat tanda tangan
              baru.
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
