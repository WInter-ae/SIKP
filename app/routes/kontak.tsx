import { useState, type FormEvent, type ChangeEvent } from 'react'
import { useTheme } from '~/contexts/theme-context'
import Header from '~/components/header'
import Footer from '~/components/footer'

interface FormData {
  jenisFeedback: string
  detailPesan: string
  informasiKontak: string
}

const Kontak = () => {
  const { isDarkMode } = useTheme()
  const [showMap, setShowMap] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    jenisFeedback: '',
    detailPesan: '',
    informasiKontak: ''
  })

  // Koordinat Kampus Bukit Palembang
  const organizationLocation = {
    lat: -2.9761,
    lng: 104.7754,
    name: 'Kampus Bukit Palembang'
  }

  const openInGoogleMaps = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${organizationLocation.lat},${organizationLocation.lng}`
    window.open(url, '_blank')
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    console.log('Form submitted:', formData)
    // Handle form submission here
  }

  return (
    <>
      <Header />

      <section className={`py-16 min-h-[calc(100vh-300px)] transition-colors duration-300 ${
        isDarkMode ? 'bg-gray-900' : 'bg-white'
      }`}>
        <div className="container mx-auto px-4">
          <h1 className={`text-4xl font-bold text-center mb-10 transition-colors duration-300 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Form Kontak & Feedback
          </h1>

          {/* Google Maps Section */}
          <div className="max-w-4xl mx-auto mb-10">
            <div className="flex gap-3 mb-4">
              <button
                type="button"
                onClick={() => setShowMap(!showMap)}
                className={`px-6 py-2 rounded text-sm font-medium transition-colors duration-300 ${
                  isDarkMode
                    ? 'bg-gray-800 text-white border border-gray-600 hover:bg-gray-700'
                    : 'bg-white text-gray-900 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                Lokasi organisasi
              </button>
              <button
                type="button"
                onClick={openInGoogleMaps}
                className="px-6 py-2 bg-primary text-white rounded text-sm font-medium hover:bg-secondary transition-colors"
              >
                Buka di Google Maps
              </button>
            </div>
            <div className={`w-full h-96 rounded-lg overflow-hidden relative transition-colors duration-300 ${
              isDarkMode ? 'bg-gray-800' : 'bg-gray-900'
            }`}>
              {!showMap ? (
                <div className={`absolute inset-0 flex items-center justify-center text-2xl font-semibold transition-colors duration-300 ${
                  isDarkMode ? 'text-white' : 'text-white'
                }`}>
                  Preview Maps
                </div>
              ) : (
                <iframe
                  src={`https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3966.5!2d${organizationLocation.lng}!3d${organizationLocation.lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMsKwNTgnMzUuOCJTIDEwNMKwNDYnMzIuNiJF!5e0!3m2!1sen!2sid!4v1234567890`}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Organization Location Map"
                ></iframe>
              )}
            </div>
          </div>

          <form
            className={`max-w-2xl mx-auto p-10 rounded-lg transition-colors duration-300 ${
              isDarkMode ? 'bg-gray-800' : 'bg-gray-50'
            }`}
            onSubmit={handleSubmit}
          >
            <div className="mb-6">
              <label
                htmlFor="jenisFeedback"
                className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}
              >
                Jenis Feedback
              </label>
              <input
                type="text"
                id="jenisFeedback"
                name="jenisFeedback"
                value={formData.jenisFeedback}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded focus:outline-none focus:border-primary text-sm transition-colors duration-300 ${
                  isDarkMode
                    ? 'bg-gray-700 text-white border-gray-600 focus:border-blue-400'
                    : 'bg-white text-gray-900 border-gray-300 focus:border-primary'
                }`}
                placeholder="Masukkan jenis feedback"
              />
            </div>

            <div className="mb-6">
              <label
                htmlFor="detailPesan"
                className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}
              >
                Detail Pesan
              </label>
              <textarea
                id="detailPesan"
                name="detailPesan"
                value={formData.detailPesan}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded focus:outline-none focus:border-primary text-sm resize-vertical transition-colors duration-300 ${
                  isDarkMode
                    ? 'bg-gray-700 text-white border-gray-600 focus:border-blue-400'
                    : 'bg-white text-gray-900 border-gray-300 focus:border-primary'
                }`}
                rows={5}
                placeholder="Masukkan detail pesan"
              ></textarea>
            </div>

            <div className="mb-6">
              <label
                htmlFor="informasiKontak"
                className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}
              >
                Informasi Kontak
              </label>
              <input
                type="text"
                id="informasiKontak"
                name="informasiKontak"
                value={formData.informasiKontak}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded focus:outline-none focus:border-primary text-sm transition-colors duration-300 ${
                  isDarkMode
                    ? 'bg-gray-700 text-white border-gray-600 focus:border-blue-400'
                    : 'bg-white text-gray-900 border-gray-300 focus:border-primary'
                }`}
                placeholder="Email atau nomor telepon"
              />
            </div>

            <button
              type="submit"
              className={`px-10 py-3 rounded text-sm transition-all mx-auto block transition-colors duration-300 ${
                isDarkMode
                  ? 'bg-gray-700 hover:bg-gray-600 border border-gray-600 hover:border-blue-400 text-white'
                  : 'bg-white hover:bg-gray-100 border border-gray-300 hover:border-primary text-gray-900'
              }`}
            >
              Submit
            </button>
          </form>
        </div>
      </section>

      <Footer />
    </>
  )
}

export default Kontak
