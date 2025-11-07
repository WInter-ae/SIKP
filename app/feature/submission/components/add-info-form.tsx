import React, { useState } from "react";
import type { AdditionalInfoData } from "../components/submission-types";

interface AdditionalInfoFormProps {
  onDataChange?: (data: AdditionalInfoData) => void;
}

const AdditionalInfoForm: React.FC<AdditionalInfoFormProps> = ({
  onDataChange,
}) => {
  const [formData, setFormData] = useState<AdditionalInfoData>({
    tujuanSurat: "",
    namaTempat: "",
    alamatTempat: "",
    tanggalMulai: "",
    tanggalSelesai: "",
    pembimbingLapangan: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const updatedFormData = { ...formData, [name]: value };
    setFormData(updatedFormData);
    if (onDataChange) {
      onDataChange(updatedFormData);
    }
  };

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b">
        Keterangan Lain
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Tujuan Surat
          </label>
          <input
            type="text"
            name="tujuanSurat"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-500"
            placeholder="HRD/Lainnya"
            onChange={handleInputChange}
            value={formData.tujuanSurat}
          />
        </div>
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Nama Tempat KP
          </label>
          <input
            type="text"
            name="namaTempat"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-500"
            placeholder=""
            onChange={handleInputChange}
            value={formData.namaTempat}
          />
        </div>
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Alamat Tempat KP
          </label>
          <input
            type="text"
            name="alamatTempat"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-500"
            placeholder=""
            onChange={handleInputChange}
            value={formData.alamatTempat}
          />
        </div>
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Nama Unit/Divisi
          </label>
          <input
            type="text"
            name="pembimbingLapangan"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-500"
            placeholder=""
            onChange={handleInputChange}
            value={formData.pembimbingLapangan}
          />
        </div>
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Tanggal Mulai KP
          </label>
          <input
            type="date"
            name="tanggalMulai"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-500"
            onChange={handleInputChange}
            value={formData.tanggalMulai}
          />
        </div>
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Tanggal Selesai KP
          </label>
          <input
            type="date"
            name="tanggalSelesai"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-500"
            onChange={handleInputChange}
            value={formData.tanggalSelesai}
          />
        </div>
      </div>
    </div>
  );
};

export default AdditionalInfoForm;
