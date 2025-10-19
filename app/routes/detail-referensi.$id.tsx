import { useNavigate, useParams } from "react-router";
import Header from "~/components/header";
import Footer from "~/components/footer";

const DetailReferensi = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const handleBack = () => {
    navigate("/referensi");
  };

  return (
    <>
      <Header />

      <section className="py-16 bg-white min-h-[calc(100vh-300px)]">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Left Side - Image Gallery */}
            <div className="relative">
              <div className="relative bg-gray-900 rounded-lg aspect-[4/3] flex items-center justify-center">
                <button className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white w-10 h-10 rounded-full flex items-center justify-center text-xl font-bold transition-colors z-10">
                  &lt;
                </button>
                <div className="text-white text-2xl font-bold text-center leading-relaxed">
                  Gambar
                  <br />
                  Instansi
                </div>
                <button className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white w-10 h-10 rounded-full flex items-center justify-center text-xl font-bold transition-colors z-10">
                  &gt;
                </button>
              </div>
            </div>

            {/* Right Side - Details */}
            <div className="pt-5">
              <div className="mb-5">
                <span
                  onClick={handleBack}
                  className="text-sm text-gray-600 hover:text-primary cursor-pointer transition-colors block mb-2"
                >
                  Kembali
                </span>
                <h1 className="text-4xl font-bold text-gray-900">
                  PT. Cinta Sejati
                </h1>
              </div>

              <div className="mb-8">
                <p className="text-sm leading-relaxed text-gray-600">
                  Deskripsi terkait organisasi. Deskripsi terkait organisasi.
                  Deskripsi terkait organisasi. Deskripsi terkait organisasi.
                  Deskripsi terkait organisasi. Deskripsi terkait organisasi.
                  Deskripsi terkait organisasi.
                </p>
              </div>

              <div className="mb-8">
                <p className="text-sm text-gray-900 mb-2">
                  Jumlah Mahasiswa yang melakukan KP: 10
                </p>
                <p className="text-sm text-gray-900">
                  Mulai bekerja sama sejak : 2023
                </p>
              </div>

              <div className="mt-8">
                <button className="bg-white border border-gray-300 hover:bg-gray-100 px-5 py-2 rounded text-sm transition-colors mb-4">
                  Lokasi organisasi
                </button>
                <div className="w-full aspect-video bg-gray-900 rounded-lg flex items-center justify-center">
                  <div className="text-white text-2xl font-bold">
                    Preview Maps
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
};

export default DetailReferensi;
