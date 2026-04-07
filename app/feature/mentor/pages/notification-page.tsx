import { useEffect, useMemo, useState } from "react";
import { Bell } from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent } from "~/components/ui/card";
import PageHeader from "../components/page-header";
import StatsCard from "../components/stats-card";
import BackButton from "../components/back-button";
import NotificationCard from "../components/notification-card";

import {
  getMentees,
  getStudentAssessment,
  getStudentLogbook,
  type LogbookEntry,
  type MenteeData,
} from "~/feature/field-mentor/services";

import type { Notification } from "../types";

function formatRelativeDate(dateString?: string) {
  if (!dateString) return "Baru saja";

  const now = Date.now();
  const time = new Date(dateString).getTime();
  if (Number.isNaN(time)) return "Baru saja";

  const diffMs = Math.max(0, now - time);
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffHours < 1) return "Baru saja";
  if (diffHours < 24) return `${diffHours} jam yang lalu`;
  if (diffDays < 30) return `${diffDays} hari yang lalu`;

  return new Date(dateString).toLocaleDateString("id-ID");
}

function buildNotifications(mentees: MenteeData[], entriesByStudent: Record<string, LogbookEntry[]>): Notification[] {
  const notifications: Notification[] = [];

  mentees.forEach((mentee) => {
    if (!mentee.userId) return;

    const studentName = mentee.nama || mentee.name || "Mahasiswa";
    const studentEntries = entriesByStudent[mentee.userId] || [];
    const pendingCount = studentEntries.filter((entry) => entry.status === "PENDING").length;
    const approvedCount = studentEntries.filter((entry) => entry.status === "APPROVED").length;
    const latestDate = studentEntries
      .map((entry) => entry.updatedAt || entry.createdAt || entry.date)
      .filter(Boolean)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0];

    if (pendingCount > 0) {
      notifications.push({
        id: `pending-${mentee.userId}`,
        type: "warning",
        title: "Logbook Menunggu Verifikasi",
        message: `${pendingCount} logbook dari ${studentName} menunggu paraf Anda.`,
        timestamp: formatRelativeDate(latestDate),
        isRead: false,
        link: `/mentor/logbook-detail/${mentee.userId}`,
      });
    }

    if (approvedCount > 0) {
      notifications.push({
        id: `approved-${mentee.userId}`,
        type: "success",
        title: "Logbook Sudah Diverifikasi",
        message: `${approvedCount} logbook ${studentName} sudah disetujui.`,
        timestamp: formatRelativeDate(latestDate),
        isRead: true,
        link: `/mentor/logbook-detail/${mentee.userId}`,
      });
    }
  });

  return notifications;
}

function NotificationPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadNotifications() {
      setIsLoading(true);

      try {
        const menteesRes = await getMentees();

        if (!isMounted) return;

        if (!menteesRes.success || !menteesRes.data) {
          setNotifications([]);
          toast.error(menteesRes.message || "Gagal memuat notifikasi mentor.");
          return;
        }

        const validMentees = menteesRes.data.filter((mentee) => Boolean(mentee.userId));

        const entriesByStudent = await Promise.all(
          validMentees.map(async (mentee) => {
            try {
              const [logbookRes, assessmentRes] = await Promise.all([
                getStudentLogbook(mentee.userId),
                getStudentAssessment(mentee.userId),
              ]);

              const logbookEntries = logbookRes.success && logbookRes.data?.entries ? logbookRes.data.entries : [];
              const existingEntries = [...logbookEntries];

              if (!assessmentRes.success || !assessmentRes.data) {
                existingEntries.push({
                  id: `assessment-needed-${mentee.userId}`,
                  studentId: mentee.userId,
                  date: mentee.internshipEndDate || new Date().toISOString(),
                  activity: "Penilaian akhir belum diisi",
                  description: "Penilaian akhir belum diisi",
                  status: "PENDING",
                  createdAt: mentee.internshipEndDate || new Date().toISOString(),
                  updatedAt: mentee.internshipEndDate || new Date().toISOString(),
                });
              }

              return [mentee.userId, existingEntries] as const;
            } catch {
              return [mentee.userId, []] as const;
            }
          })
        );

        if (!isMounted) return;

        const map = Object.fromEntries(entriesByStudent);
        const built = buildNotifications(validMentees, map).sort((a, b) => {
          const aTime = a.timestamp.includes("yang lalu") ? Date.now() : new Date(a.timestamp).getTime();
          const bTime = b.timestamp.includes("yang lalu") ? Date.now() : new Date(b.timestamp).getTime();
          return bTime - aTime;
        });

        setNotifications(built);
      } catch (error) {
        if (!isMounted) return;
        setNotifications([]);
        toast.error(error instanceof Error ? error.message : "Gagal memuat notifikasi mentor.");
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadNotifications();

    return () => {
      isMounted = false;
    };
  }, []);

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.isRead).length,
    [notifications]
  );

  return (
    <div className="p-6">
      <PageHeader
        title="Notifikasi"
        description="Semua notifikasi dan pembaruan untuk Anda"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <StatsCard title="Total Notifikasi" value={isLoading ? "..." : notifications.length} />
        <StatsCard title="Belum Dibaca" value={isLoading ? "..." : unreadCount} />
      </div>

      <div className="space-y-4 mb-8">
        {isLoading ? (
          <Card>
            <CardContent className="py-8 text-muted-foreground">Memuat notifikasi dari backend...</CardContent>
          </Card>
        ) : (
          notifications.map((notification) => (
            <NotificationCard key={notification.id} notification={notification} />
          ))
        )}
      </div>

      {!isLoading && notifications.length === 0 && (
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
