import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Users, ListOrdered, Inbox, Clock, BookOpenCheck, UserCog, UserCheck, ShieldCheck } from "lucide-react";
import { Link } from "react-router";
import { Button } from "~/components/ui/button";

export type ActivityItem = {
  action: string;
  time: string;
  status: "success" | "info";
};

export interface DashboardDosenData {
  totalMahasiswaBimbingan?: number;
  totalSuratAjuanMasuk?: number;
  activities?: ActivityItem[];
}

interface DashboardDosenPageProps {
  data?: DashboardDosenData | null;
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex min-h-[160px] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-center text-sm text-slate-500">
      <div className="rounded-full bg-slate-100 dark:bg-slate-800 p-3">
        <Inbox className="h-6 w-6 text-slate-400" />
      </div>
      <span className="font-medium">{message}</span>
    </div>
  );
}

export default function DashboardDosenPage({ data }: DashboardDosenPageProps) {
  const totalMahasiswaBimbingan = data?.totalMahasiswaBimbingan;
  const totalSuratAjuanMasuk = data?.totalSuratAjuanMasuk;
  const activities = data?.activities ?? [];

  const HeroSection = () => (
    <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-indigo-900 via-blue-900 to-slate-900 p-8 sm:p-10 text-white shadow-2xl mb-8 border border-white/10">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 right-0 -translate-y-8 translate-x-1/4 opacity-10 pointer-events-none">
        <ShieldCheck className="w-[400px] h-[400px] text-blue-300" strokeWidth={0.5} />
      </div>
      <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-500 rounded-full blur-[80px] opacity-40 mix-blend-screen pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 w-48 h-48 bg-indigo-500 rounded-full blur-[60px] opacity-30 mix-blend-screen pointer-events-none" />
      
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="space-y-4 max-w-2xl">
          <div className="inline-flex items-center rounded-full bg-white/10 px-4 py-1.5 text-sm font-semibold text-blue-100 backdrop-blur-md border border-white/20 shadow-xs">
            <span className="flex h-2.5 w-2.5 rounded-full bg-blue-400 mr-2.5 animate-pulse"></span>
            Sistem Informasi Kerja Praktik
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-transparent bg-clip-text bg-linear-to-r from-white to-blue-200 drop-shadow-xs">
            Dashboard Dosen Pembimbing
          </h1>
          <p className="text-blue-100/90 text-base sm:text-lg font-medium leading-relaxed max-w-xl">
            Pantau progress bimbingan mahasiswa, verifikasi kelayakan mentor industri, dan awasi laporan harian logbook secara efisien.
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col p-4 sm:p-6 lg:p-8 bg-slate-50/30 dark:bg-slate-950 min-h-[calc(100svh-3.5rem)]">
      <HeroSection />

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 mb-8">
        {/* Total Mahasiswa Bimbingan */}
        <Card className="relative overflow-hidden rounded-2xl border border-slate-200/60 dark:border-slate-800/60 bg-white/80 dark:bg-slate-900/80 shadow-sm backdrop-blur-xl transition-all hover:-translate-y-1 hover:shadow-lg group">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-linear-to-b from-blue-400 to-indigo-600" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
              Total Mahasiswa Bimbingan
            </CardTitle>
            <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform duration-300">
              <Users className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black tracking-tight text-slate-800 dark:text-slate-100">
              {typeof totalMahasiswaBimbingan === "number"
                ? totalMahasiswaBimbingan
                : "-"}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">
              Berdasarkan jumlah mahasiswa pada tim KP yang Anda bimbing.
            </p>
          </CardContent>
        </Card>

        {/* Total Surat Ajuan Mahasiswa */}
        <Card className="relative overflow-hidden rounded-2xl border border-slate-200/60 dark:border-slate-800/60 bg-white/80 dark:bg-slate-900/80 shadow-sm backdrop-blur-xl transition-all hover:-translate-y-1 hover:shadow-lg group">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-linear-to-b from-amber-400 to-orange-500" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
              Total Surat Ajuan Mahasiswa
            </CardTitle>
            <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform duration-300">
              <ListOrdered className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black tracking-tight text-slate-800 dark:text-slate-100">
              {typeof totalSuratAjuanMasuk === "number"
                ? totalSuratAjuanMasuk
                : "-"}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">
              Akumulasi jumlah surat kesediaan & permohonan masuk.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Manajemen Pelaksanaan Magang */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
              <BookOpenCheck className="h-5 w-5" />
            </div>
            Tahap Pelaksanaan Magang
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card className="group cursor-pointer overflow-hidden rounded-2xl border-0 shadow-xs hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <Link to="/dosen/kp/logbook-monitor" className="block h-full relative">
                <div className="absolute inset-0 bg-linear-to-br from-emerald-50 to-teal-50/20 dark:from-emerald-900/20 dark:to-teal-900/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <CardContent className="p-6 relative z-10 flex flex-col items-center text-center">
                  <div className="p-4 rounded-full bg-emerald-100 dark:bg-emerald-800/30 text-emerald-600 dark:text-emerald-400 mb-4 group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300 shadow-xs">
                    <BookOpenCheck className="h-8 w-8" />
                  </div>
                  <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 mb-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">Pantau Logbook</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Tinjau dan monitor rutinitas pengisian logbook harian mahasiswa bimbingan secara komprehensif.</p>
                </CardContent>
              </Link>
            </Card>

            <Card className="group cursor-pointer overflow-hidden rounded-2xl border-0 shadow-xs hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <Link to="/dosen/kp/persetujuan-pembimbing" className="block h-full relative">
                <div className="absolute inset-0 bg-linear-to-br from-indigo-50 to-blue-50/20 dark:from-indigo-900/20 dark:to-blue-900/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <CardContent className="p-6 relative z-10 flex flex-col items-center text-center">
                  <div className="p-4 rounded-full bg-indigo-100 dark:bg-indigo-800/30 text-indigo-600 dark:text-indigo-400 mb-4 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 shadow-xs">
                    <UserCheck className="h-8 w-8" />
                  </div>
                  <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">Verifikasi Mentor</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Periksa kualifikasi dan setujui penunjukan mentor lapangan/pembimbing industri mahasiswa.</p>
                </CardContent>
              </Link>
            </Card>
          </div>
        </div>

        {/* Log Aktivitas Terbaru */}
        <div className="lg:col-span-1">
          <Card className="h-full rounded-2xl border-0 shadow-md bg-white dark:bg-slate-900 overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-linear-to-r from-blue-400 to-indigo-500" />
            <CardHeader className="pt-6 pb-4 border-b border-slate-100 dark:border-slate-800">
              <CardTitle className="flex items-center gap-2 text-xl font-bold">
                <Clock className="h-5 w-5 text-indigo-500" />
                Log Aktivitas
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {activities.length > 0 ? (
                <div className="relative space-y-6 before:absolute before:inset-0 before:ml-2.5 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 dark:before:via-slate-700 before:to-transparent">
                  {activities.map((activity, index) => (
                    <div key={`${activity.action}-${activity.time}-${index}`} className="relative flex items-start gap-4 group">
                      <div className={`mt-1 flex items-center justify-center w-5 h-5 rounded-full border-4 border-white dark:border-slate-900 shadow shrink-0 ${
                        activity.status === "success" ? "bg-emerald-500" : "bg-blue-500"
                      }`} />
                      <div className="flex flex-col flex-1 p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 shadow-xs hover:shadow-md transition-shadow">
                        <span className="font-semibold text-sm text-slate-800 dark:text-slate-200 leading-tight">{activity.action}</span>
                        <span className="text-xs text-slate-500 mt-1.5 font-medium">{activity.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState message="Belum ada aktivitas terbaru direkam." />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
