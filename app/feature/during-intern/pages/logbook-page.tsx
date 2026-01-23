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

// API Services
import { getMyProfile, getMyInternship } from "~/feature/during-intern/services";
import type { StudentProfile, InternshipData } from "~/feature/during-intern/services/student-api";

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
  
  // Student data state
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null);
  const [internshipData, setInternshipData] = useState<InternshipData | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  // Fetch student profile and internship data
  useEffect(() => {
    async function fetchStudentData() {
      try {
        const [profileResponse, internshipResponse] = await Promise.all([
          getMyProfile(),
          getMyInternship()
        ]);

        if (profileResponse.success && profileResponse.data) {
          setStudentProfile(profileResponse.data);
        }

        if (internshipResponse.success && internshipResponse.data) {
          setInternshipData(internshipResponse.data);
          
          // NOTE: Auto-populate periode TIDAK digunakan
          // Mahasiswa harus input periode manual sekali
          // Kode ini disimpan sebagai referensi jika nanti perlu:
          /*
          const internship = internshipResponse.data;
          if (internship.startDate && internship.endDate) {
            setWorkPeriod(prev => ({
              ...prev,
              startDate: internship.startDate,
              endDate: internship.endDate,
            }));
          }
          */
        }
      } catch (error) {
        console.error("Error fetching student data:", error);
        toast.error("Gagal memuat data mahasiswa");
      } finally {
        setIsLoadingProfile(false);
      }
    }

    fetchStudentData();
  }, []);

  // Restore state dari localStorage jika ada
  useEffect(() => {
    // Check localStorage untuk saved state
    const savedPeriodState = localStorage.getItem('logbook_period_saved');
    const savedDates = localStorage.getItem('logbook_generated_dates');
    const savedEntries = localStorage.getItem('logbook_entries');
    const savedWorkPeriod = localStorage.getItem('logbook_work_period');

    if (savedPeriodState === 'true' && savedDates && savedWorkPeriod) {
      // Restore dari localStorage
      setIsPeriodSaved(true);
      setGeneratedDates(JSON.parse(savedDates));
      setWorkPeriod(JSON.parse(savedWorkPeriod));
      if (savedEntries) {
        setLogbookEntries(JSON.parse(savedEntries));
      }
      toast.success('Periode logbook berhasil dimuat!');
    }
    // Jika belum ada saved state, mahasiswa harus input manual
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
    
    // Clear localStorage
    localStorage.removeItem('logbook_period_saved');
    localStorage.removeItem('logbook_generated_dates');
    localStorage.removeItem('logbook_entries');
    
    toast.info('Periode logbook direset');
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

  const handleExportToFile = () => {
    // TODO: Implement file generation (PDF/Excel)
    // Fungsi ini akan diaktifkan setelah format file ditentukan
    toast.info("Fitur generate file sedang dalam pengembangan");
    
    // // Generate CSV content
    // let csvContent = "Minggu Ke,Hari,Tanggal,Deskripsi Kegiatan,Status Paraf,Catatan Mentor\n";
    // 
    // generatedDates.forEach((date) => {
    //   const entry = getLogbookForDate(date);
    //   const weekNum = getWeekNumber(date);
    //   const dayName = getDayName(date);
    //   const formattedDate = formatDate(date);
    //   const description = entry?.description || "Belum diisi";
    //   const status = entry?.mentorSignature ? 
    //     (entry.mentorSignature.status === "approved" ? "Disetujui" : 
    //      entry.mentorSignature.status === "revision" ? "Perlu Revisi" : "Ditolak") : 
    //     "Menunggu Paraf";
    //   const notes = entry?.mentorSignature?.notes || "-";
    //   
    //   csvContent += `${weekNum},${dayName},"${formattedDate}","${description}",${status},"${notes}"\n`;
    // });
    //
    // // Create blob and download
    // const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    // const link = document.createElement("a");
    // const url = URL.createObjectURL(blob);
    // link.setAttribute("href", url);
    // link.setAttribute("download", `logbook_${workPeriod.startDate}_${workPeriod.endDate}.csv`);
    // link.style.visibility = "hidden";
    // document.body.appendChild(link);
    // link.click();
    // document.body.removeChild(link);
    // 
    // toast.success("Logbook berhasil diexport ke file CSV!");
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
                  <p className="font-medium">{studentProfile?.name || "-"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">NIM</Label>
                  <p className="font-medium">{studentProfile?.nim || "-"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Program Studi</Label>
                  <p className="font-medium">{studentProfile?.prodi || "Manajemen Informatika"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Fakultas</Label>
                  <p className="font-medium">
                    {studentProfile?.fakultas || "Ilmu Komputer"}
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <Label className="text-muted-foreground">Tempat KP</Label>
                  <p className="font-medium flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    {internshipData?.company || "-"}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Bagian/Bidang</Label>
                  <p className="font-medium">{internshipData?.position || "-"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Periode KP</Label>
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
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <div className="mt-1">
                    <Badge
                      variant={internshipData?.status === "AKTIF" ? "default" : "secondary"}
                      className={internshipData?.status === "AKTIF" ? "bg-green-500" : ""}
                    >
                      {internshipData?.status || "PENDING"}
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
              </CardTitle>
              <CardDescription>
                Tentukan periode dan hari kerja praktik Anda
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
                            {entry?.mentorSignature?.notes && (
                              <p className="text-xs text-muted-foreground italic mt-1">
                                {entry.mentorSignature.notes}
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
                    Generate file CSV untuk logbook Anda
                  </p>
                </div>
              </div>
              <Button size="lg" onClick={handleExportToFile}>
                <Download className="mr-2 h-5 w-5" />
                Generate File
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
