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
  members: Array<{
    id: string;
    role: string;
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
 * Delete/Leave team
 * DELETE /api/teams/:teamId
 * 
 * Used when:
 * - Team leader wants to delete their team
 * - Member accepts invitation from another team (auto-delete old team)
 */
export async function deleteTeam(teamId: string): Promise<ApiResponse<{
  success: boolean;
  deletedTeamId: string;
}>> {
  return post(`/api/teams/${teamId}/delete`, {});
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


