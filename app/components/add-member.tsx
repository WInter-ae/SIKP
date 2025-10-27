import React, { useState } from "react";

const AddMemberForm = () => {
  const [showSearch, setShowSearch] = useState(false);
  const [searchId, setSearchId] = useState("");

  const handleAddMember = () => {
    setShowSearch(!showSearch);
    setSearchId("");
  };

  const handleSearch = () => {
    // Implement search functionality here
    console.log("Searching for student ID:", searchId);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8 text-center">
      <button
        onClick={handleAddMember}
        className="bg-green-700 hover:bg-green-800 text-white px-6 py-3 rounded-lg font-medium flex items-center justify-center mx-auto transition"
      >
        <i className="fas fa-user-plus mr-2"></i>
        Tambah Anggota
      </button>

      {showSearch && (
        <div className="mt-6">
          <div className="flex justify-center items-center gap-3">
            <input
              type="text"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              placeholder="Masukkan Nomor ID Mahasiswa"
              className="w-80 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <button
              onClick={handleSearch}
              className="bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-lg font-medium transition"
            >
              Cari
            </button>
          </div>
          <p className="mt-3 text-sm text-gray-600">
            Masukkan nomor ID mahasiswa yang ingin Anda tambahkan ke tim
          </p>
        </div>
      )}
    </div>
  );
};

export default AddMemberForm;
