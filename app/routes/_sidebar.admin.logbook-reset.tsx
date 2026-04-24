import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AlertTriangle, DatabaseZap, RotateCcw } from "lucide-react";

import { ProtectedRoute } from "~/components/protected-route";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Alert, AlertDescription } from "~/components/ui/alert";
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
  resetGlobalLogbook,
  type LogbookStatusFilter,
  type LogbookResetResult,
} from "~/lib/services/admin-logbook.service";

type FilterOption = "ALL" | LogbookStatusFilter;
type ConfirmMode = "filter" | "period-end";

function AdminLogbookResetPage() {
  const [filter, setFilter] = useState<FilterOption>("PENDING");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmMode, setConfirmMode] = useState<ConfirmMode>("filter");
  const [lastResult, setLastResult] = useState<LogbookResetResult | null>(null);
  const [activationDate, setActivationDate] = useState("");
  const [periodEndDate, setPeriodEndDate] = useState("");

  const todayISO = new Date().toISOString().slice(0, 10);
  const isActivationReady = Boolean(activationDate) && activationDate <= todayISO;
  const isPeriodEnded = Boolean(periodEndDate) && periodEndDate <= todayISO;

  useEffect(() => {
    const savedActivationDate = localStorage.getItem("admin_logbook_reset_activation_date");
    if (savedActivationDate) {
      setActivationDate(savedActivationDate);
    }

    const savedPeriodEndDate = localStorage.getItem("admin_logbook_reset_period_end_date");
    if (savedPeriodEndDate) {
      setPeriodEndDate(savedPeriodEndDate);
    }
  }, []);

  useEffect(() => {
    if (activationDate) {
      localStorage.setItem("admin_logbook_reset_activation_date", activationDate);
    } else {
      localStorage.removeItem("admin_logbook_reset_activation_date");
    }
  }, [activationDate]);

  useEffect(() => {
    if (periodEndDate) {
      localStorage.setItem("admin_logbook_reset_period_end_date", periodEndDate);
    } else {
      localStorage.removeItem("admin_logbook_reset_period_end_date");
    }
  }, [periodEndDate]);

  async function handleReset() {
    setIsSubmitting(true);

    try {
      const status =
        confirmMode === "period-end" ? undefined : filter === "ALL" ? undefined : filter;
      const response = await resetGlobalLogbook(status);

      if (!response.success) {
        toast.error(response.message || "Gagal mereset logbook.");
        return;
      }

      setLastResult(response.data || null);
      const deletedCount = response.data?.deletedCount ?? 0;
      toast.success(`Reset logbook berhasil. Total terhapus: ${deletedCount}`);
      setConfirmOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal mereset logbook.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const filterLabel =
    filter === "ALL" ? "SEMUA STATUS" : filter === "PENDING" ? "PENDING" : filter === "APPROVED" ? "APPROVED" : "REJECTED";
  const confirmTargetLabel =
    confirmMode === "period-end" ? "SEMUA STATUS (AKHIR PERIODE)" : filterLabel;

  return (
    <div className="space-y-6 p-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Reset Global Logbook</h1>
        <p className="text-sm text-muted-foreground">
          Fitur admin untuk membersihkan logbook secara massal berdasarkan status.
        </p>
      </div>

      <Alert className="border-amber-500/40 bg-amber-50 dark:bg-amber-950/20">
        <AlertTriangle className="h-4 w-4 text-amber-600" />
        <AlertDescription className="text-amber-800 dark:text-amber-300">
          Tindakan ini bersifat destruktif dan tidak bisa dibatalkan. Pastikan Anda memilih filter dengan benar.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Tanggal Aktivasi Tombol Reset</CardTitle>
          <CardDescription>
            Tombol reset hanya aktif saat tanggal hari ini mencapai tanggal aktivasi.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="max-w-sm space-y-2">
            <p className="text-sm font-medium">Tanggal Aktivasi</p>
            <input
              type="date"
              value={activationDate}
              onChange={(event) => setActivationDate(event.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
            />
          </div>

          <div className="rounded-md border bg-muted/20 p-3 text-sm">
            {activationDate
              ? isActivationReady
                ? "Tanggal aktivasi tercapai. Tombol reset sudah bisa digunakan."
                : `Tombol reset terkunci sampai ${activationDate}.`
              : "Atur tanggal aktivasi untuk mengunci tombol reset."}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DatabaseZap className="h-5 w-5" />
            Pilih Target Reset
          </CardTitle>
          <CardDescription>
            Endpoint: DELETE /api/admin/logbook/reset?status=...
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="max-w-sm space-y-2">
            <p className="text-sm font-medium">Filter Status</p>
            <Select value={filter} onValueChange={(value) => setFilter(value as FilterOption)}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih status logbook" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PENDING">PENDING</SelectItem>
                <SelectItem value="APPROVED">APPROVED</SelectItem>
                <SelectItem value="REJECTED">REJECTED</SelectItem>
                <SelectItem value="ALL">SEMUA STATUS</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border bg-muted/20 p-3 text-sm">
            Target reset saat ini: <span className="font-semibold">{filterLabel}</span>
          </div>

          <Button
            variant="destructive"
            onClick={() => {
              setConfirmMode("filter");
              setConfirmOpen(true);
            }}
            disabled={isSubmitting || !isActivationReady}
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset Logbook Global
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Reset Akhir Periode Magang</CardTitle>
          <CardDescription>
            Gunakan reset semua status saat periode magang sudah berakhir.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="max-w-sm space-y-2">
            <p className="text-sm font-medium">Tanggal Akhir Periode</p>
            <input
              type="date"
              value={periodEndDate}
              onChange={(event) => setPeriodEndDate(event.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
            />
          </div>

          <div className="rounded-md border bg-muted/20 p-3 text-sm">
            {periodEndDate
              ? isPeriodEnded
                ? "Periode sudah berakhir. Reset akhir periode siap dijalankan."
                : `Periode belum berakhir. Reset baru aktif pada ${periodEndDate}.`
              : "Pilih tanggal akhir periode terlebih dahulu."}
          </div>

          <Button
            variant="destructive"
            disabled={isSubmitting || !isActivationReady || !isPeriodEnded}
            onClick={() => {
              setConfirmMode("period-end");
              setConfirmOpen(true);
            }}
          >
            <AlertTriangle className="mr-2 h-4 w-4" />
            Reset Otomatis Akhir Periode
          </Button>
        </CardContent>
      </Card>

      {lastResult && (
        <Card>
          <CardHeader>
            <CardTitle>Hasil Reset Terakhir</CardTitle>
            <CardDescription>Ringkasan respons endpoint reset logbook.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              <span className="text-muted-foreground">Deleted Count:</span>{" "}
              <span className="font-semibold">{lastResult.deletedCount}</span>
            </p>
            <p>
              <span className="text-muted-foreground">Status Filter:</span>{" "}
              <span className="font-semibold">{lastResult.statusFilter || "ALL"}</span>
            </p>
          </CardContent>
        </Card>
      )}

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Reset Logbook</AlertDialogTitle>
            <AlertDialogDescription>
              Anda akan menghapus data logbook dengan filter <strong>{confirmTargetLabel}</strong>.
              Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault();
                void handleReset();
              }}
              disabled={isSubmitting}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {isSubmitting ? "Mereset..." : "Ya, Reset Sekarang"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default function Page() {
  return (
    <ProtectedRoute requiredRoles={["ADMIN"]}>
      <AdminLogbookResetPage />
    </ProtectedRoute>
  );
}
