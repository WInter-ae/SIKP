import { API_ENDPOINTS } from "~/lib/constants/endpoints";
/**
 * Team Service
 * Wrapper untuk Team API endpoints
 */

import { sikpClient } from "~/lib/api-client";
import type { Team, TeamMember } from "~/lib/types";

/** Create a new team. Backend requires 'name' field in request. */
export async function createTeam() {
  return sikpClient.post<Team>(API_ENDPOINTS.TEAM.CREATE, { name: "Tim Kerja Praktik" });
}

/** Get user's teams. */
export async function getMyTeams() {
  return sikpClient.get<Team[]>(API_ENDPOINTS.TEAM.GET_MY);
}

/** Get team members. */
export async function getTeamMembers(teamId: string) {
  return sikpClient.get<TeamMember[]>(`/api/teams/${teamId}/members`);
}

/** Invite team member by NIM. */
export async function inviteTeamMember(teamId: string, memberNim: string) {
  return sikpClient.post<TeamMember>(`/api/teams/${teamId}/invite`, {
    memberNim,
  });
}

/** Respond to team invitation. */
export async function respondToInvitation(memberId: string, accept: boolean) {
  return sikpClient.post<{ success: boolean; status: string }>(
    `/api/teams/invitations/${memberId}/respond`,
    { accept },
  );
}

/** Leave team (for team members, not leader). */
export async function leaveTeam(teamId: string) {
  return sikpClient.post<{ success: boolean; message: string; teamId: string }>(
    `/api/teams/${teamId}/leave`,
    {},
  );
}

/** Delete team (for team leader). */
export async function deleteTeam(teamId: string) {
  return sikpClient.post<{
    success: boolean;
    deletedTeamId: string;
    deletedTeamCode: string;
    membersAffected: number;
  }>(`/api/teams/${teamId}/delete`, {});
}
