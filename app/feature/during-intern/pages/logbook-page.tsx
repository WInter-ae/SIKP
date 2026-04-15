import { useState, useEffect } from "react";
import { Link } from "react-router";
import { toast } from "sonner";
import {
  ArrowLeft,
  Calendar,
  FileText,
  Plus,
  Save,
  Sparkles,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  Download,
  Edit,
  User,
  Building,
  File,
} from "lucide-react";
import { id as localeId } from "date-fns/locale";

import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { Badge } from "~/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { Calendar as UiCalendar } from "~/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
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

// API Services
import { getCompleteInternshipData } from "~/feature/during-intern/services";
import type { CompleteInternshipData } from "~/feature/during-intern/services/student-api";
import {
  createLogbookEntry,
  getLogbookEntries,
  updateLogbookEntry,
  deleteLogbookEntry,
  submitLogbookForApproval,
} from "~/feature/during-intern/services/logbook-api";

// Utility Functions
import {
  createLogbookDOCXBlob,
  generateLogbookDOCX,
  getLogbookDocxFileName,
} from "~/feature/during-intern/utils/generate-logbook-docx";

interface LogbookEntry {
  id: string;
  date: string;
  description: string;
  hours?: number;
  status?: "DRAFT" | "PENDING" | "APPROVED" | "REJECTED";
  mentorSignature?: {
    status: "approved" | "revision" | "rejected";
    signedAt: string;
    mentorName: string;
    notes?: string;
  };
}

interface WorkPeriod {
  startDate?: string;
  endDate?: string;
  startDay?: string;
  endDay?: string;
}

const DAYS_OPTIONS = [
  { value: "senin", label: "Senin" },
  { value: "selasa", label: "Selasa" },
  { value: "rabu", label: "Rabu" },
  { value: "kamis", label: "Kamis" },
  { value: "jumat", label: "Jumat" },
  { value: "sabtu", label: "Sabtu" },
  { value: "minggu", label: "Minggu" },
];

function mapBackendLogbookEntry(entry: {
  id: string;
  date: string;
  activity?: string;
  description?: string;
  hours?: number;
  status?: string;
  submittedAt?: string | null;
  submitted_at?: string | null;
  isSubmitted?: boolean;
  submitted?: boolean;
  is_submitted?: boolean;
  rejectionReason?: string | null;
  verifiedBy?: string | null;
  verifiedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}) {
  const normalizedStatus = String(entry.status || "").toUpperCase();
  const createdMs = Date.parse(String(entry.createdAt || ""));
  const updatedMs = Date.parse(String(entry.updatedAt || ""));
  const updatedAfterCreate =
    Number.isFinite(createdMs) &&
    Number.isFinite(updatedMs) &&
    updatedMs > createdMs;
  const hasSubmittedMarkers = Boolean(
    entry.submittedAt ||
      entry.submitted_at ||
      entry.isSubmitted ||
      entry.submitted ||
      entry.is_submitted ||
      updatedAfterCreate,
  );
  const mappedStatus: LogbookEntry["status"] =
    normalizedStatus === "APPROVED" || normalizedStatus === "REJECTED"
      ? (normalizedStatus as LogbookEntry["status"])
      : normalizedStatus === "PENDING"
        ? hasSubmittedMarkers
          ? "PENDING"
          : "DRAFT"
        : normalizedStatus === "DRAFT" ||
            normalizedStatus === "UNSUBMITTED" ||
            normalizedStatus === "BELUM_DIAJUKAN"
          ? "DRAFT"
          : hasSubmittedMarkers
            ? "PENDING"
            : "DRAFT";

  const signatureStatus =
    mappedStatus === "APPROVED"
      ? "approved"
      : mappedStatus === "REJECTED"
        ? "rejected"
        : normalizedStatus === "REVISION" || normalizedStatus === "REVISED"
          ? "revision"
          : null;

  return {
    id: entry.id,
    date: entry.date,
    description: entry.description || entry.activity || "",
    hours: entry.hours,
    status: mappedStatus,
    mentorSignature: signatureStatus
      ? {
          status: signatureStatus,
          signedAt:
            entry.verifiedAt ||
            entry.updatedAt ||
            entry.createdAt ||
            new Date().toISOString(),
          mentorName: entry.verifiedBy || "Backend",
          notes: entry.rejectionReason || undefined,
        }
      : undefined,
  } satisfies LogbookEntry;
}

function LogbookPage() {
  const [isPeriodSaved, setIsPeriodSaved] = useState(false);
  const [workPeriod, setWorkPeriod] = useState<WorkPeriod>({
    startDay: "senin",
    endDay: "jumat",
  });
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [description, setDescription] = useState("");
  const [logbookEntries, setLogbookEntries] = useState<LogbookEntry[]>([]);
  const [isSavingLogbook, setIsSavingLogbook] = useState(false);
  const [generatedDates, setGeneratedDates] = useState<string[]>([]);
  const [periodSource, setPeriodSource] = useState<"auto" | "manual" | null>(
    null,
  ); // Track sumber periode
  const [showSubmitConfirmDialog, setShowSubmitConfirmDialog] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState<Date>(new Date());

  // Edit mode state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  // Complete internship data from backend (includes student, submission, team, mentor, lecturer)
  const [completeData, setCompleteData] =
    useState<CompleteInternshipData | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [showEmptyDataDialog, setShowEmptyDataDialog] = useState(false);

  // Format choice dialog for export
  const [showFormatChoiceDialog, setShowFormatChoiceDialog] = useState(false);
  const [selectedExportFormat, setSelectedExportFormat] = useState<
    "docx" | "pdf" | null
  >(null);

  // Fetch complete internship data (⭐ ONE API CALL FOR ALL DATA)
  useEffect(() => {
    async function fetchInternshipData() {
      try {
        const response = await getCompleteInternshipData();

        if (response.success && response.data) {
          setCompleteData(response.data);

          // ✅ AUTO-POPULATE periode dari data submission (per mahasiswa)
          const submission = response.data.submission;
          if (submission?.startDate && submission?.endDate) {
            // Periode tersedia dari submission - auto-populate!
            const autoWorkPeriod = {
              startDate: submission.startDate,
              endDate: submission.endDate,
              startDay: "senin",
              endDay: "jumat",
            };

            setWorkPeriod(autoWorkPeriod);
            setPeriodSource("auto"); // Mark sebagai auto-populate

            // Cek localStorage untuk dates yang sudah digenerate
            const savedPeriodState = localStorage.getItem(
              "logbook_period_saved",
            );
            const savedDates = localStorage.getItem("logbook_generated_dates");
            const savedWorkPeriod = localStorage.getItem("logbook_work_period");
            // Jika sudah pernah generate dengan periode yang sama, restore dari localStorage
            if (savedPeriodState === "true" && savedDates && savedWorkPeriod) {
              const saved = JSON.parse(savedWorkPeriod);
              if (
                saved.startDate === submission.startDate &&
                saved.endDate === submission.endDate
              ) {
                setIsPeriodSaved(true);
                setGeneratedDates(JSON.parse(savedDates));
                toast.success("Periode magang dan logbook berhasil dimuat!");
                return; // Exit early karena sudah restore dari localStorage
              }
            }

            // Jika belum pernah generate atau periode berbeda, auto-generate sekarang!
            const dates = generateDatesFromPeriod(
              autoWorkPeriod.startDate,
              autoWorkPeriod.endDate,
              autoWorkPeriod.startDay,
              autoWorkPeriod.endDay,
            );

            setGeneratedDates(dates);
            setIsPeriodSaved(true);

            // Save ke localStorage
            localStorage.setItem("logbook_period_saved", "true");
            localStorage.setItem(
              "logbook_generated_dates",
              JSON.stringify(dates),
            );
            localStorage.setItem(
              "logbook_work_period",
              JSON.stringify(autoWorkPeriod),
            );

            toast.success(
              `Periode otomatis dari pengajuan! ${dates.length} hari kerja telah digenerate.`,
            );
          } else {
            // Tidak ada data submission - coba restore dari localStorage (input manual sebelumnya)
            const savedPeriodState = localStorage.getItem(
              "logbook_period_saved",
            );
            const savedDates = localStorage.getItem("logbook_generated_dates");
            const savedWorkPeriod = localStorage.getItem("logbook_work_period");
            if (savedPeriodState === "true" && savedDates && savedWorkPeriod) {
              // Restore input manual sebelumnya
              setIsPeriodSaved(true);
              setGeneratedDates(JSON.parse(savedDates));
              setWorkPeriod(JSON.parse(savedWorkPeriod));
              setPeriodSource("manual"); // Mark sebagai manual input
              toast.success("Periode logbook manual berhasil dimuat!");
            } else {
              // Belum ada data submission DAN belum pernah input manual
              setPeriodSource(null);
              toast.info(
                "Silakan input periode kerja Anda secara manual di Step 1",
              );
            }
          }
        } else {
          // Check if it's an authentication error
          if (
            response.message?.toLowerCase().includes("unauthorized") ||
            response.message?.toLowerCase().includes("token")
          ) {
            toast.error(
              "Session expired. Anda akan diarahkan ke halaman login...",
              {
                duration: 3000,
              },
            );
            // Redirect to login after 3 seconds if not already redirected
            setTimeout(() => {
              if (window.location.pathname !== "/login") {
                window.location.href = "/login?reason=unauthorized";
              }
            }, 3000);
          } else {
            toast.error(response.message || "Gagal memuat data magang");
          }
        }
      } catch {
        toast.error("Gagal memuat data magang");
      } finally {
        setIsLoadingProfile(false);
      }
    }

    fetchInternshipData();
  }, []);

  useEffect(() => {
    async function fetchLogbookFromBackend() {
      if (!completeData?.student?.userId) return;

      try {
        const response = await getLogbookEntries();
        if (!response.success || !response.data) {
          return;
        }

        const backendEntries = response.data.entries.map(
          mapBackendLogbookEntry,
        );

        setLogbookEntries(backendEntries);
      } catch {
        // keep current UI state when fetch fails
      }
    }

    fetchLogbookFromBackend();
  }, [completeData?.student?.userId]);

  // Helper function untuk generate dates
  const generateDatesFromPeriod = (
    startDate: string,
    endDate: string,
    startDay: string,
    endDay: string,
  ): string[] => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const dates: string[] = [];

    const dayMap: { [key: string]: number } = {
      minggu: 0,
      senin: 1,
      selasa: 2,
      rabu: 3,
      kamis: 4,
      jumat: 5,
      sabtu: 6,
    };

    const startDayNum = dayMap[startDay.toLowerCase()] || 1;
    const endDayNum = dayMap[endDay.toLowerCase()] || 5;
    const MS_PER_DAY = 24 * 60 * 60 * 1000;

    for (
      let d = new Date(start);
      d <= end;
      d = new Date(d.getTime() + MS_PER_DAY)
    ) {
      const currentDay = d.getDay();

      if (startDayNum <= endDayNum) {
        if (currentDay >= startDayNum && currentDay <= endDayNum) {
          dates.push(d.toISOString().split("T")[0]);
        }
      } else {
        if (currentDay >= startDayNum || currentDay <= endDayNum) {
          dates.push(d.toISOString().split("T")[0]);
        }
      }
    }

    return dates;
  };

  const handleSubmitPeriod = () => {
    if (!workPeriod.startDate || !workPeriod.endDate) {
      toast.error("Mohon lengkapi periode kerja praktik!");
      return;
    }

    const start = new Date(workPeriod.startDate);
    const end = new Date(workPeriod.endDate);

    if (end < start) {
      toast.error(
        "Tanggal selesai harus setelah atau sama dengan tanggal mulai!",
      );
      return;
    }

    // Generate dates
    const dates = generateDatesFromPeriod(
      workPeriod.startDate,
      workPeriod.endDate,
      workPeriod.startDay || "senin",
      workPeriod.endDay || "jumat",
    );

    setGeneratedDates(dates);
    setIsPeriodSaved(true);
    setPeriodSource("manual"); // Mark sebagai manual input

    // Save to localStorage
    localStorage.setItem("logbook_period_saved", "true");
    localStorage.setItem("logbook_generated_dates", JSON.stringify(dates));
    localStorage.setItem("logbook_work_period", JSON.stringify(workPeriod));

    toast.success(
      `Periode berhasil disimpan! ${dates.length} hari kerja telah digenerate.`,
    );
  };

  const handleEditPeriod = () => {
    setIsPeriodSaved(false);
    setGeneratedDates([]);
    setLogbookEntries([]);
    setPeriodSource(null); // Reset period source

    // Clear localStorage
    localStorage.removeItem("logbook_period_saved");
    localStorage.removeItem("logbook_generated_dates");
    localStorage.removeItem("logbook_work_period");

    toast.info(
      "Periode logbook direset. Silakan input periode baru secara manual.",
    );
  };

  const handleAddLogbook = () => {
    if (isSavingLogbook) return;

    if (!selectedDate || !description.trim()) {
      toast.error("Mohon lengkapi tanggal dan deskripsi!");
      return;
    }

    if (!generatedDates.includes(selectedDate)) {
      toast.error(
        "Tanggal tidak termasuk hari kerja pada periode yang sudah Anda set. Pilih tanggal sesuai periode kerja praktik.",
      );
      return;
    }

    // Prevent duplicate entries on same date (unless editing)
    const existingEntry = logbookEntries.find(
      (entry) => entry.date === selectedDate,
    );
    if (existingEntry && existingEntry.id !== editingId) {
      toast.error(
        "Sudah ada logbook untuk tanggal ini! Hapus atau edit yang sudah ada terlebih dahulu.",
      );
      return;
    }

    const activityText = description.trim();

    const submitEntry = async () => {
      if (!completeData?.student?.userId) {
        toast.error("Data mahasiswa belum siap.");
        return;
      }

      try {
        setIsSavingLogbook(true);

        if (editingId) {
          // Update existing entry
          const response = await updateLogbookEntry(editingId, {
            date: selectedDate,
            activity: activityText,
            description: activityText,
          });

          if (!response.success || !response.data) {
            throw new Error(
              response.message || "Gagal memperbarui logbook ke backend.",
            );
          }

          const updatedEntry = mapBackendLogbookEntry(response.data);
          const updatedEntries = logbookEntries.map((entry) =>
            entry.id === editingId ? updatedEntry : entry,
          );

          setLogbookEntries(updatedEntries);
          setEditingId(null);
          toast.success("Logbook berhasil diperbarui!");
        } else {
          // Create new entry
          const response = await createLogbookEntry({
            date: selectedDate,
            activity: activityText,
            description: activityText,
          });

          if (!response.success || !response.data) {
            throw new Error(
              response.message || "Gagal menyimpan logbook ke backend.",
            );
          }

          const createdEntry = mapBackendLogbookEntry(response.data);
          const updatedEntries = [...logbookEntries, createdEntry];

          setLogbookEntries(updatedEntries);
          toast.success("Logbook berhasil disimpan ke backend!");
        }

        setSelectedDate("");
        setDescription("");
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Gagal menyimpan logbook ke backend.",
        );
      } finally {
        setIsSavingLogbook(false);
      }
    };

    void submitEntry();
  };

  const handleEditLogbook = (entry: LogbookEntry) => {
    // Check if entry is approved - jangan bisa edit
    if (entry.mentorSignature?.status === "approved") {
      toast.error(
        "Tidak bisa mengedit logbook yang sudah disetujui. Hanya entri PENDING yang dapat diubah.",
      );
      return;
    }
    setEditingId(entry.id);
    setSelectedDate(entry.date);
    setDescription(entry.description);
  };

  const handleDeleteLogbook = (id: string) => {
    if (isSavingLogbook) return;

    const deleteEntry = async () => {
      try {
        setIsSavingLogbook(true);

        const response = await deleteLogbookEntry(id);

        if (!response.success) {
          throw new Error(
            response.message || "Gagal menghapus logbook dari backend.",
          );
        }

        const updatedEntries = logbookEntries.filter(
          (entry) => entry.id !== id,
        );
        setLogbookEntries(updatedEntries);
        toast.success("Logbook berhasil dihapus!");
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Gagal menghapus logbook dari backend.",
        );
      } finally {
        setIsSavingLogbook(false);
      }
    };

    void deleteEntry();
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setSelectedDate("");
    setDescription("");
  };

  const getWordCount = (text: string): number => {
    return text
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0).length;
  };

  const toDateKey = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const fromDateKey = (dateKey: string): Date =>
    new Date(`${dateKey}T00:00:00`);

  const shiftSelectedDate = (deltaDays: number) => {
    const baseDate = selectedDate
      ? fromDateKey(selectedDate)
      : generatedDates.length > 0
        ? fromDateKey(generatedDates[0])
        : new Date();
    const nextDate = new Date(baseDate);
    nextDate.setDate(nextDate.getDate() + deltaDays);
    setSelectedDate(toDateKey(nextDate));
    setCalendarMonth(nextDate);
  };

  const filledDateSet = new Set(logbookEntries.map((entry) => entry.date));

  const handleSubmitLogbook = async () => {
    if (isSavingLogbook) return;

    const invalidEntries = logbookEntries.filter(
      (entry) => !generatedDates.includes(entry.date),
    );
    if (invalidEntries.length > 0) {
      toast.error(
        `Ditemukan ${invalidEntries.length} entri dengan tanggal di luar hari kerja periode kerja praktik. Perbaiki atau hapus dulu sebelum ajukan.`,
      );
      return;
    }

    // Get entries that are not yet submitted (PENDING status)
    const pendingEntries = logbookEntries.filter(
      (entry) => entry.mentorSignature?.status !== "approved",
    );

    if (pendingEntries.length === 0) {
      toast.info("Semua logbook sudah diajukan atau disetujui mentor!");
      return;
    }

    const submitAll = async () => {
      try {
        setIsSavingLogbook(true);

        let successCount = 0;
        const results = [];

        for (const entry of pendingEntries) {
          try {
            const response = await submitLogbookForApproval(entry.id);

            if (response.success) {
              results.push({ id: entry.id, success: true });
              successCount++;
            } else {
              results.push({
                id: entry.id,
                success: false,
                error: response.message,
              });
            }
          } catch (error) {
            results.push({
              id: entry.id,
              success: false,
              error:
                error instanceof Error ? error.message : "Gagal submit entry",
            });
          }
        }

        // Update logbook entries with new status (refresh)
        const refreshResponse = await getLogbookEntries();
        if (refreshResponse.success && refreshResponse.data) {
          const refreshedEntries = refreshResponse.data.entries.map(
            mapBackendLogbookEntry,
          );
          setLogbookEntries(refreshedEntries);
        }

        if (successCount === pendingEntries.length) {
          toast.success(
            `✅ Semua ${successCount} logbook berhasil diajukan ke mentor!`,
          );
        } else {
          toast.warning(
            `⚠️ ${successCount} dari ${pendingEntries.length} logbook berhasil diajukan. ${pendingEntries.length - successCount} gagal.`,
          );
        }
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Gagal mengajukan logbook ke mentor.",
        );
      } finally {
        setIsSavingLogbook(false);
      }
    };

    void submitAll();
  };

  const getLogbookForDate = (date: string) => {
    return logbookEntries.find((entry) => entry.date === date);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const getDayName = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", { weekday: "long" });
  };

  const getWeekNumber = (dateString: string) => {
    if (!generatedDates.length) return 0;

    // Find the index of current date in generatedDates
    const currentIndex = generatedDates.indexOf(dateString);
    if (currentIndex === -1) return 0;

    // Count weeks by looking at Friday or last working day of the week
    let weekNumber = 1;
    for (let i = 0; i < currentIndex; i++) {
      const currentDate = new Date(generatedDates[i]);
      const nextDate =
        i + 1 < generatedDates.length ? new Date(generatedDates[i + 1]) : null;
      const currentDay = currentDate.getDay();

      // Check if this is the last day of week (Friday=5, Saturday=6, Sunday=0)
      // or if next day is Monday (1) which means this is end of week
      if (nextDate) {
        const nextDay = nextDate.getDay();
        // If current is Fri/Sat/Sun OR next day is Monday, increment week
        if (
          currentDay === 5 ||
          currentDay === 6 ||
          currentDay === 0 ||
          nextDay === 1
        ) {
          weekNumber++;
        }
      }
    }

    return weekNumber;
  };

  const getWeekRowSpan = (dates: string[], currentIndex: number) => {
    const currentWeek = getWeekNumber(dates[currentIndex]);
    let count = 1;

    for (let i = currentIndex + 1; i < dates.length; i++) {
      if (getWeekNumber(dates[i]) === currentWeek) {
        count++;
      } else {
        break;
      }
    }

    return count;
  };

  const getMentorSignatureBadge = (entry: LogbookEntry | undefined) => {
    if (!entry) {
      return (
        <Badge variant="outline" className="bg-gray-50">
          <span className="text-muted-foreground">Belum diisi</span>
        </Badge>
      );
    }

    if (entry.status === "DRAFT") {
      return (
        <Badge variant="outline" className="bg-slate-100">
          <span className="text-slate-700">Belum Diajukan</span>
        </Badge>
      );
    }

    if (!entry.mentorSignature) {
      return (
        <Badge variant="outline" className="bg-yellow-50">
          <Clock className="w-3 h-3 mr-1" />
          Menunggu Paraf
        </Badge>
      );
    }

    switch (entry.mentorSignature.status) {
      case "approved":
        return (
          <Badge className="bg-green-500">
            <CheckCircle className="w-3 h-3 mr-1" />
            Disetujui
          </Badge>
        );
      case "revision":
        return (
          <Badge className="bg-yellow-500">
            <AlertCircle className="w-3 h-3 mr-1" />
            Perlu Revisi
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="destructive">
            <XCircle className="w-3 h-3 mr-1" />
            Ditolak
          </Badge>
        );
    }
  };

  const handleExportToFile = async () => {
    // Validasi minimal: harus ada periode dan tanggal yang digenerate
    if (!workPeriod.startDate || !workPeriod.endDate) {
      toast.error("Periode kerja praktik belum diset");
      return;
    }
    if (generatedDates.length === 0) {
      toast.error("Belum ada tanggal yang digenerate");
      return;
    }

    // Cek apakah data magang lengkap (student dan submission data)
    const isDataMissing =
      !completeData || !completeData.student || !completeData.submission;

    if (isDataMissing) {
      // Tampilkan dialog konfirmasi data kosong
      setShowEmptyDataDialog(true);
    } else if (hasApprovedEntries()) {
      // Data lengkap DAN ada entri yang approved - tampilkan format choice dialog
      setShowFormatChoiceDialog(true);
    } else {
      // Data lengkap tapi belum ada entri approved - langsung generate DOCX
      await generateDirectly("docx");
    }
  };

  const buildLogbookData = () => ({
    student: {
      name: completeData?.student?.name || "[Nama Mahasiswa]",
      nim: completeData?.student?.nim || "[NIM]",
      prodi: completeData?.student?.prodi || "Manajemen Informatika",
      fakultas: completeData?.student?.fakultas || "Ilmu Komputer",
    },
    internship: {
      company: completeData?.submission?.company || "[Nama Perusahaan]",
      division: completeData?.submission?.division || "[Nama Divisi]",
      position:
        completeData?.submission?.division ||
        completeData?.submission?.company ||
        "[Posisi]",
      mentorName: completeData?.mentor?.name || "[Nama Pembimbing Lapangan]",
      mentorSignature: completeData?.mentor?.signature,
      startDate: completeData?.submission?.startDate || workPeriod.startDate!,
      endDate: completeData?.submission?.endDate || workPeriod.endDate!,
    },
    workPeriod: {
      startDate: workPeriod.startDate!,
      endDate: workPeriod.endDate!,
      startDay: workPeriod.startDay,
      endDay: workPeriod.endDay,
    },
    generatedDates,
    entries: logbookEntries,
  });

  const escapeHtml = (value: string): string =>
    value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");

  const getParafText = (entry?: LogbookEntry): string => {
    if (!entry) return "-";
    if (entry.mentorSignature?.status === "approved") return "Disetujui";
    if (entry.mentorSignature?.status === "revision") return "Revisi";
    if (entry.mentorSignature?.status === "rejected") return "Ditolak";
    if (entry.status === "DRAFT") return "Belum Diajukan";
    return "Menunggu";
  };

  const normalizeSignatureSrc = (signature?: string): string | null => {
    if (!signature) return null;

    const value = signature.trim();
    if (!value) return null;
    if (value.startsWith("data:image/")) return value;

    // Some APIs send raw base64 without data URI prefix.
    if (/^[A-Za-z0-9+/=\r\n]+$/.test(value)) {
      return `data:image/png;base64,${value.replace(/\s+/g, "")}`;
    }

    return value;
  };

  const buildPrintStyleHtml = (
    data: ReturnType<typeof buildLogbookData>,
    options: {
      title: string;
      autoOpenPrint?: boolean;
      downloadUrl?: string;
      downloadFileName?: string;
    },
  ): string => {
    const mentorSignatureSrc = normalizeSignatureSrc(
      data.internship?.mentorSignature,
    );

    const rowsHtml = data.generatedDates
      .map((date, index) => {
        const entry = data.entries.find((item) => item.date === date);
        const weekNum = getWeekNumber(date);
        const prevWeekNum =
          index > 0 ? getWeekNumber(data.generatedDates[index - 1]) : 0;
        const showWeekNumber = weekNum !== prevWeekNum;
        const weekCell = showWeekNumber
          ? `<td class="col-week" rowspan="${getWeekRowSpan(data.generatedDates, index)}">${escapeHtml(String(weekNum))}</td>`
          : "";
        const parafCell =
          entry?.mentorSignature?.status === "approved" && mentorSignatureSrc
            ? `<img class="paraf-image" src="${mentorSignatureSrc}" alt="Paraf Pembimbing" />`
            : escapeHtml(getParafText(entry));
        return `
          <tr>
            ${weekCell}
            <td class="col-date">${escapeHtml(formatDate(date))}</td>
            <td class="col-activity">${escapeHtml(entry?.description || "-")}</td>
            <td class="col-paraf">${parafCell}</td>
          </tr>
        `;
      })
      .join("");

    const mentorSignatureBlock = mentorSignatureSrc
      ? `<img class="signature-image" src="${mentorSignatureSrc}" alt="Paraf Pembimbing" />`
      : `<div class="signature-placeholder"></div>`;

    const printScript = options.autoOpenPrint
      ? `<script>window.addEventListener('load', function(){ setTimeout(function(){ window.print(); }, 180); });</script>`
      : "";

    const downloadScript = options.downloadUrl
      ? `
      <script>
        async function downloadDocument(url, filename) {
          if (window.opener && typeof window.opener.__downloadLogbookDocx === 'function') {
            try {
              await window.opener.__downloadLogbookDocx();
              return;
            } catch (error) {
              // fallback to blob URL download below
            }
          }
          const link = document.createElement('a');
          link.href = url;
          link.download = filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      </script>
    `
      : "";

    return `
      <!DOCTYPE html>
      <html lang="id">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${escapeHtml(options.title)}</title>
        <style>
          :root { color-scheme: light; }
          * { box-sizing: border-box; }
          body { margin: 0; background: #ffffff; color: #111827; font-family: "Times New Roman", serif; }
          .page {
            width: 210mm;
            min-height: 297mm;
            margin: 0 auto;
            padding: 18mm;
            background: #fff;
            box-shadow: none;
          }
          h1 {
            margin: 0 0 14px;
            text-align: center;
            font-size: 21px;
            font-weight: 700;
            letter-spacing: 0.2px;
          }
          .meta {
            width: 67%;
            margin: 0 auto 14px;
            transform: translateX(40px);
            font-size: 16px;
            line-height: 1.45;
          }
          .meta-row { display: grid; grid-template-columns: 170px 16px 1fr; }
          table { width: 100%; border-collapse: collapse; table-layout: fixed; font-size: 16px; }
          th, td {
            border: 1px solid #374151;
            padding: 6px 8px;
            vertical-align: middle;
          }
          tr {
            height: 40px;
            page-break-inside: avoid;
          }
          th { text-align: center; background: #f3f4f6; }
          th { line-height: 1.15; font-weight: 700; }
          .col-week,
          .col-date,
          .col-paraf {
            text-align: center;
            white-space: nowrap;
          }
          .col-week {
            vertical-align: middle;
            font-weight: 700;
          }
          .col-activity {
            text-align: left;
            white-space: pre-wrap;
            word-break: break-word;
            line-height: 1.25;
          }
          .paraf-image {
            display: block;
            max-width: 100px;
            max-height: 75px;
            margin: 0 auto;
            object-fit: contain;
          }
          .footer-sign {
            margin-top: 8px;
            display: flex;
            justify-content: flex-end;
            padding-right: 2px;
            margin-right: -50px;
            break-inside: avoid;
            page-break-inside: avoid;
          }
          .signature-box {
            width: 230px;
            text-align: left;
            font-size: 16px;
            break-inside: avoid;
            page-break-inside: avoid;
          }
          .signature-image {
            display: block;
            width: 150px;
            height: 100px;
            margin: 10px 0 8px 0;
            object-fit: contain;
          }
          .signature-placeholder { height: 100px; }
          .mentor-name { margin-top: 6px; font-weight: 700; text-decoration: underline; }
          .toolbar { 
            position: fixed; 
            top: 10px; 
            left: 10px; 
            z-index: 1000; 
            display: flex; 
            gap: 8px;
          }
          .btn-download {
            padding: 8px 16px;
            background-color: #3b82f6;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            transition: background-color 0.2s;
          }
          .btn-download:hover {
            background-color: #2563eb;
          }
          .btn-download:active {
            background-color: #1d4ed8;
          }
          @media print {
            body { background: #fff; }
            thead { display: table-row-group; }
            .page { margin: 0; box-shadow: none; width: 100%; min-height: auto; }
            .toolbar { display: none; }
          }
        </style>
      </head>
      <body>
        ${
          options.downloadUrl
            ? `
        <div class="toolbar">
          <button class="btn-download" onclick="downloadDocument('${options.downloadUrl}', '${escapeHtml(options.downloadFileName || "logbook.docx")}')">
            ⬇ Download Word
          </button>
        </div>
        `
            : ""
        }
        <div class="page">
          <h1>FORMULIR KEGIATAN HARIAN MAHASISWA</h1>

          <div class="meta">
            <div class="meta-row"><span>Nama</span><span>:</span><span>${escapeHtml(data.student?.name || "-")}</span></div>
            <div class="meta-row"><span>NIM</span><span>:</span><span>${escapeHtml(data.student?.nim || "-")}</span></div>
            <div class="meta-row"><span>Program Studi</span><span>:</span><span>${escapeHtml(data.student?.prodi || "-")}</span></div>
            <div class="meta-row"><span>Tempat KP</span><span>:</span><span>${escapeHtml(data.internship?.company || "-")}</span></div>
            <div class="meta-row"><span>Bagian/Bidang</span><span>:</span><span>${escapeHtml(data.internship?.position || "-")}</span></div>
          </div>

          <table>
            <thead>
              <tr>
                <th style="width: 14.3%;">Minggu<br/>Ke</th>
                <th style="width: 18%;">Tanggal</th>
                <th style="width: 49%;">Jenis Kegiatan</th>
                <th style="width: 18.7%;">Paraf<br/>Pembimbing<br/>Lapangan</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>

          <div class="footer-sign">
            <div class="signature-box">
              <div>Palembang, ${escapeHtml(formatDate(data.workPeriod.endDate))}</div>
              <div>Pembimbing Lapangan,</div>
              ${mentorSignatureBlock}
              <div class="mentor-name">${escapeHtml(data.internship?.mentorName || "-")}</div>
              <div>${escapeHtml(data.internship?.position || "-")}</div>
            </div>
          </div>
        </div>
        ${printScript}
        ${downloadScript}
      </body>
      </html>
    `;
  };

  const openDocxPreviewTab = async (
    blob: Blob,
    fileName: string,
    data: ReturnType<typeof buildLogbookData>,
  ): Promise<{ converted: boolean; error?: string }> => {
    const url = URL.createObjectURL(blob);

    (
      window as unknown as { __downloadLogbookDocx?: () => Promise<void> }
    ).__downloadLogbookDocx = async () => {
      const [{ saveAs }, freshBlob] = await Promise.all([
        import("file-saver"),
        createLogbookDOCXBlob(data),
      ]);
      saveAs(freshBlob, fileName);
    };

    const previewWindow = window.open("", "_blank");

    if (!previewWindow) {
      URL.revokeObjectURL(url);
      throw new Error(
        "Gagal membuka tab preview. Pastikan pop-up tidak diblokir browser.",
      );
    }

    previewWindow.document.write(
      buildPrintStyleHtml(data, {
        title: "Preview DOCX Logbook",
        autoOpenPrint: false,
        downloadUrl: url,
        downloadFileName: fileName,
      }),
    );
    previewWindow.document.close();
    previewWindow?.addEventListener("beforeunload", () => {
      URL.revokeObjectURL(url);
      const win = window as unknown as {
        __downloadLogbookDocx?: () => Promise<void>;
      };
      if (win.__downloadLogbookDocx) {
        delete win.__downloadLogbookDocx;
      }
    });
    return { converted: true };
  };

  const openPdfPreviewTab = (data: ReturnType<typeof buildLogbookData>) => {
    const previewWindow = window.open("", "_blank");

    if (!previewWindow) {
      throw new Error(
        "Gagal membuka tab preview. Pastikan pop-up tidak diblokir browser.",
      );
    }

    previewWindow.document.write(
      buildPrintStyleHtml(data, {
        title: "FORMULIR KEGIATAN HARIAN MAHASISWA",
        autoOpenPrint: true,
      }),
    );
    previewWindow.document.close();
  };

  const generateDirectly = async (format: "docx" | "pdf") => {
    try {
      const logbookData = buildLogbookData();

      if (format === "pdf") {
        openPdfPreviewTab(logbookData);
        toast.success(
          "Preview PDF dibuka. Gunakan Simpan sebagai PDF agar hasil 1:1 dengan preview.",
        );
      } else {
        await generateLogbookDOCX(logbookData);
        toast.success("Logbook DOCX berhasil didownload!");
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Gagal generate logbook. Silakan coba lagi.";
      toast.error(message);
    }
  };

  const hasApprovedEntries = (): boolean => {
    return logbookEntries.some(
      (entry) => entry.mentorSignature?.status === "approved",
    );
  };

  const performGenerate = async () => {
    if (!selectedExportFormat) return;

    const logbookData = buildLogbookData();

    try {
      if (selectedExportFormat === "pdf") {
        openPdfPreviewTab(logbookData);
        toast.success("Preview PDF siap cetak dibuka di tab baru.");
      } else {
        const blob = await createLogbookDOCXBlob(logbookData);
        const fileName = getLogbookDocxFileName();
        const previewResult = await openDocxPreviewTab(
          blob,
          fileName,
          logbookData,
        );

        if (previewResult.converted) {
          toast.success("Preview DOCX dibuka di tab baru.");
        } else {
          toast.warning(
            "Preview DOCX tidak bisa dirender otomatis. Silakan gunakan tombol Download DOCX pada tab preview.",
          );
        }
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat membuka preview logbook.";
      toast.error(message);
    } finally {
      setSelectedExportFormat(null);
    }
  };

  return (
    <div className="w-full p-6 space-y-8">
      {/* Header Section */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Halaman Logbook</h1>
        <p className="text-muted-foreground">
          Catat aktivitas harian selama masa kerja praktik
        </p>
      </div>

      {/* Back Button */}
      <Button variant="secondary" asChild>
        <Link to="/mahasiswa/kp/saat-magang">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali ke Saat Magang
        </Link>
      </Button>

      {/* Student Profile Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Data Mahasiswa
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingProfile ? (
            <div className="text-center py-4 text-muted-foreground">
              Memuat data mahasiswa...
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-muted-foreground">Nama</Label>
                  <p className="font-medium">
                    {completeData?.student.name || "-"}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">NIM</Label>
                  <p className="font-medium">
                    {completeData?.student.nim || "-"}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Program Studi</Label>
                  <p className="font-medium">
                    {completeData?.student.prodi || "Manajemen Informatika"}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Fakultas</Label>
                  <p className="font-medium">
                    {completeData?.student.fakultas || "Ilmu Komputer"}
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <Label className="text-muted-foreground">Tempat KP</Label>
                  <p className="font-medium flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    {completeData?.submission.company || "-"}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Bagian/Bidang</Label>
                  <p className="font-medium">
                    {completeData?.submission.division || "-"}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Periode KP</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="font-medium flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {workPeriod.startDate && workPeriod.endDate
                        ? `${new Date(workPeriod.startDate).toLocaleDateString(
                            "id-ID",
                            {
                              day: "2-digit",
                              month: "long",
                              year: "numeric",
                            },
                          )} - ${new Date(
                            workPeriod.endDate,
                          ).toLocaleDateString("id-ID", {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                          })}`
                        : "Belum diisi"}
                    </p>
                    {periodSource === "auto" && workPeriod.startDate && (
                      <Badge
                        variant="outline"
                        className="text-xs bg-green-50 text-green-700 border-green-300"
                      >
                        Auto
                      </Badge>
                    )}
                    {periodSource === "manual" && workPeriod.startDate && (
                      <Badge
                        variant="outline"
                        className="text-xs bg-gray-50 text-gray-700 border-gray-300"
                      >
                        Manual
                      </Badge>
                    )}
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <div className="mt-1">
                    <Badge
                      variant={
                        completeData?.internship.status === "AKTIF"
                          ? "default"
                          : "secondary"
                      }
                      className={
                        completeData?.internship.status === "AKTIF"
                          ? "bg-green-500"
                          : ""
                      }
                    >
                      {completeData?.internship.status || "PENDING"}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Step Indicator */}
      <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
        <div
          className={`flex items-center gap-2 ${isPeriodSaved ? "text-green-600" : "text-blue-600"}`}
        >
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${isPeriodSaved ? "bg-green-100" : "bg-blue-100"}`}
          >
            {isPeriodSaved ? <CheckCircle className="w-5 h-5" /> : "1"}
          </div>
          <span className="font-medium">Set Periode</span>
        </div>
        <div
          className={`h-0.5 flex-1 ${isPeriodSaved ? "bg-green-600" : "bg-gray-300"}`}
        ></div>
        <div
          className={`flex items-center gap-2 ${isPeriodSaved ? "text-blue-600" : "text-gray-400"}`}
        >
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${isPeriodSaved ? "bg-blue-100" : "bg-gray-100"}`}
          >
            2
          </div>
          <span className="font-medium">Isi Logbook</span>
        </div>
      </div>

      {/* Section 1: Work Period Form */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Periode Kerja Praktik
                {periodSource === "auto" && (
                  <Badge variant="default" className="ml-2 bg-green-500">
                    <Sparkles className="h-3 w-3 mr-1" />
                    Auto dari Pengajuan
                  </Badge>
                )}
                {periodSource === "manual" && (
                  <Badge variant="secondary" className="ml-2">
                    <Edit className="h-3 w-3 mr-1" />
                    Input Manual
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                {periodSource === "auto"
                  ? "Periode otomatis dimuat dari data pengajuan KP Anda"
                  : "Tentukan periode dan hari kerja praktik Anda"}
              </CardDescription>
            </div>
            {isPeriodSaved && (
              <Button variant="outline" size="sm" onClick={handleEditPeriod}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Periode
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Info Alert berdasarkan sumber periode */}
          {periodSource === "auto" && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                <strong>Periode Otomatis:</strong> Periode kerja praktik Anda
                sudah otomatis dimuat dari data pengajuan yang telah disetujui.
                Tanggal mulai dan selesai mengikuti data pengajuan Anda.
              </AlertDescription>
            </Alert>
          )}
          {periodSource === null && !isPeriodSaved && (
            <Alert className="bg-blue-50 border-blue-200">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                <strong>Input Manual Diperlukan:</strong> Data pengajuan Anda
                belum tersedia atau belum disetujui. Silakan input periode kerja
                praktik secara manual di bawah ini.
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Tanggal Mulai</Label>
              <Input
                type="date"
                value={workPeriod.startDate || ""}
                onChange={(e) =>
                  setWorkPeriod({ ...workPeriod, startDate: e.target.value })
                }
                disabled={isPeriodSaved}
              />
            </div>
            <div className="space-y-2">
              <Label>Tanggal Selesai</Label>
              <Input
                type="date"
                value={workPeriod.endDate || ""}
                onChange={(e) =>
                  setWorkPeriod({ ...workPeriod, endDate: e.target.value })
                }
                disabled={isPeriodSaved}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Hari Kerja Mulai</Label>
              <Select
                value={workPeriod.startDay}
                onValueChange={(value) =>
                  setWorkPeriod({ ...workPeriod, startDay: value })
                }
                disabled={isPeriodSaved}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih hari" />
                </SelectTrigger>
                <SelectContent>
                  {DAYS_OPTIONS.map((day) => (
                    <SelectItem key={day.value} value={day.value}>
                      {day.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Hari Kerja Selesai</Label>
              <Select
                value={workPeriod.endDay}
                onValueChange={(value) =>
                  setWorkPeriod({ ...workPeriod, endDay: value })
                }
                disabled={isPeriodSaved}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih hari" />
                </SelectTrigger>
                <SelectContent>
                  {DAYS_OPTIONS.map((day) => (
                    <SelectItem key={day.value} value={day.value}>
                      {day.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {!isPeriodSaved && (
            <div className="flex justify-end">
              <Button onClick={handleSubmitPeriod}>
                <Save className="mr-2 h-4 w-4" />
                Simpan Periode
              </Button>
            </div>
          )}

          {isPeriodSaved && (
            <Alert className="border-l-4 border-green-500 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Periode kerja praktik telah disimpan. Tabel logbook dengan{" "}
                {generatedDates.length} hari kerja siap digunakan. Anda dapat
                menambahkan catatan harian di bawah ini.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Show sections below only if period is saved */}
      {isPeriodSaved && (
        <>
          {/* Section 2: Add Logbook Entry Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {editingId ? (
                  <Edit className="h-5 w-5" />
                ) : (
                  <Plus className="h-5 w-5" />
                )}
                {editingId ? "Edit Entri Logbook" : "Tambah Entri Logbook"}
              </CardTitle>
              <CardDescription>
                {editingId
                  ? "Edit catatan kegiatan harian Anda"
                  : "Tambahkan catatan kegiatan harian Anda"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-6 items-start">
                <div className="space-y-2 min-w-0">
                  <Label htmlFor="tanggal">Tanggal</Label>
                  <div className="flex items-center gap-2 min-w-0">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      disabled={isSavingLogbook}
                      onClick={() => shiftSelectedDate(-1)}
                      aria-label="Tanggal sebelumnya"
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <Popover
                      open={isDatePickerOpen}
                      onOpenChange={setIsDatePickerOpen}
                    >
                      <PopoverTrigger asChild>
                        <Button
                          id="tanggal"
                          variant="outline"
                          disabled={isSavingLogbook}
                          className="h-10 w-[190px] flex-1 justify-start text-left text-sm font-normal"
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          {selectedDate
                            ? formatDate(selectedDate)
                            : "Pilih tanggal logbook"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <UiCalendar
                          className="p-1"
                          mode="single"
                          locale={localeId}
                          weekStartsOn={1}
                          showOutsideDays
                          formatters={{
                            formatWeekdayName: (date) => {
                              const dayNames = [
                                "Min",
                                "Sen",
                                "Sel",
                                "Rab",
                                "Kam",
                                "Jum",
                                "Sab",
                              ];
                              return dayNames[date.getDay()] || "";
                            },
                          }}
                          month={calendarMonth}
                          onMonthChange={setCalendarMonth}
                          selected={
                            selectedDate ? fromDateKey(selectedDate) : undefined
                          }
                          onSelect={(date) => {
                            if (!date) return;
                            setSelectedDate(toDateKey(date));
                            setCalendarMonth(date);
                            setIsDatePickerOpen(false);
                          }}
                          classNames={{
                            nav_button: "h-7 w-7 p-0",
                            weekdays: "grid grid-cols-7",
                            weekday:
                              "w-8 text-center text-[0.7rem] font-medium leading-none",
                            head_row: "grid grid-cols-7",
                            head_cell:
                              "w-8 text-center text-[0.7rem] font-medium leading-none",
                            day_outside: "text-muted-foreground/20 opacity-25",
                          }}
                          disabled={isSavingLogbook}
                          modifiers={{
                            filled: (date) =>
                              date.getMonth() === calendarMonth.getMonth() &&
                              date.getFullYear() ===
                                calendarMonth.getFullYear() &&
                              filledDateSet.has(toDateKey(date)),
                            nonWorkday: (date) =>
                              date.getMonth() === calendarMonth.getMonth() &&
                              date.getFullYear() ===
                                calendarMonth.getFullYear() &&
                              !generatedDates.includes(toDateKey(date)),
                          }}
                          modifiersStyles={{
                            outside: {
                              opacity: 0.25,
                              color: "#94a3b8",
                            },
                            filled: {
                              backgroundColor: "#ecfdf3",
                              color: "#166534",
                              border: "1px solid #86efac",
                              fontWeight: 600,
                            },
                            nonWorkday: {
                              color: "#b91c1c",
                            },
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      disabled={isSavingLogbook}
                      onClick={() => shiftSelectedDate(1)}
                      aria-label="Tanggal berikutnya"
                    >
                      <ArrowLeft className="h-4 w-4 rotate-180" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <span className="h-2.5 w-2.5 rounded-full bg-green-300" />
                      Sudah diisi
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <span className="h-2.5 w-2.5 rounded-full bg-red-300" />
                      Bukan hari kerja
                    </span>
                  </div>
                </div>
                <div className="space-y-2 min-w-0">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="deskripsi">Deskripsi Kegiatan</Label>
                    <span className="text-xs text-muted-foreground">
                      {getWordCount(description)} kata
                    </span>
                  </div>
                  <div className="space-y-1">
                    <Textarea
                      id="deskripsi"
                      rows={4}
                      placeholder="Masukkan deskripsi kegiatan..."
                      value={description}
                      onChange={(e) => {
                        setDescription(e.target.value);
                      }}
                      disabled={isSavingLogbook}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                {editingId && (
                  <Button
                    variant="outline"
                    onClick={handleCancelEdit}
                    disabled={isSavingLogbook}
                  >
                    Batal
                  </Button>
                )}
                <Button onClick={handleAddLogbook} disabled={isSavingLogbook}>
                  <Save className="mr-2 h-4 w-4" />
                  {isSavingLogbook
                    ? "Menyimpan..."
                    : editingId
                      ? "Simpan Perubahan"
                      : "Tambah Logbook"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Section 3: Generated Logbook Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Tabel Logbook
              </CardTitle>
              <CardDescription>
                Daftar kegiatan harian berdasarkan periode kerja yang telah
                digenerate
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Period Display */}
              <div className="flex flex-wrap items-center gap-2 p-3 bg-muted rounded-lg">
                <span className="font-medium text-sm text-muted-foreground">
                  Periode:
                </span>
                <span className="px-3 py-1.5 bg-background rounded-md text-sm font-medium">
                  {workPeriod.startDate
                    ? formatDate(workPeriod.startDate)
                    : "Belum diset"}
                </span>
                <span className="text-muted-foreground">s/d</span>
                <span className="px-3 py-1.5 bg-background rounded-md text-sm font-medium">
                  {workPeriod.endDate
                    ? formatDate(workPeriod.endDate)
                    : "Belum diset"}
                </span>
                <span className="ml-auto px-3 py-1.5 bg-blue-100 text-blue-700 rounded-md text-sm font-medium">
                  {generatedDates.length} Hari Kerja
                </span>
              </div>

              {/* Logbook Table */}
              {generatedDates.length > 0 && (
                <div className="rounded-md border w-full">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-16 text-center text-xs">
                          Minggu Ke
                        </TableHead>
                        <TableHead className="w-24 text-xs">
                          Hari, Tanggal
                        </TableHead>
                        <TableHead className="text-xs">
                          Deskripsi Kegiatan
                        </TableHead>
                        <TableHead className="w-32 text-center text-xs">
                          Paraf Pembimbing
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {generatedDates.map((date, index) => {
                        const entry = getLogbookForDate(date);
                        const weekNum = getWeekNumber(date);
                        const prevWeekNum =
                          index > 0
                            ? getWeekNumber(generatedDates[index - 1])
                            : 0;
                        const showWeekNumber = weekNum !== prevWeekNum;

                        return (
                          <TableRow key={index}>
                            {showWeekNumber && (
                              <TableCell
                                className="text-center font-medium bg-muted/50"
                                rowSpan={getWeekRowSpan(generatedDates, index)}
                              >
                                {weekNum}
                              </TableCell>
                            )}
                            <TableCell>
                              <div className="flex flex-col">
                                <span className="font-medium">
                                  {getDayName(date)}
                                </span>
                                <span className="text-sm text-muted-foreground">
                                  {formatDate(date)}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-2 break-words">
                                {entry ? (
                                  <div className="space-y-2">
                                    <div className="text-sm break-words whitespace-normal">
                                      <p className="text-foreground line-clamp-3">
                                        {entry.description}
                                      </p>
                                      <p className="text-xs text-muted-foreground mt-1">
                                        {getWordCount(entry.description)} kata
                                      </p>
                                    </div>
                                    <div className="flex gap-1 flex-wrap">
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleEditLogbook(entry)}
                                        disabled={
                                          isSavingLogbook ||
                                          entry?.mentorSignature?.status ===
                                            "approved"
                                        }
                                      >
                                        <Edit className="h-3 w-3 mr-1" />
                                        Edit
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="destructive"
                                        onClick={() =>
                                          handleDeleteLogbook(entry.id)
                                        }
                                        disabled={
                                          isSavingLogbook ||
                                          entry?.mentorSignature?.status ===
                                            "approved"
                                        }
                                      >
                                        <XCircle className="h-3 w-3 mr-1" />
                                        Hapus
                                      </Button>
                                    </div>
                                    {entry?.mentorSignature?.status ===
                                      "approved" && (
                                      <p className="text-xs text-green-700 bg-green-50 px-2 py-1 rounded">
                                        Logbook sudah disetujui mentor, entri
                                        ini tidak bisa diedit atau dihapus.
                                      </p>
                                    )}
                                    {entry?.status === "PENDING" &&
                                      !entry?.mentorSignature && (
                                        <p className="text-xs text-amber-700 bg-amber-50 px-2 py-1 rounded">
                                          Logbook sudah diajukan dan sedang
                                          menunggu review mentor.
                                        </p>
                                      )}
                                    {entry?.status === "DRAFT" && (
                                      <p className="text-xs text-slate-700 bg-slate-100 px-2 py-1 rounded">
                                        Logbook belum diajukan ke mentor.
                                      </p>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-muted-foreground italic">
                                    Belum diisi
                                  </span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-center">
                              <div className="flex flex-col items-center gap-1 break-words">
                                {getMentorSignatureBadge(entry)}

                                {/* Notes dari mentor (untuk approved) */}
                                {entry?.mentorSignature?.status ===
                                  "approved" &&
                                  entry?.mentorSignature?.notes && (
                                    <p className="text-xs text-green-700 bg-green-50 px-2 py-1 rounded mt-1 italic">
                                      💬 {entry.mentorSignature.notes}
                                    </p>
                                  )}

                                {/* Rejection note (untuk rejected) - Lebih prominent */}
                                {entry?.mentorSignature?.status ===
                                  "rejected" &&
                                  entry?.mentorSignature?.notes && (
                                    <div className="mt-2 w-full">
                                      <div className="bg-red-50 border border-red-200 rounded-lg p-2 text-left">
                                        <p className="text-xs font-semibold text-red-900 mb-1">
                                          📝 Catatan Revisi:
                                        </p>
                                        <p className="text-xs text-red-800">
                                          {entry.mentorSignature.notes}
                                        </p>
                                        <p className="text-xs text-red-600 mt-1 italic">
                                          Silakan perbaiki dan submit ulang
                                        </p>
                                      </div>
                                    </div>
                                  )}

                                {/* Revision note (untuk revision) */}
                                {entry?.mentorSignature?.status ===
                                  "revision" &&
                                  entry?.mentorSignature?.notes && (
                                    <p className="text-xs text-amber-700 bg-amber-50 px-2 py-1 rounded mt-1 italic">
                                      ⚠️ {entry.mentorSignature.notes}
                                    </p>
                                  )}
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Submit Logbook Section */}
          {generatedDates.length > 0 && (
            <Card className="border-2 border-amber-500 bg-gradient-to-br from-amber-50 via-background to-background shadow-sm">
              <CardContent className="pt-6">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-4 text-left max-w-2xl">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-100">
                      <Sparkles className="h-6 w-6 text-amber-600" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold text-foreground">
                        Ajukan Logbook ke Mentor
                      </h3>
                      <p className="max-w-xl text-sm leading-6 text-muted-foreground">
                        Kumpulkan seluruh logbook untuk dikirim ke mentor dalam
                        satu langkah.
                      </p>
                      <div className="-ml-3 max-w-xl rounded-full bg-amber-100/80 px-3 py-1 text-xs font-medium text-amber-800 ring-1 ring-amber-200">
                        Mahasiswa dapat mengajukan kapan saja. Mentor akan
                        meninjau dan memberi feedback.
                      </div>
                    </div>
                  </div>
                  <Button
                    size="lg"
                    onClick={() => setShowSubmitConfirmDialog(true)}
                    disabled={isSavingLogbook || logbookEntries.length === 0}
                    className="bg-amber-600 hover:bg-amber-700"
                  >
                    <Sparkles className="mr-2 h-5 w-5" />
                    {isSavingLogbook ? "Mengajukan..." : "Ajukan Logbook"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <AlertDialog
            open={showSubmitConfirmDialog}
            onOpenChange={setShowSubmitConfirmDialog}
          >
            <AlertDialogContent className="sm:max-w-[520px]">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-xl">
                  Ajukan Logbook ke Mentor?
                </AlertDialogTitle>
                <AlertDialogDescription className="text-base space-y-3 pt-2">
                  <p className="text-foreground">
                    Setelah logbook diajukan dan disetujui mentor, entri yang
                    berstatus approved tidak bisa diedit.
                  </p>
                  <p>
                    Pastikan seluruh catatan sudah benar sebelum melanjutkan.
                  </p>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel
                  onClick={() => setShowSubmitConfirmDialog(false)}
                >
                  Batal
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={async () => {
                    setShowSubmitConfirmDialog(false);
                    await handleSubmitLogbook();
                  }}
                  className="bg-amber-600 hover:bg-amber-700"
                >
                  Lanjutkan Ajukan
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Export Button - Bottom of page */}
          {generatedDates.length > 0 && (
            <Card className="border-2 border-primary">
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <Download className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">
                        Export Logbook
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Generate dokumen logbook Anda
                      </p>
                    </div>
                  </div>
                  <Button size="lg" onClick={handleExportToFile}>
                    <Download className="mr-2 h-5 w-5" />
                    Generate Logbook
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Confirmation Dialog for Empty Data */}
          <AlertDialog
            open={showEmptyDataDialog}
            onOpenChange={setShowEmptyDataDialog}
          >
            <AlertDialogContent className="sm:max-w-[500px]">
              <AlertDialogHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-3 bg-amber-100 rounded-full">
                    <AlertCircle className="h-6 w-6 text-amber-600" />
                  </div>
                  <AlertDialogTitle className="text-xl">
                    Data Belum Lengkap
                  </AlertDialogTitle>
                </div>
                <AlertDialogDescription className="text-base space-y-4 pt-2">
                  <p className="text-foreground">
                    {!completeData?.student && !completeData?.submission
                      ? "Data mahasiswa dan data magang Anda belum tersedia."
                      : !completeData?.student
                        ? "Data mahasiswa Anda belum tersedia."
                        : "Data magang Anda belum tersedia."}
                  </p>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-900 font-medium mb-2">
                      📋 Yang akan dihasilkan:
                    </p>
                    <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                      <li>File DOCX logbook dengan format standar</li>
                      <li>Field yang kosong dapat diisi manual di Word</li>
                      <li>Periode minggu sesuai tanggal yang Anda set</li>
                      <li>
                        Tabel kegiatan dengan {generatedDates.length} hari kerja
                      </li>
                    </ul>
                    <p className="text-xs text-blue-700 mt-2 italic">
                      ⚠️ Format mungkin perlu disesuaikan setelah dibuka di Word
                    </p>
                  </div>

                  <p className="text-sm text-muted-foreground">
                    💡 <strong>Rekomendasi:</strong> Lengkapi data Anda terlebih
                    dahulu untuk hasil yang lebih baik, atau lanjutkan untuk
                    mendapatkan template kosong.
                  </p>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="mt-2 sm:mt-0">
                  Batal
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={async () => {
                    setShowEmptyDataDialog(false);
                    await generateDirectly("docx");
                  }}
                  className="bg-primary hover:bg-primary/90"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Ya, Download Template
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Format Choice Dialog - shown when data is complete and has approved entries */}
          <AlertDialog
            open={showFormatChoiceDialog}
            onOpenChange={setShowFormatChoiceDialog}
          >
            <AlertDialogContent className="sm:max-w-[520px]">
              <AlertDialogHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-3 bg-blue-100 rounded-full">
                    <File className="h-6 w-6 text-blue-600" />
                  </div>
                  <AlertDialogTitle className="text-xl">
                    Pilih Format Export
                  </AlertDialogTitle>
                </div>
                <AlertDialogDescription className="text-base space-y-4 pt-2">
                  <p className="text-foreground">
                    Data logbook Anda lengkap dan memiliki entri yang sudah
                    disetujui mentor. Pilih format file yang Anda inginkan:
                  </p>

                  <div className="space-y-3">
                    <div
                      className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                        selectedExportFormat === "docx"
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => setSelectedExportFormat("docx")}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="radio"
                          name="format"
                          value="docx"
                          checked={selectedExportFormat === "docx"}
                          onChange={() => setSelectedExportFormat("docx")}
                          className="mt-1"
                        />
                        <div>
                          <p className="font-semibold text-foreground">
                            File Word (.DOCX)
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Format Microsoft Word. Dapat diedit dan dimodifikasi
                            lebih lanjut.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div
                      className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                        selectedExportFormat === "pdf"
                          ? "border-red-500 bg-red-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => setSelectedExportFormat("pdf")}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="radio"
                          name="format"
                          value="pdf"
                          checked={selectedExportFormat === "pdf"}
                          onChange={() => setSelectedExportFormat("pdf")}
                          className="mt-1"
                        />
                        <div>
                          <p className="font-semibold text-foreground">
                            File PDF (.PDF)
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Format PDF final untuk dibagikan.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel
                  onClick={() => {
                    setShowFormatChoiceDialog(false);
                    setSelectedExportFormat(null);
                  }}
                  className="mt-2 sm:mt-0"
                >
                  Batal
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={async () => {
                    if (selectedExportFormat) {
                      setShowFormatChoiceDialog(false);
                      await performGenerate();
                    }
                  }}
                  disabled={!selectedExportFormat}
                  className="bg-primary hover:bg-primary/90"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download {selectedExportFormat?.toUpperCase() || "File"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      )}
    </div>
  );
}

export default LogbookPage;
