import { useState, useRef, useEffect } from "react";
import { Calendar as CalendarIcon } from "lucide-react";

import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Separator } from "~/components/ui/separator";

import type { AdditionalInfoData } from "../types";

interface AdditionalInfoFormProps {
  onDataChange?: (data: AdditionalInfoData) => void;
  initialData?: AdditionalInfoData;
  isEditable?: boolean;
}

function AdditionalInfoForm({
  onDataChange,
  initialData,
  isEditable = true,
}: AdditionalInfoFormProps) {
  const [formData, setFormData] = useState<AdditionalInfoData>(
    initialData || {
      tujuanSurat: "",
      namaTempat: "",
      alamatTempat: "",
      tanggalMulai: "",
      tanggalSelesai: "",
      divisi: "",
    }
  );

  const tanggalMulaiRef = useRef<HTMLInputElement>(null);
  const tanggalSelesaiRef = useRef<HTMLInputElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Update formData ketika initialData berubah (dari parent component)
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  // Debounced autosave: tunggu 10 detik setelah user berhenti mengetik
  useEffect(() => {
    if (!isEditable) return;
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      if (onDataChange) {
        console.log("💾 Auto-saving additional info after 10 seconds:", formData);
        onDataChange(formData);
      }
    }, 10000); // 10 detik delay

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [formData, onDataChange, isEditable]);

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!isEditable) return;
    const { name, value } = e.target;
    const updatedFormData = { ...formData, [name]: value };
    setFormData(updatedFormData);
    // Jangan langsung call onDataChange - biarkan debounce effect menanganinya
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
            disabled={!isEditable}
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
            disabled={!isEditable}
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
            disabled={!isEditable}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="divisi">Nama Unit/Divisi</Label>
          <Input
            type="text"
            id="divisi"
            name="divisi"
            placeholder=""
            onChange={handleInputChange}
            value={formData.divisi}
            disabled={!isEditable}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="tanggalMulai">Tanggal Mulai KP</Label>
          <div className="relative">
            <Input
              type="date"
              id="tanggalMulai"
              name="tanggalMulai"
              onChange={handleInputChange}
              value={formData.tanggalMulai}
              ref={tanggalMulaiRef}
              className="pr-10"
              disabled={!isEditable}
            />
            <CalendarIcon
              className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground cursor-pointer"
              onClick={() => {
                if (!isEditable) return;
                tanggalMulaiRef.current?.showPicker();
              }}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="tanggalSelesai">Tanggal Selesai KP</Label>
          <div className="relative">
            <Input
              type="date"
              id="tanggalSelesai"
              name="tanggalSelesai"
              onChange={handleInputChange}
              value={formData.tanggalSelesai}
              ref={tanggalSelesaiRef}
              className="pr-10"
              disabled={!isEditable}
            />
            <CalendarIcon
              className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground cursor-pointer"
              onClick={() => {
                if (!isEditable) return;
                tanggalSelesaiRef.current?.showPicker();
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdditionalInfoForm;
