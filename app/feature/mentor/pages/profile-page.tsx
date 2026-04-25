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
import { SignatureDialog, SignatureCanvas } from "~/feature/field-mentor";

// API services
import {
  deleteMentorSignature,
  getMentorProfile,
  saveMentorSignature,
  updateMentorProfile,
  type MentorProfile,
} from "~/feature/field-mentor/services";

// Types
import type { ProfileData } from "../types";

const DEFAULT_PROFILE: ProfileData = {
  name: "-",
  nip: "-",
  email: "-",
  phone: "-",
  company: "-",
  position: "-",
  address: "-",
  bio: "-",
  photo: "",
  signature: "",
};

function mapMentorProfileToFormData(data: MentorProfile): ProfileData {
  return {
    name: data.name || "-",
    nip: data.userId || "-",
    email: data.email || "-",
    phone: data.phone || "-",
    company: data.company || "-",
    position: data.position || "-",
    address: data.address || "-",
    bio: "-",
    photo: "",
    signature: data.signature || "",
  };
}

function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>(DEFAULT_PROFILE);
  const [editData, setEditData] = useState<ProfileData>(DEFAULT_PROFILE);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [emailChangeRequest, setEmailChangeRequest] = useState({
    newEmail: "",
    reason: "",
  });
  const [isSubmittingEmailRequest, setIsSubmittingEmailRequest] =
    useState(false);
  const sigCanvasRef = useRef<SignatureCanvas>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [signaturePreview, setSignaturePreview] = useState<string | null>(null);
  const [isUpdatingSignature, setIsUpdatingSignature] = useState(false);
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
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[
        focusableElements.length - 1
      ] as HTMLElement;

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

  useEffect(() => {
    let isMounted = true;

    async function loadProfile() {
      setIsLoadingProfile(true);
      try {
        const response = await getMentorProfile();
        if (!isMounted) return;

        if (!response.success || !response.data) {
          toast.error(response.message || "Gagal memuat profil mentor.");
          return;
        }

        const mapped = mapMentorProfileToFormData(response.data);
        setProfileData(mapped);
        setEditData(mapped);
      } catch (error) {
        if (!isMounted) return;
        toast.error(
          error instanceof Error
            ? error.message
            : "Gagal memuat profil mentor.",
        );
      } finally {
        if (isMounted) {
          setIsLoadingProfile(false);
        }
      }
    }

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  function handleInputChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  }

  function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type with allowlist
      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
      ];
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

  async function handleSave() {
    setIsSavingProfile(true);

    try {
      const response = await updateMentorProfile({
        name: editData.name,
        phone: editData.phone === "-" ? "" : editData.phone,
        position: editData.position,
        address: editData.address === "-" ? "" : editData.address,
      });

      if (!response.success || !response.data) {
        toast.error(response.message || "Gagal memperbarui profil mentor.");
        return;
      }

      const mapped = mapMentorProfileToFormData(response.data);
      mapped.bio = editData.bio;
      mapped.photo = editData.photo;

      setProfileData(mapped);
      setEditData(mapped);
      setIsEditing(false);
      toast.success("Profil berhasil diperbarui!");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Gagal memperbarui profil mentor.",
      );
    } finally {
      setIsSavingProfile(false);
    }
  }

  function handleCancel() {
    setEditData(profileData);
    setIsEditing(false);
  }

  function handleSubmitEmailChangeRequest() {
    const newEmail = emailChangeRequest.newEmail.trim().toLowerCase();
    const reason = emailChangeRequest.reason.trim();
    const emailPattern = /^\S+@\S+\.\S+$/;

    if (!newEmail) {
      toast.error("Email baru wajib diisi.");
      return;
    }

    if (!emailPattern.test(newEmail)) {
      toast.error("Format email baru tidak valid.");
      return;
    }

    if (newEmail === profileData.email.toLowerCase()) {
      toast.error("Email baru tidak boleh sama dengan email saat ini.");
      return;
    }

    if (!reason) {
      toast.error("Alasan perubahan email wajib diisi.");
      return;
    }

    // TODO: Ganti dengan API request ke endpoint pengajuan perubahan email mentor.
    setIsSubmittingEmailRequest(true);
    setTimeout(() => {
      setIsSubmittingEmailRequest(false);
      setEmailChangeRequest({ newEmail: "", reason: "" });
      toast.success("Pengajuan perubahan email dikirim ke Dosen PA/Admin.");
    }, 300);
  }

  // E-Signature functions
  const handleClearSignature = () => {
    sigCanvasRef.current?.clear();
    setSignaturePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleChooseFile = () => {
    fileInputRef.current?.click();
  };

  const handleUploadSignature = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("File harus berupa gambar (PNG/JPG/WebP).");
      return;
    }

    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error("Ukuran file maksimal 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === "string") {
        sigCanvasRef.current?.clear();
        setSignaturePreview(result);
      }
    };
    reader.readAsDataURL(file);
  };

  async function saveSignature() {
    // Auto-generate preview from canvas if empty but canvas has content
    let finalPreview = signaturePreview;
    if (
      !finalPreview &&
      sigCanvasRef.current &&
      sigCanvasRef.current.isEmpty &&
      !sigCanvasRef.current.isEmpty()
    ) {
      finalPreview = sigCanvasRef.current.toDataURL("image/png");
      setSignaturePreview(finalPreview);
    }

    if (!finalPreview) {
      toast.error("Silakan buat tanda tangan terlebih dahulu.");
      return;
    }

    setIsUpdatingSignature(true);
    try {
      const response = await saveMentorSignature(finalPreview);
      if (!response.success || !response.data) {
        toast.error(response.message || "Gagal menyimpan tanda tangan.");
        return;
      }

      setEditData((prev) => ({ ...prev, signature: finalPreview }));
      setProfileData((prev) => ({ ...prev, signature: finalPreview }));
      setShowSignatureModal(false);
      handleClearSignature();
      toast.success("Tanda tangan berhasil disimpan!");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Gagal menyimpan tanda tangan.",
      );
    } finally {
      setIsUpdatingSignature(false);
    }
  }

  async function deleteSignature() {
    try {
      const response = await deleteMentorSignature();
      if (!response.success) {
        toast.error(response.message || "Gagal menghapus tanda tangan.");
        return;
      }

      setEditData((prev) => ({ ...prev, signature: "" }));
      setProfileData((prev) => ({ ...prev, signature: "" }));
      handleClearSignature();
      toast.success("Tanda tangan berhasil dihapus!");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Gagal menghapus tanda tangan.",
      );
    }
  }

  if (isLoadingProfile) {
    return (
      <div className="p-6">
        <PageHeader title="Profil" description="Kelola informasi profil Anda" />
        <Card>
          <CardContent className="pt-6 text-muted-foreground">
            Memuat profil mentor...
          </CardContent>
        </Card>
      </div>
    );
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
                  className="mt-1 bg-muted"
                  readOnly
                />
              ) : (
                <p className="mt-1 font-medium">{profileData.nip}</p>
              )}
              {isEditing && (
                <p className="mt-1 text-xs text-muted-foreground">
                  NIP/NIK dikunci untuk menjaga konsistensi data verifikasi.
                </p>
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
                  className="mt-1 bg-muted"
                  readOnly
                />
              ) : (
                <p className="mt-1 font-medium">{profileData.email}</p>
              )}
              {isEditing && (
                <p className="mt-1 text-xs text-muted-foreground">
                  Email tidak dapat diubah di sini. Ajukan perubahan melalui
                  Dosen PA/Admin.
                </p>
              )}

              <div className="mt-3 rounded-md border border-dashed p-3">
                <p className="text-sm font-medium">Butuh ganti email?</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Kirim pengajuan ke Dosen PA/Admin. Email akun akan diperbarui
                  setelah disetujui.
                </p>

                <div className="grid gap-3 mt-3">
                  <Input
                    type="email"
                    placeholder="Email baru (contoh: nama@perusahaan.com)"
                    value={emailChangeRequest.newEmail}
                    onChange={(e) =>
                      setEmailChangeRequest((prev) => ({
                        ...prev,
                        newEmail: e.target.value,
                      }))
                    }
                  />
                  <Textarea
                    rows={3}
                    placeholder="Alasan perubahan email"
                    value={emailChangeRequest.reason}
                    onChange={(e) =>
                      setEmailChangeRequest((prev) => ({
                        ...prev,
                        reason: e.target.value,
                      }))
                    }
                  />
                  <div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleSubmitEmailChangeRequest}
                      disabled={isSubmittingEmailRequest}
                    >
                      {isSubmittingEmailRequest
                        ? "Mengirim Pengajuan..."
                        : "Ajukan Perubahan Email"}
                    </Button>
                  </div>
                </div>
              </div>
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
                  className="mt-1 bg-muted"
                  readOnly
                />
              ) : (
                <p className="mt-1 font-medium">{profileData.company}</p>
              )}
              {isEditing && (
                <p className="mt-1 text-xs text-muted-foreground">
                  Perusahaan dikunci sesuai data persetujuan pembimbing
                  lapangan.
                </p>
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
              <Button onClick={handleSave} disabled={isSavingProfile}>
                <Save className="mr-2 h-4 w-4" />
                {isSavingProfile ? "Menyimpan..." : "Simpan Perubahan"}
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
              <CardTitle id="signature-modal-title">
                Buat Tanda Tangan Digital
              </CardTitle>
              <CardDescription>
                Gambar atau upload tanda tangan Anda pada area di bawah ini
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SignatureDialog
                sigCanvas={sigCanvasRef}
                fileInputRef={fileInputRef}
                preview={signaturePreview}
                onClear={handleClearSignature}
                onChooseFile={handleChooseFile}
                onUploadSignature={handleUploadSignature}
                onSave={saveSignature}
                isSaving={isUpdatingSignature}
              />
              <div className="flex justify-end gap-2 mt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowSignatureModal(false)}
                >
                  Batal
                </Button>
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
