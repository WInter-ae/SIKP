import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { Loader2, UserCheck } from "lucide-react";

import { Button } from "~/components/ui/button";
import { useUser } from "~/contexts/user-context";
import { getDashboardPath } from "~/lib/sso-types";

export default function IdentityChooserPage() {
  const navigate = useNavigate();
  const {
    user,
    isAuthenticated,
    isLoading,
    availableIdentities,
    activeIdentity,
    effectiveRoles,
    selectActiveIdentity,
    hydrateSession,
    callbackError,
    setCallbackError,
  } = useUser();

  const [selectedIdentityType, setSelectedIdentityType] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    void hydrateSession();
  }, [hydrateSession]);

  const shouldChooseIdentity = useMemo(
    () => availableIdentities.length > 1 && !activeIdentity,
    [availableIdentities, activeIdentity],
  );

  const accountInfo = useMemo(() => {
    const fallbackProfile = availableIdentities[0]?.profile;

    return {
      nama: user?.nama || fallbackProfile?.nama || "Akun SSO",
      email: user?.email || fallbackProfile?.email || null,
    };
  }, [availableIdentities, user]);

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      navigate("/login", { replace: true });
      return;
    }

    if (activeIdentity && !shouldChooseIdentity) {
      navigate(getDashboardPath(effectiveRoles, activeIdentity), {
        replace: true,
      });
      return;
    }

    if (availableIdentities.length === 1 && availableIdentities[0]) {
      setSelectedIdentityType(availableIdentities[0].identityType);
    }
  }, [
    activeIdentity,
    availableIdentities,
    effectiveRoles,
    isAuthenticated,
    isLoading,
    navigate,
    shouldChooseIdentity,
  ]);

  const handleSubmit = async () => {
    if (!selectedIdentityType) {
      setLocalError("Pilih salah satu identity terlebih dahulu.");
      return;
    }

    setCallbackError(null);
    setLocalError(null);
    setIsSubmitting(true);

    const success = await selectActiveIdentity(selectedIdentityType);
    setIsSubmitting(false);

    if (!success) {
      setLocalError("Gagal mengaktifkan identity terpilih.");
      return;
    }

    navigate("/dashboard", { replace: true });
  };

  if (isLoading) {
    return (
      <div className="flex min-h-svh items-center justify-center p-6">
        <div className="w-full max-w-md rounded-xl border border-border/60 bg-card p-6 text-center shadow-sm">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <h1 className="mt-4 text-xl font-semibold">Menyiapkan Identity</h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Sistem sedang memuat daftar identity dari sesi SSO Anda.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-svh items-center justify-center p-6">
      <div className="w-full max-w-2xl rounded-xl border border-border/60 bg-card p-6 shadow-sm">
        <div className="mb-6 text-center">
          <div className="bg-primary/10 text-primary mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full">
            <UserCheck className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-semibold">Pilih Identity Aktif</h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Anda memiliki lebih dari satu identity. Pilih identity aktif untuk
            masuk ke dashboard.
          </p>
          <div className="bg-muted/40 mt-4 rounded-lg border border-border/60 px-4 py-3 text-left">
            <p className="text-sm font-semibold">{accountInfo.nama}</p>
            <p className="text-muted-foreground text-xs">
              {accountInfo.email || "Email tidak tersedia"}
            </p>
          </div>
        </div>

        {availableIdentities.length === 0 ? (
          <div className="rounded-md border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            Identity tidak ditemukan pada sesi login saat ini. Silakan login
            ulang.
          </div>
        ) : (
          <div className="grid gap-3">
            {availableIdentities.map((identity) => {
              const isSelected = selectedIdentityType === identity.identityType;

              return (
                <button
                  key={identity.identityType}
                  type="button"
                  onClick={() => setSelectedIdentityType(identity.identityType)}
                  className={`w-full rounded-lg border p-4 text-left transition ${
                    isSelected
                      ? "border-primary bg-primary/5"
                      : "border-border/70 hover:border-primary/40"
                  }`}
                >
                  <p className="text-sm font-semibold">{identity.label}</p>
                  <p className="text-muted-foreground text-xs">
                    {identity.profile.nim ||
                      identity.profile.nip ||
                      "Pilih identity ini untuk melanjutkan"}
                  </p>
                </button>
              );
            })}
          </div>
        )}

        {(localError || callbackError) && (
          <div className="mt-4 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
            {localError || callbackError}
          </div>
        )}

        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
          <Button
            variant="outline"
            onClick={() => navigate("/login", { replace: true })}
            disabled={isSubmitting}
          >
            Login Ulang
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !selectedIdentityType}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Menyimpan...
              </>
            ) : (
              "Lanjut ke Dashboard"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
