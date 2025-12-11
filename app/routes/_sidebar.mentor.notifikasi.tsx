import { Link } from "react-router";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import {
  ArrowLeft,
  Bell,
  CheckCircle,
  AlertCircle,
  Info,
  Clock,
} from "lucide-react";

interface Notification {
  id: string;
  type: "info" | "success" | "warning" | "error";
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
}

export default function NotifikasiPage() {
  const notifications: Notification[] = [
    {
      id: "1",
      type: "info",
      title: "Mentee Baru Ditambahkan",
      message: "Ahmad Fauzi telah ditambahkan sebagai mentee Anda",
      timestamp: "2 jam yang lalu",
      isRead: false,
    },
    {
      id: "2",
      type: "success",
      title: "Penilaian Berhasil Disimpan",
      message: "Penilaian untuk Siti Aminah berhasil disimpan ke sistem",
      timestamp: "5 jam yang lalu",
      isRead: false,
    },
    {
      id: "3",
      type: "warning",
      title: "Logbook Belum Diverifikasi",
      message: "Terdapat 3 logbook dari Budi Santoso yang perlu diverifikasi",
      timestamp: "1 hari yang lalu",
      isRead: true,
    },
    {
      id: "4",
      type: "info",
      title: "Permintaan Pertemuan",
      message: "Ahmad Fauzi meminta jadwal pertemuan untuk bimbingan",
      timestamp: "2 hari yang lalu",
      isRead: true,
    },
    {
      id: "5",
      type: "success",
      title: "Logbook Disetujui",
      message: "Logbook minggu ke-4 dari Siti Aminah telah disetujui",
      timestamp: "3 hari yang lalu",
      isRead: true,
    },
  ];

  function getIcon(type: string) {
    switch (type) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "warning":
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      case "error":
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Info className="h-5 w-5 text-blue-600" />;
    }
  }

  function getBgColor(type: string) {
    switch (type) {
      case "success":
        return "bg-green-50 border-green-200";
      case "warning":
        return "bg-yellow-50 border-yellow-200";
      case "error":
        return "bg-red-50 border-red-200";
      default:
        return "bg-blue-50 border-blue-200";
    }
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Notifikasi</h1>
        <p className="text-muted-foreground">
          Semua notifikasi dan pembaruan untuk Anda
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Notifikasi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{notifications.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Belum Dibaca
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{unreadCount}</div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4 mb-8">
        {notifications.map((notification) => (
          <Card
            key={notification.id}
            className={`${getBgColor(notification.type)} ${!notification.isRead ? "border-l-4" : ""}`}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start gap-3">
                <div className="mt-1">{getIcon(notification.type)}</div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-base">
                      {notification.title}
                    </CardTitle>
                    {!notification.isRead && (
                      <span className="px-2 py-1 text-xs rounded-full bg-primary text-primary-foreground">
                        Baru
                      </span>
                    )}
                  </div>
                  <CardDescription className="mt-1">
                    {notification.message}
                  </CardDescription>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                    <Clock className="h-3 w-3" />
                    <span>{notification.timestamp}</span>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>

      {notifications.length === 0 && (
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

      <div className="flex justify-start">
        <Button variant="secondary" asChild>
          <Link to="/mentor">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali ke Dashboard
          </Link>
        </Button>
      </div>
    </div>
  );
}
