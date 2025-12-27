import { useState, useRef } from "react";
import { Link } from "react-router";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { ArrowLeft, Save, User, Camera, Mail, Phone, Building2, MapPin, Briefcase, Pen, Trash2 } from "lucide-react";

export default function ProfilPage() {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: "Budi Santoso, S.T., M.T.",
    nip: "198501152010121001",
    email: "budi.santoso@company.com",
    phone: "081234567890",
    company: "PT. Teknologi Indonesia",
    position: "Software Engineer Lead",
    address: "Jl. Raya Teknologi No. 123, Jakarta Selatan",
    bio: "Berpengalaman 10+ tahun di bidang software engineering dan pembimbingan mahasiswa magang.",
    photo: "",
    signature: "",
  });

  const [editData, setEditData] = useState(profileData);
  const [isDrawing, setIsDrawing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showSignatureModal, setShowSignatureModal] = useState(false);

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  }

  function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditData((prev) => ({ ...prev, photo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  }

  function handleSave() {
    setProfileData(editData);
    setIsEditing(false);
    alert("Profil berhasil diperbarui!");
  }

  function handleCancel() {
    setEditData(profileData);
    setIsEditing(false);
  }

  // E-Signature functions
  function startDrawing(e: React.MouseEvent<HTMLCanvasElement>) {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  }

  function draw(e: React.MouseEvent<HTMLCanvasElement>) {
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
  }

  function stopDrawing() {
    setIsDrawing(false);
  }

  function clearSignature() {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  function saveSignature() {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const signatureData = canvas.toDataURL();
    setEditData((prev) => ({ ...prev, signature: signatureData }));
    setShowSignatureModal(false);
    alert("Tanda tangan berhasil disimpan!");
  }

  function deleteSignature() {
    setEditData((prev) => ({ ...prev, signature: "" }));
    clearSignature();
    alert("Tanda tangan berhasil dihapus!");
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Profil</h1>
        <p className="text-muted-foreground">
          Kelola informasi profil Anda
        </p>
      </div>

      {/* Profile Card */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Informasi Profil</CardTitle>
              <CardDescription>
                {isEditing
                  ? "Edit informasi profil Anda"
                  : "Lihat dan edit informasi profil"}
              </CardDescription>
            </div>
            {!isEditing && (
              <Button onClick={() => setIsEditing(true)}>
                Edit Profil
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {/* Photo Section */}
          <div className="flex flex-col items-center mb-6">
            <div className="relative">
              {editData.photo ? (
                <img
                  src={editData.photo}
                  alt="Profile"
                  className="w-32 h-32 rounded-full object-cover border-4 border-gray-200"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center border-4 border-gray-300">
                  <User className="h-16 w-16 text-gray-400" />
                </div>
              )}
              {isEditing && (
                <label
                  htmlFor="photo-upload"
                  className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-2 cursor-pointer hover:bg-primary/90"
                >
                  <Camera className="h-4 w-4" />
                  <input
                    id="photo-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoUpload}
                  />
                </label>
              )}
            </div>
            {isEditing && (
              <p className="text-xs text-muted-foreground mt-2">
                Klik ikon kamera untuk mengubah foto
              </p>
            )}
          </div>

          <div className="space-y-4">
            {/* Name */}
            <div>
              <Label htmlFor="name" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Nama Lengkap
              </Label>
              {isEditing ? (
                <Input
                  id="name"
                  name="name"
                  value={editData.name}
                  onChange={handleInputChange}
                  className="mt-1"
                />
              ) : (
                <p className="mt-1 font-medium">{profileData.name}</p>
              )}
            </div>

            {/* NIP */}
            <div>
              <Label htmlFor="nip" className="flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                NIP/NIK
              </Label>
              {isEditing ? (
                <Input
                  id="nip"
                  name="nip"
                  value={editData.nip}
                  onChange={handleInputChange}
                  className="mt-1"
                />
              ) : (
                <p className="mt-1 font-medium">{profileData.nip}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email
              </Label>
              {isEditing ? (
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={editData.email}
                  onChange={handleInputChange}
                  className="mt-1"
                />
              ) : (
                <p className="mt-1 font-medium">{profileData.email}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                No. Telepon
              </Label>
              {isEditing ? (
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={editData.phone}
                  onChange={handleInputChange}
                  className="mt-1"
                />
              ) : (
                <p className="mt-1 font-medium">{profileData.phone}</p>
              )}
            </div>

            {/* Company */}
            <div>
              <Label htmlFor="company" className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Perusahaan
              </Label>
              {isEditing ? (
                <Input
                  id="company"
                  name="company"
                  value={editData.company}
                  onChange={handleInputChange}
                  className="mt-1"
                />
              ) : (
                <p className="mt-1 font-medium">{profileData.company}</p>
              )}
            </div>

            {/* Position */}
            <div>
              <Label htmlFor="position" className="flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                Jabatan
              </Label>
              {isEditing ? (
                <Input
                  id="position"
                  name="position"
                  value={editData.position}
                  onChange={handleInputChange}
                  className="mt-1"
                />
              ) : (
                <p className="mt-1 font-medium">{profileData.position}</p>
              )}
            </div>

            {/* Address */}
            <div>
              <Label htmlFor="address" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Alamat
              </Label>
              {isEditing ? (
                <Textarea
                  id="address"
                  name="address"
                  value={editData.address}
                  onChange={handleInputChange}
                  className="mt-1"
                  rows={3}
                />
              ) : (
                <p className="mt-1 font-medium">{profileData.address}</p>
              )}
            </div>

            {/* Bio */}
            <div>
              <Label htmlFor="bio">Bio</Label>
              {isEditing ? (
                <Textarea
                  id="bio"
                  name="bio"
                  value={editData.bio}
                  onChange={handleInputChange}
                  className="mt-1"
                  rows={4}
                  placeholder="Ceritakan tentang pengalaman dan keahlian Anda..."
                />
              ) : (
                <p className="mt-1 font-medium">{profileData.bio}</p>
              )}
            </div>

            {/* E-Signature */}
            <div>
              <Label className="flex items-center gap-2">
                <Pen className="h-4 w-4" />
                Tanda Tangan Digital
              </Label>
              <div className="mt-2">
                {editData.signature ? (
                  <div className="space-y-2">
                    <div className="border rounded-lg p-4 bg-white">
                      <img
                        src={editData.signature}
                        alt="Signature"
                        className="max-w-full h-24 object-contain"
                      />
                    </div>
                    {isEditing && (
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setShowSignatureModal(true)}
                        >
                          <Pen className="h-4 w-4 mr-2" />
                          Ubah Tanda Tangan
                        </Button>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={deleteSignature}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Hapus
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    {isEditing ? (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowSignatureModal(true)}
                      >
                        <Pen className="h-4 w-4 mr-2" />
                        Buat Tanda Tangan
                      </Button>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">
                        Belum ada tanda tangan digital
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons for Edit Mode */}
          {isEditing && (
            <div className="flex justify-end gap-4 mt-6">
              <Button variant="outline" onClick={handleCancel}>
                Batal
              </Button>
              <Button onClick={handleSave}>
                <Save className="mr-2 h-4 w-4" />
                Simpan Perubahan
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* E-Signature Modal */}
      {showSignatureModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl mx-4">
            <CardHeader>
              <CardTitle>Buat Tanda Tangan Digital</CardTitle>
              <CardDescription>
                Gambar tanda tangan Anda pada area di bawah ini
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg bg-white">
                  <canvas
                    ref={canvasRef}
                    width={600}
                    height={200}
                    className="w-full cursor-crosshair"
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                  />
                </div>
                <div className="flex justify-between">
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={clearSignature}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Hapus
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowSignatureModal(false)}
                    >
                      Batal
                    </Button>
                    <Button type="button" onClick={saveSignature}>
                      <Save className="h-4 w-4 mr-2" />
                      Simpan Tanda Tangan
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Back Button */}
      <div className="flex justify-start">
        <Button variant="secondary" asChild>
          <Link to="/mentor">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali ke Dashboard
          </Link>
        </Button>
      </div>
    </div>
  );
}
