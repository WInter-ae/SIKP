import { useState, useEffect, useRef } from "react";
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
  Camera,
  ImageIcon,
  AlertTriangle,
  Info,
  Briefcase,
  UserCircle,
} from "lucide-react";
import { id as localeId } from "date-fns/locale";
import { cn } from "~/lib/utils";

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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "~/components/ui/tooltip";
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
  uploadLogbookPhoto,
} from "~/feature/during-intern/services/logbook-api";

// Utility Functions
// (DOCX generation moved to backend)
interface LogbookEntry {
  id: string;
  date: string;
  description: string;
  hours?: number;
  photoUrl?: string | null;
  status?: "DRAFT" | "PENDING" | "APPROVED" | "REJECTED";
  mentorSignature?: {
    status: "approved" | "revision" | "rejected";
    signedAt: string;
    mentorName: string;
    notes?: string;
  };
  time?: string;
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
  photoUrl?: string | null;
  photo_url?: string | null;
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
    photoUrl: entry.photoUrl || entry.photo_url || null,
    status: mappedStatus,
    time: entry.createdAt ? new Date(entry.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : "-",
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
  const entryFormRef = useRef<HTMLDivElement>(null);

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
  const [holidays, setHolidays] = useState<string[]>([]);
  const [periodSource, setPeriodSource] = useState<"auto" | "manual" | null>(
    null,
  ); // Track sumber periode
  const [showSubmitConfirmDialog, setShowSubmitConfirmDialog] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState<Date>(new Date());

  // Photo upload state
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [uploadingPhotoForId, setUploadingPhotoForId] = useState<string | null>(null);

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
  const [showIncompleteLogbookDialog, setShowIncompleteLogbookDialog] = useState(false);

  // Fetch holidays on mount
  useEffect(() => {
    async function fetchHolidays() {
      try {
        const response = await fetch("https://dayoffapi.vercel.app/api/v1/holidays");
        if (!response.ok) throw new Error("API response not ok");
        const data = await response.json();
        if (data && Array.isArray(data)) {
          const dates = data.map((h: any) => h.holiday_date);
          setHolidays(dates);
        }
      } catch (error) {
        console.warn("⚠️ Failed to fetch holidays from API, using fallback list:", error);
        setHolidays([
          "2026-01-01", // Tahun Baru 2026
          "2026-02-17", // Isra Mikraj
          "2026-02-24", // Tahun Baru Imlek
          "2026-03-20", // Hari Suci Nyepi
          "2026-03-26", "2026-03-27", // Idul Fitri
          "2026-03-28", "2026-03-29", "2026-03-30", "2026-03-31", // Cuti Bersama Idul Fitri
          "2026-04-03", // Wafat Yesus Kristus
          "2026-05-01", // Hari Buruh
          "2026-05-14", // Kenaikan Yesus Kristus
          "2026-05-15", // Cuti Bersama Kenaikan
          "2026-05-22", // Hari Raya Waisak
          "2026-05-27", // Idul Adha
          "2026-05-28", // Cuti Bersama Idul Adha
          "2026-06-01", // Hari Lahir Pancasila
          "2026-07-17", // Tahun Baru Islam
          "2026-08-17", // Hari Kemerdekaan RI
          "2026-09-25", // Maulid Nabi
          "2026-12-25", // Hari Raya Natal
          "2026-12-26", // Cuti Bersama Natal
        ]);
      }
    }
    fetchHolidays();
  }, []);

  // Fetch complete internship data
  useEffect(() => {
    async function fetchInternshipData() {
      try {
        const response = await getCompleteInternshipData();
        if (response.success && response.data) {
          setCompleteData(response.data);
          const submission = response.data.submission;
          if (submission?.startDate && submission?.endDate) {
            const autoWorkPeriod = {
              startDate: submission.startDate,
              endDate: submission.endDate,
              startDay: "senin",
              endDay: "jumat",
            };
            setWorkPeriod(autoWorkPeriod);
            setPeriodSource("auto");

            const savedPeriodState = localStorage.getItem("logbook_period_saved");
            const savedDates = localStorage.getItem("logbook_generated_dates");
            const savedWorkPeriod = localStorage.getItem("logbook_work_period");
            
            if (savedPeriodState === "true" && savedDates && savedWorkPeriod) {
              const saved = JSON.parse(savedWorkPeriod);
              if (saved.startDate === submission.startDate && saved.endDate === submission.endDate) {
                setWorkPeriod(saved);
                setIsPeriodSaved(true);
                // RE-GENERATE dates dynamically so latest holidays are ALWAYS applied
                const refreshedDates = generateDatesFromPeriod(
                  saved.startDate,
                  saved.endDate,
                  saved.startDay || "senin",
                  saved.endDay || "jumat"
                );
                setGeneratedDates(refreshedDates);
                return;
              }
            }

            const dates = generateDatesFromPeriod(
              autoWorkPeriod.startDate,
              autoWorkPeriod.endDate,
              autoWorkPeriod.startDay,
              autoWorkPeriod.endDay,
            );
            setGeneratedDates(dates);
            setIsPeriodSaved(true);
            localStorage.setItem("logbook_period_saved", "true");
            localStorage.setItem("logbook_work_period", JSON.stringify(autoWorkPeriod));
          }
        }
      } catch (error) {
        console.error("Failed to fetch internship data:", error);
      } finally {
        setIsLoadingProfile(false);
      }
    }
    fetchInternshipData();
  }, [holidays]); // Dependency on holidays to ensure generation uses them

  useEffect(() => {
    async function fetchLogbookFromBackend() {
      if (!completeData?.student?.userId) return;
      try {
        const response = await getLogbookEntries();
        if (response.success && response.data) {
          setLogbookEntries(response.data.entries.map(mapBackendLogbookEntry));
        }
      } catch (error) {
        console.error("Failed to fetch logbook:", error);
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
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      const dateStr = `${year}-${month}-${day}`;

      // Always include the exact start date to make sure the student's first day of KP is never skipped
      const isStartDate = dateStr === startDate;

      if (isStartDate) {
        dates.push(dateStr);
      } else {
        // ❌ SKIP TANGGAL MERAH (Holidays)
        if (holidays.includes(dateStr)) {
          continue;
        }

        const currentDay = d.getDay();

        if (startDayNum <= endDayNum) {
          if (currentDay >= startDayNum && currentDay <= endDayNum) {
            dates.push(dateStr);
          }
        } else {
          if (currentDay >= startDayNum || currentDay <= endDayNum) {
            dates.push(dateStr);
          }
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

    const submitEntry = async () => {
      if (!completeData?.student?.userId) {
        toast.error("Data mahasiswa belum siap.");
        return;
      }

      try {
        setIsSavingLogbook(true);

        let finalEntryId = editingId;
        const activityText = description.trim();

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

          finalEntryId = response.data.id;
          const createdEntry = mapBackendLogbookEntry(response.data);
          const updatedEntries = [...logbookEntries, createdEntry];

          setLogbookEntries(updatedEntries);
        }

        // --- Photo Upload Logic ---
        if (photoFile && finalEntryId) {
          try {
            setIsUploadingPhoto(true);
            setUploadingPhotoForId(finalEntryId);
            const photoRes = await uploadLogbookPhoto(finalEntryId, photoFile);
            if (photoRes.success && photoRes.data) {
              const photoUrl = photoRes.data.photoUrl;
              setLogbookEntries((prev) =>
                prev.map((e) =>
                  e.id === finalEntryId ? { ...e, photoUrl } : e,
                ),
              );
            }
          } catch (photoError) {
            console.error("Failed to upload photo:", photoError);
            toast.error("Logbook disimpan, namun gagal mengupload foto.");
          } finally {
            setIsUploadingPhoto(false);
            setUploadingPhotoForId(null);
          }
        }

        toast.success(editingId ? "Logbook berhasil diperbarui!" : "Logbook berhasil disimpan!");
        setSelectedDate("");
        setDescription("");
        setPhotoFile(null);
        setPhotoPreview(null);
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
    // Check if entry is approved or pending review - jangan bisa edit
    if (entry.mentorSignature?.status === "approved" || entry.status === "PENDING") {
      const reason = entry.status === "PENDING" ? "sedang ditinjau" : "sudah disetujui";
      toast.error(
        `Tidak bisa mengedit logbook yang ${reason}. Hanya entri DRAFT atau REJECTED yang dapat diubah.`,
      );
      return;
    }
    setEditingId(entry.id);
    setSelectedDate(entry.date);
    setDescription(entry.description);
    setPhotoPreview(entry.photoUrl || null);
    setPhotoFile(null); // Reset file selection to current photo

    // Scroll to entry form
    entryFormRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };



  const handleCancelEdit = () => {
    setEditingId(null);
    setSelectedDate("");
    setDescription("");
    setPhotoFile(null);
    setPhotoPreview(null);
  };

  const handlePhotoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Client-side validation: max 2MB, JPEG/PNG/WebP
    const ALLOWED = ["image/jpeg", "image/png", "image/webp"];
    if (!ALLOWED.includes(file.type)) {
      toast.error("Format foto tidak didukung. Gunakan JPEG, PNG, atau WebP.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Ukuran foto maksimal 2MB.");
      return;
    }

    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleUploadPhotoForEntry = async (logbookId: string) => {
    if (!photoFile) return;
    try {
      setIsUploadingPhoto(true);
      setUploadingPhotoForId(logbookId);

      const res = await uploadLogbookPhoto(logbookId, photoFile);
      if (!res.success) {
        throw new Error(res.message || "Gagal upload foto.");
      }

      // Update photoUrl on the entry in state
      setLogbookEntries((prev) =>
        prev.map((e) =>
          e.id === logbookId
            ? { ...e, photoUrl: res.data?.photoUrl ?? e.photoUrl }
            : e,
        ),
      );

      setPhotoFile(null);
      setPhotoPreview(null);
      toast.success("Foto kegiatan berhasil diupload!");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Gagal upload foto kegiatan.",
      );
    } finally {
      setIsUploadingPhoto(false);
      setUploadingPhotoForId(null);
    }
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
    if (generatedDates.length === 0) return;

    const currentIdx = selectedDate 
      ? generatedDates.indexOf(selectedDate) 
      : -1;
    
    let nextIdx: number;
    
    if (currentIdx === -1) {
      // If no date selected, try to find the last interacted date from entries
      // or pick first/last based on direction
      if (logbookEntries.length > 0) {
        // Sort entries by date to find the most recent one
        const sortedEntries = [...logbookEntries].sort((a, b) => 
          a.date.localeCompare(b.date)
        );
        const lastEntryDate = sortedEntries[sortedEntries.length - 1].date;
        const lastEntryIdx = generatedDates.indexOf(lastEntryDate);
        
        if (lastEntryIdx !== -1) {
          nextIdx = lastEntryIdx + deltaDays;
        } else {
          nextIdx = deltaDays > 0 ? 0 : generatedDates.length - 1;
        }
      } else {
        nextIdx = deltaDays > 0 ? 0 : generatedDates.length - 1;
      }
    } else {
      nextIdx = currentIdx + deltaDays;
    }

    // Boundary check
    if (nextIdx < 0 || nextIdx >= generatedDates.length) {
      const edge = deltaDays > 0 ? "akhir" : "awal";
      toast.info(`Anda sudah berada di ${edge} periode kerja praktik.`);
      return;
    }

    const nextDateKey = generatedDates[nextIdx];
    const nextDate = fromDateKey(nextDateKey);

    setSelectedDate(nextDateKey);
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
      toast.info("Semua logbook sudah diajukan atau disetujui pembimbing lapangan!");
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
            `✅ Semua ${successCount} logbook berhasil diajukan ke pembimbing lapangan!`,
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
    return logbookEntries.find((entry) => {
      const entryDate = entry.date.split(/[T ]/)[0];
      return entryDate === date;
    });
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
        <Badge variant="outline" className="bg-amber-50 border-amber-200">
          <span className="text-amber-700 font-medium">Belum diisi</span>
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
    } else if (isLogbookFullyApproved()) {
      // Data lengkap DAN SEMUA entri sudah approved - tampilkan format choice dialog
      setShowFormatChoiceDialog(true);
    } else {
      // Data lengkap tapi ada entri belum approved atau belum diisi - tampilkan peringatan
      setShowIncompleteLogbookDialog(true);
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


  const generateDirectly = async (format: "docx" | "pdf") => {
    try {
      const baseUrl = window.location.origin.includes('localhost') 
        ? 'http://localhost:8787' 
        : 'https://backend-sikp.pusing.me'; 
        
      const url = `${baseUrl}/api/internships/generate/logbook?format=${format}`;
      window.open(url, "_blank");
      toast.success(`Sedang menyiapkan dokumen logbook (${format.toUpperCase()})...`);
    } catch (error) {
      console.error("Gagal generate dokumen:", error);
      toast.error("Gagal generate logbook. Silakan coba lagi.");
    }
  };

  const isLogbookFullyApproved = (): boolean => {
    if (generatedDates.length === 0) return false;
    
    // Check if every generated date has an approved entry
    return generatedDates.every((date) => {
      const entry = logbookEntries.find((e) => {
        const entryDate = e.date.split(/[T ]/)[0];
        return entryDate === date;
      });
      return entry?.mentorSignature?.status === "approved";
    });
  };

  const performGenerate = async () => {
    if (!selectedExportFormat) return;

    try {
      const baseUrl = window.location.origin.includes('localhost') 
        ? 'http://localhost:8787' 
        : 'https://backend-sikp.pusing.me'; 
        
      const url = `${baseUrl}/api/internships/generate/logbook?format=${selectedExportFormat}`;
      window.open(url, "_blank");
      toast.success(`Sedang menyiapkan dokumen logbook (${selectedExportFormat.toUpperCase()})...`);
    } catch (error) {
      console.error("Gagal generate dokumen:", error);
      toast.error("Terjadi kesalahan saat mengunduh dokumen logbook.");
    } finally {
      setSelectedExportFormat(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-8 bg-slate-50/10 dark:bg-slate-950/10 min-h-[calc(100svh-3.5rem)]">
      {/* Premium Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-blue-600 via-indigo-600 to-indigo-700 p-6 sm:p-8 text-white shadow-xl">
        {/* Decorative glows */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 rounded-full bg-indigo-500/30 blur-3xl" />

        <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold uppercase tracking-wider text-blue-200">
              <Sparkles className="h-3.5 w-3.5" />
              Fase Saat Magang — Logbook
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Catatan Logbook Harian
            </h1>
            <p className="text-sm sm:text-base text-blue-100/90 max-w-xl font-medium">
              Dokumentasikan setiap aktivitas, capaian pembelajaran, dan koordinasi harian Anda secara teratur untuk verifikasi Pembimbing Lapangan.
            </p>
          </div>
          
          <Button 
            variant="outline" 
            asChild
            className="border-white/20 bg-white/10 text-white hover:bg-white hover:text-indigo-950 font-bold rounded-xl backdrop-blur-xs transition-all shadow-sm shrink-0"
          >
            <Link to="/mahasiswa/kp/saat-magang">
              <ArrowLeft className="mr-2 h-4.5 w-4.5" />
              Kembali ke Menu Utama
            </Link>
          </Button>
        </div>

        {/* Stats Grid */}
        {generatedDates.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t border-white/10">
            <div className="bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10">
              <span className="text-xs text-blue-200 font-semibold uppercase tracking-wider block">Total Hari Kerja</span>
              <span className="text-2xl sm:text-3xl font-extrabold mt-1 block">{generatedDates.length} Hari</span>
            </div>
            <div className="bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10">
              <span className="text-xs text-blue-200 font-semibold uppercase tracking-wider block">Logbook Terisi</span>
              <span className="text-2xl sm:text-3xl font-extrabold mt-1 block">{logbookEntries.length} Entri</span>
            </div>
            <div className="bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10">
              <span className="text-xs text-blue-200 font-semibold uppercase tracking-wider block">Menunggu Paraf</span>
              <span className="text-2xl sm:text-3xl font-extrabold mt-1 block text-amber-300">
                {logbookEntries.filter(e => e.status === "PENDING" && e.mentorSignature?.status !== "approved").length} Entri
              </span>
            </div>
            <div className="bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10">
              <span className="text-xs text-blue-200 font-semibold uppercase tracking-wider block">Telah Disetujui</span>
              <span className="text-2xl sm:text-3xl font-extrabold mt-1 block text-emerald-300">
                {logbookEntries.filter(e => e.mentorSignature?.status === "approved").length} Entri
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Panduan Penggunaan & Alur Status Logbook */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="relative overflow-hidden rounded-2xl border border-slate-200/60 dark:border-slate-800/60 bg-white/80 dark:bg-slate-900/80 shadow-md backdrop-blur-xl">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-linear-to-b from-indigo-500 to-blue-600" />
            <CardHeader className="pt-6 pb-4 border-b border-slate-100 dark:border-slate-800">
              <CardTitle className="text-base font-extrabold flex items-center gap-2 text-indigo-950 dark:text-indigo-300">
                <Info className="h-5 w-5 text-indigo-500" />
                Panduan Pengisian & Alur Logbook Kerja Praktik
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-5">
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-semibold">
                Setiap mahasiswa wajib mencatat kegiatan harian selama masa magang industri untuk divalidasi oleh Pembimbing Lapangan. Silakan ikuti tahapan pengisian berikut:
              </p>
              
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-650 dark:text-indigo-400 flex items-center justify-center font-extrabold text-xs border border-indigo-100/50">
                    1
                  </div>
                  <div>
                    <p className="font-extrabold text-slate-800 dark:text-slate-200 text-xs">Set Periode Kerja Praktik</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed mt-0.5">
                      Sistem akan memuat otomatis periode magang dari pengajuan Anda. Hari kerja yang digenerate otomatis menyaring hari libur/tanggal merah.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-650 dark:text-indigo-400 flex items-center justify-center font-extrabold text-xs border border-indigo-100/50">
                    2
                  </div>
                  <div>
                    <p className="font-extrabold text-slate-800 dark:text-slate-200 text-xs">Isi Detail Kegiatan Harian & Foto</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed mt-0.5">
                      Pilih tanggal hari kerja, tuliskan rincian deskripsi tugas/kegiatan Anda secara jelas, serta lampirkan foto dokumentasi kegiatan (opsional) sebagai bukti dukung.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-650 dark:text-indigo-400 flex items-center justify-center font-extrabold text-xs border border-indigo-100/50">
                    3
                  </div>
                  <div>
                    <p className="font-extrabold text-slate-800 dark:text-slate-200 text-xs">Ajukan & Tunggu Paraf Pembimbing</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed mt-0.5">
                      Klik tombol <strong className="text-amber-600 dark:text-amber-400 font-bold">"Ajukan Logbook"</strong> di bagian bawah untuk mengirim seluruh draft catatan ke akun pembimbing lapangan untuk disetujui atau direvisi.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Status Legends / Arti Status */}
        <div>
          <Card className="relative overflow-hidden rounded-2xl border border-slate-200/60 dark:border-slate-800/60 bg-linear-to-br from-indigo-50/40 to-blue-50/40 dark:from-slate-950/40 dark:to-slate-900/40 p-5 shadow-md h-full flex flex-col justify-between">
            <div>
              <h4 className="font-extrabold text-indigo-950 dark:text-indigo-300 text-sm flex items-center gap-1.5 mb-3">
                <Sparkles className="h-4 w-4 text-indigo-500" />
                Legenda Status Paraf
              </h4>
              
              <div className="space-y-3.5">
                <div className="flex items-start gap-2">
                  <Badge variant="outline" className="bg-slate-100 shrink-0 text-[10px] font-bold">DRAFT</Badge>
                  <p className="text-[10px] text-slate-655 dark:text-slate-400 leading-relaxed">
                    Belum diajukan. Catatan masih disimpan secara lokal di draft Anda dan dapat diedit/dihapus kapan saja.
                  </p>
                </div>

                <div className="flex items-start gap-2">
                  <Badge variant="outline" className="bg-yellow-50 shrink-0 text-[10px] font-bold text-yellow-750 border-yellow-200">PENDING</Badge>
                  <p className="text-[10px] text-slate-655 dark:text-slate-400 leading-relaxed">
                    Menunggu review pembimbing lapangan. Entri dikunci sementara selama peninjauan berlangsung.
                  </p>
                </div>

                <div className="flex items-start gap-2">
                  <Badge className="bg-green-500 shrink-0 text-[10px] font-bold text-white">DISETUJUI</Badge>
                  <p className="text-[10px] text-slate-655 dark:text-slate-400 leading-relaxed">
                    Disetujui & diparaf secara sah oleh pembimbing lapangan. Catatan ini resmi dikunci dan siap di-export.
                  </p>
                </div>

                <div className="flex items-start gap-2">
                  <Badge variant="destructive" className="shrink-0 text-[10px] font-bold">REJECTED</Badge>
                  <p className="text-[10px] text-slate-655 dark:text-slate-400 leading-relaxed">
                    Ditolak/perlu revisi. Silakan klik tombol Edit untuk membenahi deskripsi sesuai catatan feedback pembimbing.
                  </p>
                </div>
              </div>
            </div>
            
            <p className="text-[9.5px] text-slate-400 dark:text-slate-500 italic leading-relaxed mt-4 pt-3 border-t border-slate-200/50 dark:border-slate-800/50">
              💡 Tip: Seluruh logbook dapat diunduh sebagai file PDF atau Word jika semua hari kerja sudah disetujui mentor.
            </p>
          </Card>
        </div>
      </div>

      {/* Student Profile Card */}
      <Card className="relative overflow-hidden rounded-2xl border border-slate-200/60 dark:border-slate-800/60 bg-white/85 dark:bg-slate-900/85 shadow-md backdrop-blur-xl mb-8">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-linear-to-b from-blue-400 to-indigo-600" />
        <CardContent className="p-6 sm:p-8">
          {isLoadingProfile ? (
            <div className="flex min-h-[160px] items-center justify-center text-sm text-slate-500 font-medium animate-pulse">
              Memuat data profil magang...
            </div>
          ) : (
            <TooltipProvider delayDuration={200}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Block 1: Nama Mahasiswa */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-4 rounded-xl border border-slate-100 dark:border-slate-850 p-4 bg-slate-50/50 dark:bg-slate-950/40 transition-all hover:bg-slate-50 dark:hover:bg-slate-950/60 shadow-xs cursor-help">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 shrink-0 shadow-2xs">
                        <User className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <Label className="text-[10px] sm:text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Nama Mahasiswa</Label>
                        <p className="font-extrabold text-slate-800 dark:text-slate-100 text-sm sm:text-base mt-0.5 leading-tight truncate">
                          {completeData?.student?.name || "-"}
                        </p>
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="font-semibold shadow-md">
                    <p>{completeData?.student?.name || "-"}</p>
                  </TooltipContent>
                </Tooltip>

                {/* Block 2: NIM */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-4 rounded-xl border border-slate-100 dark:border-slate-850 p-4 bg-slate-50/50 dark:bg-slate-950/40 transition-all hover:bg-slate-50 dark:hover:bg-slate-950/60 shadow-xs cursor-help">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 shrink-0 shadow-2xs">
                        <span className="font-black text-sm font-mono">#</span>
                      </div>
                      <div className="min-w-0">
                        <Label className="text-[10px] sm:text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">NIM</Label>
                        <p className="font-extrabold text-slate-800 dark:text-slate-100 text-sm sm:text-base mt-0.5 leading-tight truncate">
                          {completeData?.student?.nim || "-"}
                        </p>
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="font-semibold shadow-md">
                    <p>{completeData?.student?.nim || "-"}</p>
                  </TooltipContent>
                </Tooltip>

                {/* Block 3: Dosen Pembimbing */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-4 rounded-xl border border-slate-100 dark:border-slate-850 p-4 bg-slate-50/50 dark:bg-slate-950/40 transition-all hover:bg-slate-50 dark:hover:bg-slate-950/60 shadow-xs cursor-help">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 shrink-0 shadow-2xs">
                        <UserCircle className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <Label className="text-[10px] sm:text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Dosen Pembimbing</Label>
                        <p className="font-extrabold text-slate-800 dark:text-slate-100 text-sm sm:text-base mt-0.5 leading-tight truncate">
                          {completeData?.lecturer?.name || "-"}
                        </p>
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="font-semibold shadow-md">
                    <p>{completeData?.lecturer?.name || "-"}</p>
                  </TooltipContent>
                </Tooltip>

                {/* Block 4: Tempat KP */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-4 rounded-xl border border-slate-100 dark:border-slate-850 p-4 bg-slate-50/50 dark:bg-slate-950/40 transition-all hover:bg-slate-50 dark:hover:bg-slate-950/60 shadow-xs cursor-help">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 shrink-0 shadow-2xs">
                        <Building className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <Label className="text-[10px] sm:text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Tempat KP</Label>
                        <p className="font-extrabold text-slate-800 dark:text-slate-100 text-sm sm:text-base mt-0.5 leading-tight truncate" title={completeData?.submission?.company}>
                          {completeData?.submission?.company || "Belum tersedia"}
                        </p>
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="font-semibold shadow-md max-w-[320px]">
                    <p>{completeData?.submission?.company || "Belum tersedia"}</p>
                  </TooltipContent>
                </Tooltip>

                {/* Block 5: Unit / Divisi */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-4 rounded-xl border border-slate-100 dark:border-slate-850 p-4 bg-slate-50/50 dark:bg-slate-950/40 transition-all hover:bg-slate-50 dark:hover:bg-slate-950/60 shadow-xs cursor-help">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 shrink-0 shadow-2xs">
                        <Briefcase className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <Label className="text-[10px] sm:text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Unit / Divisi</Label>
                        <p className="font-extrabold text-slate-800 dark:text-slate-100 text-sm sm:text-base mt-0.5 leading-tight truncate">
                          {completeData?.submission?.division || "Belum tersedia"}
                        </p>
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="font-semibold shadow-md max-w-[300px]">
                    <p>{completeData?.submission?.division || "Belum tersedia"}</p>
                  </TooltipContent>
                </Tooltip>

                {/* Block 6: Periode */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-4 rounded-xl border border-slate-100 dark:border-slate-850 p-4 bg-slate-50/50 dark:bg-slate-950/40 transition-all hover:bg-slate-50 dark:hover:bg-slate-950/60 shadow-xs cursor-help">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 shrink-0 shadow-2xs">
                        <Calendar className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 w-full">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <Label className="text-[10px] sm:text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider font-sans">Periode</Label>
                          <Badge
                            variant={
                              completeData?.internship?.status === "AKTIF"
                                ? "default"
                                : "secondary"
                            }
                            className={
                              completeData?.internship?.status === "AKTIF"
                                ? "bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold rounded-md shadow-xs px-2 py-0.5 text-[9px] sm:text-[10px]"
                                : "font-semibold rounded-md text-[9px] sm:text-[10px]"
                            }
                          >
                            {completeData?.internship?.status || "PENDING"}
                          </Badge>
                        </div>
                        <p className="font-extrabold text-slate-800 dark:text-slate-100 text-xs sm:text-sm mt-0.5 leading-tight truncate">
                          {workPeriod.startDate && workPeriod.endDate
                            ? `${new Date(workPeriod.startDate).toLocaleDateString("id-ID", {
                                day: "2-digit",
                                month: "short",
                              })} - ${new Date(workPeriod.endDate).toLocaleDateString("id-ID", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })}`
                            : completeData?.submission?.startDate && completeData?.submission?.endDate
                            ? `${new Date(completeData.submission.startDate).toLocaleDateString("id-ID", {
                                day: "2-digit",
                                month: "short",
                              })} - ${new Date(completeData.submission.endDate).toLocaleDateString("id-ID", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })}`
                            : "Belum tersedia"}
                        </p>
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="font-semibold shadow-md">
                    <p>
                      {workPeriod.startDate && workPeriod.endDate
                        ? `${new Date(workPeriod.startDate).toLocaleDateString("id-ID", {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                          })} s/d ${new Date(workPeriod.endDate).toLocaleDateString("id-ID", {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                          })}`
                        : completeData?.submission?.startDate && completeData?.submission?.endDate
                        ? `${new Date(completeData.submission.startDate).toLocaleDateString("id-ID", {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                          })} s/d ${new Date(completeData.submission.endDate).toLocaleDateString("id-ID", {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                          })}`
                        : "Belum tersedia"}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </TooltipProvider>
          )}
        </CardContent>
      </Card>

      {/* Step Indicator */}
      <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-12">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-9 h-9 rounded-full flex items-center justify-center font-black text-sm border shadow-sm transition-all",
              isPeriodSaved 
                ? "bg-emerald-500 border-emerald-500 text-white" 
                : "bg-indigo-50 border-indigo-200 text-indigo-600 dark:bg-indigo-950/30 dark:border-indigo-900"
            )}>
              {isPeriodSaved ? <CheckCircle className="w-5 h-5" /> : "1"}
            </div>
            <div>
              <span className="font-extrabold text-xs block text-slate-800 dark:text-slate-200">LANGKAH 1</span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold block">Set Periode Kerja Praktik</span>
            </div>
          </div>
          
          <div className="hidden sm:block h-px w-20 bg-slate-200 dark:bg-slate-800" />

          <div className="flex items-center gap-3">
            <div className={cn(
              "w-9 h-9 rounded-full flex items-center justify-center font-black text-sm border shadow-sm transition-all",
              isPeriodSaved 
                ? "bg-indigo-650 border-indigo-600 text-white shadow-indigo-100 dark:shadow-none" 
                : "bg-slate-50 border-slate-200 text-slate-400 dark:bg-slate-900 dark:border-slate-800"
            )}>
              2
            </div>
            <div>
              <span className="font-extrabold text-xs block text-slate-800 dark:text-slate-200">LANGKAH 2</span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold block">Catat Entri & Ajukan Logbook</span>
            </div>
          </div>
        </div>
      </div>

      {/* Section 1: Work Period Form */}
      <Card className="border border-slate-200/60 dark:border-slate-800/60 rounded-2xl bg-white dark:bg-slate-900/80 shadow-md overflow-hidden">
        <CardHeader className="bg-slate-50/50 dark:bg-slate-950/20 px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <CardTitle className="text-base font-extrabold flex items-center gap-2 text-indigo-950 dark:text-indigo-300">
                <Calendar className="h-5 w-5 text-indigo-500" />
                Periode Kerja Praktik
                {periodSource === "auto" && (
                  <Badge variant="default" className="ml-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold py-0.5">
                    <Sparkles className="h-3 w-3 mr-1" />
                    Auto dari Pengajuan
                  </Badge>
                )}
                {periodSource === "manual" && (
                  <Badge variant="secondary" className="ml-2 text-xs font-bold py-0.5">
                    <Edit className="h-3 w-3 mr-1" />
                    Input Manual
                  </Badge>
                )}
              </CardTitle>
              <CardDescription className="text-xs text-slate-500 mt-1">
                {periodSource === "auto"
                  ? "Periode otomatis dimuat dari data pengajuan KP Anda"
                  : "Tentukan periode dan hari kerja praktik Anda"}
              </CardDescription>
            </div>
            {isPeriodSaved && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleEditPeriod}
                className="border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl font-bold text-xs"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Periode
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {/* Info Alert berdasarkan sumber periode */}
          {periodSource === "auto" && (
            <Alert className="bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900 rounded-xl">
              <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <AlertDescription className="text-xs text-emerald-800 dark:text-emerald-350 leading-relaxed font-semibold">
                <strong>Periode Otomatis Terdeteksi:</strong> Periode kerja praktik Anda
                sudah otomatis disinkronkan dari pengajuan magang yang disetujui.
                Semua tanggal libur nasional/akhir pekan disaring otomatis.
              </AlertDescription>
            </Alert>
          )}
          {periodSource === null && !isPeriodSaved && (
            <Alert className="bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900 rounded-xl">
              <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <AlertDescription className="text-xs text-blue-800 dark:text-blue-350 leading-relaxed font-semibold">
                <strong>Input Manual Diperlukan:</strong> Sistem belum mendeteksi pengajuan
                KP aktif Anda. Silakan tentukan rentang tanggal kerja praktik Anda secara mandiri di bawah.
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-600 dark:text-slate-400">Tanggal Mulai KP</Label>
              <Input
                type="date"
                value={workPeriod.startDate || ""}
                onChange={(e) =>
                  setWorkPeriod({ ...workPeriod, startDate: e.target.value })
                }
                disabled={isPeriodSaved}
                className="rounded-xl border-slate-200 dark:border-slate-800 shadow-xs focus-visible:ring-indigo-500 h-11"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-600 dark:text-slate-400">Tanggal Selesai KP</Label>
              <Input
                type="date"
                value={workPeriod.endDate || ""}
                onChange={(e) =>
                  setWorkPeriod({ ...workPeriod, endDate: e.target.value })
                }
                disabled={isPeriodSaved}
                className="rounded-xl border-slate-200 dark:border-slate-800 shadow-xs focus-visible:ring-indigo-500 h-11"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-600 dark:text-slate-400">Hari Kerja Mulai</Label>
              <Select
                value={workPeriod.startDay}
                onValueChange={(value) =>
                  setWorkPeriod({ ...workPeriod, startDay: value })
                }
                disabled={isPeriodSaved}
              >
                <SelectTrigger className="rounded-xl border-slate-200 dark:border-slate-800 h-11 shadow-xs">
                  <SelectValue placeholder="Pilih hari" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {DAYS_OPTIONS.map((day) => (
                    <SelectItem key={day.value} value={day.value}>
                      {day.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-600 dark:text-slate-400">Hari Kerja Selesai</Label>
              <Select
                value={workPeriod.endDay}
                onValueChange={(value) =>
                  setWorkPeriod({ ...workPeriod, endDay: value })
                }
                disabled={isPeriodSaved}
              >
                <SelectTrigger className="rounded-xl border-slate-200 dark:border-slate-800 h-11 shadow-xs">
                  <SelectValue placeholder="Pilih hari" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
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
            <div className="flex justify-end pt-2">
              <Button 
                onClick={handleSubmitPeriod}
                className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md font-bold px-6 py-5"
              >
                <Save className="mr-2 h-4 w-4" />
                Simpan & Generate Hari Kerja
              </Button>
            </div>
          )}

          {isPeriodSaved && (
            <Alert className="border-l-4 border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/10 border-slate-250 dark:border-slate-800 rounded-xl">
              <CheckCircle className="h-4 w-4 text-emerald-600" />
              <AlertDescription className="text-xs text-emerald-800 dark:text-emerald-350 leading-relaxed font-semibold">
                Periode kerja praktik Anda telah tersimpan dengan aman! Sistem berhasil melahirkan{" "}
                <strong>{generatedDates.length} hari kerja</strong> yang siap diisi secara bertahap pada panel di bawah ini.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Show sections below only if period is saved */}
      {isPeriodSaved && (
        <>
          {/* Section 2: Add Logbook Entry Form */}
          <div ref={entryFormRef} className="scroll-mt-20">
            <Card className="border border-slate-200/60 dark:border-slate-800/60 rounded-2xl bg-white dark:bg-slate-900/80 shadow-md overflow-hidden">
            <CardHeader className="bg-slate-50/50 dark:bg-slate-950/20 px-6 py-4 border-b border-slate-100 dark:border-slate-800">
              <CardTitle className="text-base font-extrabold flex items-center gap-2 text-indigo-950 dark:text-indigo-300">
                {editingId ? (
                  <Edit className="h-5 w-5 text-indigo-500 animate-pulse" />
                ) : (
                  <Plus className="h-5 w-5 text-indigo-500" />
                )}
                {editingId ? "Edit Catatan Logbook Harian" : "Catat Aktivitas Baru"}
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                {editingId
                  ? "Sesuaikan rincian laporan aktivitas harian Anda di bawah"
                  : "Dokumentasikan tugas, pengerjaan, dan pencapaian Anda hari ini"}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-6 items-start">
                {/* Left Column: Date Selectors */}
                <div className="space-y-4 p-4 rounded-xl bg-slate-50/50 dark:bg-slate-950/30 border border-slate-100 dark:border-slate-850">
                  <Label htmlFor="tanggal" className="text-xs font-bold text-slate-700 dark:text-slate-350">
                    Tanggal Logbook
                  </Label>
                  <div className="flex items-center gap-1.5">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      disabled={isSavingLogbook}
                      onClick={() => shiftSelectedDate(-1)}
                      aria-label="Tanggal sebelumnya"
                      className="rounded-lg h-9 w-9 border-slate-200 dark:border-slate-800 shrink-0"
                    >
                      <ArrowLeft className="h-4 w-4 text-slate-650" />
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
                          className="h-9 flex-1 justify-start text-left text-xs font-bold rounded-lg border-slate-200 dark:border-slate-800"
                        >
                          <Calendar className="mr-2 h-4 w-4 text-indigo-500 shrink-0" />
                          {selectedDate
                            ? formatDate(selectedDate)
                            : "Pilih Tanggal"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 rounded-xl overflow-hidden shadow-lg border" align="start">
                        <UiCalendar
                          className="p-2"
                          mode="single"
                          locale={localeId}
                          weekStartsOn={1}
                          showOutsideDays
                          formatters={{
                            formatWeekdayName: (date) => {
                              const dayNames = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
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
                            const dateKey = toDateKey(date);
                            if (!generatedDates.includes(dateKey)) {
                              toast.error(
                                "Tanggal tidak termasuk hari kerja pada periode yang sudah Anda set. Pilih tanggal sesuai periode kerja praktik.",
                              );
                              return;
                            }
                            setSelectedDate(dateKey);
                            setCalendarMonth(date);
                            setIsDatePickerOpen(false);
                          }}
                          classNames={{
                            nav_button: "h-7 w-7 p-0 rounded-md",
                            weekdays: "grid grid-cols-7",
                            weekday: "w-8 text-center text-[0.7rem] font-bold text-slate-400 leading-none",
                            head_row: "grid grid-cols-7",
                            head_cell: "w-8 text-center text-[0.7rem] font-bold text-slate-400 leading-none",
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
                              backgroundColor: "#e8fbf1",
                              color: "#0f764a",
                              border: "1px solid #a7f3d0",
                              fontWeight: 700,
                            },
                            nonWorkday: {
                              color: "#ef4444",
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
                      className="rounded-lg h-9 w-9 border-slate-200 dark:border-slate-800 shrink-0"
                    >
                      <ArrowLeft className="h-4 w-4 rotate-180 text-slate-655" />
                    </Button>
                  </div>
                  
                  <div className="pt-2 space-y-2 border-t border-slate-100 dark:border-slate-850">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">Keterangan Kalender</span>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 dark:text-slate-450">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-sm" />
                        Sudah diisi
                      </span>
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 dark:text-slate-450">
                        <span className="h-2 w-2 rounded-full bg-red-400 shadow-sm" />
                        Bukan hari kerja
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Column: Description textarea */}
                <div className="space-y-4 w-full">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="deskripsi" className="text-xs font-bold text-slate-700 dark:text-slate-350">
                      Rincian Aktivitas Kerja Praktik
                    </Label>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-400">
                      {getWordCount(description)} kata
                    </span>
                  </div>
                  <Textarea
                    id="deskripsi"
                    rows={5}
                    placeholder="Contoh: Menyusun desain arsitektur database relasional, melakukan setup environment Docker local, berdiskusi dengan mentor tim dev mengenai integrasi API SSO..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    disabled={isSavingLogbook}
                    className="rounded-xl border-slate-200 dark:border-slate-800 focus-visible:ring-indigo-500 text-sm leading-relaxed p-3.5"
                  />
                </div>
              </div>

              {/* Photo Upload Section (Opsional) */}
              <div className="space-y-3 p-5 rounded-xl border border-slate-200/60 dark:border-slate-800/60 bg-slate-50/30 dark:bg-slate-950/20">
                <div className="flex items-center gap-2">
                  <Camera className="h-4.5 w-4.5 text-indigo-550 shrink-0" />
                  <Label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Bukti Dokumentasi Kegiatan Magang 
                    <span className="ml-1.5 text-[10px] font-normal text-slate-400 dark:text-slate-500 uppercase tracking-wide">
                      (Opsional — Maksimal 2MB, JPEG/PNG/WebP)
                    </span>
                  </Label>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <label
                    htmlFor="foto-kegiatan"
                    className="flex items-center gap-2 cursor-pointer px-4 py-2.5 text-xs font-extrabold border border-dashed rounded-xl bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 border-slate-300 hover:border-indigo-500 transition-all shadow-xs shrink-0"
                  >
                    <ImageIcon className="h-4 w-4 text-slate-500" />
                    {photoFile ? photoFile.name : "Pilih File Gambar..."}
                    <input
                      id="foto-kegiatan"
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="sr-only"
                      onChange={handlePhotoFileChange}
                      disabled={isSavingLogbook}
                    />
                  </label>

                  {photoPreview && (
                    <div className="flex items-start gap-2 p-1 border rounded-xl bg-white dark:bg-slate-900 shadow-sm shrink-0">
                      <img
                        src={photoPreview}
                        alt="Preview foto kegiatan"
                        className="h-16 w-16 object-cover rounded-lg"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-slate-450 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-md"
                        onClick={() => {
                          setPhotoFile(null);
                          setPhotoPreview(null);
                        }}
                        title="Hapus foto"
                      >
                        <XCircle className="h-4.5 w-4.5" />
                      </Button>
                    </div>
                  )}
                  
                  <div className="text-[11px] text-slate-450 dark:text-slate-500 leading-normal flex-1">
                    💡 <em>Catatan:</em> Foto bersifat bukti otentik yang akan dilihat langsung oleh Pembimbing Lapangan serta Dosen PA. Anda juga bisa mengupload/mengganti foto kapan saja lewat tabel setelah entri disimpan.
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                {editingId && (
                  <Button
                    variant="outline"
                    onClick={handleCancelEdit}
                    disabled={isSavingLogbook}
                    className="rounded-xl border-slate-200 hover:bg-slate-100 font-bold px-5 text-xs h-10"
                  >
                    Batal Edit
                  </Button>
                )}
                <Button 
                  onClick={handleAddLogbook} 
                  disabled={isSavingLogbook}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md font-bold px-6 h-10 text-xs"
                >
                  <Save className="mr-2 h-4 w-4" />
                  {isSavingLogbook
                    ? "Menyimpan..."
                    : editingId
                      ? "Simpan Perubahan"
                      : "Tambah ke Draft Logbook"}
                </Button>
              </div>
            </CardContent>
          </Card>
          </div>

          {/* Section 3: Generated Logbook Table */}
          <Card className="border border-slate-200/60 dark:border-slate-800/60 rounded-2xl bg-white dark:bg-slate-900/80 shadow-md overflow-hidden">
            <CardHeader className="bg-slate-50/50 dark:bg-slate-950/20 px-6 py-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <CardTitle className="text-base font-extrabold flex items-center gap-2 text-indigo-950 dark:text-indigo-300">
                    <FileText className="h-5 w-5 text-indigo-500" />
                    Catatan Tabel Logbook Harian
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500 mt-1">
                    Daftar seluruh hari kerja praktik Anda. Isi catatan harian untuk memproses persetujuan.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Period Display */}
              <div className="flex flex-wrap items-center gap-3 p-4 bg-linear-to-r from-indigo-50/50 via-blue-50/30 to-transparent dark:from-slate-950/40 dark:via-slate-950/20 dark:to-transparent border border-slate-100 dark:border-slate-850 rounded-xl">
                <span className="text-xs font-bold text-slate-400 dark:text-slate-550 uppercase tracking-wider">
                  Rentang Waktu KP:
                </span>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-300">
                    {workPeriod.startDate
                      ? formatDate(workPeriod.startDate)
                      : "Belum diset"}
                  </span>
                  <span className="text-xs font-semibold text-slate-400">s/d</span>
                  <span className="px-3 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-300">
                    {workPeriod.endDate
                      ? formatDate(workPeriod.endDate)
                      : "Belum diset"}
                  </span>
                </div>
                <span className="ml-auto px-3 py-1 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-400 border border-indigo-100/50 dark:border-indigo-900/50 rounded-full text-xs font-black">
                  🚀 {generatedDates.length} Hari Kerja Praktik
                </span>
              </div>

              {/* Logbook Table */}
              {generatedDates.length > 0 && (
                <div className="rounded-2xl border border-slate-200/60 dark:border-slate-800/60 w-full overflow-hidden shadow-xs bg-white dark:bg-slate-900">
                  <Table className="border-collapse">
                    <TableHeader className="bg-slate-50/70 dark:bg-slate-950/40">
                      <TableRow className="border-b border-slate-200/60 dark:border-slate-800/60 hover:bg-transparent">
                        <TableHead className="w-20 text-center text-xs font-black text-slate-500 uppercase tracking-wider py-4">
                          Minggu
                        </TableHead>
                        <TableHead className="w-36 text-xs font-black text-slate-500 uppercase tracking-wider py-4">
                          Hari & Tanggal
                        </TableHead>
                        <TableHead className="w-20 text-center text-xs font-black text-slate-500 uppercase tracking-wider py-4">
                          Jam
                        </TableHead>
                        <TableHead className="text-xs font-black text-slate-500 uppercase tracking-wider py-4">
                          Deskripsi Aktivitas Kerja
                        </TableHead>
                        <TableHead className="w-28 text-center text-xs font-black text-slate-500 uppercase tracking-wider py-4">
                          Foto Bukti
                        </TableHead>
                        <TableHead className="w-40 text-center text-xs font-black text-slate-500 uppercase tracking-wider py-4">
                          Status & Paraf
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
                          <TableRow 
                            key={index}
                            className={cn(
                              "border-b border-slate-100 dark:border-slate-850 hover:bg-slate-50/40 dark:hover:bg-slate-950/10 transition-colors",
                              showWeekNumber && index > 0 ? "border-t-2 border-slate-200 dark:border-slate-850" : ""
                            )}
                          >
                            {showWeekNumber && (
                              <TableCell
                                className="text-center font-black bg-indigo-50/20 dark:bg-indigo-950/10 text-indigo-700 dark:text-indigo-400 text-sm border-r border-slate-100 dark:border-slate-850"
                                rowSpan={getWeekRowSpan(generatedDates, index)}
                              >
                                {weekNum}
                              </TableCell>
                            )}
                            <TableCell
                              className={cn(
                                "py-4",
                                !entry && "cursor-pointer hover:bg-amber-50/20 dark:hover:bg-amber-950/5 group"
                              )}
                              onClick={() => {
                                if (!entry) {
                                  setSelectedDate(date);
                                  setCalendarMonth(fromDateKey(date));
                                  entryFormRef.current?.scrollIntoView({
                                    behavior: "smooth",
                                    block: "start",
                                  });
                                }
                              }}
                            >
                              <div className="flex flex-col">
                                <span className="font-extrabold text-slate-800 dark:text-slate-200 group-hover:text-indigo-650 transition-colors text-xs">
                                  {getDayName(date)}
                                </span>
                                <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 mt-0.5">
                                  {formatDate(date)}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell 
                              className={cn(
                                "text-center font-bold text-xs py-4",
                                !entry && "cursor-pointer hover:bg-amber-50/20 dark:hover:bg-amber-950/5 group"
                              )}
                              onClick={() => {
                                if (!entry) {
                                  setSelectedDate(date);
                                  setCalendarMonth(fromDateKey(date));
                                  entryFormRef.current?.scrollIntoView({
                                    behavior: "smooth",
                                    block: "start",
                                  });
                                }
                              }}
                            >
                              <span className={cn(entry ? "text-slate-800 dark:text-slate-200" : "text-slate-350 dark:text-slate-600")}>
                                {entry?.time || "—"}
                              </span>
                            </TableCell>
                            <TableCell 
                              className={cn(
                                "py-4",
                                !entry && "cursor-pointer hover:bg-amber-50/20 dark:hover:bg-amber-950/5 group"
                              )}
                              onClick={() => {
                                if (!entry) {
                                  setSelectedDate(date);
                                  setCalendarMonth(fromDateKey(date));
                                  entryFormRef.current?.scrollIntoView({
                                    behavior: "smooth",
                                    block: "start",
                                  });
                                }
                              }}
                            >
                              <div className="space-y-1.5 max-w-xl break-words">
                                {entry ? (
                                  <div className="space-y-2">
                                    <div className="text-xs leading-relaxed text-slate-700 dark:text-slate-300 break-words whitespace-normal font-semibold">
                                      <p className="line-clamp-4">
                                        {entry.description}
                                      </p>
                                      <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mt-1">
                                        {getWordCount(entry.description)} kata
                                      </p>
                                    </div>
                                    <div className="flex gap-1 flex-wrap">
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={(e) => {
                                          e.stopPropagation(); // Prevent cell click
                                          handleEditLogbook(entry);
                                        }}
                                        disabled={
                                          isSavingLogbook ||
                                          entry?.mentorSignature?.status === "approved" ||
                                          entry?.status === "PENDING"
                                        }
                                        className="h-7 text-[10px] font-bold rounded-lg border-slate-200 dark:border-slate-800 px-2.5"
                                      >
                                        <Edit className="h-3 w-3 mr-1 text-slate-500" />
                                        Edit Rincian
                                      </Button>
                                    </div>
                                    {entry?.mentorSignature?.status === "approved" && (
                                      <p className="text-[10px] font-bold text-emerald-700 dark:text-emerald-450 bg-emerald-50 dark:bg-emerald-950/30 px-2.5 py-1 rounded-lg">
                                        🔒 Logbook telah diverifikasi mentor lapangan. Entri ini dikunci secara permanen.
                                      </p>
                                    )}
                                    {entry?.status === "PENDING" && !entry?.mentorSignature && (
                                      <p className="text-[10px] font-bold text-amber-700 dark:text-amber-450 bg-amber-50 dark:bg-amber-950/30 px-2.5 py-1 rounded-lg">
                                        ⏳ Sudah diajukan & sedang menanti paraf review dari pembimbing lapangan.
                                      </p>
                                    )}
                                    {entry?.status === "DRAFT" && (
                                      <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/50 px-2.5 py-1 rounded-lg border border-slate-100 dark:border-slate-800">
                                        📝 Disimpan sebagai draft lokal. Siap diajukan ke pembimbing lapangan.
                                      </p>
                                    )}
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-500 font-bold text-xs py-2 group-hover:text-amber-700 transition-colors">
                                    <Sparkles className="h-3.5 w-3.5" />
                                    <span>Belum diisi. Klik untuk mencatat aktivitas hari ini</span>
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            {/* Foto Kegiatan Cell */}
                            <TableCell className="text-center py-4">
                              {entry?.photoUrl ? (
                                <a
                                  href={entry.photoUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  title="Lihat foto kegiatan"
                                  className="inline-block"
                                >
                                  <div className="relative group mx-auto h-12 w-12 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xs">
                                    <img
                                      src={entry.photoUrl}
                                      alt="Foto kegiatan"
                                      className="h-12 w-12 object-cover"
                                    />
                                    {/* Overlay for replacement (only for editable entries) */}
                                    {entry.status !== "PENDING" && entry.mentorSignature?.status !== "approved" && (
                                      <label
                                        htmlFor={`foto-replace-${entry.id}`}
                                        className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity"
                                        onClick={(e) => e.stopPropagation()} // Prevent bubble
                                        title="Ganti foto kegiatan"
                                      >
                                        <Camera className="h-4.5 w-4.5 text-white" />
                                        <input
                                          id={`foto-replace-${entry.id}`}
                                          type="file"
                                          accept="image/jpeg,image/png,image/webp"
                                          className="sr-only"
                                          onChange={async (e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                              const ALLOWED = ["image/jpeg", "image/png", "image/webp"];
                                              if (!ALLOWED.includes(file.type) || file.size > 2 * 1024 * 1024) return;
                                              try {
                                                setIsUploadingPhoto(true);
                                                setUploadingPhotoForId(entry.id);
                                                const res = await uploadLogbookPhoto(entry.id, file);
                                                if (!res.success) throw new Error(res.message || "Gagal upload foto.");
                                                setLogbookEntries((prev) =>
                                                  prev.map((en) =>
                                                    en.id === entry.id ? { ...en, photoUrl: res.data?.photoUrl ?? en.photoUrl } : en,
                                                  ),
                                                );
                                                toast.success("Foto berhasil diganti!");
                                              } catch (err) {
                                                toast.error(err instanceof Error ? err.message : "Gagal ganti foto.");
                                              } finally {
                                                setIsUploadingPhoto(false);
                                                setUploadingPhotoForId(null);
                                              }
                                            }
                                          }}
                                        />
                                      </label>
                                    )}
                                  </div>
                                </a>
                              ) : entry ? (
                                <div className="flex flex-col items-center gap-1">
                                  <label
                                    htmlFor={`foto-entry-${entry.id}`}
                                    className={`flex flex-col items-center gap-1 cursor-pointer text-[10px] font-extrabold text-slate-400 hover:text-indigo-600 transition-colors ${isUploadingPhoto && uploadingPhotoForId === entry.id ? "opacity-50 pointer-events-none" : ""}`}
                                    title="Upload foto kegiatan"
                                  >
                                    <Camera className="h-4.5 w-4.5 text-slate-400" />
                                    <span>
                                      {isUploadingPhoto && uploadingPhotoForId === entry.id
                                        ? "Uploading..."
                                        : "Unggah Foto"}
                                    </span>
                                    <input
                                      id={`foto-entry-${entry.id}`}
                                      type="file"
                                      accept="image/jpeg,image/png,image/webp"
                                      className="sr-only"
                                      onChange={async (e) => {
                                        handlePhotoFileChange(e);
                                        const file = e.target.files?.[0];
                                        if (file) {
                                          const ALLOWED = ["image/jpeg", "image/png", "image/webp"];
                                          if (!ALLOWED.includes(file.type) || file.size > 2 * 1024 * 1024) return;
                                          setPhotoFile(file);
                                          try {
                                            setIsUploadingPhoto(true);
                                            setUploadingPhotoForId(entry.id);
                                            const res = await uploadLogbookPhoto(entry.id, file);
                                            if (!res.success) throw new Error(res.message || "Gagal upload foto.");
                                            setLogbookEntries((prev) =>
                                              prev.map((en) =>
                                                en.id === entry.id ? { ...en, photoUrl: res.data?.photoUrl ?? en.photoUrl } : en,
                                              ),
                                            );
                                            setPhotoFile(null);
                                            setPhotoPreview(null);
                                            toast.success("Foto berhasil diupload!");
                                          } catch (err) {
                                            toast.error(err instanceof Error ? err.message : "Gagal upload foto.");
                                          } finally {
                                            setIsUploadingPhoto(false);
                                            setUploadingPhotoForId(null);
                                          }
                                        }
                                      }}
                                      disabled={isUploadingPhoto}
                                    />
                                  </label>
                                </div>
                              ) : (
                                <span className="text-[11px] text-slate-300 dark:text-slate-700 font-semibold">—</span>
                              )}
                            </TableCell>
                            <TableCell 
                              className={cn(
                                "text-center py-4 border-l border-slate-100 dark:border-slate-850",
                                !entry && "cursor-pointer hover:bg-amber-50/20 dark:hover:bg-amber-950/5 group"
                              )}
                              onClick={() => {
                                if (!entry) {
                                  setSelectedDate(date);
                                  setCalendarMonth(fromDateKey(date));
                                  entryFormRef.current?.scrollIntoView({
                                    behavior: "smooth",
                                    block: "start",
                                  });
                                }
                              }}
                            >
                              <div className="flex flex-col items-center gap-1.5 break-words">
                                {entry ? (
                                  getMentorSignatureBadge(entry)
                                ) : (
                                  <Badge variant="outline" className="bg-slate-50 text-slate-400 border-slate-200 group-hover:text-slate-500 group-hover:border-slate-300 transition-colors font-bold text-[10px] rounded-lg">
                                    Belum diisi
                                  </Badge>
                                )}

                                {/* Notes dari mentor (untuk approved) */}
                                {entry?.mentorSignature?.status === "approved" && entry?.mentorSignature?.notes && (
                                  <p className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-100 dark:bg-emerald-950/20 dark:border-emerald-900/50 px-2 py-1 rounded-lg mt-1 italic">
                                    💬 {entry.mentorSignature.notes}
                                  </p>
                                )}

                                {/* Rejection note (untuk rejected) - Lebih prominent */}
                                {entry?.mentorSignature?.status === "rejected" && entry?.mentorSignature?.notes && (
                                  <div className="mt-2 w-full max-w-[150px]">
                                    <div 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleEditLogbook(entry);
                                      }}
                                      className="bg-red-50 border border-red-200 rounded-lg p-2 text-left cursor-pointer hover:bg-red-100 transition-colors"
                                    >
                                      <p className="text-[9px] font-extrabold text-red-900 mb-0.5 uppercase tracking-wide">
                                        📝 Revisi:
                                      </p>
                                      <p className="text-[10px] text-red-800 leading-normal line-clamp-3">
                                        {entry.mentorSignature.notes}
                                      </p>
                                      <p className="text-[9px] text-red-600 mt-1 italic font-semibold">
                                        Klik untuk revisi
                                      </p>
                                    </div>
                                  </div>
                                )}

                                {/* Revision note (untuk revision) */}
                                {entry?.mentorSignature?.status === "revision" && entry?.mentorSignature?.notes && (
                                  <p className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-1 rounded-lg mt-1 italic border border-amber-100">
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
                        Ajukan Logbook ke Pembimbing Lapangan
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

          {/* Warning Dialog for Incomplete Logbook (missing approvals) */}
          <AlertDialog
            open={showIncompleteLogbookDialog}
            onOpenChange={setShowIncompleteLogbookDialog}
          >
            <AlertDialogContent className="sm:max-w-[500px]">
              <AlertDialogHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-3 bg-amber-100 rounded-full">
                    <AlertTriangle className="h-6 w-6 text-amber-600" />
                  </div>
                  <AlertDialogTitle className="text-xl">
                    Logbook Belum Terverifikasi Penuh
                  </AlertDialogTitle>
                </div>
                <AlertDialogDescription className="text-base space-y-4 pt-2">
                  <p className="text-foreground">
                    Beberapa entri logbook Anda belum disetujui oleh mentor atau
                    belum diisi lengkap untuk seluruh periode kerja.
                  </p>

                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <p className="text-sm text-amber-900 font-medium mb-2">
                      ⚠️ Penting untuk Diketahui:
                    </p>
                    <p className="text-sm text-amber-800 leading-relaxed">
                      Hasil generate berupa <strong>Docx</strong> dan hanya
                      berisi data mahasiswa dan aktivitas{" "}
                      <strong>tanpa tanda tangan/paraf mentor</strong>.
                    </p>
                  </div>

                  <p className="text-sm text-muted-foreground">
                    💡 <strong>Saran:</strong> Pastikan seluruh logbook sudah
                    disetujui mentor jika Anda membutuhkan dokumen yang memiliki
                    tanda tangan digital.
                  </p>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="mt-2 sm:mt-0">
                  Batal
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={async () => {
                    setShowIncompleteLogbookDialog(false);
                    await generateDirectly("docx");
                  }}
                  className="bg-primary hover:bg-primary/90"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Lanjutkan Download
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
