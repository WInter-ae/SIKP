import { useState, useEffect } from "react";
import { useNavigate } from "react-router";

import { Alert, AlertDescription } from "~/components/ui/alert";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";

import MemberList from "~/feature/create-teams/components/member-list";
import { ConfirmDialog } from "~/feature/create-teams/components/confirm-dialog";
import { JoinTeamDialog } from "~/feature/create-teams/components/join-team-dialog";
import { InviteMemberDialog } from "~/feature/create-teams/components/invite-member-dialog";
import { TeamCodeDialog } from "~/feature/create-teams/components/team-code-dialog";
import { DeleteTeamDialog } from "~/feature/create-teams/components/delete-team-dialog";

import type { Member, Team } from "~/feature/create-teams/types";
import { Users, UserPlus, Info, Crown, Loader2, Copy, Check, Trash2 } from "lucide-react";

// Import user context untuk akses user data
import { useUser } from "~/contexts/user-context";

// Import API services
import {
  createTeam as createTeamApi,
  getMyTeams,
  inviteTeamMember,
  deleteTeam as deleteTeamApi,
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
  const [deleteReason, setDeleteReason] = useState<"join_other_team" | "manual_delete">(
    "manual_delete"
  );
  const [isDeletingTeam, setIsDeletingTeam] = useState(false);
  
  // State untuk menyimpan action yang ditunda setelah delete team
  const [pendingActionAfterDelete, setPendingActionAfterDelete] = useState<{
    type: string;
    memberId?: number;
    memberName?: string;
  } | null>(null);

  // State untuk dialogs
  const [showJoinDialog, setShowJoinDialog] = useState(false);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [showConfirmNext, setShowConfirmNext] = useState(false);
  const [showTeamCodeDialog, setShowTeamCodeDialog] = useState(false);
  const [newTeamCode, setNewTeamCode] = useState<string>("");
  const [confirmAction, setConfirmAction] = useState<{
    type: string;
    memberId?: number;
    memberName?: string;
  } | null>(null);

  // Load teams on mount (only when user is authenticated)
  useEffect(() => {
    if (!isUserLoading && isAuthenticated && user) {
      loadMyTeams();
    }
  }, [isUserLoading, isAuthenticated, user]);

  // Fungsi untuk load teams dari backend
  const loadMyTeams = async () => {
    setIsLoading(true);
    try {
      console.log("=== LOAD TEAMS DEBUG ===");
      console.log("User:", user);
      console.log("Token:", localStorage.getItem("auth_token"));
      
      const response = await getMyTeams();
      
      console.log("Get Teams Response:", response);
      console.log("=== END DEBUG ===");
      
      if (response.success && response.data && response.data.length > 0) {
        // Get the first team (user should only have one active team)
        const teamData = response.data[0];

        console.log("Team Data:", teamData);
        console.log("Team Members:", teamData.members);

        // Ensure members array exists
        const members = Array.isArray(teamData.members) ? teamData.members : [];
        
        // Transform backend data to frontend format
        const transformedTeam: Team = {
          id: teamData.id,
          name: teamData.name || "",
          code: teamData.code || "",
          leaderId: parseInt(
            members.find((m) => m.role === "KETUA")?.user?.id || user?.id || "0",
          ),
          members: members
            .filter((m) => m.status === "ACCEPTED")
            .map((m) => ({
              id: parseInt(m.user.id),
              name: m.user.name,
              role: m.role === "KETUA" ? "Ketua (Anda)" : "Anggota",
              isLeader: m.role === "KETUA",
              nim: m.user.nim,
              email: m.user.email,
            })),
          maxMembers: 99,
        };

        // Jika tidak ada members yang ACCEPTED, tambahkan current user sebagai leader
        if (transformedTeam.members.length === 0 && user) {
          transformedTeam.members.push({
            id: parseInt(user.id),
            name: user.nama,
            role: "Ketua (Anda)",
            isLeader: true,
            nim: user.nim || "",
            email: user.email,
          });
        }

        setTeam(transformedTeam);

        // Set pending invites (undangan yang kita kirim, belum direspons)
        const pending = members
          .filter((m) => m.status === "PENDING")
          .map((m) => ({
            id: parseInt(m.user.id),
            name: m.user.name,
            role: "Mahasiswa",
            nim: m.user.nim,
            email: m.user.email,
          }));
        setPendingInvites(pending);
      }
    } catch (error) {
      console.error("Error loading teams:", error);
      
      // Tampilkan error yang lebih informatif
      if (error instanceof Error) {
        if (error.message.includes("userId") || error.message.includes("undefined")) {
          console.error(
            "❌ BACKEND ERROR: Cannot read userId from JWT token\n" +
            "Silakan perbaiki backend sesuai instruksi yang diberikan."
          );
        }
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
      alert("❌ Error: User data tidak tersedia\n\nSilakan logout dan login kembali.");
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
        
        if (errorMsg.includes("userId") || errorMsg.includes("undefined")) {
          alert(
            `❌ ERROR BACKEND: JWT Token Issue\n\n` +
            `Pesan: ${errorMsg}\n\n` +
            `SOLUSI:\n` +
            `Backend tidak dapat membaca userId dari JWT token.\n` +
            `Silakan perbaiki backend sesuai instruksi yang diberikan.\n\n` +
            `Detail error ada di console (F12).`
          );
        } else {
          alert(
            `❌ Gagal membuat tim\n\nPesan: ${errorMsg}\n\nCek console untuk detail.`
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
        `3. Backend error (cek logs backend)`
      );
    } finally {
      setIsCreatingTeam(false);
    }
  };

  // Fungsi untuk gabung tim
  const handleJoinTeam = (teamCode: string) => {
    // Jika user sudah memiliki tim, hapus tim lama terlebih dahulu sebelum join
    if (team && team.id) {
      // Simpan state untuk diteruskan setelah delete
      setPendingActionAfterDelete({
        type: "join-team",
        memberName: teamCode,
      });
      // Buka dialog delete
      setShowDeleteDialog(true);
      setDeleteReason("join_other_team");
    } else {
      // Jika tidak ada tim lama, langsung join
      console.log("Bergabung dengan tim:", teamCode);
      alert(`Permintaan bergabung ke tim ${teamCode} telah dikirim!`);
      setShowJoinDialog(false);
    }
  };

  // Fungsi terima anggota dari permintaan gabung
  const handleAcceptJoinRequest = (memberId: number) => {
    const member = joinRequests.find((m) => m.id === memberId);
    if (!member || !team) return;

    setConfirmAction({
      type: "accept-join",
      memberId,
      memberName: member.name,
    });
  };

  // Fungsi tolak anggota dari permintaan gabung
  const handleRejectJoinRequest = (memberId: number) => {
    const member = joinRequests.find((m) => m.id === memberId);
    if (!member) return;

    setConfirmAction({
      type: "reject-join",
      memberId,
      memberName: member.name,
    });
  };

  // Fungsi terima ajakan tim
  const handleAcceptInvite = (memberId: number) => {
    const member = inviteRequests.find((m) => m.id === memberId);
    if (!member) return;

    // Jika user sudah memiliki tim, hapus tim lama terlebih dahulu
    if (team && team.id) {
      // Simpan state untuk diteruskan setelah delete
      setPendingActionAfterDelete({
        type: "accept-invite",
        memberId,
        memberName: member.name,
      });
      // Buka dialog delete
      setShowDeleteDialog(true);
      setDeleteReason("join_other_team");
      setConfirmAction(null); // Clear konfirmasi dialog
    } else {
      // Jika tidak ada tim lama, langsung proses accept
      setConfirmAction({
        type: "accept-invite",
        memberId,
        memberName: member.name,
      });
    }
  };

  // Fungsi tolak ajakan tim
  const handleRejectInvite = (memberId: number) => {
    const member = inviteRequests.find((m) => m.id === memberId);
    if (!member) return;

    setConfirmAction({
      type: "reject-invite",
      memberId,
      memberName: member.name,
    });
  };

  // Fungsi keluarkan anggota
  const handleRemoveMember = (memberId: number) => {
    const member = team?.members.find((m) => m.id === memberId);
    if (!member || member.isLeader) return;

    setConfirmAction({
      type: "remove",
      memberId,
      memberName: member.name,
    });
  };

  // Fungsi untuk invite member - INTEGRATED WITH BACKEND
  const handleInviteMember = async (member: {
    id: number;
    name: string;
    nim: string;
    email: string;
  }) => {
    if (!team) {
      alert("Anda harus membuat atau bergabung dengan tim terlebih dahulu!");
      return;
    }

    // Check jika sudah diundang
    if (pendingInvites.some((m) => m.id === member.id)) {
      alert(`${member.name} sudah diundang sebelumnya!`);
      return;
    }

    // Check jika sudah menjadi anggota
    if (team.members.some((m) => m.id === member.id)) {
      alert(`${member.name} sudah menjadi anggota tim!`);
      return;
    }

    try {
      const response = await inviteTeamMember(team.id, member.nim);

      if (response.success && response.data) {
        // Tambahkan ke pending invites
        setPendingInvites([
          ...pendingInvites,
          {
            id: member.id,
            name: member.name,
            role: "Mahasiswa",
            nim: member.nim,
            email: member.email,
          },
        ]);

        alert(`Undangan berhasil dikirim ke ${member.name}!`);
      } else {
        alert(`Gagal mengirim undangan: ${response.message}`);
      }
    } catch (error) {
      console.error("Error inviting member:", error);
      alert("Terjadi kesalahan saat mengirim undangan");
    }
  };

  // Fungsi untuk membatalkan undangan
  const handleCancelInvite = (memberId: number) => {
    const member = pendingInvites.find((m) => m.id === memberId);
    if (!member) return;

    setConfirmAction({
      type: "cancel-invite",
      memberId,
      memberName: member.name,
    });
  };

  // Konfirmasi action
  const executeConfirmAction = () => {
    if (!confirmAction) return;

    switch (confirmAction.type) {
      case "accept-join": {
        const member = joinRequests.find(
          (m) => m.id === confirmAction.memberId,
        );
        if (member && team) {
          setTeam({
            ...team,
            members: [...team.members, { ...member, role: "Anggota" }],
          });
          setJoinRequests(
            joinRequests.filter((m) => m.id !== confirmAction.memberId),
          );
          alert(`${member.name} berhasil diterima sebagai anggota tim!`);
        }
        break;
      }
      case "reject-join": {
        setJoinRequests(
          joinRequests.filter((m) => m.id !== confirmAction.memberId),
        );
        alert(`Permintaan bergabung dari ${confirmAction.memberName} ditolak.`);
        break;
      }
      case "accept-invite": {
        const member = inviteRequests.find(
          (m) => m.id === confirmAction.memberId,
        );
        if (member && team) {
          setTeam({
            ...team,
            members: [...team.members, { ...member, role: "Anggota" }],
          });
          setInviteRequests(
            inviteRequests.filter((m) => m.id !== confirmAction.memberId),
          );
          alert(`Anda berhasil menerima ajakan dari ${member.name}!`);
        }
        break;
      }
      case "reject-invite": {
        setInviteRequests(
          inviteRequests.filter((m) => m.id !== confirmAction.memberId),
        );
        alert(`Ajakan dari ${confirmAction.memberName} ditolak.`);
        break;
      }
      case "remove": {
        if (team) {
          setTeam({
            ...team,
            members: team.members.filter(
              (m) => m.id !== confirmAction.memberId,
            ),
          });
          alert(`${confirmAction.memberName} berhasil dikeluarkan dari tim.`);
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

  const confirmNext = () => {
    navigate("/mahasiswa/kp/pengajuan");
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
  const handleDeleteTeam = async (reason: "join_other_team" | "manual_delete" = "manual_delete") => {
    if (!team) return;
    
    setDeleteReason(reason);
    setShowDeleteDialog(true);
  };

  // Confirm delete team
  const confirmDeleteTeam = async () => {
    if (!team) return;
    
    setIsDeletingTeam(true);
    try {
      const response = await deleteTeamApi(team.id);
      
      if (response.success) {
        // Clear team data
        setTeam(null);
        setPendingInvites([]);
        setJoinRequests([]);
        setInviteRequests([]);
        
        if (deleteReason === "join_other_team") {
          alert("✅ Tim lama berhasil dihapus. Anda sekarang bergabung dengan tim baru!");
          
          // Jika ada action yang ditunda, eksekusi sekarang
          if (pendingActionAfterDelete) {
            setTimeout(() => {
              window.location.reload();
            }, 1500);
          }
        } else {
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
      alert(`❌ Terjadi kesalahan saat menghapus tim: ${error}`);
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
                <p className="text-xs text-muted-foreground font-medium mb-1">Kode Tim Anda</p>
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
              {user && team.members.some((m) => m.isLeader && m.id === parseInt(user.id)) && (
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
            <Loader2 className="h-16 w-16 mx-auto text-muted-foreground mb-4 animate-spin" />
            <p className="text-muted-foreground">Memuat data tim...</p>
          </CardContent>
        </Card>
      ) : !team ? (
        <Card className="mb-8">
          <CardContent className="py-12 text-center">
            <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-6">
              Anda belum memiliki tim. Silakan buat tim baru atau gabung dengan
              tim yang sudah ada.
            </p>
            <div className="flex justify-center gap-4">
              <Button onClick={handleCreateTeam} disabled={isCreatingTeam}>
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
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="flex justify-end items-center mb-8">
            <Button
              onClick={() => setShowInviteDialog(true)}
              disabled={!team || isCreatingTeam}
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Undang Anggota
            </Button>
          </div>

          {/* Team Info Card */}
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
                {team.members.some((m) => m.isLeader) && (
                  <span className="flex items-center gap-1">
                    <Crown className="h-4 w-4 text-yellow-500" />
                    Anda adalah Ketua Tim
                  </span>
                )}
              </div>
            </AlertDescription>
          </Alert>

          {/* Member Lists */}
          <div className="space-y-6">
            <MemberList
              title="Daftar Anggota"
              members={team.members}
              onRemove={handleRemoveMember}
            />

            <MemberList
              title="Undangan yang Dikirim"
              members={pendingInvites}
              showCancel={true}
              onCancel={handleCancelInvite}
            />

            <MemberList
              title="Daftar Permintaan Gabung Tim"
              members={joinRequests}
              showActions={true}
              onAccept={handleAcceptJoinRequest}
              onReject={handleRejectJoinRequest}
            />

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
        >
          Selanjutnya
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
