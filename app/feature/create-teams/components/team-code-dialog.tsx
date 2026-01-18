import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Copy, Check, Share2 } from "lucide-react";
import { useState } from "react";

interface TeamCodeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teamCode: string;
}

export function TeamCodeDialog({
  open,
  onOpenChange,
  teamCode,
}: TeamCodeDialogProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(teamCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const handleShare = async () => {
    const shareText = `Bergabunglah dengan tim KP saya!\n\nKode Tim: ${teamCode}\n\nGunakan kode ini untuk bergabung di Sistem Informasi Kerja Praktik.`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Kode Tim Kerja Praktik",
          text: shareText,
        });
      } catch (error) {
        // User cancelled share or error occurred
        console.log("Share cancelled or failed:", error);
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(shareText);
      alert("Teks untuk dibagikan telah disalin ke clipboard!");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">🎉 Tim Berhasil Dibuat!</DialogTitle>
          <DialogDescription>
            Tim Anda telah berhasil dibuat. Gunakan kode tim di bawah ini untuk
            mengundang anggota lain bergabung.
          </DialogDescription>
        </DialogHeader>

        <div className="py-6">
          <div className="text-center space-y-4">
            <p className="text-sm text-muted-foreground font-medium">
              Kode Tim Anda:
            </p>
            <div className="flex items-center justify-center gap-3">
              <Badge
                variant="outline"
                className="text-2xl font-mono font-bold py-3 px-6 bg-primary/5 border-primary/30"
              >
                {teamCode}
              </Badge>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCopy}
                className="h-10 w-10"
              >
                {copied ? (
                  <Check className="h-5 w-5 text-green-500" />
                ) : (
                  <Copy className="h-5 w-5" />
                )}
              </Button>
            </div>
            <div className="bg-muted/50 rounded-lg p-4 text-left">
              <p className="text-sm text-muted-foreground">
                <strong>Cara menggunakan:</strong>
              </p>
              <ul className="text-sm text-muted-foreground mt-2 space-y-1 list-disc list-inside">
                <li>Bagikan kode ini kepada anggota tim Anda</li>
                <li>Anggota dapat menggunakan kode untuk bergabung</li>
                <li>Atau Anda dapat mengundang langsung melalui NIM</li>
              </ul>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleShare}
            className="w-full sm:w-auto"
          >
            <Share2 className="mr-2 h-4 w-4" />
            Bagikan Kode
          </Button>
          <Button
            type="button"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto"
          >
            Mengerti
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
