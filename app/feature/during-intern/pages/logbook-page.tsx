import { useState } from "react";
import { Link } from "react-router";
import { toast } from "sonner";
import { ArrowLeft, Calendar, FileText, Plus, Save, Sparkles, CheckCircle, Clock, AlertCircle, XCircle, Download, Edit } from "lucide-react";

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

    // Auto-generate dates
    handleGenerate();
    setIsPeriodSaved(true);
    toast.success("Periode berhasil disimpan dan tabel logbook telah digenerate!");
  };

  const handleEditPeriod = () => {
    setIsPeriodSaved(false);
    setGeneratedDates([]);
    setLogbookEntries([]);
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

    setLogbookEntries([...logbookEntries, newEntry]);
    setSelectedDate("");
    setDescription("");
    toast.success("Logbook berhasil ditambahkan!");
  };

  const handleGenerate = () => {
    if (!workPeriod.startDate || !workPeriod.endDate) {
      toast.error("Mohon set periode kerja praktik terlebih dahulu!");
      return;
    }

    const start = new Date(workPeriod.startDate);
    const end = new Date(workPeriod.endDate);
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

    const startDayNum = workPeriod.startDay
      ? dayMap[workPeriod.startDay.toLowerCase()]
      : 1;
    const endDayNum = workPeriod.endDay
      ? dayMap[workPeriod.endDay.toLowerCase()]
      : 5;

    const MS_PER_DAY = 24 * 60 * 60 * 1000;

    for (let d = new Date(start); d <= end; d = new Date(d.getTime() + MS_PER_DAY)) {
      const currentDay = d.getDay();

      if (startDayNum <= endDayNum) {
        if (currentDay >= startDayNum && currentDay <= endDayNum) {
          dates.push(new Date(d).toISOString().split("T")[0]);
        }
      } else {
        if (currentDay >= startDayNum || currentDay <= endDayNum) {
          dates.push(new Date(d).toISOString().split("T")[0]);
        }
      }
    }

    setGeneratedDates(dates);
    toast.success(`${dates.length} hari kerja berhasil di-generate!`);
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
                Periode kerja praktik telah disimpan. Tabel logbook telah digenerate otomatis dengan {generatedDates.length} hari kerja.
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
