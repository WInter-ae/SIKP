import { useParams, useNavigate } from "react-router";
import { useState, useEffect } from "react";
import { ArrowLeft, User, CheckCircle, Lock } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Badge } from "~/components/ui/badge";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { GradingForm } from "../components/grading-form";
import { RevisionReviewSection } from "../components/revision-review-section";
import { MOCK_STUDENTS_FOR_GRADING } from "../data/mock-students";
import type { GradingFormData } from "../types";

export default function GiveGradePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("revisi");
  
  // Track revision approvals - will check if revisions are approved
  const [allRevisionsApproved, setAllRevisionsApproved] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const studentInfo = MOCK_STUDENTS_FOR_GRADING.find(
    (s) => s.student.id === id,
  );

  // Load saved grading data and revision status from localStorage on mount
  useEffect(() => {
    if (!id) {
      setIsLoading(false);
      return;
    }
    
    // Check revision decision first
    const savedDecision = localStorage.getItem(`revision-decision-${id}`);
    const savedRevisionStatus = localStorage.getItem(`revision-approved-${id}`);
    
    // If revision is approved (no-revision decision), unlock penilaian
    if (savedDecision === 'no-revision' || savedRevisionStatus === 'true') {
      setAllRevisionsApproved(true);
      
      // Load saved tab preference
      const savedTab = localStorage.getItem(`active-tab-${id}`);
      if (savedTab) {
        setActiveTab(savedTab);
      }
      // Note: Don't auto-switch to penilaian, let user decide
    } else {
      // Always stay on revisi tab if not approved
      setActiveTab("revisi");
      setAllRevisionsApproved(false);
    }
    
    setIsLoading(false);
  }, [id]);

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

  // Get initial form data if already graded or from localStorage
  const getInitialFormData = (): Partial<GradingFormData> | undefined => {
    // First, check localStorage for saved draft
    const savedGrading = localStorage.getItem(`grading-draft-${id}`);
    if (savedGrading) {
      try {
        const parsedData = JSON.parse(savedGrading);
        return parsedData;
      } catch (e) {
        console.error("Error parsing saved grading data:", e);
      }
    }

    // Otherwise, use existing graded data if available
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
    
    // Load e-signature dari profil dosen
    let eSignatureUrl = "";
    const savedSignature = localStorage.getItem("dosen-esignature");
    if (savedSignature) {
      try {
        const signatureData = JSON.parse(savedSignature);
        eSignatureUrl = signatureData.signatureImage;
      } catch (e) {
        console.error("Error loading signature:", e);
      }
    }
    
    // Load dosen profile data
    let dosenData = {
      nama: "Dr. Ahmad Santoso, M.Kom",
      nip: "198501122010121001"
    };
    const savedProfile = localStorage.getItem("dosen-profile");
    if (savedProfile) {
      try {
        const profileData = JSON.parse(savedProfile);
        dosenData.nama = profileData.nama || dosenData.nama;
        dosenData.nip = profileData.nip || dosenData.nip;
      } catch (e) {
        console.error("Error loading profile:", e);
      }
    }
    
    // Save nilai to localStorage for mahasiswa to generate form
    // Include complete student data from current student being graded
    const nilaiData = {
      // Data Mahasiswa
      namaMahasiswa: student.name,
      nim: student.studentId,
      programStudi: "Teknik Informatika", // TODO: get from student data
      tempatKP: student.company,
      judulLaporan: "Sistem Informasi Manajemen Berbasis Web", // TODO: get from submission
      waktuPelaksanaan: `${new Date(student.internPeriod.start).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })} s.d. ${new Date(student.internPeriod.end).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}`,
      dosenPembimbing: dosenData.nama,
      pembimbingLapangan: student.fieldSupervisor,
      
      // Nilai
      kesesuaianLaporan: data.reportFormat,
      penguasaanMateri: data.materialMastery,
      analisisPerancangan: data.analysisDesign,
      sikapEtika: data.attitudeEthics,
      
      // Data Dosen
      dosenPenguji: dosenData.nama,
      nipDosen: dosenData.nip,
      eSignatureUrl: eSignatureUrl,
      tanggalPenilaian: new Date().toISOString(),
      
      // Student ID untuk tracking
      studentId: student.studentId,
    };
    
    // Save dengan key yang spesifik per mahasiswa
    localStorage.setItem(`nilai-kp-${student.studentId}`, JSON.stringify(nilaiData));
    // Also save to generic key for backward compatibility
    localStorage.setItem("nilai-kp", JSON.stringify(nilaiData));
    
    console.log("Submitting grade data:", data);
    console.log("Saved nilai data:", nilaiData);
    
    // Show success message or redirect
    alert("Nilai berhasil disimpan! Mahasiswa dapat mencetak Form Nilai KP.");
    navigate("/dosen/penilaian");
    setIsSubmitting(false);
  };

  const handleCancel = () => {
    navigate("/dosen/penilaian");
  };

  const handleAllRevisionsApproved = (approved: boolean) => {
    // Only update if the value actually changed
    if (allRevisionsApproved !== approved) {
      setAllRevisionsApproved(approved);
      
      // Save revision approval status to localStorage
      if (id) {
        localStorage.setItem(`revision-approved-${id}`, approved.toString());
      }
      
      // Don't auto-switch tab, let user manually click
      // User will see the unlock message and can switch when ready
    }
  };

  // Save active tab to localStorage when it changes
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (id) {
      localStorage.setItem(`active-tab-${id}`, value);
    }
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

        {/* Revision Status Alert */}
        {allRevisionsApproved && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <AlertDescription className="text-green-800">
              <strong>Dokumen disetujui.</strong> Anda sekarang dapat memberikan penilaian final pada mahasiswa ini. Silakan klik tab <strong>Penilaian</strong> di atas.
            </AlertDescription>
          </Alert>
        )}

        {/* Tabs for Revisi and Penilaian */}
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="revisi" className="gap-2">
              Revisi
              {allRevisionsApproved && (
                <CheckCircle className="h-4 w-4 text-green-600" />
              )}
            </TabsTrigger>
            <TabsTrigger 
              value="penilaian" 
              disabled={!allRevisionsApproved}
              className="gap-2"
            >
              Penilaian
              {!allRevisionsApproved && (
                <Lock className="h-4 w-4" />
              )}
            </TabsTrigger>
          </TabsList>

          {/* Revisi Tab */}
          <TabsContent value="revisi" className="mt-6">
            <RevisionReviewSection
              studentId={id!}
              onAllRevisionsApproved={handleAllRevisionsApproved}
            />
          </TabsContent>

          {/* Penilaian Tab */}
          <TabsContent value="penilaian" className="mt-6">
            {allRevisionsApproved ? (
              <GradingForm
                initialData={getInitialFormData()}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                isSubmitting={isSubmitting}
              />
            ) : (
              <Card>
                <CardContent className="py-12">
                  <div className="text-center space-y-4">
                    <Lock className="h-16 w-16 text-orange-400 mx-auto" />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Penilaian Terkunci
                      </h3>
                      <p className="text-gray-600 mb-2">
                        Anda harus mereview dan menyetujui revisi terlebih dahulu sebelum dapat memberikan penilaian.
                      </p>
                      <p className="text-sm text-orange-600 font-medium">
                        Silakan klik tombol "Tidak Ada Revisi" di tab Revisi untuk membuka tab Penilaian.
                      </p>
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={() => setActiveTab("revisi")}
                      className="mt-4"
                    >
                      Kembali ke Revisi
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
