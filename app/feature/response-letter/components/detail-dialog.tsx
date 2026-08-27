import {
  Building2,
  CalendarDays,
  CircleCheck,
  Eye,
  FileText,
  Info,
  OctagonAlert,
  Users,
} from "lucide-react";

import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "~/components/ui/dialog";

import type { Student } from "../types";

const getDisplayText = (
  value?: string | null,
  fallback = "Belum ditentukan",
) => {
  if (!value) return fallback;

  const normalized = value.trim();
  if (!normalized) return fallback;
  if (normalized.toLowerCase() === "unknown") return fallback;
  if (normalized === "-") return fallback;

  return normalized;
};

interface DetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student: Student | null;
  onApprove: (student: Student) => void;
}

function DetailDialog({
  open,
  onOpenChange,
  student,
  onApprove,
}: DetailDialogProps) {
  const isApproved = student?.status === "Disetujui";

  const handleApproveClick = () => {
    if (student) {
      onOpenChange(false);
      onApprove(student);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-4xl lg:max-w-5xl w-full max-h-[95vh] sm:max-h-[90vh] flex flex-col overflow-hidden p-0 gap-0">
        <DialogHeader className="p-4 sm:p-6 pb-2 sm:pb-4 border-b">
          <DialogTitle className="text-xl sm:text-2xl font-bold">
            Verifikasi Surat Balasan
          </DialogTitle>
          <DialogDescription>
            Tinjau surat balasan dari perusahaan yang dikirimkan oleh mahasiswa.
          </DialogDescription>
        </DialogHeader>
        {student && (
          <div className="space-y-6 sm:space-y-8 p-4 sm:p-6 flex-1 overflow-y-auto pr-1 scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center">
                  <Users className="w-5 h-5 mr-2 text-primary" />
                  Informasi Tim Kerja Praktik
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-primary/10 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    Dosen Pembimbing Kerja Praktik:
                  </p>
                  <p className="font-semibold text-primary text-lg">
                    {getDisplayText(student.supervisor)}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {(
                    student.members ?? [
                      {
                        id: 0,
                        name: student.name,
                        nim: student.nim,
                        prodi: student.prodi,
                        role: "Ketua",
                      },
                    ]
                  ).map((member) => (
                    <MemberCard
                      key={`${member.id}-${member.nim ?? member.name}`}
                      fallbackProdi={student.prodi}
                      member={member}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Detail Surat Balasan */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center">
                  <Info className="w-5 h-5 mr-2 text-blue-600" />
                  Detail Surat Balasan
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="rounded-lg border border-border bg-muted/30 px-4 py-3">
                    <p className="text-xs font-semibold tracking-wide uppercase text-muted-foreground mb-2">
                      Perusahaan
                    </p>
                    <div className="flex items-center gap-2 text-foreground">
                      <Building2 className="h-4 w-4 text-primary" />
                      <p className="font-semibold">
                        {getDisplayText(student.company, "Belum tersedia")}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-lg border border-border bg-muted/30 px-4 py-3">
                    <p className="text-xs font-semibold tracking-wide uppercase text-muted-foreground mb-2">
                      Tanggal Upload
                    </p>
                    <div className="flex items-center gap-2 text-foreground">
                      <CalendarDays className="h-4 w-4 text-primary" />
                      <p className="font-semibold">
                        {getDisplayText(student.tanggal, "Belum tersedia")}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-lg border border-border bg-muted/30 px-4 py-3">
                    <p className="text-xs font-semibold tracking-wide uppercase text-muted-foreground mb-2">
                      Status Surat
                    </p>
                    <div
                      className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold ${
                        isApproved
                          ? "bg-green-100 text-green-600"
                          : "bg-destructive/10 text-destructive"
                      }`}
                    >
                      {isApproved ? (
                        <CircleCheck className="h-4 w-4" />
                      ) : (
                        <OctagonAlert className="h-4 w-4" />
                      )}
                      <span>{getDisplayText(student.status, "Unknown")}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* File Surat Balasan */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-green-600" />
                  Surat Balasan Perusahaan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-green-600 text-white rounded-lg flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-green-900 mb-1">
                        File Surat Balasan
                      </p>
                      <p className="text-sm text-green-800 mb-4">
                        Surat balasan telah diupload dan siap ditinjau
                      </p>
                      <Button
                        variant="outline"
                        className="border-green-600 text-green-600 hover:bg-green-50:bg-green-950"
                        onClick={() => {
                          const url = student.responseFileUrl ?? "#";
                          try {
                            window.open(url, "_blank");
                          } catch {
                            /* ignore */
                          }
                        }}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Lihat Surat Balasan
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        <DialogFooter className="p-4 sm:p-6 pt-2 sm:pt-4 border-t flex flex-col-reverse sm:flex-row sm:justify-between gap-3 sm:gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-none px-8"
          >
            Tutup
          </Button>
          {student && !student.adminApproved && (
            <Button onClick={handleApproveClick} className="flex-none px-18">
              Verifikasi
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function MemberCard({
  member,
  fallbackProdi,
}: {
  member: {
    id: number;
    name: string;
    nim?: string;
    prodi?: string;
    role: "Ketua" | "Anggota";
  };
  fallbackProdi?: string;
}) {
  const isLeader = member.role === "Ketua";
  const displayProdi = getDisplayText(member.prodi ?? fallbackProdi);
  return (
    <div
      className={`p-4 rounded-lg border ${isLeader ? "border-primary/30 bg-primary/5" : "border-border bg-muted/50"}`}
    >
      <div className="flex justify-between items-start mb-2">
        <Badge variant={isLeader ? "default" : "secondary"}>
          {isLeader ? "Ketua" : "Anggota"}
        </Badge>
      </div>
      <p className="font-bold text-foreground">{member.name}</p>
      {member.nim && (
        <p className="text-sm text-muted-foreground">
          {getDisplayText(member.nim)}
        </p>
      )}
      <p className="text-sm text-muted-foreground/80">{displayProdi}</p>
    </div>
  );
}

export default DetailDialog;
