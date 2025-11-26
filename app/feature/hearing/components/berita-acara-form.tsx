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
import { Calendar, Clock } from "lucide-react";
import type { BeritaAcara } from "../types";

const beritaAcaraSchema = z.object({
  judulLaporan: z.string().min(5, "Judul laporan minimal 5 karakter"),
  tempatPelaksanaan: z.string().min(3, "Tempat pelaksanaan minimal 3 karakter"),
  tanggalSidang: z.string().min(1, "Tanggal sidang wajib diisi"),
  waktuMulai: z.string().min(1, "Waktu mulai wajib diisi"),
  waktuSelesai: z.string().min(1, "Waktu selesai wajib diisi"),
});

type BeritaAcaraFormData = z.infer<typeof beritaAcaraSchema>;

interface BeritaAcaraFormProps {
  onSubmit: (data: BeritaAcaraFormData) => void;
  onSaveDraft: (data: BeritaAcaraFormData) => void;
  initialData?: Partial<BeritaAcara>;
  isSubmitting?: boolean;
}

export function BeritaAcaraForm({
  onSubmit,
  onSaveDraft,
  initialData,
  isSubmitting = false,
}: BeritaAcaraFormProps) {
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
    onSaveDraft(currentData);
  };

  return (
    <Card className="shadow-lg border-2">
      <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950">
        <CardTitle className="text-2xl">Form Berita Acara Sidang</CardTitle>
        <CardDescription className="text-base">
          Lengkapi data berita acara untuk pengujian sidang Kerja Praktik
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
              className="w-full sm:flex-1 bg-green-700 hover:bg-green-800 h-11"
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
