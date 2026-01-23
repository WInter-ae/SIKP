/**
 * Team Service
 * Wrapper untuk Team API endpoints
 */

import { post, get } from "~/lib/api-client";
import type { Team, TeamMember } from "~/lib/types";

/**
 * Create a new team
 * Backend requires 'name' field in request
 */
export async function createTeam() {
  return post<Team>("/api/teams", { name: "Tim Kerja Praktik" });
}

/**
 * Get user's teams
 */
export async function getMyTeams() {
  return get<Team[]>("/api/teams/my-teams");
}

/**
 * Get team members
 */
export async function getTeamMembers(teamId: string) {
  return get<TeamMember[]>(`/api/teams/${teamId}/members`);
}

/**
 * Invite team member by NIM
 */
export async function inviteTeamMember(teamId: string, memberNim: string) {
  return post<TeamMember>(`/api/teams/${teamId}/invite`, {
    memberNim,
  });
}

/**
 * Respond to team invitation
 */
export async function respondToInvitation(memberId: string, accept: boolean) {
  return post<{ success: boolean; status: string }>(
    `/api/teams/invitations/${memberId}/respond`,
    { accept },
  );
}

/**
 * Leave team (for team members, not leader)
 */
export async function leaveTeam(teamId: string) {
  return post<{ success: boolean; message: string; teamId: string }>(
    `/api/teams/${teamId}/leave`,
    {},
  );
}

/**
 * Delete team (for team leader)
 */
export async function deleteTeam(teamId: string) {
  return post<{ success: boolean; deletedTeamId: string; deletedTeamCode: string; membersAffected: number }>(
    `/api/teams/${teamId}/delete`,
    {},
  );
}
