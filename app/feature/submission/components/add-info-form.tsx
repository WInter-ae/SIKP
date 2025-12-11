import { useState } from "react";

import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Separator } from "~/components/ui/separator";

import type { AdditionalInfoData } from "../types";

interface AdditionalInfoFormProps {
  onDataChange?: (data: AdditionalInfoData) => void;
}

function AdditionalInfoForm({ onDataChange }: AdditionalInfoFormProps) {
  const [formData, setFormData] = useState<AdditionalInfoData>({
    tujuanSurat: "",
    namaTempat: "",
    alamatTempat: "",
    tanggalMulai: "",
    tanggalSelesai: "",
    pembimbingLapangan: "",
  });

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    const updatedFormData = { ...formData, [name]: value };
    setFormData(updatedFormData);
    if (onDataChange) {
      onDataChange(updatedFormData);
    }
  }

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold text-foreground mb-4">
        Keterangan Lain
      </h2>
      <Separator className="mb-4" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="tujuanSurat">Tujuan Surat</Label>
          <Input
            type="text"
            id="tujuanSurat"
            name="tujuanSurat"
            placeholder="HRD/Lainnya"
            onChange={handleInputChange}
            value={formData.tujuanSurat}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="namaTempat">Nama Tempat KP</Label>
          <Input
            type="text"
            id="namaTempat"
            name="namaTempat"
            placeholder=""
            onChange={handleInputChange}
            value={formData.namaTempat}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="alamatTempat">Alamat Tempat KP</Label>
          <Input
            type="text"
            id="alamatTempat"
            name="alamatTempat"
            placeholder=""
            onChange={handleInputChange}
            value={formData.alamatTempat}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="pembimbingLapangan">Nama Unit/Divisi</Label>
          <Input
            type="text"
            id="pembimbingLapangan"
            name="pembimbingLapangan"
            placeholder=""
            onChange={handleInputChange}
            value={formData.pembimbingLapangan}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="tanggalMulai">Tanggal Mulai KP</Label>
          <Input
            type="date"
            id="tanggalMulai"
            name="tanggalMulai"
            onChange={handleInputChange}
            value={formData.tanggalMulai}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="tanggalSelesai">Tanggal Selesai KP</Label>
          <Input
            type="date"
            id="tanggalSelesai"
            name="tanggalSelesai"
            onChange={handleInputChange}
            value={formData.tanggalSelesai}
          />
        </div>
      </div>
    </div>
  );
}

export default AdditionalInfoForm;
