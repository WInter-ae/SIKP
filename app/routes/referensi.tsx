import { Link } from 'react-router'
import { useTheme } from '~/contexts/theme-context'
import Header from '~/components/header'
import Footer from '~/components/footer'

interface ReferensiItem {
  id: number
  name: string
}

const Referensi = () => {
  const { isDarkMode } = useTheme()
  const referensiData: ReferensiItem[] = [
    { id: 1, name: 'PT. Cinta Sejati' },
    { id: 2, name: 'Kominfo' },
    { id: 3, name: 'Kominfo' },
    { id: 4, name: 'PT. Cinta Sejati' },
    { id: 5, name: 'Kominfo' },
    { id: 6, name: 'Kominfo' },
  ]

  return (
    <>
      <Header />

      <section className={`py-16 min-h-[calc(100vh-300px)] transition-colors duration-300 ${
        isDarkMode ? 'bg-gray-900' : 'bg-gray-100'
      }`}>
        <div className="container mx-auto px-4">
          <h1 className={`text-4xl font-bold text-center mb-10 transition-colors duration-300 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Referensi Tempat KP
          </h1>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-12">
            <input
              type="text"
              className={`w-full px-5 py-3 rounded focus:outline-none focus:border-primary text-sm transition-colors duration-300 ${
                isDarkMode
                  ? 'bg-gray-800 text-white border-gray-600 focus:border-blue-400'
                  : 'bg-white text-gray-900 border-gray-300 focus:border-primary'
              }`}
              placeholder="Cari tempat KP"
            />
          </div>

          {/* Referensi Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
            {referensiData.map((item) => (
              <Link
                key={item.id}
                to={`/detail-referensi/${item.id}`}
                className={`rounded-lg shadow-md hover:shadow-lg hover:-translate-y-1 transition-all p-5 flex items-center gap-5 ${
                  isDarkMode
                    ? 'bg-gray-800 hover:bg-gray-700'
                    : 'bg-white hover:bg-gray-50'
                }`}
              >
                <div className={`w-20 h-20 flex items-center justify-center font-bold text-xs rounded flex-shrink-0 transition-colors duration-300 ${
                  isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-900 text-white'
                }`}>
                  LOGO
                </div>
                <div className="flex-1">
                  <h3 className={`text-base transition-colors duration-300 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {item.name}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </>
  )
}

export default Referensi
