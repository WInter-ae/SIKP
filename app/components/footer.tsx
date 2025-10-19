import { Link } from 'react-router'
import { useTheme } from '~/contexts/theme-context'

const Footer = () => {
  const { isDarkMode } = useTheme()

  return (
    <footer className={`py-12 transition-colors duration-300 ${
      isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-900 text-white'
    }`}>
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div>
            <h3 className="text-base font-bold mb-5">About Platform</h3>
            <p className="text-sm leading-relaxed text-gray-400">
              Portal Kerja Praktik Program Studi Manajemen Informatika yang dirancang
              untuk mempermudah mahasiswa dalam mencari, memilihkan, dan melaksanakan
              program magang.
            </p>
          </div>
          <div>
            <h3 className="text-base font-bold mb-5">Navigasi Cepat</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-sm text-gray-400 hover:text-white transition-colors">
                  Beranda
                </Link>
              </li>
              <li>
                <Link to="/referensi" className="text-sm text-gray-400 hover:text-white transition-colors">
                  Referensi
                </Link>
              </li>
              <li>
                <Link to="/tentang" className="text-sm text-gray-400 hover:text-white transition-colors">
                  Tentang
                </Link>
              </li>
              <li>
                <Link to="/kontak" className="text-sm text-gray-400 hover:text-white transition-colors">
                  Kontak
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-base font-bold mb-5">Hubungi Kami</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>Jalan</li>
              <li>No telepon</li>
              <li>Email</li>
            </ul>
          </div>
          <div>
            <h3 className="text-base font-bold mb-5">Newsletter</h3>
            <div className="bg-white h-20 rounded"></div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
