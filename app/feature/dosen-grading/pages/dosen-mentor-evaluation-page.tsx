import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router";
import { 
  Users, 
  Search, 
  ClipboardCheck, 
  Building2, 
  User, 
  Clock, 
  AlertCircle, 
  Award,
  BookMarked
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import { 
  getDosenLogbookMonitorItems,
  type DosenLogbookMonitorItem
} from "../services/logbook-monitor-api";
import { getAssessmentRecap } from "~/feature/evaluation/services/evaluation-api";
import { GradeSection } from "~/feature/evaluation/components/grade-section";

interface DetailedStudentItem extends DosenLogbookMonitorItem {
  mentorGrades: any[] | null;
  mentorTotalScore: number | null;
  hasMentorGraded: boolean;
}

export default function DosenMentorEvaluationPage() {
  const [students, setStudents] = useState<DetailedStudentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      setErrorMessage(null);
      try {
        const response = await getDosenLogbookMonitorItems();
        if (response.success && response.data) {
          const studentItems = response.data;
          
          // Fetch assessments for each student in parallel
          const detailedStudents = await Promise.all(
            studentItems.map(async (student) => {
              try {
                const recapRes = await getAssessmentRecap(student.id);
                if (recapRes.success && recapRes.data) {
                  return {
                    ...student,
                    mentorGrades: recapRes.data.fieldSupervisorGrades || null,
                    mentorTotalScore: recapRes.data.summary?.fieldSupervisorTotal ?? null,
                    hasMentorGraded: !!recapRes.data.mentor,
                  };
                }
              } catch (e) {
                console.error("Error loading assessment for student:", student.id, e);
              }
              return {
                ...student,
                mentorGrades: null,
                mentorTotalScore: null,
                hasMentorGraded: false,
              };
            })
          );
          
          setStudents(detailedStudents);
        } else {
          setErrorMessage(response.message || "Gagal memuat daftar mahasiswa bimbingan.");
        }
      } catch (error) {
        console.error("Error loading detailed students:", error);
        setErrorMessage("Terjadi kesalahan sistem saat memuat data.");
      } finally {
        setIsLoading(false);
      }
    }
    
    loadData();
  }, []);

  // Filter students based on search query
  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const query = searchQuery.toLowerCase();
      return (
        student.studentName.toLowerCase().includes(query) ||
        student.nim.toLowerCase().includes(query) ||
        (student.company && student.company.toLowerCase().includes(query))
      );
    });
  }, [students, searchQuery]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center space-y-4">
          <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground font-medium">Memuat data penilaian mentor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
          <ClipboardCheck className="h-8 w-8 text-primary" />
          Monitoring Penilaian Mentor Lapangan
        </h1>
        <p className="text-sm text-muted-foreground">
          Pantau dan tinjau seluruh hasil evaluasi mahasiswa bimbingan Anda yang diberikan oleh Mentor Lapangan dari Industri.
        </p>
      </div>

      {errorMessage && (
        <Card className="border-red-200 bg-red-50 text-red-800 p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <p className="font-semibold">{errorMessage}</p>
          </div>
        </Card>
      )}

      {/* Search Bar */}
      <Card className="border-slate-200/80 shadow-xs bg-white">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Cari nama mahasiswa, NIM, atau perusahaan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white"
            />
          </div>
        </CardContent>
      </Card>

      {/* Grid List */}
      {filteredStudents.length === 0 ? (
        <Card className="border-dashed border-2 p-12 text-center bg-gray-50/50">
          <div className="max-w-md mx-auto space-y-4">
            <Users className="h-12 w-12 text-gray-300 mx-auto" />
            <h3 className="text-xl font-bold text-gray-900">Mahasiswa Tidak Ditemukan</h3>
            <p className="text-gray-500">
              Tidak ada mahasiswa bimbingan yang cocok dengan pencarian Anda.
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredStudents.map((student) => {
            const hasGraded = student.hasMentorGraded;
            
            return (
              <Card key={student.id} className="overflow-hidden bg-white border-slate-200/85 hover:shadow-md transition-all duration-300 flex flex-col justify-between">
                <div>
                  {/* Top Header Card */}
                  <div className="bg-slate-50 border-b border-slate-100 p-5 flex items-start gap-4">
                    <Avatar className="h-12 w-12 border-2 border-white shadow-2xs">
                      <AvatarImage src={student.photoUrl || student.photo_url || undefined} />
                      <AvatarFallback className="text-sm font-semibold bg-slate-200 text-slate-700">
                        {student.studentName.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-slate-800 text-base truncate">{student.studentName}</h3>
                      <p className="text-xs font-mono text-slate-500">NIM: {student.nim}</p>
                      
                      <div className="mt-2 flex flex-wrap gap-y-1 gap-x-3 text-xs text-slate-600">
                        <span className="flex items-center gap-1">
                          <Building2 className="h-3.5 w-3.5 text-slate-400" />
                          {student.company || "-"}
                        </span>
                        <span className="flex items-center gap-1">
                          <User className="h-3.5 w-3.5 text-slate-400" />
                          Mentor: {student.mentorName || "Belum ditentukan"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Mentorship Grades Content */}
                  <div className="p-5">
                    {hasGraded ? (
                      <div className="space-y-4">
                        <GradeSection
                          title="Rata-rata Nilai"
                          grades={student.mentorGrades!}
                          totalScore={student.mentorTotalScore || 0}
                          maxScore={100}
                        />
                      </div>
                    ) : (
                      <div className="bg-amber-50/50 border border-amber-200/60 rounded-xl p-6 text-center space-y-3">
                        <Clock className="h-10 w-10 text-amber-500 mx-auto animate-pulse" />
                        <h4 className="font-bold text-amber-900 text-sm">Belum Dinilai Oleh Mentor</h4>
                        <p className="text-xs text-amber-700 max-w-sm mx-auto leading-relaxed">
                          Pembimbing lapangan (mentor) dari industri belum melakukan input penilaian untuk mahasiswa ini di sistem.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="bg-slate-50/50 border-t border-slate-100 px-5 py-4 flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-medium">
                    {hasGraded ? "✓ Evaluasi Mentor Selesai" : "⏳ Menunggu Evaluasi"}
                  </span>
                  
                  <div className="flex gap-2">
                    <Button asChild size="sm" variant="outline" className="bg-white">
                      <Link to={`/dosen/kp/logbook-monitor/${student.nim || student.studentId || student.id}`}>
                        <BookMarked className="h-4 w-4 mr-2" />
                        Detail Logbook
                      </Link>
                    </Button>
                    <Button asChild size="sm" className="bg-primary hover:bg-primary/95 text-white">
                      <Link to={`/dosen/penilaian/beri-nilai/${student.nim || student.studentId || student.id}`}>
                        <Award className="h-4 w-4 mr-2" />
                        Beri Nilai Akhir
                      </Link>
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
