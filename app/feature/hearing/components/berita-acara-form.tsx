import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Calendar, Clock, Plus, Trash2, Users } from "lucide-react";
import type { BeritaAcara, DosenPenguji } from "../types";
import { useState } from "react";

const dosenPengujiSchema = z.object({
  id: z.number(),
  nama: z.string().min(3, "Nama dosen minimal 3 karakter"),
  nip: z.string().min(10, "NIP minimal 10 karakter"),
  jabatan: z.enum(["pembimbing", "penguji"]),
});

const beritaAcaraSchema = z.object({
  judulLaporan: z.string().min(5, "Judul laporan minimal 5 karakter"),
  tempatPelaksanaan: z.string().min(3, "Tempat pelaksanaan minimal 3 karakter"),
  tanggalSidang: z.string().min(1, "Tanggal sidang wajib diisi"),
  waktuMulai: z.string().min(1, "Waktu mulai wajib diisi"),
  waktuSelesai: z.string().min(1, "Waktu selesai wajib diisi"),
});

type BeritaAcaraFormData = z.infer<typeof beritaAcaraSchema>;

type BeritaAcaraFormDataWithDosen = BeritaAcaraFormData & {
  dosenPenguji?: DosenPenguji[];
};

interface BeritaAcaraFormProps {
  onSubmit: (data: BeritaAcaraFormDataWithDosen) => void;
  onSaveDraft: (data: BeritaAcaraFormDataWithDosen) => void;
  initialData?: Partial<BeritaAcara>;
  isSubmitting?: boolean;
}

export function BeritaAcaraForm({
  onSubmit,
  onSaveDraft,
  initialData,
  isSubmitting = false,
}: BeritaAcaraFormProps) {
  // State untuk dosen penguji
  const [dosenPenguji, setDosenPenguji] = useState<DosenPenguji[]>(
    initialData?.dosenPenguji || [
      { id: 1, nama: "", nip: "", jabatan: "pembimbing" }
    ]
  );
  
  // State untuk error dosen penguji
  const [dosenError, setDosenError] = useState<string>("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<BeritaAcaraFormData>({
    resolver: zodResolver(beritaAcaraSchema),
    defaultValues: {
      judulLaporan: initialData?.judulLaporan || "",
      tempatPelaksanaan: initialData?.tempatPelaksanaan || "",
      tanggalSidang: initialData?.tanggalSidang || "",
      waktuMulai: initialData?.waktuMulai || "",
      waktuSelesai: initialData?.waktuSelesai || "",
    },
  });

  const handleSaveDraft = () => {
    const currentData = getValues();
    onSaveDraft({ ...currentData, dosenPenguji });
  };

  const validateDosenPenguji = () => {
    // Reset error
    setDosenError("");
    
    // Cek apakah ada minimal 1 dosen pembimbing
    const pembimbing = dosenPenguji.find(d => d.jabatan === "pembimbing");
    if (!pembimbing) {
      setDosenError("Minimal harus ada 1 Dosen Pembimbing");
      return false;
    }
    
    // Cek apakah semua dosen sudah diisi nama dan NIP
    for (const dosen of dosenPenguji) {
      if (!dosen.nama || dosen.nama.trim().length < 3) {
        setDosenError(`Nama dosen harus diisi minimal 3 karakter`);
        return false;
      }
      if (!dosen.nip || dosen.nip.trim().length < 10) {
        setDosenError(`NIP dosen harus diisi minimal 10 karakter`);
        return false;
      }
    }
    
    return true;
  };

  const handleFormSubmit = (data: BeritaAcaraFormData) => {
    // Validasi dosen penguji sebelum submit
    if (!validateDosenPenguji()) {
      return;
    }
    
    onSubmit({ ...data, dosenPenguji });
  };

  const handleAddDosen = () => {
    const newId = Math.max(...dosenPenguji.map(d => d.id), 0) + 1;
    setDosenPenguji([...dosenPenguji, { 
      id: newId, 
      nama: "", 
      nip: "", 
      jabatan: "penguji" 
    }]);
  };

  const handleRemoveDosen = (id: number) => {
    // Jangan hapus jika hanya ada 1 dosen (pembimbing wajib)
    if (dosenPenguji.length > 1) {
      setDosenPenguji(dosenPenguji.filter(d => d.id !== id));
    }
  };

  const handleUpdateDosen = (id: number, field: keyof DosenPenguji, value: string) => {
    setDosenPenguji(dosenPenguji.map(d => 
      d.id === id ? { ...d, [field]: value } : d
    ));
    // Clear error saat user mulai mengisi
    if (dosenError) {
      setDosenError("");
    }
  };

  return (
    <Card className="shadow-lg border-2">
      <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10">
        <CardTitle className="text-2xl">Form Berita Acara Sidang</CardTitle>
        <CardDescription className="text-base">
          Lengkapi data berita acara untuk pengujian sidang Kerja Praktik
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Judul Laporan */}
          <div className="space-y-2">
            <Label htmlFor="judulLaporan" className="text-base font-semibold">
              Judul Laporan <span className="text-red-500">*</span>
            </Label>
            <Input
              id="judulLaporan"
              {...register("judulLaporan")}
              placeholder="Masukkan judul laporan Kerja Praktik"
              className={`h-12 ${errors.judulLaporan ? "border-red-500" : ""}`}
            />
            {errors.judulLaporan && (
              <p className="text-sm text-red-500">
                {errors.judulLaporan.message}
              </p>
            )}
          </div>

          {/* Dosen Penguji Section */}
          <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold flex items-center gap-2">
                <Users className="h-5 w-5" />
                Dosen Penguji <span className="text-red-500">*</span>
              </Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddDosen}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Tambah Dosen Penguji
              </Button>
            </div>
            
            {/* Error Message untuk Dosen */}
            {dosenError && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-sm text-red-600 font-medium">{dosenError}</p>
              </div>
            )}
            
            {dosenPenguji.map((dosen, index) => (
              <div key={dosen.id} className="space-y-3 p-4 border rounded-md bg-background">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">
                    {index === 0 ? "Dosen Pembimbing" : `Dosen Penguji ${index}`}
                  </Label>
                  {index > 0 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveDosen(dosen.id)}
                      className="gap-2 text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                      Hapus
                    </Button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`dosen-nama-${dosen.id}`} className="text-sm">
                      Nama Lengkap <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id={`dosen-nama-${dosen.id}`}
                      value={dosen.nama}
                      onChange={(e) => handleUpdateDosen(dosen.id, "nama", e.target.value)}
                      placeholder="Masukkan nama lengkap dosen"
                      className="h-10"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor={`dosen-nip-${dosen.id}`} className="text-sm">
                      NIP <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id={`dosen-nip-${dosen.id}`}
                      value={dosen.nip}
                      onChange={(e) => handleUpdateDosen(dosen.id, "nip", e.target.value)}
                      placeholder="Masukkan NIP dosen"
                      className="h-10"
                      required
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Tempat Pelaksanaan */}
          <div className="space-y-2">
            <Label htmlFor="tempatPelaksanaan" className="text-base font-semibold">
              Tempat Pelaksanaan <span className="text-red-500">*</span>
            </Label>
            <Input
              id="tempatPelaksanaan"
              {...register("tempatPelaksanaan")}
              placeholder="Contoh: Ruang Seminar A, Gedung FMIPA"
              className={`h-12 ${errors.tempatPelaksanaan ? "border-red-500" : ""}`}
            />
            {errors.tempatPelaksanaan && (
              <p className="text-sm text-red-500">
                {errors.tempatPelaksanaan.message}
              </p>
            )}
          </div>

          {/* Tanggal Sidang */}
          <div className="space-y-2">
            <Label htmlFor="tanggalSidang" className="text-base font-semibold">
              Tanggal Sidang <span className="text-red-500">*</span>
            </Label>
            <Input
              id="tanggalSidang"
              type="date"
              {...register("tanggalSidang")}
              className={`h-12 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-100 [&::-webkit-calendar-picker-indicator]:hover:opacity-80 [&::-webkit-calendar-picker-indicator]:w-5 [&::-webkit-calendar-picker-indicator]:h-5 [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:brightness-0 [&::-webkit-calendar-picker-indicator]:saturate-100 [&::-webkit-calendar-picker-indicator]:invert-[.45] [&::-webkit-calendar-picker-indicator]:sepia-[1] [&::-webkit-calendar-picker-indicator]:hue-rotate-[90deg] ${errors.tanggalSidang ? "border-red-500" : ""}`}
              style={{
                colorScheme: 'light'
              }}
            />
            {errors.tanggalSidang && (
              <p className="text-sm text-red-500">
                {errors.tanggalSidang.message}
              </p>
            )}
          </div>

          {/* Waktu Pelaksanaan */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="waktuMulai" className="text-base font-semibold">
                Waktu Mulai <span className="text-red-500">*</span>
              </Label>
              <Input
                id="waktuMulai"
                type="time"
                {...register("waktuMulai")}
                className={`h-12 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-100 [&::-webkit-calendar-picker-indicator]:hover:opacity-80 [&::-webkit-calendar-picker-indicator]:w-5 [&::-webkit-calendar-picker-indicator]:h-5 [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:brightness-0 [&::-webkit-calendar-picker-indicator]:saturate-100 [&::-webkit-calendar-picker-indicator]:invert-[.3] [&::-webkit-calendar-picker-indicator]:sepia-[1] [&::-webkit-calendar-picker-indicator]:hue-rotate-[180deg] ${errors.waktuMulai ? "border-red-500" : ""}`}
                style={{
                  colorScheme: 'light'
                }}
              />
              {errors.waktuMulai && (
                <p className="text-sm text-red-500">
                  {errors.waktuMulai.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="waktuSelesai" className="text-base font-semibold">
                Waktu Selesai <span className="text-red-500">*</span>
              </Label>
              <Input
                id="waktuSelesai"
                type="time"
                {...register("waktuSelesai")}
                className={`h-12 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-100 [&::-webkit-calendar-picker-indicator]:hover:opacity-80 [&::-webkit-calendar-picker-indicator]:w-5 [&::-webkit-calendar-picker-indicator]:h-5 [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:brightness-0 [&::-webkit-calendar-picker-indicator]:saturate-100 [&::-webkit-calendar-picker-indicator]:invert-[.3] [&::-webkit-calendar-picker-indicator]:sepia-[1] [&::-webkit-calendar-picker-indicator]:hue-rotate-[180deg] ${errors.waktuSelesai ? "border-red-500" : ""}`}
                style={{
                  colorScheme: 'light'
                }}
              />
              {errors.waktuSelesai && (
                <p className="text-sm text-red-500">
                  {errors.waktuSelesai.message}
                </p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleSaveDraft}
              disabled={isSubmitting}
              className="w-full sm:w-auto h-11"
            >
              Simpan Draft
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:flex-1 h-11"
            >
              {isSubmitting ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Mengajukan...
                </>
              ) : (
                "Ajukan ke Dosen"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
