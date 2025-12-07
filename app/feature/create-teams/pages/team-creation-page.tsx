import { useState } from "react";
import { useNavigate } from "react-router";

import { Alert, AlertDescription } from "~/components/ui/alert";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";

import MemberList from "~/feature/create-teams/components/member-list";
import { ConfirmDialog } from "~/feature/create-teams/components/confirm-dialog";
import { JoinTeamDialog } from "~/feature/create-teams/components/join-team-dialog";
import { InviteMemberDialog } from "~/feature/create-teams/components/invite-member-dialog";

import type { Member, Team } from "~/feature/create-teams/types";
import { Users, UserPlus, Copy, Info, Crown } from "lucide-react";

const TeamCreationPage = () => {
  const navigate = useNavigate();

  // State untuk tim
  const [team, setTeam] = useState<Team | null>({
    id: "team-001",
    name: "Tim Kerja Praktik",
    code: "TEAM-ABC123",
    leaderId: 1,
    members: [
      { id: 1, name: "Adam", role: "Ketua (Anda)", isLeader: true },
      { id: 2, name: "Robin", role: "Anggota" },
    ],
    maxMembers: 3,
  });

  // State untuk permintaan gabung dan ajakan
  const [joinRequests, setJoinRequests] = useState<Member[]>([
    { id: 3, name: "Raihan", role: "Mahasiswa" },
  ]);

  const [inviteRequests, setInviteRequests] = useState<Member[]>([
    { id: 4, name: "Rafly", role: "Mahasiswa" },
  ]);

  // State untuk pending invitations (undangan yang sudah kita kirim)
  const [pendingInvites, setPendingInvites] = useState<Member[]>([]);

  // State untuk dialogs
  const [showJoinDialog, setShowJoinDialog] = useState(false);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [showConfirmNext, setShowConfirmNext] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{
    type: string;
    memberId?: number;
    memberName?: string;
  } | null>(null);

  // Fungsi untuk membuat tim baru
  const handleCreateTeam = () => {
    const newTeamCode = `TEAM-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const newTeam: Team = {
      id: `team-${Date.now()}`,
      name: "Tim Kerja Praktik",
      code: newTeamCode,
      leaderId: 1,
      members: [{ id: 1, name: "Anda", role: "Ketua (Anda)", isLeader: true }],
      maxMembers: 3,
    };
    setTeam(newTeam);
    alert(`Tim berhasil dibuat!\nKode Tim: ${newTeamCode}\n\nBagikan kode ini kepada anggota tim Anda.`);
  };

  // Fungsi untuk gabung tim
  const handleJoinTeam = (teamCode: string) => {
    // Simulasi join team - di production, ini akan API call
    console.log("Bergabung dengan tim:", teamCode);
    alert(`Permintaan bergabung ke tim ${teamCode} telah dikirim!`);
    setShowJoinDialog(false);
  };

  // Fungsi terima anggota dari permintaan gabung
  const handleAcceptJoinRequest = (memberId: number) => {
    const member = joinRequests.find((m) => m.id === memberId);
    if (!member || !team) return;

    if (team.members.length >= team.maxMembers) {
      alert("Tim sudah penuh! Maksimal 3 anggota.");
      return;
    }

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
    if (!member || !team) return;

    if (team.members.length >= team.maxMembers) {
      alert("Tim sudah penuh! Maksimal 3 anggota.");
      return;
    }

    setConfirmAction({
      type: "accept-invite",
      memberId,
      memberName: member.name,
    });
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

  // Fungsi untuk invite member
  const handleInviteMember = (member: { id: number; name: string; nim: string; email: string }) => {
    if (!team) {
      alert("Anda harus membuat atau bergabung dengan tim terlebih dahulu!");
      return;
    }

    if (team.members.length >= team.maxMembers) {
      alert("Tim sudah penuh! Maksimal 3 anggota.");
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

    // Tambahkan ke pending invites
    setPendingInvites([
      ...pendingInvites,
      { 
        id: member.id, 
        name: member.name, 
        role: "Mahasiswa",
        nim: member.nim,
        email: member.email
      },
    ]);
    
    alert(`Undangan berhasil dikirim ke ${member.name}!`);
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
        const member = joinRequests.find((m) => m.id === confirmAction.memberId);
        if (member && team) {
          setTeam({
            ...team,
            members: [...team.members, { ...member, role: "Anggota" }],
          });
          setJoinRequests(joinRequests.filter((m) => m.id !== confirmAction.memberId));
          alert(`${member.name} berhasil diterima sebagai anggota tim!`);
        }
        break;
      }
      case "reject-join": {
        setJoinRequests(joinRequests.filter((m) => m.id !== confirmAction.memberId));
        alert(`Permintaan bergabung dari ${confirmAction.memberName} ditolak.`);
        break;
      }
      case "accept-invite": {
        const member = inviteRequests.find((m) => m.id === confirmAction.memberId);
        if (member && team) {
          setTeam({
            ...team,
            members: [...team.members, { ...member, role: "Anggota" }],
          });
          setInviteRequests(inviteRequests.filter((m) => m.id !== confirmAction.memberId));
          alert(`Anda berhasil menerima ajakan dari ${member.name}!`);
        }
        break;
      }
      case "reject-invite": {
        setInviteRequests(inviteRequests.filter((m) => m.id !== confirmAction.memberId));
        alert(`Ajakan dari ${confirmAction.memberName} ditolak.`);
        break;
      }
      case "remove": {
        if (team) {
          setTeam({
            ...team,
            members: team.members.filter((m) => m.id !== confirmAction.memberId),
          });
          alert(`${confirmAction.memberName} berhasil dikeluarkan dari tim.`);
        }
        break;
      }
      case "cancel-invite": {
        setPendingInvites(pendingInvites.filter((m) => m.id !== confirmAction.memberId));
        alert(`Undangan ke ${confirmAction.memberName} berhasil dibatalkan.`);
        break;
      }
    }

    setConfirmAction(null);
  };

  // Handle navigasi selanjutnya
  const handleNext = () => {
    if (!team) {
      alert("Anda belum memiliki tim! Silakan buat atau gabung tim terlebih dahulu.");
      return;
    }

    if (team.members.length < 2) {
      alert("Tim harus memiliki minimal 2 anggota untuk melanjutkan!");
      return;
    }

    setShowConfirmNext(true);
  };

  const confirmNext = () => {
    navigate("/mahasiswa/kp/pengajuan");
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

  return (
    <>
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Halaman Pembuatan Tim
        </h1>
        <p className="text-muted-foreground">
          Buat tim Anda untuk melaksanakan Kerja Praktik
        </p>
      </div>

      {!team ? (
        <Card className="mb-8">
          <CardContent className="py-12 text-center">
            <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-6">
              Anda belum memiliki tim. Silakan buat tim baru atau gabung dengan tim yang sudah ada.
            </p>
            <div className="flex justify-center gap-4">
              <Button
                onClick={handleCreateTeam}
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Buat Tim Baru
              </Button>
              <Button
                variant="secondary"
                onClick={() => setShowJoinDialog(true)}
              >
                <Users className="mr-2 h-4 w-4" />
                Gabung Tim
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="flex justify-between items-center mb-8">
            <div className="flex gap-4">
              <Button
                onClick={handleCreateTeam}
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Buat Tim Baru
              </Button>
              <Button
                variant="secondary"
                onClick={() => setShowJoinDialog(true)}
              >
                <Users className="mr-2 h-4 w-4" />
                Gabung Tim
              </Button>
            </div>
            <Button
              onClick={() => setShowInviteDialog(true)}
              disabled={!team || team.members.length >= team.maxMembers}
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Undang Anggota
            </Button>
          </div>

          {/* Team Info Card */}
          <Alert className="mb-8 border-primary/20 bg-primary/5">
            <Info className="h-5 w-5 text-primary" />
            <AlertDescription className="text-foreground">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="flex items-center gap-4">
                  <span>
                    Jumlah Anggota Tim:{" "}
                    <Badge variant="secondary" className="ml-1">
                      {team.members.length}/{team.maxMembers}
                    </Badge>
                  </span>
                  {team.members.some((m) => m.isLeader) && (
                    <span className="flex items-center gap-1">
                      <Crown className="h-4 w-4 text-yellow-500" />
                      Anda adalah Ketua Tim
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span>Kode Tim:</span>
                  <Badge variant="outline" className="font-mono font-bold">
                    {team.code}
                  </Badge>
                </div>
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
    </>
  );
};

export default TeamCreationPage;
