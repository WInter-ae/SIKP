import { Link, useLocation } from "react-router";
import { useTheme } from "~/contexts/theme-context";

const Header = () => {
  const location = useLocation();
  const { isDarkMode, toggleTheme } = useTheme();

  const isActive = (path: string) => {
    return location.pathname === path ? "font-bold" : "";
  };

  return (
    <headerjobivb uyivovbiu
      className={`bg-gradient-to-r from-primary to-secondary shadow-md transition-colors duration-300`}
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-3">
          <div className="text-white text-xl font-bold px-5 py-2 bg-white/10 rounded">
            LOGO
          </div>

          {/* Navigation and Theme Toggle in the same row */}
          <div className="flex items-center gap-8">
            <nav className="flex gap-8 items-center">
              <Link
                to="/"
                className={`text-white text-sm hover:opacity-80 transition-opacity ${isActive("/")}`}
              >
                Beranda
              </Link>
              <Link
                to="/referensi"
                className={`text-white text-sm hover:opacity-80 transition-opacity ${isActive("/referensi")}`}
              >
                Referensi
              </Link>
              <Link
                to="/tentang"
                className={`text-white text-sm hover:opacity-80 transition-opacity ${isActive("/tentang")}`}
              >
                Tentang
              </Link>
              <Link
                to="/kontak"
                className={`text-white text-sm hover:opacity-80 transition-opacity ${isActive("/kontak")}`}
              >
                Kontak
              </Link>
              <Link
                to="/login"
                className={`text-white text-sm hover:opacity-80 transition-opacity ${isActive("/login")}`}
              >
                Log in
              </Link>
            </nav>

            {/* Theme Toggle Button - inside header */}
            <div className="relative">
              <button
                onClick={toggleTheme}
                className={`relative w-14 h-7 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white/50 ${
                  isDarkMode ? "bg-gray-600" : "bg-gray-300"
                }`}
                aria-label="Toggle theme"
              >
                <div
                  className={`absolute top-1 w-5 h-5 rounded-full transition-all duration-300 flex items-center justify-center ${
                    isDarkMode
                      ? "left-8 bg-yellow-400 text-gray-900"
                      : "left-1 bg-white text-gray-700"
                  }`}
                >
                  {isDarkMode ? (
                    <svg
                      className="w-3 h-3"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-3 h-3"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                    </svg>
                  )}
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
