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
