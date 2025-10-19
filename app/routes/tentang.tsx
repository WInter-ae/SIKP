import { useTheme } from '~/contexts/theme-context'
import Header from '~/components/header'
import Footer from '~/components/footer'

interface Technology {
  id: number
  name: string
}

interface TeamMember {
  id: number
  name: string
  role: string
}

const Tentang = () => {
  const { isDarkMode } = useTheme()
  const technologies: Technology[] = [
    { id: 1, name: '[APK]' },
    { id: 2, name: '[APK]' },
    { id: 3, name: '[APK]' },
  ]

  const teamMembers: TeamMember[] = [
    { id: 1, name: 'Nama', role: 'Role' },
    { id: 2, name: 'Nama', role: 'Role' },
    { id: 3, name: 'Nama', role: 'Role' },
    { id: 4, name: 'Nama', role: 'Role' },
    { id: 5, name: 'Nama', role: 'Role' },
    { id: 6, name: 'Nama', role: 'Role' },
  ]

  return (
    <>
      <Header />

      <section className={`py-16 min-h-[calc(100vh-300px)] transition-colors duration-300 ${
        isDarkMode ? 'bg-gray-900' : 'bg-white'
      }`}>
        <div className="container mx-auto px-4">
          {/* About Header */}
          <div className="flex flex-col md:flex-row items-center gap-10 p-10 border-b border-gray-200 mb-12">
            <div className="flex-shrink-0">
              <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
                <circle cx="40" cy="40" r="40" fill="#64B5F6" />
                <circle cx="40" cy="30" r="12" fill="white" />
                <path d="M20 65C20 55 28 50 40 50C52 50 60 55 60 65" fill="white" />
              </svg>
            </div>
            <div className="flex-1 text-center md:text-left">
              <h1 className={`text-4xl font-bold mb-4 transition-colors duration-300 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Tentang
              </h1>
              <p className={`text-sm leading-relaxed transition-colors duration-300 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Portal Kerja Praktik adalah aplikasi untuk mempermudah mahasiswa dalam mencari,
                mendaftar, dan melaksanakan program kerja praktik.
              </p>
            </div>
          </div>

          {/* Technology Section */}
          <div className={`py-10 border-b border-gray-200 mb-12 transition-colors duration-300 ${
            isDarkMode ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <h2 className={`text-3xl font-bold text-center mb-4 transition-colors duration-300 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Teknologi
            </h2>
            <p className={`text-center text-sm mb-10 transition-colors duration-300 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              zxcvbnm,sdfghjkwertyuisdfghcvbncvbn
            </p>

            <div className="relative flex items-center justify-center gap-8 py-5">
              <button className={`w-10 h-10 rounded-full flex items-center justify-center text-xl font-bold transition-colors duration-300 ${
                isDarkMode
                  ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
              }`}>
                &lt;
              </button>
              <div className="flex gap-10 items-center">
                {technologies.map((tech) => (
                  <div key={tech.id} className="flex flex-col items-center gap-4">
                    <div className={`w-24 h-24 rounded-full border-2 transition-colors duration-300 ${
                      isDarkMode
                        ? 'bg-gray-800 border-blue-300'
                        : 'bg-blue-100 border-blue-400'
                    }`}
                    ></div>
                    <p className={`text-sm font-medium transition-colors duration-300 ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {tech.name}
                    </p>
                  </div>
                ))}
              </div>
              <button className={`w-10 h-10 rounded-full flex items-center justify-center text-xl font-bold transition-colors duration-300 ${
                isDarkMode
                  ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
              }`}>
                &gt;
              </button>
            </div>
          </div>

          {/* Team Section */}
          <div className="py-10">
            <h2 className={`text-3xl font-bold text-center mb-4 transition-colors duration-300 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Tim Pengembang
            </h2>
            <p className={`text-center text-sm mb-10 transition-colors duration-300 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              zxcvbnm,sdfghjkwertyuisdfghcvbncvbn
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {teamMembers.map((member) => (
                <div
                  key={member.id}
                  className={`p-5 rounded-lg flex items-center gap-4 transition-colors duration-300 ${
                    isDarkMode ? 'bg-gray-800' : 'bg-gray-100'
                  }`}
                >
                  <div className="flex-shrink-0">
                    <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
                      <circle cx="30" cy="30" r="30" fill="#64B5F6" />
                      <circle cx="30" cy="22" r="9" fill="white" />
                      <path d="M15 48C15 40 21 37 30 37C39 37 45 40 45 48" fill="white" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm font-bold mb-1 transition-colors duration-300 ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {member.name}
                    </p>
                    <p className={`text-xs transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      {member.role}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  )
}

export default Tentang
