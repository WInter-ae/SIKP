import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { Pen, Upload, Type, Check, X, AlertCircle } from "lucide-react";
import type { ESignatureSetupData } from "../types/esignature";

interface ESignatureSetupProps {
  onSave: (data: ESignatureSetupData) => void;
  onCancel?: () => void;
  existingSignature?: string;
  dosenName: string;
  nip: string;
}

export function ESignatureSetup({
  onSave,
  onCancel,
  existingSignature,
  dosenName,
  nip,
}: ESignatureSetupProps) {
  const [signatureType, setSignatureType] = useState<"draw" | "upload" | "text">("draw");
  const [isDrawing, setIsDrawing] = useState(false);
  const [signatureData, setSignatureData] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [textSignature, setTextSignature] = useState(dosenName);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (existingSignature) {
      setSignatureData(existingSignature);
    }
  }, [existingSignature]);

  // Drawing handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      setSignatureData(canvas.toDataURL());
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSignatureData("");
  };

  // Upload handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Ukuran file maksimal 2MB");
        return;
      }
      
      const reader = new FileReader();
      reader.onload = () => {
        setSignatureData(reader.result as string);
        setUploadedFile(file);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    let finalData = "";
    
    if (signatureType === "draw") {
      if (!signatureData) {
        alert("Silakan buat tanda tangan terlebih dahulu");
        return;
      }
      finalData = signatureData;
    } else if (signatureType === "upload") {
      if (!signatureData) {
        alert("Silakan upload gambar tanda tangan");
        return;
      }
      finalData = signatureData;
    } else if (signatureType === "text") {
      if (!textSignature.trim()) {
        alert("Silakan masukkan nama untuk tanda tangan");
        return;
      }
      finalData = textSignature;
    }

    onSave({
      signatureType,
      signatureData: finalData,
      dosenName,
      nip,
    });
  };

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Setup E-Signature</CardTitle>
        <CardDescription>
          Buat tanda tangan digital Anda untuk approval dokumen
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            E-Signature akan digunakan untuk menandatangani berita acara sidang secara otomatis.
          </AlertDescription>
        </Alert>

        <Tabs value={signatureType} onValueChange={(v) => setSignatureType(v as any)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="draw" className="gap-2">
              <Pen className="h-4 w-4" />
              Gambar
            </TabsTrigger>
            <TabsTrigger value="upload" className="gap-2">
              <Upload className="h-4 w-4" />
              Upload
            </TabsTrigger>
            <TabsTrigger value="text" className="gap-2">
              <Type className="h-4 w-4" />
              Teks
            </TabsTrigger>
          </TabsList>

          {/* Draw Tab */}
          <TabsContent value="draw" className="space-y-4">
            <div>
              <Label className="mb-2 block">Gambar Tanda Tangan Anda</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-white">
                <canvas
                  ref={canvasRef}
                  width={600}
                  height={200}
                  className="w-full border border-gray-300 rounded cursor-crosshair bg-white"
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={clearCanvas}
                className="mt-2"
              >
                <X className="h-4 w-4 mr-2" />
                Hapus
              </Button>
            </div>
          </TabsContent>

          {/* Upload Tab */}
          <TabsContent value="upload" className="space-y-4">
            <div>
              <Label htmlFor="signature-upload" className="mb-2 block">
                Upload Gambar Tanda Tangan
              </Label>
              <Input
                id="signature-upload"
                type="file"
                accept="image/png,image/jpeg,image/jpg"
                onChange={handleFileUpload}
                className="mb-3"
              />
              <p className="text-sm text-gray-600 mb-3">
                Format: PNG, JPG, JPEG (Maks. 2MB)
              </p>
              {signatureData && (
                <div className="border rounded-lg p-4 bg-gray-50">
                  <img
                    src={signatureData}
                    alt="Preview"
                    className="max-h-40 mx-auto"
                  />
                </div>
              )}
            </div>
          </TabsContent>

          {/* Text Tab */}
          <TabsContent value="text" className="space-y-4">
            <div>
              <Label htmlFor="text-signature" className="mb-2 block">
                Nama untuk Tanda Tangan
              </Label>
              <Input
                id="text-signature"
                type="text"
                value={textSignature}
                onChange={(e) => setTextSignature(e.target.value)}
                placeholder="Masukkan nama Anda"
                className="mb-3"
              />
              <div className="border rounded-lg p-6 bg-white text-center">
                <p className="text-3xl font-signature" style={{ fontFamily: "Brush Script MT, cursive" }}>
                  {textSignature || "Preview Tanda Tangan"}
                </p>
                <p className="text-sm text-gray-600 mt-2">NIP: {nip}</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <Button onClick={handleSave} className="flex-1 gap-2">
            <Check className="h-4 w-4" />
            Simpan E-Signature
          </Button>
          {onCancel && (
            <Button variant="outline" onClick={onCancel}>
              Batal
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
