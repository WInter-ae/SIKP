import { Link } from "react-router";

import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

import { ArrowLeft, Star, User, Building2 } from "lucide-react";

function AssessmentPage() {
  // Dummy data untuk penilaian
  const assessments = [
    {
      id: 1,
      category: "Kedisiplinan",
      score: 85,
      maxScore: 100,
      description: "Kehadiran dan ketepatan waktu",
    },
    {
      id: 2,
      category: "Kerjasama",
      score: 90,
      maxScore: 100,
      description: "Kemampuan bekerja dalam tim",
    },
    {
      id: 3,
      category: "Inisiatif",
      score: 80,
      maxScore: 100,
      description: "Kemampuan mengambil inisiatif dalam pekerjaan",
    },
    {
      id: 4,
      category: "Kualitas Kerja",
      score: 88,
      maxScore: 100,
      description: "Hasil kerja sesuai standar yang ditetapkan",
    },
  ];

  const supervisorInfo = {
    name: "Budi Santoso, S.T., M.T.",
    position: "Software Engineer Lead",
    company: "PT. Teknologi Indonesia",
  };

  const totalScore =
    assessments.reduce((sum, a) => sum + a.score, 0) / assessments.length;

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Penilaian</h1>
        <p className="text-muted-foreground">
          Hasil penilaian dari pembimbing lapangan
        </p>
      </div>

      {/* Supervisor Info */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-lg">Pembimbing Lapangan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span>{supervisorInfo.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-muted-foreground" />
              <span>{supervisorInfo.position}</span>
            </div>
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <span>{supervisorInfo.company}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Overall Score */}
      <Card className="mb-8 bg-primary/5 border-primary/20">
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-muted-foreground mb-2">Nilai Rata-rata</p>
            <p className="text-5xl font-bold text-primary">
              {totalScore.toFixed(1)}
            </p>
            <p className="text-muted-foreground mt-2">dari 100</p>
          </div>
        </CardContent>
      </Card>

      {/* Assessment Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {assessments.map((assessment) => (
          <Card key={assessment.id}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-base">{assessment.category}</CardTitle>
                <span className="text-lg font-bold text-primary">
                  {assessment.score}/{assessment.maxScore}
                </span>
              </div>
              <CardDescription>{assessment.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all"
                  style={{
                    width: `${(assessment.score / assessment.maxScore) * 100}%`,
                  }}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Generate Button */}
      <div className="flex justify-center mb-6">
        <Button
          className="px-8 py-3 font-semibold"
          onClick={() => alert("Generate data penilaian")}
        >
          Generate
        </Button>
      </div>

      {/* Navigation Button */}
      <div className="flex justify-start">
        <Button variant="secondary" asChild className="px-6 py-3 font-medium">
          <Link to="/mahasiswa/kp/saat-magang">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali
          </Link>
        </Button>
      </div>
    </div>
  );
}

export default AssessmentPage;
