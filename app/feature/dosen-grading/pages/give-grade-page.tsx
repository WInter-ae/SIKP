import { useParams, useNavigate } from "react-router";
import { useState } from "react";
import { ArrowLeft, User } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { GradingForm } from "../components/grading-form";
import { MOCK_STUDENTS_FOR_GRADING } from "../data/mock-students";
import type { GradingFormData } from "../types";

export default function GiveGradePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const studentInfo = MOCK_STUDENTS_FOR_GRADING.find(
    (s) => s.student.id === id,
  );

  if (!studentInfo) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Data Tidak Ditemukan
            </h2>
            <p className="text-gray-600 mb-4">
              Data mahasiswa yang Anda cari tidak tersedia.
            </p>
            <Button onClick={() => navigate("/dosen/penilaian")}>
              Kembali ke Daftar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { student, academicGrades } = studentInfo;

  // Get initial form data if already graded
  const getInitialFormData = (): Partial<GradingFormData> | undefined => {
    if (!academicGrades || academicGrades.length === 0) return undefined;

    const reportGrade = academicGrades.find(
      (g) => g.category === "Laporan Kerja Praktik",
    );
    const presentationGrade = academicGrades.find(
      (g) => g.category === "Presentasi & Ujian",
    );

    if (!reportGrade || !presentationGrade) return undefined;

    return {
      reportSystematics:
        reportGrade.components.find((c) => c.name === "Sistematika Penulisan")
          ?.score || 0,
      reportContent:
        reportGrade.components.find((c) => c.name === "Isi dan Pembahasan")
          ?.score || 0,
      reportAnalysis:
        reportGrade.components.find((c) => c.name === "Analisis dan Kesimpulan")
          ?.score || 0,
      presentationDelivery:
        presentationGrade.components.find(
          (c) => c.name === "Penyampaian Materi",
        )?.score || 0,
      presentationMastery:
        presentationGrade.components.find((c) => c.name === "Penguasaan Materi")
          ?.score || 0,
      presentationQA:
        presentationGrade.components.find(
          (c) => c.name === "Kemampuan Menjawab",
        )?.score || 0,
      notes: studentInfo.notes || "",
    };
  };

  const handleSubmit = async (data: GradingFormData) => {
    setIsSubmitting(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    console.log("Submitting grade data:", data);
    // Show success message or redirect
    alert("Nilai berhasil disimpan!");
    navigate("/dosen/penilaian");
    setIsSubmitting(false);
  };

  const handleCancel = () => {
    navigate("/dosen/penilaian");
  };

  const isEditing = studentInfo.gradingStatus === "graded";

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate("/dosen/penilaian")}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Kembali ke Daftar
        </Button>

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {isEditing ? "Edit Nilai Mahasiswa" : "Beri Nilai Mahasiswa"}
          </h1>
          <p className="text-gray-600">
            {isEditing
              ? "Perbarui penilaian untuk mahasiswa bimbingan Anda"
              : "Berikan penilaian untuk mahasiswa bimbingan Anda"}
          </p>
        </div>

        {/* Student Info Card */}
        <Card>
          <CardHeader>
            <CardTitle>Informasi Mahasiswa</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={student.photo} alt={student.name} />
                <AvatarFallback>
                  {student.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900">
                  {student.name}
                </h3>
                <p className="text-gray-600">{student.studentId}</p>
                <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Perusahaan: </span>
                    <span className="font-medium">{student.company}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Pembimbing Lapangan: </span>
                    <span className="font-medium">
                      {student.fieldSupervisor}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Grading Form */}
        <GradingForm
          initialData={getInitialFormData()}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
}
