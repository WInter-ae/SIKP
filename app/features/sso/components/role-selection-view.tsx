import type { LoginMode } from "~/features/sso/types/role.types";

interface RoleSelectionViewProps {
  loginModes: LoginMode[];
  onChooseMode: (mode: LoginMode) => void;
}

export function RoleSelectionView({
  loginModes,
  onChooseMode,
}: RoleSelectionViewProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-lg text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Pilih Mode Login
        </h1>
        <p className="text-gray-600 mb-6">
          Akun Anda memiliki beberapa role. Silakan pilih ingin masuk sebagai
          apa.
        </p>

        <div className="grid gap-3">
          {loginModes.includes("mahasiswa") && (
            <button
              type="button"
              onClick={() => onChooseMode("mahasiswa")}
              className="w-full rounded-md bg-primary px-4 py-2 text-primary-foreground hover:opacity-90"
            >
              Masuk sebagai Mahasiswa
            </button>
          )}

          {loginModes.includes("dosen") && (
            <button
              type="button"
              onClick={() => onChooseMode("dosen")}
              className="w-full rounded-md border border-input bg-background px-4 py-2 hover:bg-accent"
            >
              Masuk sebagai Dosen
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
