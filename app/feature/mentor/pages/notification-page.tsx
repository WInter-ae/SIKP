// External dependencies
import { Bell } from "lucide-react";

// Components
import { Card, CardContent } from "~/components/ui/card";
import PageHeader from "../components/page-header";
import StatsCard from "../components/stats-card";
import BackButton from "../components/back-button";
import NotificationCard from "../components/notification-card";

// Types
import type { Notification } from "../types";

// Mock data - should be fetched from API in real implementation
const NOTIFICATIONS: Notification[] = [
  {
    id: "1",
    type: "info",
    title: "Mahasiswa Magang Baru",
    message: "Ahmad Fauzi telah ditambahkan sebagai mahasiswa magang Anda",
    timestamp: "2 jam yang lalu",
    isRead: false,
    link: "/mentor/mentee/1",
  },
  {
    id: "2",
    type: "success",
    title: "Penilaian Berhasil Disimpan",
    message: "Penilaian untuk Siti Aminah berhasil disimpan ke sistem",
    timestamp: "5 jam yang lalu",
    isRead: false,
    link: "/mentor/mentee/2",
  },
  {
    id: "3",
    type: "warning",
    title: "Logbook Belum Diverifikasi",
    message: "Terdapat 3 logbook dari Budi Santoso yang perlu diverifikasi",
    timestamp: "1 hari yang lalu",
    isRead: true,
    link: "/mentor/logbook-detail/3",
  },
  {
    id: "4",
    type: "info",
    title: "Permintaan Pertemuan",
    message: "Ahmad Fauzi meminta jadwal pertemuan untuk diskusi progress magang",
    timestamp: "2 hari yang lalu",
    isRead: true,
    link: "/mentor/mentee/1",
  },
  {
    id: "5",
    type: "success",
    title: "Logbook Disetujui",
    message: "Logbook minggu ke-4 dari Siti Aminah telah disetujui",
    timestamp: "3 hari yang lalu",
    isRead: true,
    link: "/mentor/logbook-detail/2",
  },
];

function NotificationPage() {
  const unreadCount = NOTIFICATIONS.filter((n) => !n.isRead).length;

  return (
    <div className="p-6">
      <PageHeader
        title="Notifikasi"
        description="Semua notifikasi dan pembaruan untuk Anda"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <StatsCard title="Total Notifikasi" value={NOTIFICATIONS.length} />
        <StatsCard title="Belum Dibaca" value={unreadCount} />
      </div>

      <div className="space-y-4 mb-8">
        {NOTIFICATIONS.map((notification) => (
          <NotificationCard key={notification.id} notification={notification} />
        ))}
      </div>

      {NOTIFICATIONS.length === 0 && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg font-medium mb-2">Tidak ada notifikasi</p>
              <p className="text-muted-foreground">
                Semua notifikasi akan muncul di sini
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <BackButton />
    </div>
  );
}

export default NotificationPage;
