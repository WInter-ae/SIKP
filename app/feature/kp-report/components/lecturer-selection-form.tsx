import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { Info, User } from "lucide-react";
import type { DosenPembimbing } from "../types";

interface LecturerSelectionFormProps {
  currentLecturer?: DosenPembimbing;
  availableLecturers: DosenPembimbing[];
  onSubmit: (lecturerId: string) => void;
  disabled?: boolean;
  isFromTeam?: boolean;
}

export default function LecturerSelectionForm({
  currentLecturer,
  availableLecturers,
  onSubmit,
  disabled = false,
  isFromTeam = false,
}: LecturerSelectionFormProps) {
  const [selectedLecturer, setSelectedLecturer] = useState<string>(
    currentLecturer?.id || ""
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedLecturer) {
      onSubmit(selectedLecturer);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pengesahan Dosen Pembimbing KP</CardTitle>
      </CardHeader>
      <CardContent>
        {isFromTeam && currentLecturer ? (
          <Alert className="mb-4 border-l-4 border-green-500 bg-green-50">
            <User className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Dosen pembimbing sudah ditentukan saat pembuatan tim
            </AlertDescription>
          </Alert>
        ) : (
          <Alert className="mb-4 border-l-4 border-blue-500 bg-blue-50">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              Pilih dosen pembimbing untuk pengesahan laporan KP Anda (Opsional)
            </AlertDescription>
          </Alert>
        )}

        {currentLecturer && (
          <div className="mb-4 p-4 bg-muted rounded-lg">
            <Label className="text-sm font-medium text-muted-foreground">
              Dosen Pembimbing Saat Ini:
            </Label>
            <div className="mt-2">
              <p className="font-medium text-foreground">{currentLecturer.nama}</p>
              <p className="text-sm text-muted-foreground">NIP: {currentLecturer.nip}</p>
              <p className="text-sm text-muted-foreground">{currentLecturer.email}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="dosen">
              {currentLecturer ? "Ganti Dosen Pembimbing" : "Pilih Dosen Pembimbing"}
            </Label>
            <Select
              value={selectedLecturer}
              onValueChange={setSelectedLecturer}
              disabled={disabled}
            >
              <SelectTrigger id="dosen">
                <SelectValue placeholder="Pilih dosen pembimbing..." />
              </SelectTrigger>
              <SelectContent>
                {availableLecturers.map((dosen) => (
                  <SelectItem key={dosen.id} value={dosen.id}>
                    {dosen.nama} - {dosen.nip}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              Pilih dosen pembimbing yang akan membimbing laporan KP Anda
            </p>
          </div>

          <Button
            type="submit"
            disabled={disabled || !selectedLecturer}
            className="w-full"
          >
            {currentLecturer ? "Ubah Dosen Pembimbing" : "Tetapkan Dosen Pembimbing"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
