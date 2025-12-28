// External dependencies
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import {
  Save,
  User,
  Camera,
  Mail,
  Phone,
  Building2,
  MapPin,
  Briefcase,
  Pen,
  Trash2,
} from "lucide-react";

// Components
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
import PageHeader from "../components/page-header";
import BackButton from "../components/back-button";

// Types
import type { ProfileData } from "../types";

const DEFAULT_PROFILE: ProfileData = {
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
};

function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>(DEFAULT_PROFILE);
  const [editData, setEditData] = useState<ProfileData>(profileData);
  const [isDrawing, setIsDrawing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  // Handle ESC key to close modal
  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape" && showSignatureModal) {
        setShowSignatureModal(false);
      }
    }

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [showSignatureModal]);

  // Focus trap for modal
  useEffect(() => {
    if (showSignatureModal && modalRef.current) {
      const focusableElements = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      function handleTabKey(e: KeyboardEvent) {
        if (e.key !== "Tab") return;

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement?.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement?.focus();
            e.preventDefault();
          }
        }
      }

      firstElement?.focus();
      document.addEventListener("keydown", handleTabKey);
      return () => document.removeEventListener("keydown", handleTabKey);
    }
  }, [showSignatureModal]);

  function handleInputChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  }

  function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type with allowlist
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        toast.error("File harus berupa gambar (JPEG, PNG, GIF, atau WebP)!");
        return;
      }
      
      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (file.size > maxSize) {
        toast.error("Ukuran file maksimal 5MB!");
        return;
      }
      
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
    toast.success("Profil berhasil diperbarui!");
  }

  function handleCancel() {
    setEditData(profileData);
    setIsEditing(false);
  }

  // E-Signature functions
  function getCoordinates(e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    
    if ('touches' in e) {
      // Touch event
      const touch = e.touches[0] || e.changedTouches[0];
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
      };
    } else {
      // Mouse event
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    }
  }

  function startDrawing(e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) {
    e.preventDefault();
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const coords = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
  }

  function draw(e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) {
    e.preventDefault();
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const coords = getCoordinates(e);
    ctx.lineTo(coords.x, coords.y);
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.stroke();
  }

  function stopDrawing(e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) {
    e.preventDefault();
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
    toast.success("Tanda tangan berhasil disimpan!");
  }

  function deleteSignature() {
    setEditData((prev) => ({ ...prev, signature: "" }));
    clearSignature();
    toast.success("Tanda tangan berhasil dihapus!");
  }

  return (
    <div className="p-6">
      <PageHeader title="Profil" description="Kelola informasi profil Anda" />

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
              <Button onClick={() => setIsEditing(true)}>Edit Profil</Button>
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
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="signature-modal-title"
        >
          <Card className="w-full max-w-2xl mx-4" ref={modalRef}>
            <CardHeader>
              <CardTitle id="signature-modal-title">Buat Tanda Tangan Digital</CardTitle>
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
                    aria-label="Area untuk menggambar tanda tangan digital"
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    onTouchCancel={stopDrawing}
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
      <BackButton />
    </div>
  );
}

export default ProfilePage;
