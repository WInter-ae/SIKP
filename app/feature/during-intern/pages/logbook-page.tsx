import { useState } from "react";
import { Link } from "react-router";
import { toast } from "sonner";
import { ArrowLeft, Calendar, FileText, Plus, Save, Sparkles } from "lucide-react";

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

    toast.success("Periode berhasil disimpan!");
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
    if (!workPeriod.startDate) return 0;

    const start = new Date(workPeriod.startDate);
    const current = new Date(dateString);
    const diffTime = current.getTime() - start.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    return Math.floor(diffDays / 7) + 1;
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

      {/* Section 1: Work Period Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Periode Kerja Praktik
          </CardTitle>
          <CardDescription>
            Tentukan periode dan hari kerja praktik Anda
          </CardDescription>
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

          <div className="flex justify-end">
            <Button onClick={handleSubmitPeriod}>
              <Save className="mr-2 h-4 w-4" />
              Simpan Periode
            </Button>
          </div>
        </CardContent>
      </Card>

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
            Generate dan kelola entri logbook berdasarkan periode kerja
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Period Display & Generate Button */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-medium text-sm text-muted-foreground">Periode:</span>
              <span className="px-3 py-1.5 bg-muted rounded-md text-sm font-medium">
                {workPeriod.startDate ? formatDate(workPeriod.startDate) : "Belum diset"}
              </span>
              <span className="text-muted-foreground">s/d</span>
              <span className="px-3 py-1.5 bg-muted rounded-md text-sm font-medium">
                {workPeriod.endDate ? formatDate(workPeriod.endDate) : "Belum diset"}
              </span>
            </div>
            <Button onClick={handleGenerate} variant="outline">
              <Sparkles className="mr-2 h-4 w-4" />
              Generate
            </Button>
          </div>

          {/* Info Alert */}
          {generatedDates.length === 0 && (
            <Alert>
              <FileText className="h-4 w-4" />
              <AlertDescription>
                Klik tombol Generate untuk menampilkan tabel logbook berdasarkan periode yang telah diset.
              </AlertDescription>
            </Alert>
          )}

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
                          <span className="text-muted-foreground">-</span>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Save Button */}
          {generatedDates.length > 0 && (
            <div className="flex justify-center pt-4">
              <Button
                size="lg"
                onClick={() => toast.success("Data logbook berhasil disimpan!")}
              >
                <Save className="mr-2 h-4 w-4" />
                Simpan Logbook
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default LogbookPage;
