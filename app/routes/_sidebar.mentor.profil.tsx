import { useEffect } from "react";

export default function RedirectToSSO() {
  useEffect(() => {
    window.location.href = "https://sso-unsri.vercel.app/profile";
  }, []);

  return (
    <div className="flex h-[400px] items-center justify-center">
      <div className="flex flex-col items-center gap-2">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground">Mengarahkan ke profil SSO...</p>
      </div>
    </div>
  );
}
