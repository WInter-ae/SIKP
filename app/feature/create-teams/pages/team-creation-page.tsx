import { useState, useEffect } from "react";
import { useNavigate } from "react-router";

import { Alert, AlertDescription } from "~/components/ui/alert";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "~/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

import MemberList from "~/feature/create-teams/components/member-list";
import { SentInvitations } from "~/feature/create-teams/components/sent-invitations";
import { ConfirmDialog } from "~/feature/create-teams/components/confirm-dialog";
import { JoinTeamDialog } from "~/feature/create-teams/components/join-team-dialog";
import { InviteMemberDialog } from "~/feature/create-teams/components/invite-member-dialog";
import { TeamCodeDialog } from "~/feature/create-teams/components/team-code-dialog";
import { DeleteTeamDialog } from "~/feature/create-teams/components/delete-team-dialog";

import type { Member, Team } from "~/feature/create-teams/types";
import {
  Users,
  UserPlus,
  Info,
  Crown,
  Loader2,
  Copy,
  Check,
  Trash2,
  AlertCircle,
} from "lucide-react";

// Import user context untuk akses user data
import { useUser } from "~/contexts/user-context";

// Import API services
import {
  createTeam as createTeamApi,
  getMyTeams,
  getMyInvitations,
  getTeamMembers,
  inviteTeamMember,
  respondToInvitation,
  joinTeam as joinTeamApi,
  deleteTeam as deleteTeamApi,
  finalizeTeam,
} from "~/feature/create-teams/services/team-api";

const TeamCreationPage = () => {
  const navigate = useNavigate();
  const { user, isLoading: isUserLoading, isAuthenticated } = useUser();

  // Redirect ke login jika tidak terautentikasi
  useEffect(() => {
    if (!isUserLoading && !isAuthenticated) {
      navigate("/login");
    }
  }, [isUserLoading, isAuthenticated, navigate]);

  // State untuk tim
  const [team, setTeam] = useState<Team | null>(null);

  // State untuk loading
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isCreatingTeam, setIsCreatingTeam] = useState(false);

  // State untuk permintaan gabung dan ajakan
  const [joinRequests, setJoinRequests] = useState<Member[]>([]);
  const [inviteRequests, setInviteRequests] = useState<Member[]>([]);

  // State untuk pending invitations (undangan yang sudah kita kirim)
  const [pendingInvites, setPendingInvites] = useState<Member[]>([]);

  // State untuk copy kode tim
  const [copiedCode, setCopiedCode] = useState(false);

  // State untuk menandai tim baru dibuat (untuk highlight/animation)
  const [isNewlyCreated, setIsNewlyCreated] = useState(false);

  // State untuk delete team dialog
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteReason, setDeleteReason] = useState<
    "join_other_team" | "manual_delete"
  >("manual_delete");
  const [isDeletingTeam, setIsDeletingTeam] = useState(false);

  // State untuk menyimpan action yang ditunda setelah delete team
  const [pendingActionAfterDelete, setPendingActionAfterDelete] = useState<{
    type: string;
    memberId?: string;
    memberName?: string;
    teamCode?: string;
  } | null>(null);

  // State untuk dialogs
  const [showJoinDialog, setShowJoinDialog] = useState(false);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [showConfirmNext, setShowConfirmNext] = useState(false);
  const [showTeamCodeDialog, setShowTeamCodeDialog] = useState(false);
  const [newTeamCode, setNewTeamCode] = useState<string>("");
  const [confirmAction, setConfirmAction] = useState<{
    type: string;
    memberId?: string;
    memberName?: string;
  } | null>(null);

  // State untuk dialog sukses join
  const [showJoinSuccessDialog, setShowJoinSuccessDialog] = useState(false);
  const [joinSuccess, setJoinSuccess] = useState<{
    teamCode: string;
    leaderName?: string;
    leaderNim?: string;
  } | null>(null);

  // Load teams and invitations on mount (only when user is authenticated)
  useEffect(() => {
    if (!isUserLoading && isAuthenticated && user) {
      loadMyTeams();
      loadMyInvitations();
    }
  }, [isUserLoading, isAuthenticated, user]);

  // ⏱️ Optimized: Timeout constant
  const LOAD_TIMEOUT_MS = 5000; // 5 detik timeout

  // Fungsi untuk load teams dari backend - OPTIMIZED dengan timeout
  const loadMyTeams = async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      console.log("📥 Loading teams...");
      const startTime = Date.now();

      // Create timeout promise untuk prevent infinite loading
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => {
          reject(
            new Error(
              `Loading took too long (>${LOAD_TIMEOUT_MS / 1000}s). Backend may be slow.`,
            ),
          );
        }, LOAD_TIMEOUT_MS),
      );

      // Race antara actual request dan timeout
      const response = await Promise.race([getMyTeams(), timeoutPromise]);

      const loadTime = Date.now() - startTime;
      console.log(`✅ Teams loaded in ${loadTime}ms`);

      // Debug: Log response structure
      console.log("📋 API Response Details:", {
        success: response.success,
        hasData: !!response.data,
        dataType: typeof response.data,
        dataLength: Array.isArray(response.data) ? response.data.length : "N/A",
        rawResponse: response,
      });

      if (response.success && response.data && response.data.length > 0) {
        // Get the first team (user should only have one active team)
        const teamData = response.data[0];

        // Ensure members array exists
        let members = Array.isArray(teamData.members) ? teamData.members : [];

        console.log("🔍 Raw Team Data from Backend:", {
          teamId: teamData.id,
          teamCode: teamData.code,
          rawMembers: members.map((m) => ({
            id: m.id,
            userId: m.user?.id,
            userName: m.user?.name,
            status: m.status,
            role: m.role,
          })),
        });

        // WORKAROUND: If backend members array is too small or missing some members,
        // try fetching from /api/teams/:teamId/members endpoint to get complete list
        // This handles cases where backend my-teams endpoint is incomplete
        if (members.length < 3) {
          // If less than max members, try to get complete list
          try {
            console.log(
              "📡 Fetching complete members list from /api/teams/:teamId/members endpoint...",
            );
            const membersResponse = await getTeamMembers(teamData.id);
            if (
              membersResponse.success &&
              Array.isArray(membersResponse.data) &&
              membersResponse.data.length > members.length
            ) {
              console.log(
                "✅ Got more complete members list from team endpoint:",
                membersResponse.data.length,
                "members",
              );
              members = membersResponse.data;
            }
          } catch (err) {
            console.log(
              "⚠️ Could not fetch from team endpoint, using response from my-teams:",
              err instanceof Error ? err.message : "Unknown error",
            );
          }
        }

        // Optimized transformation
        // Filter accepted members for team.members display
        const acceptedMembers = members.filter((m) => m.status === "ACCEPTED");

        const transformedTeam: Team = {
          id: teamData.id,
          name: teamData.name || "",
          code: teamData.code || "",
          leaderId:
            members.find((m) => m.role === "KETUA")?.user?.id || user?.id || "",
          isLeader: teamData.isLeader ?? false, // ✅ Use isLeader flag from backend
          status: teamData.status,
          members: acceptedMembers
            .map((m) => ({
              id: m.id, // team member id (needed for backend mutations)
              userId: m.user.id,
              name: m.user.name,
              role: m.role === "KETUA" ? "Ketua" : "Anggota",
              isLeader: m.role === "KETUA",
              nim: m.user.nim,
              email: m.user.email,
            }))
            .sort((a, b) => {
              // Sort: leader first, then by name
              if (a.isLeader) return -1;
              if (b.isLeader) return 1;
              return a.name.localeCompare(b.name);
            }),
          maxMembers: 3,
        };

        console.log("📊 Member Filtering Details:", {
          totalMembers: members.length,
          acceptedCount: acceptedMembers.length,
          acceptedMembers: acceptedMembers.map((m) => ({
            name: m.user.name,
            role: m.role,
            status: m.status,
          })),
          rejectedCount: members.filter((m) => m.status === "REJECTED").length,
          pendingCount: members.filter((m) => m.status === "PENDING").length,
        });

        // Jika tidak ada members yang ACCEPTED, tambahkan current user sebagai leader
        if (transformedTeam.members.length === 0 && user) {
          transformedTeam.members.push({
            id: user.id,
            userId: user.id,
            name: user.nama,
            role: "Ketua",
            isLeader: true,
            nim: user.nim || "",
            email: user.email,
          });
        }

        setTeam(transformedTeam);

        // Debug: Log team members
        console.log("👥 Team Members Loaded:", {
          teamId: transformedTeam.id,
          teamCode: transformedTeam.code,
          memberCount: transformedTeam.members.length,
          members: transformedTeam.members.map((m) => ({
            id: m.id,
            name: m.name,
            role: m.role,
            nim: m.nim,
          })),
        });

        // Split PENDING members for leader view:
        // - pendingInvites: undangan yang dikirim oleh ketua (invitedBy = leaderId)
        // - joinRequests: permintaan gabung masuk dari orang lain (invitedBy != leaderId)
        const pendingMembers = members.filter((m) => m.status === "PENDING");

        const pendingInvitesList = pendingMembers
          .filter((m) => m.invitedBy === teamData.leaderId)
          .map((m) => ({
            id: m.id, // ✅ memberId
            userId: m.user.id,
            name: m.user.name,
            role: "Mahasiswa",
            nim: m.user.nim,
            email: m.user.email,
            status: m.status,
          }));

        const incomingJoinRequests = pendingMembers
          .filter((m) => m.invitedBy !== teamData.leaderId)
          .map((m) => ({
            id: m.id,
            userId: m.user.id,
            name: m.user.name,
            role: "Permintaan Gabung",
            nim: m.user.nim,
            email: m.user.email,
            status: m.status,
          }));

        console.log("📤 Pending Invites (Sent):", {
          total: members.length,
          pendingCount: pendingInvitesList.length,
          allStatuses: members.map((m) => ({
            memberId: m.id, // ✅ ID ini yang akan dipakai untuk cancel
            userId: m.user.id,
            name: m.user.name,
            status: m.status,
          })),
          pendingInvites: pendingInvitesList,
          joinRequests: incomingJoinRequests,
        });

        setPendingInvites(pendingInvitesList);

        // Untuk ketua tim, tampilkan permintaan gabung yang masuk dengan tombol terima/tolak
        if (teamData.isLeader) {
          setJoinRequests(incomingJoinRequests);
        }
      } else {
        // Response kosong atau error
        console.log("⚠️ No teams found in response:", {
          success: response.success,
          dataEmpty: !response.data || response.data.length === 0,
          dataLength: Array.isArray(response.data)
            ? response.data.length
            : "N/A",
          message: response.message || "No message",
        });

        // FALLBACK: Try to get team info from my-invitations jika user adalah anggota
        // yang sudah menerima undangan
        console.log(
          "🔄 Trying fallback: fetching my-invitations to find accepted team...",
        );
        try {
          const invitationsResponse = await getMyInvitations();
          console.log("📨 My Invitations Response:", {
            success: invitationsResponse.success,
            message: invitationsResponse.message,
            dataType: typeof invitationsResponse.data,
            isArray: Array.isArray(invitationsResponse.data),
            dataLength: Array.isArray(invitationsResponse.data)
              ? invitationsResponse.data.length
              : 0,
            rawData: invitationsResponse.data,
          });

          // Cari invitasi dengan status ACCEPTED
          if (
            invitationsResponse.success &&
            Array.isArray(invitationsResponse.data)
          ) {
            const allInvitations = invitationsResponse.data;
            console.log("📋 All invitations status breakdown:", {
              total: allInvitations.length,
              byStatus: {
                PENDING: allInvitations.filter((i) => i.status === "PENDING")
                  .length,
                ACCEPTED: allInvitations.filter((i) => i.status === "ACCEPTED")
                  .length,
                REJECTED: allInvitations.filter((i) => i.status === "REJECTED")
                  .length,
              },
              eachInvitation: allInvitations.map((inv) => ({
                id: inv.id,
                teamId: inv.teamId,
                role: inv.role,
                status: inv.status,
                keys: Object.keys(inv),
              })),
            });

            const acceptedInvitations = allInvitations.filter(
              (inv) => inv.status === "ACCEPTED",
            );

            if (acceptedInvitations.length > 0) {
              // Get first accepted invitation - ini adalah tim user sebagai anggota
              const firstAccepted = acceptedInvitations[0];

              console.log("✅ Found accepted invitation! Team info:", {
                teamId: firstAccepted.teamId,
                userId: firstAccepted.userId,
                role: firstAccepted.role,
                status: firstAccepted.status,
                allKeys: Object.keys(firstAccepted),
              });

              // Fetch complete team data using the team ID dari invitation
              if (firstAccepted.teamId) {
                try {
                  const teamMembers = await getTeamMembers(
                    firstAccepted.teamId,
                  );
                  console.log("🔎 Team Members Response:", {
                    success: teamMembers.success,
                    message: teamMembers.message,
                    dataType: typeof teamMembers.data,
                    isArray: Array.isArray(teamMembers.data),
                    dataLength: Array.isArray(teamMembers.data)
                      ? teamMembers.data.length
                      : 0,
                    rawData: teamMembers.data,
                  });

                  if (teamMembers.success && Array.isArray(teamMembers.data)) {
                    console.log(
                      "✅ Got team members from /api/teams/:teamId/members:",
                      {
                        teamId: firstAccepted.teamId,
                        memberCount: teamMembers.data.length,
                        members: teamMembers.data.map((m) => ({
                          id: m.id,
                          userId: m.user?.id,
                          userName: m.user?.name,
                          role: m.role,
                          status: m.status,
                        })),
                      },
                    );

                    // Build team object dari members data
                    const members = teamMembers.data;
                    const acceptedMembers = members.filter(
                      (m) => m.status === "ACCEPTED",
                    );

                    console.log("📊 Accepted Members from Team:", {
                      total: members.length,
                      accepted: acceptedMembers.length,
                      breakdown: acceptedMembers.map((m) => ({
                        name: m.user?.name,
                        role: m.role,
                      })),
                    });

                    const transformedTeam: Team = {
                      id: firstAccepted.teamId,
                      name: "Tim Kerja Praktik",
                      code: "", // Extract dari members jika tersedia
                      leaderId:
                        members.find((m) => m.role === "KETUA")?.user?.id || "",
                      isLeader: false, // ✅ User is member, not leader (from invitations)
                      status: "PENDING",
                      members: acceptedMembers
                        .map((m) => ({
                          id: m.id,
                          userId: m.user.id,
                          name: m.user.name,
                          role: m.role === "KETUA" ? "Ketua" : "Anggota",
                          isLeader: m.role === "KETUA",
                          nim: m.user.nim,
                          email: m.user.email,
                        }))
                        .sort((a, b) => {
                          if (a.isLeader) return -1;
                          if (b.isLeader) return 1;
                          return a.name.localeCompare(b.name);
                        }),
                      maxMembers: 3,
                    };

                    console.log("✅ Team constructed from fallback:", {
                      teamId: transformedTeam.id,
                      memberCount: transformedTeam.members.length,
                      members: transformedTeam.members.map((m) => ({
                        name: m.name,
                        role: m.role,
                        isLeader: m.isLeader,
                      })),
                    });

                    setTeam(transformedTeam);
                    setPendingInvites([]);
                    return;
                  } else {
                    console.log(
                      "❌ Team members response not successful or not array",
                    );
                  }
                } catch (teamErr) {
                  console.error("❌ Error fetching team members:", {
                    error:
                      teamErr instanceof Error
                        ? teamErr.message
                        : "Unknown error",
                    teamId: firstAccepted.teamId,
                  });
                }
              }
            } else {
              console.log(
                "⚠️ No accepted invitations found. Only found these statuses:",
                allInvitations.map((i) => i.status),
              );
            }
          }
        } catch (invErr) {
          console.error(
            "❌ Error fetching my-invitations:",
            invErr instanceof Error ? invErr.message : "Unknown error",
          );
        }

        // Jika semua fallback gagal, set team to null
        setTeam(null);
        setPendingInvites([]);
      }
    } catch (error) {
      console.error("❌ Error loading teams:", error);

      const errorMsg = error instanceof Error ? error.message : "Unknown error";
      setLoadError(errorMsg);

      if (errorMsg.includes("took too long")) {
        // Timeout error - show helpful message
        console.warn(
          "⚠️ PERFORMANCE ISSUE: Backend response is slow (>5s). Possible causes:\n" +
            "1. Database query not optimized\n" +
            "2. Network latency too high\n" +
            "3. Server resources limited",
        );
      } else if (
        errorMsg.includes("userId") ||
        errorMsg.includes("undefined")
      ) {
        console.error("❌ BACKEND ERROR: Cannot read userId from JWT token");
        alert(
          "Backend error: Cannot read user info from token.\n" +
            "Please check backend logs and fix JWT handling.",
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Fungsi untuk membuat tim baru - INTEGRATED WITH BACKEND
  // Database TEAMS hanya punya: id, code, leader_id, status
  // Semua field di-generate otomatis oleh backend
  const handleCreateTeam = async () => {
    if (!user || !user.id) {
      alert(
        "❌ Error: User data tidak tersedia\n\nSilakan logout dan login kembali.",
      );
      navigate("/login");
      return;
    }

    setIsCreatingTeam(true);
    try {
      // Debug: Log user dan token sebelum request
      console.log("=== CREATE TEAM DEBUG ===");
      console.log("User dari context:", user);
      console.log("Token:", localStorage.getItem("auth_token"));

      // POST /teams dengan body kosong
      // Backend akan auto-generate: id, code, leader_id (dari JWT), status (PENDING)
      const response = await createTeamApi();

      // Debug: Log full response
      console.log("Create Team Response:", response);
      console.log("=== END DEBUG ===");

      if (response.success && response.data) {
        // Simpan kode tim yang baru dibuat
        setNewTeamCode(response.data.code);

        // Set flag bahwa ini tim yang baru dibuat
        setIsNewlyCreated(true);

        // Tampilkan dialog dengan kode tim
        setShowTeamCodeDialog(true);

        // Reload teams to get updated data
        await loadMyTeams();

        // Reset flag setelah 5 detik (untuk animation/highlight)
        setTimeout(() => {
          setIsNewlyCreated(false);
        }, 5000);
      } else {
        console.error("Create team failed:", {
          success: response.success,
          message: response.message,
          data: response.data,
          fullResponse: response,
        });

        // Error message yang lebih detail
        const errorMsg = response.message || "Unknown error";

        // Check for specific error types
        if (
          errorMsg.includes("Empty response") ||
          errorMsg.includes("Invalid JSON")
        ) {
          alert(
            `❌ BACKEND ERROR: Server tidak mengembalikan response yang valid\n\n` +
              `Pesan: ${errorMsg}\n\n` +
              `KEMUNGKINAN PENYEBAB:\n` +
              `1. Backend crash saat membuat tim (error 500)\n` +
              `2. Error saat set field 'invited_by' untuk team leader\n` +
              `3. Database constraint violation\n\n` +
              `SOLUSI BACKEND:\n` +
              `Periksa file BACKEND_FIX_CREATE_TEAM_ERROR.md untuk fix lengkap!\n\n` +
              `Detail error ada di console (F12).`,
          );
        } else if (
          errorMsg.includes("userId") ||
          errorMsg.includes("undefined")
        ) {
          alert(
            `❌ ERROR BACKEND: JWT Token Issue\n\n` +
              `Pesan: ${errorMsg}\n\n` +
              `SOLUSI:\n` +
              `Backend tidak dapat membaca userId dari JWT token.\n` +
              `Silakan perbaiki backend sesuai instruksi yang diberikan.\n\n` +
              `Detail error ada di console (F12).`,
          );
        } else {
          alert(
            `❌ Gagal membuat tim\n\nPesan: ${errorMsg}\n\nCek console untuk detail.`,
          );
        }
      }
    } catch (error) {
      console.error("Error creating team:", error);
      alert(
        `❌ Terjadi kesalahan saat membuat tim\n\n` +
          `Error: ${error}\n\n` +
          `Kemungkinan:\n` +
          `1. Backend tidak dapat membaca JWT token\n` +
          `2. Koneksi ke backend bermasalah\n` +
          `3. Backend error (cek logs backend)`,
      );
    } finally {
      setIsCreatingTeam(false);
    }
  };

  // Fungsi untuk gabung tim
  const handleJoinTeam = async (teamCode: string) => {
    const code = teamCode.trim();
    if (!code) {
      alert("Kode tim tidak boleh kosong");
      return;
    }

    // Jika user sudah memiliki tim, hapus tim lama terlebih dahulu sebelum join
    if (team && team.id) {
      setPendingActionAfterDelete({
        type: "join-team",
        memberName: code,
        teamCode: code,
      });
      setShowDeleteDialog(true);
      setDeleteReason("join_other_team");
      return;
    }

    try {
      setIsLoading(true);
      console.log("🚀 Sending join team request", { teamCode: code });

      const response = await joinTeamApi(code);

      console.log("📨 Join team response", response);

      if (response.success) {
        // Simpan info untuk dialog sukses
        const teamInfo = response.data?.team;
        setJoinSuccess({
          teamCode: teamInfo?.code || response.data?.teamCode || code,
          leaderName: teamInfo?.leaderName,
          leaderNim: teamInfo?.leaderNim,
        });
        setShowJoinSuccessDialog(true);

        // Tutup dialog input dan refresh data
        setShowJoinDialog(false);
        await loadMyTeams();
        await loadMyInvitations();
      } else {
        const errorMsg =
          response.message || "Gagal mengirim permintaan gabung tim";
        alert(`❌ ${errorMsg}`);
      }
    } catch (error) {
      console.error("❌ Error joining team:", error);
      alert(
        `❌ Terjadi kesalahan saat mengirim permintaan gabung tim.\n\n` +
          `${error instanceof Error ? error.message : String(error)}`,
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Fungsi terima anggota dari permintaan gabung
  const handleAcceptJoinRequest = (memberId: string) => {
    const member = joinRequests.find((m) => m.id === memberId);
    if (!member || !team) return;

    setConfirmAction({
      type: "accept-join",
      memberId,
      memberName: member.name,
    });
  };

  // Fungsi tolak anggota dari permintaan gabung
  const handleRejectJoinRequest = (memberId: string) => {
    const member = joinRequests.find((m) => m.id === memberId);
    if (!member) return;

    setConfirmAction({
      type: "reject-join",
      memberId,
      memberName: member.name,
    });
  };

  // Fungsi untuk load invitations yang diterima
  const loadMyInvitations = async () => {
    try {
      console.log("📩 Loading my invitations...");
      const response = await getMyInvitations();

      console.log("📩 My Invitations Response:", {
        success: response.success,
        dataLength: response.data?.length || 0,
        rawData: response.data,
      });

      // 🔍 DEBUG: Show EXACT backend response structure
      if (response.data && response.data.length > 0) {
        console.log("🔍 BACKEND RESPONSE STRUCTURE (First invitation):");
        console.log(JSON.stringify(response.data[0], null, 2));
      }

      if (response.success && response.data) {
        // Transform data untuk display
        const pendingAll = response.data.filter(
          (inv) => inv.status === "PENDING",
        );

        // Split between invitations received vs join requests sent by me
        const isJoinSentByMe = (inv: any) => {
          // prefer invitedBy; fallback to inviter.id
          return inv.invitedBy === user?.id || inv.inviter?.id === user?.id;
        };

        const invitationsReceivedRaw = pendingAll.filter(
          (inv) => !isJoinSentByMe(inv),
        );
        const joinRequestsSentRaw = pendingAll.filter((inv) =>
          isJoinSentByMe(inv),
        );

        const invitations = invitationsReceivedRaw.map((inv) => {
          // Debug logging
          console.log("🔍 Invitation data:", {
            id: inv.id,
            hasInviter: !!inv.inviter,
            inviterName: inv.inviter?.name,
            inviterNim: inv.inviter?.nim,
            hasUser: !!inv.user,
            userName: inv.user?.name,
            hasTeam: !!inv.team,
            teamCode: inv.team?.code,
          });

          // Get inviter info (person who invited us)
          const inviterName = inv.inviter?.name;
          const inviterNim = inv.inviter?.nim;
          const teamCode = inv.team?.code;

          // Fallback untuk debug
          if (!inviterName) {
            console.warn(
              "⚠️ WARNING: Inviter name not found in response!",
              "Backend should return inv.inviter.name",
            );
          }

          return {
            id: inv.id, // member ID untuk respond (string utuh)
            memberId: inv.id, // Simpan member ID asli (string utuh)
            name:
              inviterName && teamCode
                ? `${inviterName} (${teamCode})`
                : teamCode
                  ? `Unknown (${teamCode})`
                  : "Unknown (Team)",
            role: "Undangan dari Tim",
            nim: inviterNim || "",
            email: inv.inviter?.email || inv.user?.email || "",
            teamId: inv.teamId,
            invitedAt: inv.invitedAt,
          };
        });

        // Map join requests sent by current user to display under 'Daftar Permintaan Gabung Tim'
        const myJoinRequests = joinRequestsSentRaw.map((inv) => {
          console.log("🔍 Join request sent by me - raw data:", {
            id: inv.id,
            teamId: inv.teamId,
            invitedBy: inv.invitedBy,
            hasTeam: !!inv.team,
            teamData: inv.team,
            hasInviter: !!inv.inviter,
            inviterData: inv.inviter,
            hasUser: !!inv.user,
            userData: inv.user,
          });

          // Get team leader info from backend response
          // Backend should provide team.leaderName and team.leaderNim
          const leaderName = inv.team?.leaderName || "Ketua Tim";
          const leaderNim = inv.team?.leaderNim || "";
          const teamCode = inv.team?.code || "";

          console.log("📋 Parsed leader info:", {
            leaderName,
            leaderNim,
            teamCode,
          });

          return {
            id: inv.id,
            memberId: inv.id,
            name: teamCode ? `${leaderName} (${teamCode})` : leaderName,
            role: "Permintaan Gabung",
            nim: leaderNim,
            email: "", // Leader email not needed for display
            status: inv.status,
            teamId: inv.teamId,
            invitedAt: inv.invitedAt,
          } as Member;
        });

        console.log(`✅ Found ${invitations.length} pending invitations:`, {
          count: invitations.length,
          details: invitations.map((inv) => ({
            name: inv.name,
            role: inv.role,
            teamId: inv.teamId,
          })),
        });

        console.log(
          `✅ Found ${myJoinRequests.length} join requests sent by me:`,
          {
            count: myJoinRequests.length,
            details: myJoinRequests.map((req) => ({
              name: req.name,
              role: req.role,
              nim: req.nim,
              teamId: req.teamId,
            })),
          },
        );

        setInviteRequests(invitations);
        // If user is NOT a leader, show the requests they sent under 'Daftar Permintaan Gabung Tim'
        if (!team || !team.isLeader) {
          setJoinRequests(myJoinRequests);
          console.log(
            "📌 Setting joinRequests for non-leader user:",
            myJoinRequests.length,
            "items",
          );
        }
      } else {
        console.warn("⚠️ No invitations found or request failed", {
          success: response.success,
          message: response.message,
          hasData: !!response.data,
          dataLength: response.data?.length,
        });
      }
    } catch (error) {
      console.error("❌ Error loading invitations:", error);
      console.error(
        "Stack:",
        error instanceof Error ? error.stack : "No stack",
      );
    }
  };

  // Fungsi terima ajakan tim
  const handleAcceptInvite = async (memberId: string) => {
    console.log("🔄 Accept invite clicked for memberId:", memberId);

    const invitation = inviteRequests.find((m) => m.id === memberId);
    if (!invitation) {
      console.error("❌ Invitation not found in state:", memberId);
      alert("❌ Data undangan tidak ditemukan. Silakan refresh halaman.");
      return;
    }

    console.log("📝 Invitation details:", {
      memberId: invitation.memberId,
      name: invitation.name,
      teamId: invitation.teamId,
    });

    // Jika user sudah memiliki tim
    if (team && team.id) {
      // Kasus 1: User adalah ketua -> harus bubarkan tim terlebih dahulu (flow lama)
      if (team.isLeader) {
        console.log("⚠️ User is leader, will delete old team before accepting invite");
        setPendingActionAfterDelete({
          type: "accept-invite",
          memberId,
          memberName: invitation.name,
        });
        setShowDeleteDialog(true);
        setDeleteReason("join_other_team");
        setConfirmAction(null); // Clear konfirmasi dialog
        return;
      }

      // Kasus 2: User adalah anggota (non-leader) -> auto keluar dari tim lama, lalu accept undangan baru
      try {
        setIsLoading(true);
        console.log("🚪 User is member, leaving current team before accepting new invite", {
          currentTeamId: team.id,
          newInvitationTeamId: invitation.teamId,
        });

        const { leaveTeam } = await import("~/lib/services/team.service");
        const leaveResponse = await leaveTeam(team.id);

        if (!leaveResponse.success) {
          const errorMsg = leaveResponse.message || "Unknown error";
          console.error("❌ Leave team before accept failed:", errorMsg);
          alert(
            `❌ Gagal keluar dari tim lama:\n\n${errorMsg}\n\nSilakan coba lagi atau hubungi admin jika masalah berlanjut.`,
          );
          setIsLoading(false);
          return;
        }

        console.log("✅ Left old team, proceeding to accept new invitation");

        const response = await respondToInvitation(memberId, true);

        console.log("📨 Accept response after leaving old team:", {
          success: response.success,
          message: response.message,
        });

        if (response.success) {
          setInviteRequests(inviteRequests.filter((m) => m.id !== memberId));
          const teamName = invitation?.name || "Tim";
          alert(`✅ Berhasil bergabung dengan tim ${teamName}!`);
          // Refresh data
          await loadMyTeams();
          await loadMyInvitations();
        } else {
          const errorMsg = response.message || "Unknown error";
          console.error("❌ Accept invitation failed after leaving old team:", errorMsg);
          alert(`❌ Gagal menerima undangan: ${errorMsg}`);
        }
      } catch (error) {
        console.error("❌ Error leaving old team or accepting invite:", error);
        alert(
          `❌ Terjadi kesalahan saat memproses undangan baru:\n\n${error instanceof Error ? error.message : String(error)}`,
        );
      } finally {
        setIsLoading(false);
      }
    } else {
      // Jika tidak ada tim lama, langsung proses accept
      try {
        console.log("🚀 Sending accept invitation request...");
        console.log("📤 Request details:", {
          memberId,
          endpoint: `/api/teams/invitations/${memberId}/respond`,
          body: { accept: true },
        });

        const response = await respondToInvitation(memberId, true);

        console.log("📨 Accept response:", {
          success: response.success,
          message: response.message,
          hasData: !!response.data,
        });

        if (response.success) {
          // Remove dari state immediately
          setInviteRequests(inviteRequests.filter((m) => m.id !== memberId));
          const teamName = invitation?.name || "Tim";
          alert(`✅ Berhasil bergabung dengan tim ${teamName}!`);
          // Reload teams dan invitations
          await loadMyTeams();
          await loadMyInvitations();
        } else {
          const errorMsg = response.message || "Unknown error";
          console.error("❌ Accept invitation failed:", errorMsg);

          // Better error message
          if (
            errorMsg.includes("not found") ||
            errorMsg.includes("already responded")
          ) {
            alert(
              `❌ Undangan tidak valid!\n\n` +
                `Kemungkinan:\n` +
                `1. Undangan sudah Anda tanggapi sebelumnya\n` +
                `2. Data di server sudah terhapus\n` +
                `3. Silakan refresh halaman dan coba lagi`,
            );
          } else if (
            errorMsg.includes("Cannot read") ||
            errorMsg.includes("undefined")
          ) {
            alert(
              `❌ Server error saat memproses undangan\n\n` +
                `Error: ${errorMsg}\n\n` +
                `Silakan hubungi administrator jika masalah berlanjut`,
            );
            console.error("🔧 Backend error details:", {
              message: response.message,
              data: response.data,
              fullResponse: response,
            });
          } else {
            alert(`❌ Gagal menerima undangan: ${errorMsg}`);
          }
        }
      } catch (error) {
        console.error("❌ Error accepting invitation:", error);
        console.error(
          "Stack:",
          error instanceof Error ? error.stack : "No stack",
        );
        alert(
          `❌ Terjadi kesalahan saat menerima undangan:\n\n${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }
  };

  // Fungsi tolak ajakan tim
  const handleRejectInvite = async (memberId: string) => {
    console.log("🔄 Reject invite clicked for memberId:", memberId);

    const invitation = inviteRequests.find((m) => m.id === memberId);
    if (!invitation) {
      console.error("❌ Invitation not found in state:", memberId);
      return;
    }

    const invitationName = invitation?.name || "Tim";
    if (!confirm(`Tolak undangan dari ${invitationName}?`)) return;

    try {
      console.log("🚀 Sending reject invitation request...");
      const response = await respondToInvitation(memberId, false);

      console.log("📨 Reject response:", {
        success: response.success,
        message: response.message,
      });

      if (response.success) {
        // Remove dari state immediately
        setInviteRequests(inviteRequests.filter((m) => m.id !== memberId));
        alert(`✅ Undangan dari ${invitationName} berhasil ditolak`);
        // Reload invitations untuk sync dengan backend
        await loadMyInvitations();
      } else {
        const errorMsg = response.message || "Unknown error";
        console.error("❌ Reject invitation failed:", errorMsg);

        if (
          errorMsg.includes("not found") ||
          errorMsg.includes("already responded")
        ) {
          alert(
            `❌ Undangan tidak valid!\n\n` +
              `Kemungkinan:\n` +
              `1. Undangan sudah Anda tanggapi sebelumnya\n` +
              `2. Data di server sudah terhapus\n` +
              `3. Silakan refresh halaman dan coba lagi`,
          );
        } else if (
          errorMsg.includes("Cannot read") ||
          errorMsg.includes("undefined")
        ) {
          alert(
            `❌ Server error saat memproses undangan\n\n` +
              `Error: ${errorMsg}\n\n` +
              `Silakan hubungi administrator jika masalah berlanjut`,
          );
          console.error("🔧 Backend error details:", {
            message: response.message,
            data: response.data,
            fullResponse: response,
          });
        } else {
          alert(`❌ Gagal menolak undangan: ${errorMsg}`);
        }
      }
    } catch (error) {
      console.error("Error rejecting invitation:", error);
      alert("❌ Terjadi kesalahan saat menolak undangan");
    }
  };

  // Fungsi keluarkan anggota / keluar dari tim
  const handleRemoveMember = async (memberId: string) => {
    if (!team || !user) return;

    const member = team.members.find((m) => m.id === memberId);
    if (!member || member.isLeader) return;

    // Check apakah user mengeluarkan diri sendiri (anggota keluar) atau ketua mengeluarkan anggota
    const isSelf = member.userId === user.id;

    if (isSelf) {
      // Anggota keluar dari tim
      const confirmLeave = confirm(
        `Apakah Anda yakin ingin keluar dari tim ${team.code}?\n\n` +
          `Anda akan dihapus dari anggota tim ini.`,
      );

      if (!confirmLeave) return;

      setIsLoading(true);
      try {
        console.log("🚪 Leaving team:", team.id);
        const { leaveTeam } = await import("~/lib/services/team.service");
        const response = await leaveTeam(team.id);

        if (response.success) {
          console.log("✅ Successfully left team");
          alert(`✅ Berhasil keluar dari tim ${team.code}`);

          // Clear team state
          setTeam(null);
          setPendingInvites([]);

          // Reload teams
          await loadMyTeams();
          await loadMyInvitations();
        } else {
          const errorMsg = response.message || "Unknown error";
          console.error("❌ Leave team failed:", errorMsg);

          if (errorMsg.includes("leader cannot leave")) {
            alert(
              "❌ Ketua tim tidak bisa keluar dari tim!\n\n" +
                "Silakan bubarkan tim jika ingin menghapus tim ini.",
            );
          } else {
            alert(`❌ Gagal keluar dari tim: ${errorMsg}`);
          }
        }
      } catch (error) {
        console.error("❌ Error leaving team:", error);
        alert(
          `❌ Terjadi kesalahan: ${error instanceof Error ? error.message : "Unknown error"}`,
        );
      } finally {
        setIsLoading(false);
      }
    } else {
      // Ketua mengeluarkan anggota
      setConfirmAction({
        type: "remove",
        memberId: member.userId || memberId, // ✅ Use userId for backend API
        memberName: member.name,
      });
    }
  };

  // Fungsi untuk invite member - INTEGRATED WITH BACKEND
  const handleInviteMember = async (member: {
    id: string;
    name: string;
    nim: string;
    email: string;
  }) => {
    if (!team) {
      alert("Anda harus membuat atau bergabung dengan tim terlebih dahulu!");
      return;
    }

    // Batasi maksimal 3 anggota (termasuk ketua)
    if (team.members.length >= 3) {
      alert("❌ Tim sudah penuh (maksimal 3 anggota)");
      return;
    }

    // Check jika sudah diundang (bandingkan userId)
    if (pendingInvites.some((m) => m.userId === member.id)) {
      alert(`${member.name} sudah diundang sebelumnya!`);
      return;
    }

    // Check jika sudah menjadi anggota di tim YANG SAMA
    if (team.members.some((m) => m.userId === member.id)) {
      alert(`${member.name} sudah menjadi anggota tim ini!`);
      return;
    }

    // Konfirmasi jika mahasiswa sudah punya tim lain
    const confirmMessage =
      `Kirim undangan ke ${member.name}?\n\n` +
      `📌 Catatan: Jika ${member.name} sudah memiliki tim lain, ` +
      `mereka akan otomatis keluar dari tim lama saat menerima undangan ini.`;

    if (!confirm(confirmMessage)) {
      return;
    }

    try {
      const response = await inviteTeamMember(team.id, member.nim);

      if (response.success && response.data) {
        // Tambahkan ke pending invites
        setPendingInvites([
          ...pendingInvites,
          {
            id: member.id, // NOTE: this is userId; will be replaced by backend reload with memberId
            userId: member.id,
            name: member.name,
            role: "Mahasiswa",
            nim: member.nim,
            email: member.email,
          },
        ]);

        alert(
          `✅ Undangan berhasil dikirim ke ${member.name}!\n\n` +
            `Mereka akan menerima notifikasi dan dapat bergabung dengan tim Anda.`,
        );

        // Close invite dialog
        setShowInviteDialog(false);
      } else {
        // Handle specific error messages
        const errorMsg = response.message || "";

        // Check if error is about team leader permission
        if (
          errorMsg.toLowerCase().includes("only team leader") ||
          errorMsg.toLowerCase().includes("team leader can invite")
        ) {
          console.error("❌ Authorization Error:", errorMsg);
          console.error(
            "📌 This should not happen - button should only show for team leaders",
          );

          alert(
            `❌ Hanya Ketua Tim yang dapat mengundang anggota!\n\n` +
              `Sepertinya Anda bukan ketua tim. Button undang anggota seharusnya tidak muncul.\n\n` +
              `💡 Solusi Frontend: Perbaiki kondisi tampilan button "Undang Anggota"`,
          );

          // Reload page to fix inconsistent state
          window.location.reload();
        } else {
          // Show other errors normally
          alert(`❌ Gagal mengirim undangan: ${errorMsg}`);
        }
      }
    } catch (error) {
      console.error("Error inviting member:", error);
      alert("❌ Terjadi kesalahan saat mengirim undangan");
    }
  };

  // Fungsi untuk membatalkan undangan
  const handleCancelInvite = (memberId: string) => {
    const member = pendingInvites.find((m) => m.id === memberId);
    if (!member) return;

    setConfirmAction({
      type: "cancel-invite",
      memberId,
      memberName: member.name,
    });
  };

  // Konfirmasi action
  const executeConfirmAction = async () => {
    if (!confirmAction) return;

    switch (confirmAction.type) {
      case "accept-join": {
        if (!confirmAction.memberId) break;

        // Cegah anggota > 3
        if (team && team.members.length >= 3) {
          alert("❌ Tim sudah penuh (maksimal 3 anggota)");
          break;
        }

        setIsLoading(true);
        try {
          const joinReq = joinRequests.find(
            (m) => m.id === confirmAction.memberId,
          );
          console.log("✅ Accepting join request - DEBUG:", {
            confirmMemberId: confirmAction.memberId,
            foundInList: !!joinReq,
            joinReqData: joinReq,
            allJoinRequests: joinRequests.map((j) => ({
              id: j.id,
              name: j.name,
              status: j.status,
            })),
          });

          const response = await respondToInvitation(
            confirmAction.memberId,
            true,
          );

          console.log("📨 Backend response:", response);

          if (response.success) {
            setJoinRequests(
              joinRequests.filter((m) => m.id !== confirmAction.memberId),
            );
            alert(
              "✅ Permintaan bergabung telah diterima. Anggota ditambahkan ke tim.",
            );
            await loadMyTeams();
            await loadMyInvitations();
          } else {
            alert(
              `❌ Gagal menerima permintaan: ${response.message || "Unknown error"}`,
            );
          }
        } catch (error) {
          console.error("Error accepting join request:", error);
          alert(
            `❌ Terjadi kesalahan saat menerima permintaan: ${error instanceof Error ? error.message : String(error)}`,
          );
        } finally {
          setIsLoading(false);
        }
        break;
      }
      case "reject-join": {
        if (!confirmAction.memberId) break;
        setIsLoading(true);
        try {
          const joinReq = joinRequests.find(
            (m) => m.id === confirmAction.memberId,
          );
          console.log("🚫 Rejecting join request - DEBUG:", {
            confirmMemberId: confirmAction.memberId,
            foundInList: !!joinReq,
            joinReqData: joinReq,
            allJoinRequests: joinRequests.map((j) => ({
              id: j.id,
              name: j.name,
              status: j.status,
            })),
          });

          const response = await respondToInvitation(
            confirmAction.memberId,
            false,
          );

          console.log("📨 Backend response:", response);

          if (response.success) {
            setJoinRequests(
              joinRequests.filter((m) => m.id !== confirmAction.memberId),
            );
            alert(
              `✅ Permintaan bergabung dari ${confirmAction.memberName} ditolak.`,
            );
            await loadMyTeams();
            await loadMyInvitations();
          } else {
            alert(
              `❌ Gagal menolak permintaan: ${response.message || "Unknown error"}`,
            );
          }
        } catch (error) {
          console.error("Error rejecting join request:", error);
          alert(
            `❌ Terjadi kesalahan saat menolak permintaan: ${error instanceof Error ? error.message : String(error)}`,
          );
        } finally {
          setIsLoading(false);
        }
        break;
      }
      case "remove": {
        // ✅ Ketua mengeluarkan anggota - CALL API BACKEND
        if (!team || !confirmAction.memberId) break;

        setIsLoading(true);
        try {
          console.log("👢 Removing member (userId):", confirmAction.memberId);

          // Import dan call API
          const { removeMember } = await import(
            "~/feature/create-teams/services/team-api"
          );
          // confirmAction.memberId is now userId (not member.id)
          const response = await removeMember(team.id, confirmAction.memberId);

          console.log("Remove member response:", response);

          if (response.success) {
            console.log("✅ Member removed from database");

            // Update local state - filter by userId
            setTeam({
              ...team,
              members: team.members.filter(
                (m) => m.userId !== confirmAction.memberId,
              ),
            });

            alert(
              `✅ ${confirmAction.memberName} berhasil dikeluarkan dari tim.`,
            );

            // Reload team data to ensure sync with backend
            await loadMyTeams();
          } else {
            const errorMsg = response.message || "Unknown error";
            console.error("❌ Remove member failed:", errorMsg);
            alert(`❌ Gagal mengeluarkan anggota: ${errorMsg}`);
          }
        } catch (error) {
          console.error("❌ Error removing member:", error);
          alert(
            `❌ Terjadi kesalahan saat mengeluarkan anggota: ${error instanceof Error ? error.message : "Unknown error"}`,
          );
        } finally {
          setIsLoading(false);
        }
        break;
      }
      case "cancel-invite": {
        setPendingInvites(
          pendingInvites.filter((m) => m.id !== confirmAction.memberId),
        );
        alert(`Undangan ke ${confirmAction.memberName} berhasil dibatalkan.`);
        break;
      }
    }

    setConfirmAction(null);
  };

  // Handle navigasi selanjutnya
  const handleNext = () => {
    if (!team) {
      alert(
        "Anda belum memiliki tim! Silakan buat atau gabung tim terlebih dahulu.",
      );
      return;
    }

    setShowConfirmNext(true);
  };

  const confirmNext = async () => {
    if (!team) {
      alert("Tim tidak ditemukan");
      return;
    }

    try {
      console.log("🔒 Finalizing team...", {
        teamId: team.id,
        teamCode: team.code,
      });
      setIsLoading(true);

      // Call finalize API
      const response = await finalizeTeam(team.id);

      if (response.success) {
        console.log("✅ Team finalized successfully:", response.data);

        // Update local team state
        setTeam((prev) =>
          prev
            ? {
                ...prev,
                status: "FIXED",
              }
            : null,
        );

        alert(
          `✅ Tim ${team.code} sudah final dengan ${team.members.length} anggota!`,
        );

        // Navigate to next step
        setTimeout(() => {
          navigate("/mahasiswa/kp/pengajuan");
        }, 500);
      } else {
        alert(`❌ Gagal finalize tim: ${response.message || "Unknown error"}`);
        console.error("❌ Finalize failed:", response);
      }
    } catch (error) {
      console.error("❌ Error finalizing team:", error);
      alert(
        `❌ Terjadi error: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    } finally {
      setIsLoading(false);
      setShowConfirmNext(false);
    }
  };

  // Handle copy kode tim
  const handleCopyTeamCode = async () => {
    if (!team) return;

    try {
      await navigator.clipboard.writeText(team.code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
      alert("Gagal menyalin kode tim");
    }
  };

  // Handle delete team
  const handleDeleteTeam = async (
    reason: "join_other_team" | "manual_delete" = "manual_delete",
  ) => {
    if (!team) return;

    setDeleteReason(reason);
    setShowDeleteDialog(true);
  };

  // Confirm delete team
  const confirmDeleteTeam = async () => {
    if (!team) return;

    setIsDeletingTeam(true);
    try {
      console.log("🗑️ Deleting team:", team.id, "Reason:", deleteReason);
      const response = await deleteTeamApi(team.id);

      if (response.success) {
        console.log("✅ Team deleted successfully");

        // If accepting new invitation, do it BEFORE clearing state
        if (deleteReason === "join_other_team" && pendingActionAfterDelete) {
          // Auto-accept invitation after delete
          if (
            pendingActionAfterDelete.type === "accept-invite" &&
            pendingActionAfterDelete.memberId
          ) {
            console.log(
              "🔄 Auto-accepting invitation after team delete:",
              pendingActionAfterDelete.memberId,
            );

            try {
              // Wait a bit before accepting to ensure clean state
              await new Promise((resolve) => setTimeout(resolve, 500));

              console.log(
                "🚀 Sending accept invitation for memberId:",
                pendingActionAfterDelete.memberId,
              );
              const acceptResponse = await respondToInvitation(
                pendingActionAfterDelete.memberId,
                true,
              );

              console.log("📨 Accept response:", {
                success: acceptResponse.success,
                message: acceptResponse.message,
              });

              if (acceptResponse.success) {
                console.log("✅ Invitation accepted successfully");
                alert(
                  `✅ Tim lama berhasil dihapus.\n\n` +
                    `Anda sekarang bergabung dengan tim ${pendingActionAfterDelete.memberName}!`,
                );

                // Clear pending action
                setPendingActionAfterDelete(null);
                setShowDeleteDialog(false);

                // NOW clear all state after successful acceptance
                setTeam(null);
                setPendingInvites([]);
                setJoinRequests([]);
                setInviteRequests([]);

                // Reload teams and invitations
                await new Promise((resolve) => setTimeout(resolve, 1000));
                await loadMyTeams();
                await loadMyInvitations();
              } else {
                // Failed to accept - show error and keep trying
                const errorMsg = acceptResponse.message || "Unknown error";
                console.error("❌ Accept invitation failed:", errorMsg);

                // Clear states anyway since old team is deleted
                setTeam(null);
                setPendingInvites([]);
                setJoinRequests([]);
                setInviteRequests([]);

                if (
                  errorMsg.includes("not found") ||
                  errorMsg.includes("already responded")
                ) {
                  alert(
                    `❌ Tim lama berhasil dihapus, namun gagal bergabung dengan tim baru.\n\n` +
                      `Undangan mungkin sudah Anda tanggapi sebelumnya.\n\n` +
                      `Silakan refresh halaman dan coba lagi.`,
                  );
                } else {
                  alert(
                    `❌ Tim lama berhasil dihapus, namun gagal bergabung dengan tim baru.\n\n` +
                      `Error: ${errorMsg}\n\n` +
                      `Silakan refresh halaman dan coba lagi.`,
                  );
                }

                // Reload to ensure state is consistent
                setTimeout(() => {
                  window.location.reload();
                }, 2000);
              }
            } catch (error) {
              console.error("Error accepting invitation after delete:", error);

              // Clear states since old team is deleted
              setTeam(null);
              setPendingInvites([]);
              setJoinRequests([]);
              setInviteRequests([]);

              alert(
                `❌ Tim lama berhasil dihapus, namun terjadi kesalahan saat bergabung dengan tim baru.\n\n` +
                  `${error instanceof Error ? error.message : String(error)}\n\n` +
                  `Silakan refresh halaman dan coba lagi.`,
              );

              setTimeout(() => {
                window.location.reload();
              }, 2000);
            }
          } else if (
            pendingActionAfterDelete.type === "join-team" &&
            pendingActionAfterDelete.teamCode
          ) {
            console.log(
              "🔄 Auto-joining new team after delete:",
              pendingActionAfterDelete.teamCode,
            );

            try {
              // Wait a bit to ensure backend finished deletion
              await new Promise((resolve) => setTimeout(resolve, 500));

              const joinResponse = await joinTeamApi(
                pendingActionAfterDelete.teamCode.trim(),
              );

              console.log("📨 Join response after delete:", joinResponse);

              // Clear local state before reload to avoid stale data
              setTeam(null);
              setPendingInvites([]);
              setJoinRequests([]);
              setInviteRequests([]);

              if (joinResponse.success) {
                const teamInfo = joinResponse.data?.team;
                setJoinSuccess({
                  teamCode:
                    teamInfo?.code ||
                    joinResponse.data?.teamCode ||
                    pendingActionAfterDelete.teamCode,
                  leaderName: teamInfo?.leaderName,
                  leaderNim: teamInfo?.leaderNim,
                });
                setShowJoinSuccessDialog(true);

                setPendingActionAfterDelete(null);
                setShowDeleteDialog(false);

                await new Promise((resolve) => setTimeout(resolve, 1000));
                await loadMyTeams();
                await loadMyInvitations();
              } else {
                const errorMsg =
                  joinResponse.message ||
                  "Gagal mengirim permintaan gabung tim";
                alert(
                  `❌ Tim lama berhasil dihapus, namun gagal mengirim permintaan gabung tim baru.\n\n` +
                    `${errorMsg}\n\n` +
                    `Silakan coba lagi dengan kode tim: ${pendingActionAfterDelete.teamCode}`,
                );

                setPendingActionAfterDelete(null);
                setShowDeleteDialog(false);
              }
            } catch (error) {
              console.error("Error joining new team after delete:", error);

              // Clear state to avoid stale data
              setTeam(null);
              setPendingInvites([]);
              setJoinRequests([]);
              setInviteRequests([]);

              alert(
                `❌ Tim lama berhasil dihapus, namun terjadi kesalahan saat mengirim permintaan gabung tim baru.\n\n` +
                  `${error instanceof Error ? error.message : String(error)}\n\n` +
                  `Silakan coba lagi dengan kode tim: ${pendingActionAfterDelete.teamCode}`,
              );

              setPendingActionAfterDelete(null);
              setShowDeleteDialog(false);
            }
          }
        } else {
          // Manual delete, just clear everything
          console.log("🗑️ Manual team delete, clearing all state");
          setTeam(null);
          setPendingInvites([]);
          setJoinRequests([]);
          setInviteRequests([]);

          alert("✅ Tim berhasil dihapus dari sistem");

          // Close dialog dan reload
          setShowDeleteDialog(false);
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        }
      } else {
        alert(`❌ Gagal menghapus tim: ${response.message}`);
      }
    } catch (error) {
      console.error("Error deleting team:", error);
      alert(
        `❌ Terjadi kesalahan saat menghapus tim: ${error instanceof Error ? error.message : String(error)}`,
      );
    } finally {
      setIsDeletingTeam(false);
    }
  };

  // Helper untuk mendapatkan pesan konfirmasi
  const getConfirmMessage = () => {
    if (!confirmAction) return { title: "", description: "" };

    switch (confirmAction.type) {
      case "accept-join":
        return {
          title: "Terima Anggota Baru",
          description: `Apakah Anda yakin ingin menerima ${confirmAction.memberName} sebagai anggota tim?`,
        };
      case "reject-join":
        return {
          title: "Tolak Permintaan",
          description: `Apakah Anda yakin ingin menolak permintaan dari ${confirmAction.memberName}?`,
        };
      case "accept-invite":
        return {
          title: "Terima Ajakan",
          description: `Apakah Anda yakin ingin menerima ajakan untuk bergabung dengan tim ini?`,
        };
      case "reject-invite":
        return {
          title: "Tolak Ajakan",
          description: `Apakah Anda yakin ingin menolak ajakan dari ${confirmAction.memberName}?`,
        };
      case "remove":
        return {
          title: "Keluarkan Anggota",
          description: `Apakah Anda yakin ingin mengeluarkan ${confirmAction.memberName} dari tim?`,
        };
      case "cancel-invite":
        return {
          title: "Batalkan Undangan",
          description: `Apakah Anda yakin ingin membatalkan undangan ke ${confirmAction.memberName}?`,
        };
      default:
        return { title: "", description: "" };
    }
  };

  const confirmMessage = getConfirmMessage();

  // Show loading jika user context masih loading
  if (isUserLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 mx-auto mb-4 animate-spin text-primary" />
          <p className="text-muted-foreground">Memuat data user...</p>
        </div>
      </div>
    );
  }

  // Jika tidak authenticated, akan di-redirect oleh useEffect
  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <>
      {/* Join Success Dialog */}
      <Dialog
        open={showJoinSuccessDialog}
        onOpenChange={setShowJoinSuccessDialog}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Permintaan Bergabung Terkirim</DialogTitle>
            <DialogDescription>
              {joinSuccess ? (
                <span>
                  Anda berhasil mengirim permintaan bergabung ke tim{" "}
                  <strong>
                    {joinSuccess.leaderName || "(Nama Ketua tidak tersedia)"}
                  </strong>{" "}
                  NIM{" "}
                  <strong>
                    {joinSuccess.leaderNim || "(NIM tidak tersedia)"}
                  </strong>
                  .
                </span>
              ) : (
                <span>Permintaan bergabung berhasil dikirim.</span>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="py-2 text-sm">
            <p className="mb-1">
              Kode Tim:{" "}
              <span className="font-mono font-semibold">
                {joinSuccess?.teamCode}
              </span>
            </p>
            <p className="text-muted-foreground">
              Status: PENDING — menunggu persetujuan ketua tim.
            </p>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowJoinSuccessDialog(false)}>
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* User Info Section */}
      <div className="mb-6 p-4 bg-primary/5 border border-primary/20 rounded-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Crown className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="font-semibold text-foreground">{user.nama}</p>
            <p className="text-sm text-muted-foreground">
              NIM: {user.nim} | {user.prodi}
            </p>
          </div>
        </div>
      </div>

      {/* Team Code Section - Permanent Display */}
      {team && (
        <div className="mb-6 p-4 bg-gradient-to-r from-primary/10 to-primary/5 border-2 border-primary/30 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium mb-1">
                  Kode Tim Anda
                </p>
                <div className="flex items-center gap-2">
                  <p className="text-xl font-bold font-mono text-primary tracking-wide">
                    {team.code}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopyTeamCode}
                    className="h-7 w-7 p-0"
                    title="Salin kode tim"
                  >
                    {copiedCode ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Bagikan kode ini untuk mengundang anggota tim
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isNewlyCreated && (
                <Badge className="bg-green-500 text-white animate-pulse">
                  Baru Dibuat!
                </Badge>
              )}
              {/* Show delete button only if current user is the team leader */}
              {user && team.isLeader && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteTeam("manual_delete")}
                  disabled={isDeletingTeam}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  title="Hapus tim"
                >
                  {isDeletingTeam ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Halaman Pembuatan Tim
        </h1>
        <p className="text-muted-foreground">
          Buat tim Anda untuk melaksanakan Kerja Praktik
        </p>
      </div>

      {isLoading ? (
        <Card className="mb-8">
          <CardContent className="py-12 text-center">
            <Loader2 className="h-16 w-16 mx-auto text-blue-500 mb-4 animate-spin" />
            <p className="text-muted-foreground font-medium">
              🔄 Memuat data tim Anda...
            </p>
            <p className="text-xs text-muted-foreground/70 mt-3">
              Mengambil data dari server. Harap tunggu beberapa saat...
            </p>
          </CardContent>
        </Card>
      ) : loadError && !team ? (
        <Card className="mb-8 border-red-200 bg-red-50">
          <CardContent className="py-12 text-center">
            <AlertCircle className="h-16 w-16 mx-auto text-red-500 mb-4" />
            <p className="text-foreground font-semibold mb-2">
              ⚠️ Gagal Memuat Data
            </p>
            <p className="text-sm text-red-700 mb-4">{loadError}</p>
            <div className="flex justify-center gap-3 flex-wrap">
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
              >
                🔄 Refresh Halaman
              </Button>
              <Button
                onClick={() => setShowJoinDialog(true)}
                variant="secondary"
              >
                Gabung Tim Terlebih Dahulu
              </Button>
            </div>
            <p className="text-xs text-muted-foreground/70 mt-4">
              💡 Tip: Buka F12 Console untuk melihat error detail
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Undang Anggota Button - Show ONLY for team leaders */}
          {team && user && team.isLeader && (
            <div className="flex justify-end items-center mb-8">
              <Button
                onClick={() => setShowInviteDialog(true)}
                disabled={isCreatingTeam}
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Undang Anggota
              </Button>
            </div>
          )}

          {/* Team Info Alert - Show only if user has team */}
          {team && (
            <Alert className="mb-8 border-primary/20 bg-primary/5">
              <Info className="h-5 w-5 text-primary" />
              <AlertDescription className="text-foreground">
                <div className="flex items-center gap-4">
                  <span>
                    Jumlah Anggota Tim:{" "}
                    <Badge variant="secondary" className="ml-1">
                      {team.members.length}
                    </Badge>
                  </span>
                  {team.isLeader ? (
                    <span className="flex items-center gap-1">
                      <Crown className="h-4 w-4 text-yellow-500" />
                      Anda adalah Ketua tim
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4 text-blue-500" />
                      Anda adalah Anggota tim
                    </span>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Member Lists */}
          <div className="space-y-6">
            {/* Daftar Anggota - Different content based on team status */}
            {team ? (
              <MemberList
                title="Daftar Anggota"
                members={team.members}
                onRemove={handleRemoveMember}
                isLeader={team.isLeader}
                currentUserId={user?.id}
              />
            ) : (
              <Card>
                <CardContent className="py-8">
                  <h3 className="text-lg font-semibold mb-2">Daftar Anggota</h3>
                  <div className="text-center py-8">
                    <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-6">
                      Anda belum memiliki tim. Silakan buat tim baru atau gabung
                      dengan tim yang sudah ada.
                    </p>
                    <div className="flex justify-center gap-4">
                      <Button
                        onClick={handleCreateTeam}
                        disabled={isCreatingTeam}
                      >
                        {isCreatingTeam ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Membuat Tim...
                          </>
                        ) : (
                          <>
                            <UserPlus className="mr-2 h-4 w-4" />
                            Buat Tim Baru
                          </>
                        )}
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => setShowJoinDialog(true)}
                        disabled={isCreatingTeam}
                      >
                        <Users className="mr-2 h-4 w-4" />
                        Gabung Tim
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Sent Invitations Component - Shows invitations sent by team leader */}
            {team?.isLeader && (
              <SentInvitations
                members={pendingInvites}
                onRefresh={loadMyTeams}
              />
            )}

            {/* Join Requests - Only show for team leader */}
            {team?.isLeader && (
              <MemberList
                title="Daftar Permintaan Gabung Tim"
                members={joinRequests}
                showActions={true}
                isLeader={true}
                currentUserId={user?.id}
                onAccept={handleAcceptJoinRequest}
                onReject={handleRejectJoinRequest}
              />
            )}

            <MemberList
              title="Daftar Permintaan Ajakan Tim"
              members={inviteRequests}
              showActions={true}
              onAccept={handleAcceptInvite}
              onReject={handleRejectInvite}
            />
          </div>
        </>
      )}

      {/* Next Button */}
      <div className="text-center mt-8">
        <Button
          onClick={handleNext}
          size="lg"
          className="px-8 font-medium text-lg"
          disabled={isLoading || !team}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sedang diproses...
            </>
          ) : (
            "Selanjutnya"
          )}
        </Button>
      </div>

      {/* Dialog Gabung Tim */}
      <JoinTeamDialog
        open={showJoinDialog}
        onOpenChange={setShowJoinDialog}
        onJoinTeam={handleJoinTeam}
      />

      {/* Dialog Undang Anggota */}
      <InviteMemberDialog
        open={showInviteDialog}
        onOpenChange={setShowInviteDialog}
        onInviteMember={handleInviteMember}
        currentMemberIds={[
          ...(team?.members.map((m) => m.id) || []),
          ...pendingInvites.map((m) => m.id),
        ]}
      />

      {/* Dialog Kode Tim Baru */}
      <TeamCodeDialog
        open={showTeamCodeDialog}
        onOpenChange={setShowTeamCodeDialog}
        teamCode={newTeamCode}
      />

      {/* Dialog Konfirmasi Action */}
      {confirmAction && (
        <ConfirmDialog
          open={!!confirmAction}
          onOpenChange={(open) => !open && setConfirmAction(null)}
          title={confirmMessage.title}
          description={confirmMessage.description}
          onConfirm={executeConfirmAction}
          variant={
            confirmAction.type.includes("reject") ||
            confirmAction.type === "remove" ||
            confirmAction.type === "cancel-invite"
              ? "destructive"
              : "default"
          }
        />
      )}

      {/* Dialog Konfirmasi Selanjutnya */}
      <ConfirmDialog
        open={showConfirmNext}
        onOpenChange={setShowConfirmNext}
        title="Konfirmasi Lanjut ke Tahap Berikutnya"
        description={`Apakah Anda yakin data tim sudah benar?\n\nAnggota Tim: ${team?.members.map((m) => m.name).join(", ")}\n\nSetelah melanjutkan, Anda akan masuk ke tahap pengajuan.`}
        onConfirm={confirmNext}
        confirmText="Ya, Lanjutkan"
        cancelText="Periksa Lagi"
      />

      {/* Delete Team Dialog */}
      <DeleteTeamDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        teamCode={team?.code || ""}
        reason={deleteReason}
        onConfirm={confirmDeleteTeam}
        isLoading={isDeletingTeam}
      />
    </>
  );
};

export default TeamCreationPage;
