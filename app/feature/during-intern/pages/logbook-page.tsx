import { useState, useEffect } from "react";
import { Link } from "react-router";
import { toast } from "sonner";
import { ArrowLeft, Calendar, FileText, Plus, Save, Sparkles, CheckCircle, Clock, AlertCircle, XCircle, Download, Edit, User, Building, GraduationCap } from "lucide-react";

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
import { Separator } from "~/components/ui/separator";
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

// Utility Functions
import { generateLogbookDOCX } from "~/feature/during-intern/utils/generate-logbook-docx";

interface LogbookEntry {
  id: string;
  date: string;
  description: string;
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

function LogbookPage() {
  const [isPeriodSaved, setIsPeriodSaved] = useState(false);
  const [workPeriod, setWorkPeriod] = useState<WorkPeriod>({
    startDay: "senin",
    endDay: "jumat",
  });
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [description, setDescription] = useState("");
  const [logbookEntries, setLogbookEntries] = useState<LogbookEntry[]>([]);
  const [generatedDates, setGeneratedDates] = useState<string[]>([]);
  const [periodSource, setPeriodSource] = useState<"auto" | "manual" | null>(null); // Track sumber periode
  
  // Complete internship data from backend (includes student, submission, team, mentor, lecturer)
  const [completeData, setCompleteData] = useState<CompleteInternshipData | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [showEmptyDataDialog, setShowEmptyDataDialog] = useState(false);

  // Fetch complete internship data (⭐ ONE API CALL FOR ALL DATA)
  useEffect(() => {
    async function fetchInternshipData() {
      console.log('🔄 Fetching internship data...');
      try {
        const response = await getCompleteInternshipData();
        console.log('📥 API Response:', response);

        if (response.success && response.data) {
          console.log('✅ Data received:', response.data);
          setCompleteData(response.data);
          
          // ✅ AUTO-POPULATE periode dari data submission (per mahasiswa)
          const submission = response.data.submission;
          if (submission?.startDate && submission?.endDate) {
            // Periode tersedia dari submission - auto-populate!
            const autoWorkPeriod = {
              startDate: submission.startDate,
              endDate: submission.endDate,
              startDay: 'senin',
              endDay: 'jumat'
            };
            
            setWorkPeriod(autoWorkPeriod);
            setPeriodSource("auto"); // Mark sebagai auto-populate
            
            // Cek localStorage untuk dates yang sudah digenerate
            const savedPeriodState = localStorage.getItem('logbook_period_saved');
            const savedDates = localStorage.getItem('logbook_generated_dates');
            const savedWorkPeriod = localStorage.getItem('logbook_work_period');
            const savedEntries = localStorage.getItem('logbook_entries');
            
            // Jika sudah pernah generate dengan periode yang sama, restore dari localStorage
            if (savedPeriodState === 'true' && savedDates && savedWorkPeriod) {
              const saved = JSON.parse(savedWorkPeriod);
              if (saved.startDate === submission.startDate && saved.endDate === submission.endDate) {
                setIsPeriodSaved(true);
                setGeneratedDates(JSON.parse(savedDates));
                if (savedEntries) {
                  setLogbookEntries(JSON.parse(savedEntries));
                }
                toast.success("Periode magang dan logbook berhasil dimuat!");
                return; // Exit early karena sudah restore dari localStorage
              }
            }
            
            // Jika belum pernah generate atau periode berbeda, auto-generate sekarang!
            const dates = generateDatesFromPeriod(
              autoWorkPeriod.startDate,
              autoWorkPeriod.endDate,
              autoWorkPeriod.startDay,
              autoWorkPeriod.endDay
            );
            
            setGeneratedDates(dates);
            setIsPeriodSaved(true);
            
            // Save ke localStorage
            localStorage.setItem('logbook_period_saved', 'true');
            localStorage.setItem('logbook_generated_dates', JSON.stringify(dates));
            localStorage.setItem('logbook_work_period', JSON.stringify(autoWorkPeriod));
            
            console.log('✅ AUTO-GENERATE SUCCESS:', {
              isPeriodSaved: true,
              generatedDatesCount: dates.length,
              workPeriod: autoWorkPeriod
            });
            
            toast.success(`Periode otomatis dari pengajuan! ${dates.length} hari kerja telah digenerate.`);
          } else {
            // Tidak ada data submission - coba restore dari localStorage (input manual sebelumnya)
            const savedPeriodState = localStorage.getItem('logbook_period_saved');
            const savedDates = localStorage.getItem('logbook_generated_dates');
            const savedWorkPeriod = localStorage.getItem('logbook_work_period');
            const savedEntries = localStorage.getItem('logbook_entries');

            if (savedPeriodState === 'true' && savedDates && savedWorkPeriod) {
              // Restore input manual sebelumnya
              setIsPeriodSaved(true);
              setGeneratedDates(JSON.parse(savedDates));
              setWorkPeriod(JSON.parse(savedWorkPeriod));
              setPeriodSource("manual"); // Mark sebagai manual input
              if (savedEntries) {
                setLogbookEntries(JSON.parse(savedEntries));
              }
              toast.success('Periode logbook manual berhasil dimuat!');
            } else {
              // Belum ada data submission DAN belum pernah input manual
              setPeriodSource(null);
              toast.info("Silakan input periode kerja Anda secara manual di Step 1");
            }
          }
        } else {
          console.error('❌ API returned unsuccessful:', response);
          
          // Check if it's an authentication error
          if (response.message?.toLowerCase().includes('unauthorized') || 
              response.message?.toLowerCase().includes('token')) {
            toast.error('Session expired. Anda akan diarahkan ke halaman login...', {
              duration: 3000,
            });
            // Redirect to login after 3 seconds if not already redirected
            setTimeout(() => {
              if (window.location.pathname !== '/login') {
                window.location.href = '/login?reason=unauthorized';
              }
            }, 3000);
          } else {
            toast.error(response.message || "Gagal memuat data magang");
          }
        }
      } catch (error) {
        console.error("❌ Error fetching internship data:", error);
        console.error('Error details:', {
          message: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined
        });
        toast.error("Gagal memuat data magang");
      } finally {
        setIsLoadingProfile(false);
      }
    }

    fetchInternshipData();
  }, []);

  // Helper function untuk generate dates
  const generateDatesFromPeriod = (
    startDate: string,
    endDate: string,
    startDay: string,
    endDay: string
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

    for (let d = new Date(start); d <= end; d = new Date(d.getTime() + MS_PER_DAY)) {
      const currentDay = d.getDay();

      if (startDayNum <= endDayNum) {
        if (currentDay >= startDayNum && currentDay <= endDayNum) {
          dates.push(d.toISOString().split('T')[0]);
        }
      } else {
        if (currentDay >= startDayNum || currentDay <= endDayNum) {
          dates.push(d.toISOString().split('T')[0]);
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
      toast.error("Tanggal selesai harus setelah atau sama dengan tanggal mulai!");
      return;
    }

    // Generate dates
    const dates = generateDatesFromPeriod(
      workPeriod.startDate,
      workPeriod.endDate,
      workPeriod.startDay || 'senin',
      workPeriod.endDay || 'jumat'
    );
    
    setGeneratedDates(dates);
    setIsPeriodSaved(true);
    setPeriodSource("manual"); // Mark sebagai manual input
    
    // Save to localStorage
    localStorage.setItem('logbook_period_saved', 'true');
    localStorage.setItem('logbook_generated_dates', JSON.stringify(dates));
    localStorage.setItem('logbook_work_period', JSON.stringify(workPeriod));
    
    toast.success(`Periode berhasil disimpan! ${dates.length} hari kerja telah digenerate.`);
  };

  const handleEditPeriod = () => {
    setIsPeriodSaved(false);
    setGeneratedDates([]);
    setLogbookEntries([]);
    setPeriodSource(null); // Reset period source
    
    // Clear localStorage
    localStorage.removeItem('logbook_period_saved');
    localStorage.removeItem('logbook_generated_dates');
    localStorage.removeItem('logbook_entries');
    localStorage.removeItem('logbook_work_period');
    
    toast.info('Periode logbook direset. Silakan input periode baru secara manual.');
  };

  const handleAddLogbook = () => {
    if (!selectedDate || !description.trim()) {
      toast.error("Mohon lengkapi tanggal dan deskripsi!");
      return;
    }

    const newEntry: LogbookEntry = {
      id: Date.now().toString(),
      date: selectedDate,
      description: description.trim(),
    };

    const updatedEntries = [...logbookEntries, newEntry];
    setLogbookEntries(updatedEntries);
    
    // Save to localStorage
    localStorage.setItem('logbook_entries', JSON.stringify(updatedEntries));
    setSelectedDate("");
    setDescription("");
    toast.success("Logbook berhasil ditambahkan!");
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
      const nextDate = i + 1 < generatedDates.length ? new Date(generatedDates[i + 1]) : null;
      const currentDay = currentDate.getDay();
      
      // Check if this is the last day of week (Friday=5, Saturday=6, Sunday=0)
      // or if next day is Monday (1) which means this is end of week
      if (nextDate) {
        const nextDay = nextDate.getDay();
        // If current is Fri/Sat/Sun OR next day is Monday, increment week
        if (currentDay === 5 || currentDay === 6 || currentDay === 0 || nextDay === 1) {
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

    console.log('🔍 Export Check - completeData:', completeData);
    
    // Cek apakah data magang lengkap (student dan submission data)
    const isDataMissing = !completeData || !completeData.student || !completeData.submission;
    
    console.log('🔍 Data Status:', {
      hasCompleteData: !!completeData,
      hasStudent: !!completeData?.student,
      hasSubmission: !!completeData?.submission,
      isDataMissing
    });

    if (isDataMissing) {
      // Tampilkan dialog konfirmasi
      console.log('⚠️ Data tidak lengkap, tampilkan dialog');
      setShowEmptyDataDialog(true);
    } else {
      // Data lengkap, langsung generate
      console.log('✅ Data lengkap, langsung generate');
      await performGenerate();
    }
  };

  const performGenerate = async () => {
    console.log('🚀 Starting performGenerate...');
    
    try {
      // Build logbookData with fallback values for missing data
      const logbookData = {
        student: {
          name: completeData?.student?.name || "[Nama Mahasiswa]",
          nim: completeData?.student?.nim || "[NIM]",
          prodi: completeData?.student?.prodi || "Manajemen Informatika",
          fakultas: completeData?.student?.fakultas || "Ilmu Komputer"
        },
        internship: {
          company: completeData?.submission?.company || "[Nama Perusahaan]",
          division: completeData?.submission?.division || "[Nama Divisi]",
          position: completeData?.submission?.division || completeData?.submission?.company || "[Posisi]",
          mentorName: completeData?.mentor?.name || "[Nama Pembimbing Lapangan]",
          mentorSignature: completeData?.mentor?.signature, // ← NEW: Paraf mentor dari backend
          startDate: completeData?.submission?.startDate || workPeriod.startDate!,
          endDate: completeData?.submission?.endDate || workPeriod.endDate!
        },
        workPeriod: {
          startDate: workPeriod.startDate!,
          endDate: workPeriod.endDate!,
          startDay: workPeriod.startDay,
          endDay: workPeriod.endDay
        },
        generatedDates,
        entries: logbookEntries
      };

      console.log('📄 Logbook Data:', logbookData);
      console.log('🖊️ Mentor Signature:', completeData?.mentor?.signature ? 'Available ✓' : 'Not available');

      // Generate and download DOCX
      await generateLogbookDOCX(logbookData);
      
      toast.success("Logbook DOCX berhasil didownload!");
    } catch (error) {
      console.error("Error generating logbook:", error);
      toast.error("Gagal generate logbook. Silakan coba lagi.");
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
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
                  <p className="font-medium">{completeData?.student.name || "-"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">NIM</Label>
                  <p className="font-medium">{completeData?.student.nim || "-"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Program Studi</Label>
                  <p className="font-medium">{completeData?.student.prodi || "Manajemen Informatika"}</p>
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
                  <p className="font-medium">{completeData?.submission.division || "-"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Periode KP</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="font-medium flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {workPeriod.startDate && workPeriod.endDate
                        ? `${new Date(workPeriod.startDate).toLocaleDateString("id-ID", {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                          })} - ${new Date(workPeriod.endDate).toLocaleDateString("id-ID", {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                          })}`
                        : "Belum diisi"}
                    </p>
                    {periodSource === "auto" && workPeriod.startDate && (
                      <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-300">
                        Auto
                      </Badge>
                    )}
                    {periodSource === "manual" && workPeriod.startDate && (
                      <Badge variant="outline" className="text-xs bg-gray-50 text-gray-700 border-gray-300">
                        Manual
                      </Badge>
                    )}
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <div className="mt-1">
                    <Badge
                      variant={completeData?.internship.status === "AKTIF" ? "default" : "secondary"}
                      className={completeData?.internship.status === "AKTIF" ? "bg-green-500" : ""}
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
        <div className={`flex items-center gap-2 ${isPeriodSaved ? 'text-green-600' : 'text-blue-600'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${isPeriodSaved ? 'bg-green-100' : 'bg-blue-100'}`}>
            {isPeriodSaved ? <CheckCircle className="w-5 h-5" /> : '1'}
          </div>
          <span className="font-medium">Set Periode</span>
        </div>
        <div className={`h-0.5 flex-1 ${isPeriodSaved ? 'bg-green-600' : 'bg-gray-300'}`}></div>
        <div className={`flex items-center gap-2 ${isPeriodSaved ? 'text-blue-600' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${isPeriodSaved ? 'bg-blue-100' : 'bg-gray-100'}`}>
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
                <strong>Periode Otomatis:</strong> Periode kerja praktik Anda sudah otomatis dimuat dari data pengajuan yang telah disetujui. 
                Tanggal mulai dan selesai sesuai dengan submission ID: <code className="bg-green-100 px-1 py-0.5 rounded text-xs">{completeData?.submission.id.slice(0, 8)}...</code>
              </AlertDescription>
            </Alert>
          )}
          {periodSource === null && !isPeriodSaved && (
            <Alert className="bg-blue-50 border-blue-200">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                <strong>Input Manual Diperlukan:</strong> Data pengajuan Anda belum tersedia atau belum disetujui. 
                Silakan input periode kerja praktik secara manual di bawah ini.
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
                Periode kerja praktik telah disimpan. Tabel logbook dengan {generatedDates.length} hari kerja siap digunakan. Anda dapat menambahkan catatan harian di bawah ini.
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
                <Plus className="h-5 w-5" />
                Tambah Entri Logbook
              </CardTitle>
              <CardDescription>
                Tambahkan catatan kegiatan harian Anda
              </CardDescription>
            </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="tanggal">Tanggal</Label>
              <Input
                type="date"
                id="tanggal"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="deskripsi">Deskripsi Kegiatan</Label>
              <Textarea
                id="deskripsi"
                rows={4}
                placeholder="Masukkan deskripsi kegiatan..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleAddLogbook}>
              <Plus className="mr-2 h-4 w-4" />
              Tambah Logbook
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
            Daftar kegiatan harian berdasarkan periode kerja yang telah digenerate
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Period Display */}
          <div className="flex flex-wrap items-center gap-2 p-3 bg-muted rounded-lg">
            <span className="font-medium text-sm text-muted-foreground">Periode:</span>
            <span className="px-3 py-1.5 bg-background rounded-md text-sm font-medium">
              {workPeriod.startDate ? formatDate(workPeriod.startDate) : "Belum diset"}
            </span>
            <span className="text-muted-foreground">s/d</span>
            <span className="px-3 py-1.5 bg-background rounded-md text-sm font-medium">
              {workPeriod.endDate ? formatDate(workPeriod.endDate) : "Belum diset"}
            </span>
            <span className="ml-auto px-3 py-1.5 bg-blue-100 text-blue-700 rounded-md text-sm font-medium">
              {generatedDates.length} Hari Kerja
            </span>
          </div>

          {/* Logbook Table */}
          {generatedDates.length > 0 && (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-24 text-center">Minggu Ke</TableHead>
                    <TableHead className="min-w-48">Hari, Tanggal</TableHead>
                    <TableHead className="min-w-64">Deskripsi Kegiatan</TableHead>
                    <TableHead className="w-48 text-center">Paraf Pembimbing</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {generatedDates.map((date, index) => {
                    const entry = getLogbookForDate(date);
                    const weekNum = getWeekNumber(date);
                    const prevWeekNum = index > 0 ? getWeekNumber(generatedDates[index - 1]) : 0;
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
                            <span className="font-medium">{getDayName(date)}</span>
                            <span className="text-sm text-muted-foreground">{formatDate(date)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {entry?.description || (
                            <span className="text-muted-foreground italic">Belum diisi</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex flex-col items-center gap-1">
                            {getMentorSignatureBadge(entry)}
                            
                            {/* Notes dari mentor (untuk approved) */}
                            {entry?.mentorSignature?.status === "approved" && entry?.mentorSignature?.notes && (
                              <p className="text-xs text-green-700 bg-green-50 px-2 py-1 rounded mt-1 italic">
                                💬 {entry.mentorSignature.notes}
                              </p>
                            )}
                            
                            {/* Rejection note (untuk rejected) - Lebih prominent */}
                            {entry?.mentorSignature?.status === "rejected" && entry?.mentorSignature?.notes && (
                              <div className="mt-2 w-full max-w-xs">
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
                            {entry?.mentorSignature?.status === "revision" && entry?.mentorSignature?.notes && (
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
                  <h3 className="font-semibold text-foreground">Export Logbook</h3>
                  <p className="text-sm text-muted-foreground">

      {/* Confirmation Dialog for Empty Data */}
      <AlertDialog open={showEmptyDataDialog} onOpenChange={setShowEmptyDataDialog}>
        <AlertDialogContent className="sm:max-w-[500px]">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-amber-100 rounded-full">
                <AlertCircle className="h-6 w-6 text-amber-600" />
              </div>
              <AlertDialogTitle className="text-xl">Data Belum Lengkap</AlertDialogTitle>
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
                <p className="text-sm text-blue-900 font-medium mb-2">📋 Yang akan dihasilkan:</p>
                <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                  <li>File DOCX logbook dengan format standar</li>
                  <li>Field yang kosong dapat diisi manual di Word</li>
                  <li>Periode minggu sesuai tanggal yang Anda set</li>
                  <li>Tabel kegiatan dengan {generatedDates.length} hari kerja</li>
                </ul>
                <p className="text-xs text-blue-700 mt-2 italic">
                  ⚠️ Format mungkin perlu disesuaikan setelah dibuka di Word
                </p>
              </div>

              <p className="text-sm text-muted-foreground">
                💡 <strong>Rekomendasi:</strong> Lengkapi data Anda terlebih dahulu untuk hasil yang lebih baik, atau lanjutkan untuk mendapatkan template kosong.
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
                await performGenerate();
              }}
              className="bg-primary hover:bg-primary/90"
            >
              <Download className="mr-2 h-4 w-4" />
              Ya, Download Template
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
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
        </>
      )}
    </div>
  );
}

export default LogbookPage;
