import { useState } from "react";
import { Link } from "react-router";
import { toast } from "sonner";

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

function LogbookPage() {
  const [workPeriod, setWorkPeriod] = useState<WorkPeriod>({});
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [description, setDescription] = useState("");
  const [logbookEntries, setLogbookEntries] = useState<LogbookEntry[]>([]);
  const [generatedDates, setGeneratedDates] = useState<string[]>([]);

  const handleSubmitPeriod = () => {
    if (!workPeriod.startDate || !workPeriod.endDate) {
      toast.error("Mohon lengkapi periode kerja praktik!");
      return;
    }
    
    // Validate that end date is after start date
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

    // Mapping hari dalam bahasa Indonesia ke nomor hari (0 = Minggu, 6 = Sabtu)
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
      : 1; // Default Senin
    const endDayNum = workPeriod.endDay
      ? dayMap[workPeriod.endDay.toLowerCase()]
      : 5; // Default Jumat

    const MS_PER_DAY = 24 * 60 * 60 * 1000;
    
    for (let d = new Date(start); d <= end; d = new Date(d.getTime() + MS_PER_DAY)) {
      const currentDay = d.getDay();
      
      // Cek apakah hari ini termasuk dalam hari kerja
      if (startDayNum <= endDayNum) {
        // Normal case: Senin-Jumat
        if (currentDay >= startDayNum && currentDay <= endDayNum) {
          dates.push(new Date(d).toISOString().split("T")[0]);
        }
      } else {
        // Wrap around case: Jumat-Minggu, atau Sabtu-Senin, dll
        if (currentDay >= startDayNum || currentDay <= endDayNum) {
          dates.push(new Date(d).toISOString().split("T")[0]);
        }
      }
    }

    setGeneratedDates(dates);
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
    
    // Count forward
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
    <div className="flex min-h-screen bg-blue-50">
      <main className="flex-1 p-10 bg-white">
        <h1 className="text-3xl font-bold mb-4">Halaman Logbook</h1>

        <Link
          to="/mahasiswa/kp/saat-magang"
          className="inline-flex items-center bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg font-medium transition mb-8"
        >
          <span className="mr-2">&larr;</span>
          Kembali ke Saat Magang
        </Link>

        {/* Bagian 1: Form Periode */}
        <section className="p-6 bg-gray-50 rounded-lg shadow-md mb-8">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Periode Kerja Praktik
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  className="flex-1 border border-gray-300 rounded-md shadow-sm p-2"
                  value={workPeriod.startDate || ""}
                  onChange={(e) =>
                    setWorkPeriod({
                      ...workPeriod,
                      startDate: e.target.value,
                    })
                  }
                />
                <span>s/d</span>
                <input
                  type="date"
                  className="flex-1 border border-gray-300 rounded-md shadow-sm p-2"
                  value={workPeriod.endDate || ""}
                  onChange={(e) =>
                    setWorkPeriod({
                      ...workPeriod,
                      endDate: e.target.value,
                    })
                  }
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hari kerja
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  className="flex-1 border border-gray-300 rounded-md shadow-sm p-2"
                  placeholder="Senin"
                  value={workPeriod.startDay || ""}
                  onChange={(e) =>
                    setWorkPeriod({ ...workPeriod, startDay: e.target.value })
                  }
                />
                <span>s/d</span>
                <input
                  type="text"
                  className="flex-1 border border-gray-300 rounded-md shadow-sm p-2"
                  placeholder="Jumat"
                  value={workPeriod.endDay || ""}
                  onChange={(e) =>
                    setWorkPeriod({ ...workPeriod, endDay: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-6 rounded-lg shadow"
                onClick={handleSubmitPeriod}
              >
                Submit
              </button>
            </div>
          </div>
        </section>

        {/* Bagian 2: Form Tambah Logbook */}
        <section className="p-6 bg-gray-50 rounded-lg shadow-md mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <label
                htmlFor="tanggal"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Tanggal
              </label>
              <input
                type="date"
                id="tanggal"
                className="w-full border border-gray-300 rounded-md shadow-sm p-2"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
            <div className="md:col-span-2">
              <label
                htmlFor="deskripsi"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Deskripsi
              </label>
              <textarea
                id="deskripsi"
                rows={4}
                className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Masukkan deskripsi kegiatan..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              ></textarea>
            </div>
            <div className="md:col-span-3 flex justify-end">
              <button
                type="button"
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-6 rounded-lg shadow"
                onClick={handleAddLogbook}
              >
                Tambah
              </button>
            </div>
          </div>
        </section>

        {/* Bagian 3: Tabel Generate */}
        <section className="p-6 bg-gray-50 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-4 text-lg">
              <span className="font-semibold bg-white px-4 py-2 rounded-md shadow border border-gray-300">
                {workPeriod.startDate
                  ? formatDate(workPeriod.startDate)
                  : "Belum diset"}
              </span>
              <span className="text-gray-600">s/d</span>
              <span className="font-semibold bg-white px-4 py-2 rounded-md shadow border border-gray-300">
                {workPeriod.endDate
                  ? formatDate(workPeriod.endDate)
                  : "Belum diset"}
              </span>
            </div>
            <button
              type="button"
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-6 rounded-lg shadow"
              onClick={handleGenerate}
            >
              Generate
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border border-gray-300 p-3 text-left font-semibold text-gray-700">
                    Minggu Ke
                  </th>
                  <th className="border border-gray-300 p-3 text-left font-semibold text-gray-700">
                    Hari, Tanggal
                  </th>
                  <th className="border border-gray-300 p-3 text-left font-semibold text-gray-700">
                    Deskripsi Kegiatan
                  </th>
                  <th className="border border-gray-300 p-3 text-left font-semibold text-gray-700">
                    Paraf Pembimbing Lapangan
                  </th>
                </tr>
              </thead>
              <tbody>
                {generatedDates.length > 0 ? (
                  generatedDates.map((date, index) => {
                    const entry = getLogbookForDate(date);
                    const weekNum = getWeekNumber(date);
                    const prevWeekNum = index > 0 ? getWeekNumber(generatedDates[index - 1]) : 0;
                    const showWeekNumber = weekNum !== prevWeekNum;
                    
                    return (
                      <tr key={index} className="bg-white">
                        {showWeekNumber && (
                          <td 
                            className="border border-gray-300 p-3 text-center align-middle" 
                            rowSpan={getWeekRowSpan(generatedDates, index)}
                          >
                            {weekNum}
                          </td>
                        )}
                        <td className="border border-gray-300 p-3">
                          {getDayName(date)}, {formatDate(date)}
                        </td>
                        <td className="border border-gray-300 p-3">
                          {entry?.description || "-"}
                        </td>
                        <td className="border border-gray-300 p-3 text-center">
                          -
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan={4}
                      className="border border-gray-300 p-8 text-center text-gray-500"
                    >
                      Klik tombol Generate untuk menampilkan tabel logbook
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex justify-center mt-6">
            <button
              type="button"
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-8 rounded-lg shadow"
              onClick={() => alert("Data logbook berhasil disimpan!")}
            >
              Simpan
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

export default LogbookPage;
