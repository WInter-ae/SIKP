import { Eye, FileText, Users, CheckCircle, XCircle } from "lucide-react";

import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";

import type { Student } from "../types";

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
  const handleApproveClick = () => {
    if (student) {
      onOpenChange(false);
      onApprove(student);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="min-w-5xl max-h-[90vh] flex flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-2xl">Detail Surat Balasan</DialogTitle>
        </DialogHeader>
        {student && (
          <div className="space-y-8 py-4 flex-1 overflow-y-auto pr-1 scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {/* Informasi Mahasiswa (Tim) */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center">
                  <Users className="w-5 h-5 mr-2 text-primary" /> Informasi Mahasiswa (Tim Kerja Praktik)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Dosen Pembimbing Akademik (Ketua) */}
                {student.supervisor && (
                  <div className="bg-primary/10 p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground">Dosen Pembimbing Akademik (Ketua):</p>
                    <p className="font-semibold text-primary text-lg">{student.supervisor}</p>
                  </div>
                )}

                {/* Anggota Tim */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {(student.members ?? [
                    { id: 0, name: student.name, nim: student.nim, prodi: undefined, role: student.memberCount > 1 ? "Ketua" : "Ketua" },
                  ]).map((member) => (
                    <MemberCard key={`${member.id}-${member.nim ?? member.name}`} member={member} />
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Detail Surat Balasan */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Detail Surat Balasan</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row items-start gap-6">
                  <div className="flex-1 min-w-[220px]">
                    <InfoItem label="Perusahaan" value={student.company} />
                  </div>
                  <div className="flex-1 min-w-[180px]">
                    <InfoItem label="Tanggal Upload" value={student.tanggal} />
                  </div>
                  <div className="flex-1 min-w-[160px] space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Status Surat</p>
                    <Badge
                      variant={
                        student.status === "Disetujui" ? "default" : "destructive"
                      }
                    >
                      {student.status}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* File Surat Balasan */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">File Surat Balasan</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-green-50 dark:bg-green-950/30 p-4 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-green-600 text-white rounded-lg flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-green-900 dark:text-green-100 mb-1">
                        Surat Balasan Perusahaan
                      </p>
                      <p className="text-sm text-green-800 dark:text-green-200 mb-4">
                        Surat balasan telah diupload dan siap ditinjau
                      </p>
                      <Button
                        variant="outline"
                        className="border-green-600 text-green-600 hover:bg-green-50 dark:hover:bg-green-950"
                        onClick={() => {
                          const url = student.responseFileUrl ?? "#";
                          try {
                            window.open(url, "_blank");
                          } catch {/* ignore */}
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
        <DialogFooter className="gap-3 sm:gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1"
          >
            Tutup
          </Button>
          {student && !student.adminApproved && (
            <Button onClick={handleApproveClick} className="flex-1">
              Verifikasi
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p className="text-foreground font-medium">{value}</p>
    </div>
  );
}

function MemberCard({ member }: { member: { id: number; name: string; nim?: string; prodi?: string; role: "Ketua" | "Anggota" } }) {
  const isLeader = member.role === "Ketua";
  return (
    <div className="p-4 rounded-lg border bg-card">
      <div className="mb-2">
        <Badge
          variant="outline"
          className={isLeader ? "bg-primary/10 text-primary border-primary/30" : "bg-destructive/10 text-destructive border-destructive/30"}
        >
          {isLeader ? "Ketua" : "Anggota"}
        </Badge>
      </div>
      <p className="font-semibold text-foreground">{member.name}</p>
      {member.nim && <p className="text-sm text-muted-foreground mt-1">{member.nim}</p>}
      {member.prodi && <p className="text-sm text-muted-foreground">{member.prodi}</p>}
    </div>
  );
}

export default DetailDialog;
