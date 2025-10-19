import { useState } from "react";
import { Link } from "react-router";
import Header from "~/components/header";
import Footer from "~/components/footer";

const Register = () => {
  const [activeTab, setActiveTab] = useState<"daftar" | "masuk">("daftar");
  const [formData, setFormData] = useState({
    namaDepan: "",
    namaBelakang: "",
    email: "",
    password: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Register data:", formData);
    // Handle registration logic here
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-grow bg-gray-100 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto">
            {/* Logo Section */}
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-800">Logo</h1>
            </div>

            {/* Form Card */}
            <div className="bg-gray-200 rounded-3xl p-8 shadow-lg">
              <h2 className="text-2xl font-bold text-center mb-2">
                Selamat Datang
              </h2>
              <p className="text-center text-sm text-gray-600 mb-6">
                Masuk ke akun Anda atau buat akun baru untuk memulai
              </p>

              {/* Tabs */}
              <div className="flex gap-2 mb-6">
                <button
                  onClick={() => setActiveTab("daftar")}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                    activeTab === "daftar"
                      ? "bg-white text-gray-800 shadow"
                      : "bg-gray-300 text-gray-600 hover:bg-gray-350"
                  }`}
                >
                  Daftar
                </button>
                <button
                  onClick={() => setActiveTab("masuk")}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                    activeTab === "masuk"
                      ? "bg-white text-gray-800 shadow"
                      : "bg-gray-300 text-gray-600 hover:bg-gray-350"
                  }`}
                >
                  Masuk
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label
                      htmlFor="namaDepan"
                      className="block text-sm font-semibold text-gray-800 mb-2"
                    >
                      Nama Depan
                    </label>
                    <input
                      type="text"
                      id="namaDepan"
                      name="namaDepan"
                      value={formData.namaDepan}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg bg-white border-0 focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="namaBelakang"
                      className="block text-sm font-semibold text-gray-800 mb-2"
                    >
                      Nama Belakang
                    </label>
                    <input
                      type="text"
                      id="namaBelakang"
                      name="namaBelakang"
                      value={formData.namaBelakang}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg bg-white border-0 focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-semibold text-gray-800 mb-2"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg bg-white border-0 focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-semibold text-gray-800 mb-2"
                  >
                    Kata Sandi
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg bg-white border-0 focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-primary hover:bg-secondary text-white font-semibold py-3 rounded-lg transition-colors shadow-md"
                >
                  Daftar
                </button>
              </form>

              {/* Additional Links */}
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Sudah punya akun?{" "}
                  <Link
                    to="/login"
                    className="text-primary hover:underline font-semibold"
                  >
                    Masuk di sini
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Register;
