import { useState } from "react";
import { Link } from "react-router";
import { useTheme } from "~/contexts/theme-context";
import Header from "~/components/header";
import Footer from "~/components/footer";

const Login = () => {
  const [activeTab, setActiveTab] = useState<"daftar" | "masuk">("masuk");
  const { isDarkMode } = useTheme();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Login data:", formData);
    // Handle login logic here
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors duration-300 ${
        isDarkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"
      }`}
    >
      <Header />

      <main className="flex-grow py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto">
            {/* Logo Section */}
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold">Logo</h1>
            </div>

            {/* Form Card */}
            <div
              className={`rounded-3xl p-8 shadow-lg transition-colors duration-300 ${
                isDarkMode
                  ? "bg-gray-800 text-white"
                  : "bg-gray-200 text-gray-900"
              }`}
            >
              <h2 className="text-2xl font-bold text-center mb-2">
                Selamat Datang
              </h2>
              <p
                className={`text-center text-sm mb-6 transition-colors duration-300 ${
                  isDarkMode ? "text-gray-300" : "text-gray-600"
                }`}
              >
                Masuk ke akun Anda atau buat akun baru untuk memulai
              </p>

              {/* Tabs */}
              <div className="flex gap-2 mb-6">
                <button
                  onClick={() => setActiveTab("daftar")}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all duration-300 ${
                    activeTab === "daftar"
                      ? isDarkMode
                        ? "bg-gray-700 text-white shadow-lg"
                        : "bg-white text-gray-800 shadow"
                      : isDarkMode
                        ? "bg-gray-600 text-gray-300 hover:bg-gray-500"
                        : "bg-gray-300 text-gray-600 hover:bg-gray-350"
                  }`}
                >
                  Daftar
                </button>
                <button
                  onClick={() => setActiveTab("masuk")}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all duration-300 ${
                    activeTab === "masuk"
                      ? isDarkMode
                        ? "bg-gray-700 text-white shadow-lg"
                        : "bg-white text-gray-800 shadow"
                      : isDarkMode
                        ? "bg-gray-600 text-gray-300 hover:bg-gray-500"
                        : "bg-gray-300 text-gray-600 hover:bg-gray-350"
                  }`}
                >
                  Masuk
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="email"
                    className={`block text-sm font-semibold mb-2 transition-colors duration-300 ${
                      isDarkMode ? "text-gray-200" : "text-gray-800"
                    }`}
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-lg border-0 focus:outline-none focus:ring-2 transition-all duration-300 ${
                      isDarkMode
                        ? "bg-gray-700 text-white focus:ring-blue-400 border-gray-600"
                        : "bg-white text-gray-900 focus:ring-primary"
                    }`}
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className={`block text-sm font-semibold mb-2 transition-colors duration-300 ${
                      isDarkMode ? "text-gray-200" : "text-gray-800"
                    }`}
                  >
                    Kata Sandi
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-lg border-0 focus:outline-none focus:ring-2 transition-all duration-300 ${
                      isDarkMode
                        ? "bg-gray-700 text-white focus:ring-blue-400 border-gray-600"
                        : "bg-white text-gray-900 focus:ring-primary"
                    }`}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-primary hover:bg-secondary text-white font-semibold py-3 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  Masuk
                </button>
              </form>

              {/* Additional Links */}
              <div className="mt-6 text-center">
                <p
                  className={`text-sm transition-colors duration-300 ${
                    isDarkMode ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  Belum punya akun?{" "}
                  <Link
                    to="/register"
                    className={`font-semibold transition-colors duration-300 ${
                      isDarkMode
                        ? "text-blue-400 hover:text-blue-300"
                        : "text-primary hover:text-secondary"
                    }`}
                  >
                    Daftar di sini
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

export default Login;
