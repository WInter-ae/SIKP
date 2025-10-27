import React from "react";
import Timeline from "~/components/timeline";
import AddMemberForm from "~/components/add-member";
import MemberList from "~/components/member-list";

const TeamCreation = () => {
  const teamMembers = [
    { id: 1, name: "Adam", role: "Ketua (Anda)", isLeader: true },
    { id: 2, name: "Robin", role: "Anggota" },
  ];

  const joinRequests = [{ id: 3, name: "Raihan", role: "Mahasiswa" }];

  const inviteRequests = [{ id: 4, name: "Rafly", role: "Mahasiswa" }];

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="max-w-6xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Halaman Pembuatan Tim
          </h1>
          <p className="text-gray-600">
            Buat tim Anda untuk melaksanakan Kerja Praktik
          </p>
        </div>

        <Timeline />

        <div className="flex space-x-4 mb-8">
          <button className="bg-green-700 hover:bg-green-800 text-white px-6 py-3 rounded-lg font-medium transition">
            Buat Tim Baru
          </button>
          <button className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-lg font-medium transition">
            Gabung Tim
          </button>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-8 text-center">
          <p className="text-green-800">
            Jumlah Anggota Tim: <span className="font-bold">2/3</span>
          </p>
          <p className="text-green-800">Anda adalah Ketua Tim</p>
        </div>

        <AddMemberForm />

        <MemberList title="Daftar Anggota" members={teamMembers} />
        <MemberList
          title="Daftar Permintaan Gabung Tim"
          members={joinRequests}
          showActions={true}
        />
        <MemberList
          title="Daftar Permintaan Ajakan Tim"
          members={inviteRequests}
          showActions={true}
        />

        <div className="text-center mt-8">
          <button className="bg-green-700 hover:bg-green-800 text-white px-8 py-3 rounded-lg font-medium text-lg transition">
            Selanjutnya
          </button>
        </div>
      </main>
    </div>
  );
};

export default TeamCreation;
