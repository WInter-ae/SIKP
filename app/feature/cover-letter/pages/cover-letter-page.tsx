import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";

import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";

import StatusTimeline from "~/feature/cover-letter/components/status-timeline";

import { ArrowLeft, ArrowRight } from "lucide-react";
import {
  getSubmissionByTeamId,
  resetSubmissionToDraft,
} from "~/lib/services/submission-api";
import { getMyTeams } from "~/feature/create-teams/services/team-api";
import type { Submission } from "~/feature/submission/types";

function CoverLetterPage() {
  const navigate = useNavigate();
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSubmissionStatus = async () => {
      try {
        setIsLoading(true);

        // 1. Get user's team
        const teamsResponse = await getMyTeams();

        if (
          !teamsResponse.success ||
          !teamsResponse.data ||
          teamsResponse.data.length === 0
        ) {
          setError("Anda belum bergabung dengan tim manapun");
          setIsLoading(false);
          return;
        }

        const team = teamsResponse.data[0]; // Get first active team

        // 2. Get submission untuk team ini
        const submissionResponse = await getSubmissionByTeamId(team.id);

        if (submissionResponse.success && submissionResponse.data) {
          setSubmission(submissionResponse.data);
          console.log("✅ Loaded submission status:", submissionResponse.data);
        } else {
          console.log("📭 No submission found for this team");
          setSubmission(null);
        }
      } catch (err) {
        console.error("❌ Error loading submission:", err);
        setError(err instanceof Error ? err.message : "Gagal memuat data");
        toast.error("Gagal memuat status pengajuan");
      } finally {
        setIsLoading(false);
      }
    };

    void loadSubmissionStatus();
  }, []);

  const handleResubmit = async () => {
    if (!submission) {
      navigate("/mahasiswa/kp/pengajuan");
      return;
    }

    const response = await resetSubmissionToDraft(submission.id);
    if (!response.success) {
      toast.error(response.message || "Gagal mengembalikan status ke draft");
      return;
    }

    toast.success("Status berhasil dikembalikan ke draft");
    navigate("/mahasiswa/kp/pengajuan");
  };

  // Render loading state
  if (isLoading) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Memuat status pengajuan...</p>
      </div>
    );
  }

  // Render error state
  if (error && !submission) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">{error}</p>
        <Button
          onClick={() => navigate("/mahasiswa/kp/pengajuan")}
          className="mt-4"
        >
          Kembali ke Pengajuan
        </Button>
      </div>
    );
  }

  // Render status berdasarkan submission status dengan timeline
  const renderStatusSteps = () => {
    // Jika tidak ada submission, tampil pesan
    if (!submission) {
      return (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            Belum ada pengajuan. Silakan ajukan terlebih dahulu.
          </p>
          <Button
            onClick={() => navigate("/mahasiswa/kp/pengajuan")}
            className="mt-4"
          >
            Ajukan Sekarang
          </Button>
        </div>
      );
    }

    // ✅ Render timeline dari status history (menampilkan semua status yang pernah ada)
    return (
      <StatusTimeline
        statusHistory={submission.statusHistory}
        currentStatus={submission.status}
        rejectionReason={submission.rejectionReason}
        submittedAt={submission.submittedAt}
        approvedAt={submission.approvedAt}
        documents={submission.documents}
        onResubmit={handleResubmit}
      />
    );
  };

  return (
    <>
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Halaman Status Pengajuan Surat Pengantar
        </h1>
        <p className="text-muted-foreground">
          Monitor status pengajuan surat pengantar kerja praktik Anda
        </p>
      </div>

      <Card className="mb-8">
        <CardContent className="p-6">{renderStatusSteps()}</CardContent>
      </Card>

      {/* Navigation Buttons - Only show if there's a submission */}
      {submission && (
        <div className="flex justify-between mt-8">
          <Button variant="secondary" asChild className="px-6 py-3 font-medium">
            <Link to="/mahasiswa/kp/pengajuan">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Sebelumnya
            </Link>
          </Button>
          <Button asChild className="px-6 py-3 font-medium">
            <Link to="/mahasiswa/kp/surat-balasan">
              Selanjutnya
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      )}
    </>
  );
}

export default CoverLetterPage;
