import { useState, useEffect } from "react";
import { toast } from "sonner";
import type { ResponseLetter } from "~/feature/response-letter/types";
import { getMyResponseLetter } from "~/lib/services/response-letter-api";
import { getMyTeams } from "~/feature/create-teams/services/team-api";
import { getSubmissionByTeamId } from "~/lib/services/submission-api";

/**
 * Result of the useResponseLetterStatus hook
 */
interface UseResponseLetterStatusResult {
  responseLetter: ResponseLetter | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  isLeader: boolean;
  hasTeam: boolean;
  canManageResponseLetter: boolean;
  blockedReason: string | null;
}

/**
 * Custom hook to fetch and manage response letter status for the current user
 *
 * This hook handles:
 * - Fetching the user's response letter data
 * - Loading and error states
 * - Ability to refetch data
 *
 * @returns Object containing responseLetter, loading state, error, and refetch function
 *
 * @example
 * ```tsx
 * const { responseLetter, isLoading, error, refetch } = useResponseLetterStatus();
 *
 * if (isLoading) return <LoadingSpinner />;
 * if (error) return <ErrorMessage message={error} />;
 * ```
 */
export function useResponseLetterStatus(): UseResponseLetterStatusResult {
  const [responseLetter, setResponseLetter] = useState<ResponseLetter | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLeader, setIsLeader] = useState(false);
  const [hasTeam, setHasTeam] = useState(true);
  const [canManageResponseLetter, setCanManageResponseLetter] = useState(true);
  const [blockedReason, setBlockedReason] = useState<string | null>(null);

  const loadResponseLetterStatus = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setBlockedReason(null);
      setCanManageResponseLetter(true);

      // Get user's team to check if they're a leader AND to get team data
      const teamsResponse = await getMyTeams();

      if (
        !teamsResponse.success ||
        !teamsResponse.data ||
        teamsResponse.data.length === 0
      ) {
        console.log("📭 User is not part of any team");
        setResponseLetter(null);
        setIsLeader(false);
        setHasTeam(false);
        setCanManageResponseLetter(false);
        setBlockedReason(
          "Tim tidak ditemukan. Silakan buat tim terlebih dahulu.",
        );
        setIsLoading(false);
        return;
      }

      const fixedTeam = teamsResponse.data.find(
        (team) => team.status?.toUpperCase() === "FIXED",
      );

      if (!fixedTeam) {
        console.log("📭 User has no FIXED team yet");
        setResponseLetter(null);
        setIsLeader(false);
        setHasTeam(false);
        setCanManageResponseLetter(false);
        setBlockedReason(
          "Tim belum berstatus FIXED. Silakan finalisasi tim terlebih dahulu.",
        );
        setIsLoading(false);
        return;
      }

      const teamIsLeader = fixedTeam.isLeader || false;
      setIsLeader(teamIsLeader);
      setHasTeam(true);

      const submissionResponse = await getSubmissionByTeamId(fixedTeam.id);
      if (!submissionResponse.success || !submissionResponse.data) {
        setResponseLetter(null);
        setCanManageResponseLetter(false);
        setBlockedReason(
          "Pengajuan belum diajukan. Silakan lengkapi data lalu ajukan pada halaman Pengajuan terlebih dahulu.",
        );
        setIsLoading(false);
        return;
      }

      const submission =
        submissionResponse.data as typeof submissionResponse.data & {
          workflowStage?: string;
        };
      const submissionStatus = submission.status?.toUpperCase();
      const submissionStage = submission.workflowStage?.toUpperCase();

      const isSubmissionApproved =
        submissionStatus === "APPROVED" ||
        submissionStatus === "COMPLETED" ||
        submissionStage === "COMPLETED";

      if (!isSubmissionApproved) {
        const isDraftSubmission = submissionStatus === "DRAFT";
        setResponseLetter(null);
        setCanManageResponseLetter(false);
        setBlockedReason(
          isDraftSubmission
            ? "Pengajuan belum diajukan. Silakan lengkapi data lalu ajukan pada halaman Pengajuan terlebih dahulu."
            : "Surat pengantar belum disetujui. Halaman surat balasan akan terbuka setelah status pengajuan APPROVED.",
        );
        setIsLoading(false);
        return;
      }

      const response = await getMyResponseLetter();

      if (response.success && response.data) {
        setResponseLetter(response.data);
        setIsLeader(response.data.isLeader ?? teamIsLeader);
        setCanManageResponseLetter(true);
        console.log("✅ Loaded response letter status:", response.data);
      } else {
        console.log("📭 No response letter found for this team");
        setResponseLetter(null);
        setIsLeader(teamIsLeader);
        setCanManageResponseLetter(true);
      }
    } catch (err) {
      console.error("❌ Error loading response letter:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Gagal memuat data";
      setError(errorMessage);
      toast.error("Gagal memuat status surat balasan");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadResponseLetterStatus();
  }, []);

  return {
    responseLetter,
    isLoading,
    error,
    refetch: loadResponseLetterStatus,
    isLeader,
    hasTeam,
    canManageResponseLetter,
    blockedReason,
  };
}
