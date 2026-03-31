import { useState, useEffect } from "react";
import { toast } from "sonner";
import type { Submission } from "~/feature/submission/types";
import { getSubmissionByTeamId } from "~/lib/services/submission-api";
import { getMyTeams } from "~/feature/create-teams/services/team-api";

/**
 * Result of the useSubmissionStatus hook
 */
interface UseSubmissionStatusResult {
  submission: Submission | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Custom hook to fetch and manage submission status for the current user's team
 * 
 * This hook handles:
 * - Fetching the user's teams
 * - Getting submission status for the active team
 * - Loading and error states
 * - Ability to refetch data
 * 
 * @returns Object containing submission, loading state, error, and refetch function
 * 
 * @example
 * ```tsx
 * const { submission, isLoading, error, refetch } = useSubmissionStatus();
 * 
 * if (isLoading) return <LoadingSpinner />;
 * if (error) return <ErrorMessage message={error} />;
 * ```
 */
export function useSubmissionStatus(): UseSubmissionStatusResult {
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSubmissionStatus = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // 1. Get user's team
      const teamsResponse = await getMyTeams();

      if (
        !teamsResponse.success ||
        !teamsResponse.data ||
        teamsResponse.data.length === 0
      ) {
        setError("Anda belum bergabung dengan tim manapun");
        setSubmission(null);
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
      const errorMessage = err instanceof Error ? err.message : "Gagal memuat data";
      setError(errorMessage);
      toast.error("Gagal memuat status pengajuan");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadSubmissionStatus();
  }, []);

  return {
    submission,
    isLoading,
    error,
    refetch: loadSubmissionStatus,
  };
}
