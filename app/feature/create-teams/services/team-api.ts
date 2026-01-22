/**
 * Team API Service
 * Handles all team-related API calls
 */

import { post, get } from "~/lib/api-client";
import type { ApiResponse } from "~/lib/api-client";

// ==================== TYPES ====================

export interface Team {
  id: string;
  name: string;
  code: string;
  leaderId: string;
  createdAt: string;
  updatedAt: string;
}

export interface TeamMember {
  id: string;
  teamId: string;
  userId: string;
  role: "KETUA" | "ANGGOTA";
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  invitedBy: string;
  invitedAt: string;
  respondedAt?: string;
  user: {
    id: string;
    nim: string;
    name: string;
    email: string;
  };
}

export interface MyTeamsResponse {
  id: string;
  name: string;
  code: string;
  leaderId: string;
  isLeader: boolean;
  status: string;
  members: Array<{
    id: string;
    role: "KETUA" | "ANGGOTA";
    status: string;
    user: {
      id: string;
      nim: string;
      name: string;
      email: string;
    };
  }>;
}

export interface MahasiswaSearchResult {
  id: string;
  name: string;
  nim: string;
  email: string;
  prodi?: string;
  fakultas?: string;
}

export interface JoinTeamResponseData {
  memberId: string;
  teamId: string;
  teamCode: string;
  userId: string;
  status: string;
  createdAt: string;
  team?: {
    id?: string;
    code: string;
    leaderName: string;
    leaderNim: string;
  };
}

// ==================== API FUNCTIONS ====================

/**
 * Create a new team
 * POST /api/teams
 * Backend requires 'name' field in request but may not store it in database
 * Database auto-generates: id, code, leader_id (from JWT), status (PENDING)
 */
export async function createTeam(): Promise<ApiResponse<Team>> {
  return post<Team>("/api/teams", { name: "Tim Kerja Praktik" });
}

/**
 * Get my teams (teams where I'm a member)
 * GET /api/teams/my-teams
 */
export async function getMyTeams(): Promise<ApiResponse<MyTeamsResponse[]>> {
  return get<MyTeamsResponse[]>("/api/teams/my-teams");
}

/**
 * Invite a member to team
 * POST /api/teams/:teamId/invite
 */
export async function inviteTeamMember(
  teamId: string,
  memberNim: string,
): Promise<ApiResponse<TeamMember>> {
  return post<TeamMember>(`/api/teams/${teamId}/invite`, { memberNim });
}

/**
 * Respond to team invitation (accept or reject)
 * POST /api/teams/invitations/:memberId/respond
 */
export async function respondToInvitation(
  memberId: string,
  accept: boolean,
): Promise<ApiResponse<TeamMember>> {
  return post<TeamMember>(`/api/teams/invitations/${memberId}/respond`, {
    accept,
  });
}

/**
 * Get team members
 * GET /api/teams/:teamId/members
 */
export async function getTeamMembers(
  teamId: string,
): Promise<ApiResponse<TeamMember[]>> {
  return get<TeamMember[]>(`/api/teams/${teamId}/members`);
}

/**
 * Search teams by NIM ketua
 * GET /api/teams/search?query=xxx
 */
export async function searchTeams(query: string): Promise<
  ApiResponse<
    Array<{
      id: string;
      name: string;
      code: string;
      memberCount: number;
      leaderNim: string;
      leaderName: string;
    }>
  >
> {
  return get<
    Array<{
      id: string;
      name: string;
      code: string;
      memberCount: number;
      leaderNim: string;
      leaderName: string;
    }>
  >("/api/teams/search", { query });
}

/**
 * Join a team using team code
 * POST /api/teams/:teamCode/join
 */
export async function joinTeam(teamCode: string): Promise<ApiResponse<JoinTeamResponseData>> {
  const normalizedCode = encodeURIComponent(teamCode.trim());
  return post<JoinTeamResponseData>(`/api/teams/${normalizedCode}/join`, {});
}

/**
 * Get my pending invitations (undangan yang saya terima)
 * GET /api/teams/my-invitations
 */
export async function getMyInvitations(): Promise<ApiResponse<TeamMember[]>> {
  return get<TeamMember[]>("/api/teams/my-invitations");
}

/**
 * Search mahasiswa by nama or NIM
 * GET /api/mahasiswa/search?q=xxx
 */
export async function searchMahasiswa(
  query: string,
): Promise<ApiResponse<MahasiswaSearchResult[]>> {
  return get<MahasiswaSearchResult[]>("/api/mahasiswa/search", { q: query });
}

/**
 * Leave team (for team members, not leader)
 * POST /api/teams/:teamId/leave
 * 
 * Only team members (not leader) can leave
 * Team leader must use deleteTeam instead
 */
export async function leaveTeam(teamId: string): Promise<ApiResponse<{
  success: boolean;
  message: string;
  teamId: string;
}>> {
  return post(`/api/teams/${teamId}/leave`, {});
}

/**
 * Delete team (for team leader only)
 * DELETE /api/teams/:teamId
 * 
 * Only team leader can delete the team
 * All members will be removed when team is deleted
 */
export async function deleteTeam(teamId: string): Promise<ApiResponse<{
  success: boolean;
  deletedTeamId: string;
  deletedTeamCode: string;
  membersAffected: number;
}>> {
  return post(`/api/teams/${teamId}/delete`, {});
}

/**
 * Remove member from team (for team leader)
 * POST /api/teams/:teamId/members/:memberId/remove
 * 
 * Only team leader can remove members
 * Cannot remove team leader
 */
export async function removeMember(teamId: string, memberId: string): Promise<ApiResponse<{
  success: boolean;
  message: string;
  removedMemberId: string;
  teamId: string;
}>> {
  return post(`/api/teams/${teamId}/members/${memberId}/remove`, {});
}

/**
 * Finalize team (lock members)
 * PUT /api/teams/:teamId/finalize
 * 
 * Only team leader can finalize
 * Team must have at least 1 accepted member
 * After finalize, no more members can be added/removed
 */
export async function finalizeTeam(teamId: string): Promise<ApiResponse<{
  id: string;
  code: string;
  status: string;
  message: string;
}>> {
  return post(`/api/teams/${teamId}/finalize`, {});
}

/**
 * Cancel invitation (for team leader)
 * POST /api/teams/invitations/:memberId/cancel
 * 
 * Only team leader can cancel pending invitations
 * Cannot cancel accepted or rejected invitations
 * Cannot cancel team leader invitation
 */
export async function cancelInvitation(memberId: string): Promise<ApiResponse<{
  success: boolean;
  message: string;
  cancelledInvitationId: string;
  cancelledUserId: string;
  teamId: string;
}>> {
  return post(`/api/teams/invitations/${memberId}/cancel`, {});
}


