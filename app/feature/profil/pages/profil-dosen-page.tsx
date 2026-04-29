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
import { getMyProfile } from "~/lib/services/dosen.service";
import {
  getActiveProfileSignature,
  getSignatureManageUrl,
} from "~/lib/services/signature.service";

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

  // Load profile dari API
  useEffect(() => {
    const loadProfile = async () => {
      setIsLoading(true);
      const response = await getMyProfile();

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

    loadProfile();
  }, []);

  const handleSaveProfile = async () => {
    setNotification({
      title: "â„¹ï¸ Profil Dikelola di SSO",
      description:
        "Perubahan profil dilakukan di SSO. Gunakan tombol Kelola Profil di SSO.",
    });
    setTimeout(() => setNotification(null), 3500);
  };

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
            Profil dan e-signature bersifat read-only di SIKP
          </p>
        </div>
        <Button
          onClick={openManageProfile}
          variant="outline"
          className="gap-2 self-start"
        >
          <ExternalLink className="h-4 w-4" />
          Kelola Profil di SSO
        </Button>
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
              <p className="text-base font-semibold tracking-tight">
                {profile.nama || "-"}
              </p>
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
              <p className="text-base font-semibold tracking-tight">
                {profile.nip || "-"}
              </p>
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
              <p className="text-base font-semibold tracking-tight">
                {profile.email || "-"}
              </p>
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
              <p className="text-base font-semibold tracking-tight">
                {profile.telepon || "-"}
              </p>
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
              <p className="text-base font-semibold tracking-tight">
                {profile.fakultas || "-"}
              </p>
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
              <p className="text-base font-semibold tracking-tight">
                {profile.programStudi || "-"}
              </p>
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
            <p className="text-base font-semibold tracking-tight">
              {profile.jabatan || "-"}
            </p>
          </div>
          <div className="flex flex-col gap-3 border-t pt-5 sm:flex-row sm:justify-end">
            <Button
              onClick={handleSaveProfile}
              disabled={isSaving}
              className="gap-2 sm:min-w-44"
            >
              <ExternalLink className="h-4 w-4" />
              Kelola Profil di SSO
            </Button>
          </div>
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
            Preview signature aktif. Perubahan dilakukan di SSO.
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
                    Anda perlu membuat tanda tangan digital untuk dapat
                    menyetujui dokumen mahasiswa.
                  </p>
                </AlertDescription>
              </Alert>

              <Button
                onClick={openManageSignature}
                className="w-full gap-2 h-11"
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
