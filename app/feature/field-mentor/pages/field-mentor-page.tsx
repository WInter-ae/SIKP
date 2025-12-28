import { useState } from "react";
import { Link } from "react-router";
import { UserPlus, CheckCircle, Copy, User } from "lucide-react";
import { toast } from "sonner";
import type { FieldMentor, MentorRequest } from "../types";

function FieldMentorPage() {
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [mentorRequest, setMentorRequest] = useState<MentorRequest>({
    mentorName: "",
    mentorEmail: "",
    mentorPhone: "",
    company: "",
    position: "",
    address: "",
  });
  const [currentMentor, setCurrentMentor] = useState<FieldMentor | null>(null);
  const [showMentorCode, setShowMentorCode] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setMentorRequest((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitRequest = (e: React.FormEvent) => {
    e.preventDefault();

    // Generate unique mentor code with better collision resistance
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    const generatedCode = `MNT-${timestamp.toString().slice(-6)}-${random.toString().padStart(4, '0')}`;

    const newMentor: FieldMentor = {
      id: Date.now().toString(),
      code: generatedCode,
      name: mentorRequest.mentorName,
      email: mentorRequest.mentorEmail,
      company: mentorRequest.company,
      position: mentorRequest.position,
      phone: mentorRequest.mentorPhone,
      status: "pending",
      createdAt: new Date().toISOString(),
      nip: "", // Akan diisi saat mentor registrasi
    };

    setCurrentMentor(newMentor);
    setShowMentorCode(true);
    setShowRequestForm(false);

    // Reset form
    setMentorRequest({
      mentorName: "",
      mentorEmail: "",
      mentorPhone: "",
      company: "",
      position: "",
      address: "",
    });

    toast.success("Request mentor berhasil! Kode mentor telah digenerate.");
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Kode berhasil disalin!");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="flex-1 p-10 bg-white">
        <h1 className="text-3xl font-bold mb-4">Mentor Lapangan</h1>

        <Link
          to="/mahasiswa"
          className="inline-flex items-center bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg font-medium transition mb-8"
        >
          <span className="mr-2">&larr;</span>
          Kembali ke Dashboard
        </Link>

        {/* Info Section */}
        <section className="p-6 bg-blue-50 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <UserPlus className="h-6 w-6" />
            Informasi Mentor Lapangan
          </h2>
          <p className="text-gray-700 mb-2">
            Halaman ini digunakan untuk mendaftarkan mentor lapangan Anda di
            tempat Kerja Praktik.
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-1">
            <li>Isi data mentor lapangan dengan lengkap</li>
            <li>Setelah submit, sistem akan generate kode unik untuk mentor</li>
            <li>
              Berikan kode tersebut kepada mentor untuk registrasi dan login
            </li>
            <li>Mentor dapat menggunakan kode untuk mengakses sistem</li>
          </ul>
        </section>

        {/* Current Mentor Section */}
        {currentMentor && (
          <section className="p-6 bg-green-50 rounded-lg shadow-md mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <CheckCircle className="h-6 w-6 text-green-600" />
              Mentor Lapangan Terdaftar
            </h2>
            
            <div className="flex flex-col md:flex-row gap-6 mb-4">
              {/* Foto Profil */}
              <div className="flex-shrink-0">
                {currentMentor.photo ? (
                  <img
                    src={currentMentor.photo}
                    alt={currentMentor.name}
                    className="w-32 h-32 rounded-lg object-cover border-2 border-gray-300"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-lg bg-gray-200 flex items-center justify-center border-2 border-gray-300">
                    <User className="h-16 w-16 text-gray-400" />
                  </div>
                )}
                {!currentMentor.photo && currentMentor.status === "pending" && (
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    Foto akan muncul setelah mentor registrasi
                  </p>
                )}
              </div>

              {/* Data Mentor */}
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Nama Mentor</p>
                  <p className="font-semibold">{currentMentor.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">NIP/NIK</p>
                  {currentMentor.nip ? (
                    <p className="font-semibold">{currentMentor.nip}</p>
                  ) : (
                    <p className="text-gray-400 italic">
                      Akan diisi saat registrasi
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-semibold">{currentMentor.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">No. Telepon</p>
                  <p className="font-semibold">{currentMentor.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Perusahaan</p>
                  <p className="font-semibold">{currentMentor.company}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Jabatan</p>
                  <p className="font-semibold">{currentMentor.position}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-600">Status</p>
                  <span
                    className={`inline-block px-3 py-1 text-sm rounded-full ${
                      currentMentor.status === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : currentMentor.status === "registered"
                          ? "bg-blue-100 text-blue-800"
                          : currentMentor.status === "approved"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                    }`}
                  >
                    {currentMentor.status === "pending"
                      ? "Menunggu Mentor Registrasi"
                      : currentMentor.status === "registered"
                        ? "Menunggu Persetujuan Admin"
                        : currentMentor.status === "approved"
                          ? "Disetujui - Aktif"
                          : "Ditolak"}
                  </span>
                </div>
              </div>
            </div>

            {showMentorCode && (
              <div className="p-4 bg-white rounded-lg border-2 border-green-300">
                <p className="text-sm text-gray-600 mb-2">Kode Mentor</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-2xl font-bold text-green-700 bg-gray-50 p-3 rounded border border-gray-300">
                    {currentMentor.code}
                  </code>
                  <button
                    onClick={() => copyToClipboard(currentMentor.code)}
                    className="p-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition"
                    title="Salin kode"
                  >
                    <Copy className="h-5 w-5" />
                  </button>
                </div>
                <p className="text-sm text-gray-600 mt-3">
                  ⚠️ Berikan kode ini kepada mentor untuk registrasi dan login ke
                  sistem
                </p>
              </div>
            )}
          </section>
        )}

        {/* Request Form Section */}
        {!currentMentor && !showRequestForm && (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-6">
              Anda belum memiliki mentor lapangan terdaftar
            </p>
            <button
              onClick={() => setShowRequestForm(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-8 rounded-lg shadow-lg transition"
            >
              <UserPlus className="inline-block h-5 w-5 mr-2" />
              Request Mentor Lapangan
            </button>
          </div>
        )}

        {showRequestForm && (
          <section className="p-6 bg-gray-50 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-6">
              Form Request Mentor Lapangan
            </h2>
            <form onSubmit={handleSubmitRequest}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nama Mentor <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="mentorName"
                    required
                    className="w-full border border-gray-300 rounded-md shadow-sm p-2"
                    placeholder="Nama lengkap mentor"
                    value={mentorRequest.mentorName}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Mentor <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="mentorEmail"
                    required
                    className="w-full border border-gray-300 rounded-md shadow-sm p-2"
                    placeholder="email@example.com"
                    value={mentorRequest.mentorEmail}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    No. Telepon <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="mentorPhone"
                    required
                    className="w-full border border-gray-300 rounded-md shadow-sm p-2"
                    placeholder="08xxxxxxxxxx"
                    value={mentorRequest.mentorPhone}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nama Perusahaan <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="company"
                    required
                    className="w-full border border-gray-300 rounded-md shadow-sm p-2"
                    placeholder="PT. Example Indonesia"
                    value={mentorRequest.company}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Jabatan <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="position"
                    required
                    className="w-full border border-gray-300 rounded-md shadow-sm p-2"
                    placeholder="Supervisor, Manager, dll"
                    value={mentorRequest.position}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Alamat Perusahaan <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="address"
                    required
                    rows={3}
                    className="w-full border border-gray-300 rounded-md shadow-sm p-2"
                    placeholder="Alamat lengkap perusahaan"
                    value={mentorRequest.address}
                    onChange={handleInputChange}
                  ></textarea>
                </div>
              </div>

              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setShowRequestForm(false)}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-6 rounded-lg shadow"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg shadow"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </section>
        )}

        {/* Info Kode Section */}
        <section className="p-6 bg-yellow-50 rounded-lg shadow-md mt-8">
          <h3 className="text-lg font-semibold mb-3">
            📌 Alur Proses Mentor Lapangan
          </h3>
          <ol className="list-decimal list-inside text-gray-700 space-y-2">
            <li>
              <strong>Mahasiswa Request Mentor</strong> - Isi form dan submit, sistem akan generate kode unik
            </li>
            <li>
              <strong>Status: Menunggu Mentor Registrasi</strong> - Berikan kode kepada mentor untuk registrasi
            </li>
            <li>
              <strong>Mentor Registrasi</strong> - Mentor menggunakan kode untuk membuat akun dan melengkapi data profil (foto profil dan NIP/NIK jika tersedia)
            </li>
            <li>
              <strong>Status: Menunggu Persetujuan Admin</strong> - Setelah mentor registrasi, data lengkap akan muncul di sini dan menunggu admin approve
            </li>
            <li>
              <strong>Admin Approve</strong> - Admin memeriksa dan menyetujui/menolak mentor
            </li>
            <li>
              <strong>Status: Disetujui</strong> - Mentor dapat login dan mulai membimbing
            </li>
          </ol>
          <p className="text-sm text-red-600 mt-4">
            ⚠️ Mentor tidak dapat login sebelum mendapat persetujuan dari admin
          </p>
        </section>
      </main>
    </div>
  );
}

export default FieldMentorPage;
