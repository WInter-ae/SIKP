import { useState, useEffect } from "react";
import { useTheme } from "~/contexts/theme-context";
import Header from "~/components/header";
import Footer from "~/components/footer";

const Beranda = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { isDarkMode } = useTheme();

  // Array gambar gedung
  const backgroundImages = [
    "/images/gedung-1.jpg",
    "/images/gedung-2.jpg",
    "/images/gedung-3.jpg",
    "/images/gedung-4.jpg",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex(
        (prevIndex) => (prevIndex + 1) % backgroundImages.length,
      );
    }, 5000); // Ganti gambar setiap 5 detik

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <Header />

      {/* Hero Section */}
      <section className="relative h-[calc(100vh-64px)] flex items-center justify-center overflow-hidden">
        {/* Background Images dengan transisi */}
        {backgroundImages.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 bg-[url(${image})] ${
              index === currentImageIndex ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}

        {/* Overlay gelap untuk meningkatkan keterbacaan teks */}
        <div className="absolute inset-0 bg-black bg-opacity-40 z-10"></div>

        {/* Konten */}
        <div className="relative z-20 text-center text-white px-5 py-8 max-w-4xl">
          <div className="text-2xl font-bold mb-6">Logo</div>
          <h1 className="text-4xl font-bold mb-5 leading-tight drop-shadow-lg">
            Selamat Datang di
            <br />
            Sistem Informasi Kerja Praktik
          </h1>
          <p className="text-base mb-12 leading-relaxed drop-shadow-md">
            Portal Kerja Praktik Program Studi Manajemen Informatika yang
            dirancang
            <br />
            untuk mempermudah mahasiswa dalam mencari, mendaftar, dan
            <br />
            melaksanakan program kerja praktik.
          </p>

          {/* Indikator Slide */}
          <div className="flex gap-3 justify-center mt-8">
            {backgroundImages.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`h-3 rounded-full transition-all ${
                  index === currentImageIndex
                    ? "bg-white w-10"
                    : "bg-white bg-opacity-60 hover:bg-opacity-90 w-3"
                }`}
                aria-label={`Slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Section S&K */}
      <section
        className={`py-16 transition-colors duration-300 ${
          isDarkMode ? "bg-gray-800" : "bg-white"
        }`}
      >
        <div className="container mx-auto px-4">
          <h2
            className={`text-3xl font-bold mb-10 text-center transition-colors duration-300 ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}
          >
            Syarat & Ketentuan
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-5">
            <div className="text-center">
              <div className="bg-secondary text-white p-8 rounded-lg min-h-[150px] flex flex-col justify-center">
                <h3 className="text-xl mb-4">Semester</h3>
                <p className="text-sm leading-relaxed">
                  Mahasiswa minimal berada di semester 5 saat mendaftar
                </p>
              </div>
            </div>
            <div className="text-center">
              <div className="bg-secondary text-white p-8 rounded-lg min-h-[150px] flex flex-col justify-center">
                <h3 className="text-xl mb-4">UKT</h3>
                <p className="text-sm leading-relaxed">
                  Mahasiswa tidak memiliki tunggakan pembayaran UKT
                </p>
              </div>
            </div>
            <div className="text-center">
              <div className="bg-secondary text-white p-8 rounded-lg min-h-[150px] flex flex-col justify-center">
                <h3 className="text-xl mb-4">SKS</h3>
                <p className="text-sm leading-relaxed">
                  Mahasiswa telah lulus minimal 90 SKS
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section Alur Kerja Praktik */}
      <section
        className={`py-16 transition-colors duration-300 ${
          isDarkMode ? "bg-gray-900" : "bg-gray-100"
        }`}
      >
        <div className="w-full">
          <div className="p-12">
            <h2
              className={`text-3xl font-bold text-center mb-12 transition-colors duration-300 ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Alur Kerja Praktik
            </h2>
            <div className="w-full">
              <img
                src="/images/Road.png"
                alt="Alur Kerja Praktik"
                className="w-full h-auto rounded-lg"
              />
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
};

export default Beranda;
