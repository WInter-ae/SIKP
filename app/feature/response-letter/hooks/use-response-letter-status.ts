import { useState, useEffect } from "react";
import { toast } from "sonner";
import type { ResponseLetter } from "~/feature/response-letter/types";
import { getMyResponseLetter } from "~/lib/services/response-letter-api";
import { getMyTeams } from "~/feature/create-teams/services/team-api";

/**
 * Result of the useResponseLetterStatus hook
 */
interface UseResponseLetterStatusResult {
  responseLetter: ResponseLetter | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  isLeader: boolean;
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

  const loadResponseLetterStatus = async () => {
    try {
      setIsLoading(true);
      setError(null);

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
        setIsLoading(false);
        return;
      }

      const team = teamsResponse.data[0];
      const teamIsLeader = team.isLeader || false;
      setIsLeader(teamIsLeader);

      const response = await getMyResponseLetter();

      if (response.success && response.data) {
        setResponseLetter(response.data);
        setIsLeader(response.data.isLeader ?? teamIsLeader);
        console.log("✅ Loaded response letter status:", response.data);
      } else {
        console.log("📭 No response letter found for this team");
        setResponseLetter(null);
        setIsLeader(teamIsLeader);
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
  };
}
