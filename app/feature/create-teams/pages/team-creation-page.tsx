import { useState } from "react";
import { useNavigate } from "react-router";
import MemberList from "~/feature/create-teams/components/member-list";
import { ConfirmDialog } from "~/feature/create-teams/components/confirm-dialog";
import { JoinTeamDialog } from "~/feature/create-teams/components/join-team-dialog";
import { InviteMemberDialog } from "~/feature/create-teams/components/invite-member-dialog";
import { Button } from "~/components/ui/button";
import type { Member, Team } from "~/feature/create-teams/types";

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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Halaman Pembuatan Tim
        </h1>
        <p className="text-gray-600">
          Buat tim Anda untuk melaksanakan Kerja Praktik
        </p>
      </div>

      {!team ? (
        <div className="text-center py-12">
          <div className="mb-6">
            <p className="text-gray-600 mb-4">
              Anda belum memiliki tim. Silakan buat tim baru atau gabung dengan tim yang sudah ada.
            </p>
          </div>
          <div className="flex justify-center space-x-4">
            <button
              onClick={handleCreateTeam}
              className="bg-green-700 hover:bg-green-800 text-white px-6 py-3 rounded-lg font-medium transition"
            >
              Buat Tim Baru
            </button>
            <button
              onClick={() => setShowJoinDialog(true)}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-lg font-medium transition"
            >
              Gabung Tim
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center mb-8">
            <div className="flex space-x-4">
              <button
                onClick={handleCreateTeam}
                className="bg-green-700 hover:bg-green-800 text-white px-6 py-3 rounded-lg font-medium transition"
              >
                Buat Tim Baru
              </button>
              <button
                onClick={() => setShowJoinDialog(true)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-lg font-medium transition"
              >
                Gabung Tim
              </button>
            </div>
            <button
              onClick={() => setShowInviteDialog(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition flex items-center gap-2"
              disabled={!team || team.members.length >= team.maxMembers}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
              </svg>
              Undang Anggota
            </button>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-8">
            <p className="text-green-800 text-center">
              Jumlah Anggota Tim:{" "}
              <span className="font-bold">
                {team.members.length}/{team.maxMembers}
              </span>
            </p>
            {team.members.some((m) => m.isLeader) && (
              <p className="text-green-800 text-center">Anda adalah Ketua Tim</p>
            )}
            <p className="text-green-800 text-center mt-2">
              Kode Tim: <span className="font-bold">{team.code}</span>
            </p>
          </div>

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
        </>
      )}

      <div className="text-center mt-8">
        <Button
          onClick={handleNext}
          className="bg-green-700 hover:bg-green-800 text-white px-8 py-3 rounded-lg font-medium text-lg transition"
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
