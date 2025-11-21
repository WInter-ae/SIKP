import { useState } from "react";
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

interface JoinTeamDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onJoinTeam: (teamCode: string) => void;
}

export function JoinTeamDialog({
  open,
  onOpenChange,
  onJoinTeam,
}: JoinTeamDialogProps) {
  const [teamCode, setTeamCode] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (teamCode.trim()) {
      onJoinTeam(teamCode.trim());
      setTeamCode("");
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="text-gray-900">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-gray-900">Gabung Tim</DialogTitle>
            <DialogDescription className="text-gray-700">
              Masukkan kode tim untuk bergabung dengan tim yang sudah ada.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="teamCode" className="text-gray-900">Kode Tim</Label>
            <Input
              id="teamCode"
              placeholder="Masukkan kode tim (contoh: TEAM-ABC123)"
              value={teamCode}
              onChange={(e) => setTeamCode(e.target.value)}
              className="mt-2"
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Batal
            </Button>
            <Button type="submit" disabled={!teamCode.trim()}>
              Gabung
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
