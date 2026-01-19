import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Loader2 } from "lucide-react";

interface CreateTeamDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateTeam: () => void;
  teamName: string;
  onTeamNameChange: (name: string) => void;
  isCreating: boolean;
}

export function CreateTeamDialog({
  open,
  onOpenChange,
  onCreateTeam,
  teamName,
  onTeamNameChange,
  isCreating,
}: CreateTeamDialogProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateTeam();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Buat Tim Baru</DialogTitle>
            <DialogDescription>
              Masukkan nama tim untuk Kerja Praktik Anda. Setelah tim dibuat,
              Anda akan mendapatkan kode tim untuk dibagikan kepada anggota.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="team-name">Nama Tim</Label>
              <Input
                id="team-name"
                placeholder="Tim KP Informatika 2024"
                value={teamName}
                onChange={(e) => onTeamNameChange(e.target.value)}
                disabled={isCreating}
                autoFocus
                required
              />
              <p className="text-sm text-muted-foreground">
                Contoh: Tim KP Informatika, Tim Magang Tech Corp, dll.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isCreating}
            >
              Batal
            </Button>
            <Button type="submit" disabled={isCreating || !teamName.trim()}>
              {isCreating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Membuat...
                </>
              ) : (
                "Buat Tim"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
