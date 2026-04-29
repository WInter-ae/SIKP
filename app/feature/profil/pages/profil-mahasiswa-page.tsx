import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { Separator } from "~/components/ui/separator";
import {
  User,
  Mail,
  Phone,
  IdCard,
  Building2,
  FileSignature,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import { getMyMahasiswaProfile } from "~/lib/services/mahasiswa.service";
import {
  getActiveProfileSignature,
  getSignatureManageUrl,
} from "~/lib/services/signature.service";

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

  const isSaving = false;
  const [isLoading, setIsLoading] = useState(true);
  const [signatureManageUrl, setSignatureManageUrl] = useState<string | null>(
    null,
  );
  const profileManageUrl = import.meta.env.VITE_SSO_PROFILE_URL || null;
  const [signatureImageError, setSignatureImageError] = useState(false);
  const [notification, setNotification] = useState<{
    title: string;
    description: string;
    variant?: "default" | "destructive";
  } | null>(null);

  const syncActiveSignature = async () => {
    const response = await getActiveProfileSignature();

    if (!response.success) {
      return;
    }

    setProfile((prev) => ({
      ...prev,
      esignature: response.data
        ? {
            url: response.data.signatureImage,
            key: response.data.id,
            uploadedAt: response.data.uploadedAt || new Date().toISOString(),
          }
        : undefined,
    }));
    setSignatureImageError(false);
  };

  const loadSignatureManageUrl = async () => {
    const response = await getSignatureManageUrl();
    if (response.success && response.data) {
      setSignatureManageUrl(response.data);
    }
  };

  useEffect(() => {
    const loadProfile = async () => {
      setIsLoading(true);
      const response = await getMyMahasiswaProfile();

      if (response.success && response.data) {
        setProfile((prev) => normalizeProfileResponse(response.data, prev));
        await syncActiveSignature();
        await loadSignatureManageUrl();
      } else {
        setNotification({
          title: "âš ï¸ Gagal Memuat Profil",
          description:
            response.message || "Terjadi kesalahan saat memuat profil",
          variant: "destructive",
        });
        setTimeout(() => setNotification(null), 4000);
      }

      setIsLoading(false);
    };

    void loadProfile();
  }, []);

  const openManageProfile = () => {
    if (!profileManageUrl) {
      setNotification({
        title: "âŒ URL SSO Tidak Tersedia",
        description: "VITE_SSO_PROFILE_URL belum dikonfigurasi.",
        variant: "destructive",
      });
      setTimeout(() => setNotification(null), 4000);
      return;
    }

    window.open(profileManageUrl, "_blank", "noopener,noreferrer");
  };

  const openManageSignature = () => {
    if (!signatureManageUrl) {
      setNotification({
        title: "âŒ URL Signature SSO Tidak Tersedia",
        description:
          "Endpoint manage signature atau env URL signature belum siap.",
        variant: "destructive",
      });
      setTimeout(() => setNotification(null), 4000);
      return;
    }

    window.open(signatureManageUrl, "_blank", "noopener,noreferrer");
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
    <div className="relative space-y-8 overflow-hidden p-4 md:p-6 lg:p-8">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-16 -top-24 h-56 w-56 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -right-16 top-24 h-64 w-64 rounded-full bg-sky-500/10 blur-3xl" />
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1.5">
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
            Profil Mahasiswa
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground md:text-base">
            Profil dan e-signature bersifat read-only di SIKP
          </p>
        </div>
        <Button
          onClick={openManageProfile}
          variant="outline"
          className="gap-2 self-start"
          disabled={isSaving}
        >
          <ExternalLink className="h-4 w-4" />
          Kelola Profil di SSO
        </Button>
      </div>

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

      <Card className="border-border/70 bg-card/90 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <User className="h-6 w-6" />
            Data Profil
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2 md:gap-5">
            <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
              <Label className="mb-2 flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <User className="h-4 w-4" />
                Nama Lengkap
              </Label>
              <p className="text-base font-semibold tracking-tight">
                {profile.nama || "-"}
              </p>
            </div>

            <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
              <Label className="mb-2 flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <IdCard className="h-4 w-4" />
                NIM
              </Label>
              <p className="text-base font-semibold tracking-tight">
                {profile.nim || "-"}
              </p>
            </div>

            <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
              <Label className="mb-2 flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Mail className="h-4 w-4" />
                Email
              </Label>
              <p className="text-base font-semibold tracking-tight">
                {profile.email || "-"}
              </p>
            </div>

            <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
              <Label className="mb-2 flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Phone className="h-4 w-4" />
                Telepon
              </Label>
              <p className="text-base font-semibold tracking-tight">
                {profile.phone || "-"}
              </p>
            </div>

            <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
              <Label className="mb-2 flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Building2 className="h-4 w-4" />
                Fakultas
              </Label>
              <p className="text-base font-semibold tracking-tight">
                {profile.fakultas || "-"}
              </p>
            </div>

            <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
              <Label className="mb-2 flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Building2 className="h-4 w-4" />
                Program Studi
              </Label>
              <p className="text-base font-semibold tracking-tight">
                {profile.prodi || "-"}
              </p>
            </div>

            <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
              <Label className="mb-2 flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Building2 className="h-4 w-4" />
                Semester
              </Label>
              <p className="text-base font-semibold tracking-tight">
                {profile.semester || "-"}
              </p>
            </div>

            <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
              <Label className="mb-2 flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Building2 className="h-4 w-4" />
                Jumlah SKS Selesai
              </Label>
              <p className="text-base font-semibold tracking-tight">
                {profile.jumlahSksSelesai || "-"}
              </p>
            </div>

            <div className="rounded-xl border border-border/60 bg-muted/20 p-4 md:col-span-2">
              <Label className="mb-2 flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Building2 className="h-4 w-4" />
                Angkatan
              </Label>
              <p className="text-base font-semibold tracking-tight">
                {profile.angkatan || "-"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator />

      <Card className="border-border/70 bg-card/90 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <FileSignature className="h-5 w-5" />
            Tanda Tangan Digital (E-Signature)
          </CardTitle>
          <CardDescription>
            Preview signature aktif. Perubahan dilakukan di SSO.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {profile.esignature ? (
            <div className="space-y-4">
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

              <Button
                onClick={openManageSignature}
                variant="outline"
                className="w-full gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                Kelola Signature di SSO
              </Button>
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
                onClick={openManageSignature}
                className="h-11 w-full gap-2"
              >
                <ExternalLink className="h-5 w-5" />
                Kelola Signature di SSO
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
