import { Link } from "react-router";

import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import { Alert, AlertDescription } from "~/components/ui/alert";

import {
  ArrowLeft,
  Briefcase,
  Building2,
  User,
  Award,
  TrendingUp,
  Clock,
  Users,
  Lightbulb,
  CheckCircle2,
  Download,
  Info,
  FileCheck,
  Archive,
} from "lucide-react";

function AssessmentPage() {
  // Flag untuk cek apakah penilaian sudah di-generate oleh mentor
  // Dalam implementasi real, ini dari API/database
  const isAssessmentGenerated = true; // true jika mentor sudah simpan penilaian
  const generatedAt = "28 Desember 2025, 14:30"; // Waktu mentor simpan penilaian
  const archivedPdfUrl = "/api/assessment/download/12345"; // URL download dari arsip

  // Dummy data untuk penilaian
  const assessments = [
    {
      id: 1,
      category: "Kehadiran",
      score: 85,
      maxScore: 100,
      weight: 20,
      description: "Tingkat kehadiran dan ketepatan waktu",
      icon: Clock,
    },
    {
      id: 2,
      category: "Kerjasama",
      score: 90,
      maxScore: 100,
      weight: 30,
      description: "Kemampuan bekerja dalam tim",
      icon: Users,
    },
    {
      id: 3,
      category: "Sikap, Etika dan Tingkah Laku",
      score: 88,
      maxScore: 100,
      weight: 20,
      description: "Sikap profesional, etika kerja, dan perilaku di tempat kerja",
      icon: Users,
    },
    {
      id: 4,
      category: "Prestasi Kerja",
      score: 87,
      maxScore: 100,
      weight: 20,
      description: "Kualitas dan hasil kerja yang dicapai",
      icon: CheckCircle2,
    },
    {
      id: 5,
      category: "Kreatifitas",
      score: 82,
      maxScore: 100,
      weight: 10,
      description: "Kemampuan berpikir kreatif dan inovatif",
      icon: Lightbulb,
    },
  ];

  const supervisorInfo = {
    name: "Budi Santoso, S.T., M.T.",
    position: "Software Engineer Lead",
    company: "PT. Teknologi Indonesia",
  };

  // Hitung weighted average
  const totalScore = assessments.reduce((sum, a) => {
    return sum + (a.score * a.weight) / 100;
  }, 0);

  const getScoreColor = (score: number) => {
    if (score >= 85) return "text-green-600";
    if (score >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 85) return "bg-green-500";
    if (score >= 70) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getGrade = (score: number) => {
    if (score >= 85) return { grade: "A", label: "Sangat Baik" };
    if (score >= 75) return { grade: "B", label: "Baik" };
    if (score >= 65) return { grade: "C", label: "Cukup" };
    if (score >= 55) return { grade: "D", label: "Kurang" };
    return { grade: "E", label: "Sangat Kurang" };
  };

  const gradeInfo = getGrade(totalScore);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header Section */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Penilaian Kerja Praktik</h1>
        <p className="text-muted-foreground">
          Hasil penilaian dari pembimbing lapangan selama masa kerja praktik
        </p>
      </div>

      {/* Back Button */}
      <Button variant="secondary" asChild>
        <Link to="/mahasiswa/kp/saat-magang">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali ke Saat Magang
        </Link>
      </Button>

      {/* Info Alert */}
      <Alert className="border-l-4 border-primary bg-primary/5">
        <Info className="h-4 w-4" />
        <AlertDescription>
          Penilaian ini diberikan oleh pembimbing lapangan berdasarkan kinerja Anda selama masa kerja praktik.
        </AlertDescription>
      </Alert>

      {/* Status Penilaian Alert */}
      {isAssessmentGenerated ? (
        <Alert className="border-l-4 border-green-500 bg-green-50 dark:bg-green-950/20">
          <FileCheck className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800 dark:text-green-400">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-medium mb-1">Penilaian telah disimpan oleh Mentor Lapangan</p>
                <p className="text-sm text-green-700 dark:text-green-500">
                  Penilaian telah di-generate secara otomatis pada <span className="font-medium">{generatedAt}</span> dan tersimpan di arsip sistem.
                </p>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      ) : (
        <Alert className="border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20">
          <Clock className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800 dark:text-yellow-400">
            <p className="font-medium mb-1">Menunggu Penilaian dari Mentor Lapangan</p>
            <p className="text-sm text-yellow-700 dark:text-yellow-500">
              Penilaian akan otomatis di-generate dan tersimpan setelah mentor lapangan menyimpan penilaian Anda.
            </p>
          </AlertDescription>
        </Alert>
      )}

      {/* Supervisor Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Pembimbing Lapangan
          </CardTitle>
          <CardDescription>
            Informasi pembimbing yang memberikan penilaian
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="bg-primary/10 text-primary text-lg">
                {supervisorInfo.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <p className="font-semibold text-lg">{supervisorInfo.name}</p>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Briefcase className="h-4 w-4" />
                <span className="text-sm">{supervisorInfo.position}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Building2 className="h-4 w-4" />
                <span className="text-sm">{supervisorInfo.company}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Overall Score Card */}
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Nilai Keseluruhan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                <div className="relative">
                  <div className="w-32 h-32 rounded-full border-8 border-primary/20 flex items-center justify-center">
                    <div className="text-center">
                      <p className={`text-4xl font-bold ${getScoreColor(totalScore)}`}>
                        {totalScore.toFixed(1)}
                      </p>
                      <p className="text-sm text-muted-foreground">dari 100</p>
                    </div>
                  </div>
                  <div className="absolute -top-2 -right-2">
                    <Badge className="text-lg px-3 py-1 bg-primary">
                      {gradeInfo.grade}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <TrendingUp className={`h-5 w-5 ${getScoreColor(totalScore)}`} />
                    <span className={`font-semibold ${getScoreColor(totalScore)}`}>
                      {gradeInfo.label}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground max-w-xs">
                    Berdasarkan rata-rata dari {assessments.length} kategori penilaian
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="p-4 bg-background rounded-lg border">
                  <p className="text-2xl font-bold text-green-600">
                    {assessments.filter((a) => a.score >= 85).length}
                  </p>
                  <p className="text-xs text-muted-foreground">Sangat Baik</p>
                </div>
                <div className="p-4 bg-background rounded-lg border">
                  <p className="text-2xl font-bold text-yellow-600">
                    {assessments.filter((a) => a.score >= 70 && a.score < 85).length}
                  </p>
                  <p className="text-xs text-muted-foreground">Baik</p>
                </div>
              </div>
            </div>
          </CardContent>
        </div>
      </Card>

      {/* Assessment Details */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Detail Penilaian</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {assessments.map((assessment) => {
            const Icon = assessment.icon;
            const percentage = (assessment.score / assessment.maxScore) * 100;
            
            return (
              <Card key={assessment.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-base">{assessment.category}</CardTitle>
                          <span className="text-xs font-medium bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                            {assessment.weight}%
                          </span>
                        </div>
                        <CardDescription className="text-sm">
                          {assessment.description}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge
                      variant="secondary"
                      className={`${getScoreColor(assessment.score)} font-bold`}
                    >
                      {assessment.score}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Nilai</span>
                      <span className="font-medium">{assessment.score} / {assessment.maxScore}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                      <div
                        className={`h-3 rounded-full transition-all duration-500 ${getScoreBgColor(assessment.score)}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Action Buttons */}
      {isAssessmentGenerated && (
        <Card className="border-l-4 border-green-500">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/20 flex items-center justify-center flex-shrink-0">
                  <Archive className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Dokumen Tersedia</p>
                  <p className="text-sm text-muted-foreground">
                    Penilaian telah disimpan pada <span className="font-medium">{generatedAt}</span>
                  </p>
                </div>
              </div>
              <Button 
                onClick={() => window.open(archivedPdfUrl, '_blank')}
                className="w-full sm:w-auto"
              >
                <Download className="mr-2 h-4 w-4" />
                Unduh PDF Penilaian
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default AssessmentPage;
