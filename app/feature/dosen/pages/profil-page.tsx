import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { Separator } from "~/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "~/components/ui/dialog";
import { 
  User, 
  Mail, 
  Phone, 
  IdCard, 
  Building2, 
  FileSignature,
  CheckCircle2,
  Edit,
  Save,
  Trash2
} from "lucide-react";
import { ESignatureSetup } from "~/feature/hearing/components/esignature-setup";
import type { ESignatureSetupData } from "~/feature/hearing/types/esignature";

interface DosenProfile {
  id: string;
  nama: string;
  nip: string;
  email: string;
  telepon: string;
  jabatan: string;
  fakultas: string;
  programStudi: string;
  esignature?: {
    signatureImage: string;
    createdAt: string;
    updatedAt: string;
  };
}

export function DosenProfilPage() {
  const [profile, setProfile] = useState<DosenProfile>({
    id: "dosen-001",
    nama: "Dr. Ahmad Santoso, M.Kom",
    nip: "198501012010121001",
    email: "ahmad.santoso@university.ac.id",
    telepon: "081234567890",
    jabatan: "Dosen Pembimbing",
    fakultas: "Fakultas Ilmu Komputer",
    programStudi: "Teknik Informatika",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showESignatureDialog, setShowESignatureDialog] = useState(false);
  const [showDeleteSignatureDialog, setShowDeleteSignatureDialog] = useState(false);
  const [notification, setNotification] = useState<{
    title: string;
    description: string;
    variant?: "default" | "destructive";
  } | null>(null);

  // Load profile dari localStorage
  useEffect(() => {
    const savedProfile = localStorage.getItem("dosen-profile");
    if (savedProfile) {
      try {
        const parsed = JSON.parse(savedProfile);
        setProfile(parsed);
      } catch (e) {
        console.error("Error parsing profile:", e);
      }
    }

    // Load e-signature
    const savedSignature = localStorage.getItem("dosen-esignature");
    if (savedSignature) {
      try {
        const parsed = JSON.parse(savedSignature);
        setProfile(prev => ({
          ...prev,
          esignature: {
            signatureImage: parsed.signatureImage,
            createdAt: parsed.createdAt,
            updatedAt: parsed.updatedAt,
          }
        }));
      } catch (e) {
        console.error("Error parsing signature:", e);
      }
    }
  }, []);

  const handleSaveProfile = () => {
    setIsSaving(true);
    
    // Simpan ke localStorage (nanti ganti dengan API call)
    localStorage.setItem("dosen-profile", JSON.stringify(profile));
    
    setTimeout(() => {
      setIsSaving(false);
      setIsEditing(false);
      setNotification({
        title: "✅ Profil Berhasil Disimpan",
        description: "Data profil Anda telah diperbarui.",
      });
      setTimeout(() => setNotification(null), 3000);
    }, 500);
  };

  const handleSaveESignature = (data: ESignatureSetupData) => {
    const newSignature = {
      id: `sig-${Date.now()}`,
      dosenId: profile.id,
      signatureImage: data.signatureData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Simpan signature
    localStorage.setItem("dosen-esignature", JSON.stringify(newSignature));
    
    // Update profile state
    setProfile(prev => ({
      ...prev,
      esignature: {
        signatureImage: data.signatureData,
        createdAt: newSignature.createdAt,
        updatedAt: newSignature.updatedAt,
      }
    }));
    
    // Update profile di localStorage juga
    const updatedProfile = {
      ...profile,
      esignature: {
        signatureImage: data.signatureData,
        createdAt: newSignature.createdAt,
        updatedAt: newSignature.updatedAt,
      }
    };
    localStorage.setItem("dosen-profile", JSON.stringify(updatedProfile));

    setShowESignatureDialog(false);
    setNotification({
      title: "✅ E-Signature Berhasil Disimpan",
      description: "Tanda tangan digital Anda telah tersimpan dan siap digunakan.",
    });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleDeleteESignature = () => {
    // Hapus signature dari localStorage
    localStorage.removeItem("dosen-esignature");
    
    // Update profile state
    setProfile(prev => ({
      ...prev,
      esignature: undefined
    }));
    
    // Update profile di localStorage juga
    const updatedProfile = {
      ...profile,
      esignature: undefined
    };
    localStorage.setItem("dosen-profile", JSON.stringify(updatedProfile));

    setShowDeleteSignatureDialog(false);
    setNotification({
      title: "🗑️ E-Signature Berhasil Dihapus",
      description: "Tanda tangan digital Anda telah dihapus.",
    });
    setTimeout(() => setNotification(null), 3000);
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Profil Dosen</h1>
          <p className="text-muted-foreground mt-1">
            Kelola data profil dan e-signature Anda
          </p>
        </div>
        {!isEditing && (
          <Button onClick={() => setIsEditing(true)} variant="outline" className="gap-2">
            <Edit className="h-4 w-4" />
            Edit Profil
          </Button>
        )}
      </div>

      {/* Notification */}
      {notification && (
        <Alert variant={notification.variant} className="shadow-md">
          <CheckCircle2 className="h-5 w-5" />
          <AlertDescription>
            <div>
              <p className="font-semibold">{notification.title}</p>
              <p className="text-sm">{notification.description}</p>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Data Profil Card */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Data Profil
          </CardTitle>
          <CardDescription>
            Informasi lengkap dosen pembimbing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Nama Lengkap */}
            <div className="space-y-2">
              <Label htmlFor="nama" className="flex items-center gap-2 text-base font-bold">
                <User className="h-5 w-5" />
                Nama Lengkap
              </Label>
              {isEditing ? (
                <Input
                  id="nama"
                  value={profile.nama}
                  onChange={(e) => setProfile({ ...profile, nama: e.target.value })}
                  placeholder="Masukkan nama lengkap"
                />
              ) : (
                <p className="text-base font-medium">{profile.nama}</p>
              )}
            </div>

            {/* NIP */}
            <div className="space-y-2">
              <Label htmlFor="nip" className="flex items-center gap-2 text-base font-bold">
                <IdCard className="h-5 w-5" />
                NIP
              </Label>
              {isEditing ? (
                <Input
                  id="nip"
                  value={profile.nip}
                  onChange={(e) => setProfile({ ...profile, nip: e.target.value })}
                  placeholder="Masukkan NIP"
                />
              ) : (
                <p className="text-base font-medium">{profile.nip}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2 text-base font-bold">
                <Mail className="h-5 w-5" />
                Email
              </Label>
              {isEditing ? (
                <Input
                  id="email"
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  placeholder="Masukkan email"
                />
              ) : (
                <p className="text-base font-medium">{profile.email}</p>
              )}
            </div>

            {/* Telepon */}
            <div className="space-y-2">
              <Label htmlFor="telepon" className="flex items-center gap-2 text-base font-bold">
                <Phone className="h-5 w-5" />
                Telepon
              </Label>
              {isEditing ? (
                <Input
                  id="telepon"
                  value={profile.telepon}
                  onChange={(e) => setProfile({ ...profile, telepon: e.target.value })}
                  placeholder="Masukkan nomor telepon"
                />
              ) : (
                <p className="text-base font-medium">{profile.telepon}</p>
              )}
            </div>

            {/* Jabatan */}
            <div className="space-y-2">
              <Label htmlFor="jabatan" className="flex items-center gap-2 text-base font-bold">
                <Building2 className="h-5 w-5" />
                Jabatan
              </Label>
              {isEditing ? (
                <Input
                  id="jabatan"
                  value={profile.jabatan}
                  onChange={(e) => setProfile({ ...profile, jabatan: e.target.value })}
                  placeholder="Masukkan jabatan"
                />
              ) : (
                <p className="text-base font-medium">{profile.jabatan}</p>
              )}
            </div>

            {/* Fakultas */}
            <div className="space-y-2">
              <Label htmlFor="fakultas" className="flex items-center gap-2 text-base font-bold">
                <Building2 className="h-5 w-5" />
                Fakultas
              </Label>
              {isEditing ? (
                <Input
                  id="fakultas"
                  value={profile.fakultas}
                  onChange={(e) => setProfile({ ...profile, fakultas: e.target.value })}
                  placeholder="Masukkan fakultas"
                />
              ) : (
                <p className="text-base font-medium">{profile.fakultas}</p>
              )}
            </div>

            {/* Program Studi */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="programStudi" className="flex items-center gap-2 text-base font-bold">
                <Building2 className="h-5 w-5" />
                Program Studi
              </Label>
              {isEditing ? (
                <Input
                  id="programStudi"
                  value={profile.programStudi}
                  onChange={(e) => setProfile({ ...profile, programStudi: e.target.value })}
                  placeholder="Masukkan program studi"
                />
              ) : (
                <p className="text-base font-medium">{profile.programStudi}</p>
              )}
            </div>
          </div>

          {/* Action Buttons saat Edit */}
          {isEditing && (
            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleSaveProfile}
                disabled={isSaving}
                className="flex-1 gap-2"
              >
                <Save className="h-4 w-4" />
                {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
              </Button>
              <Button
                onClick={() => setIsEditing(false)}
                variant="outline"
                disabled={isSaving}
              >
                Batal
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Separator />

      {/* E-Signature Card */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSignature className="h-5 w-5" />
            Tanda Tangan Digital (E-Signature)
          </CardTitle>
          <CardDescription>
            Tanda tangan digital digunakan untuk menyetujui dokumen mahasiswa
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {profile.esignature ? (
            <div className="space-y-4">
              {/* Preview Signature */}
              <div className="border rounded-lg p-6 bg-muted/30">
                <p className="text-sm text-muted-foreground mb-3">Preview Tanda Tangan:</p>
                <div className="bg-white border-2 border-dashed rounded-lg p-4 flex items-center justify-center">
                  <img 
                    src={profile.esignature.signatureImage} 
                    alt="E-Signature" 
                    className="max-h-32 max-w-full"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Dibuat: {new Date(profile.esignature.createdAt).toLocaleString("id-ID")}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  onClick={() => setShowESignatureDialog(true)}
                  variant="outline"
                  className="flex-1 gap-2"
                >
                  <Edit className="h-4 w-4" />
                  Ubah Tanda Tangan
                </Button>
                <Button
                  onClick={() => setShowDeleteSignatureDialog(true)}
                  variant="outline"
                  className="gap-2 border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                  Hapus
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <Alert>
                <FileSignature className="h-5 w-5" />
                <AlertDescription>
                  <p className="font-semibold">Tanda Tangan Belum Dibuat</p>
                  <p className="text-sm mt-1">
                    Anda perlu membuat tanda tangan digital untuk dapat menyetujui dokumen mahasiswa.
                  </p>
                </AlertDescription>
              </Alert>

              <Button
                onClick={() => setShowESignatureDialog(true)}
                className="w-full gap-2 h-11"
              >
                <FileSignature className="h-5 w-5" />
                Buat Tanda Tangan Digital
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* E-Signature Dialog */}
      <Dialog open={showESignatureDialog} onOpenChange={setShowESignatureDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Buat Tanda Tangan Digital</DialogTitle>
            <DialogDescription>
              Tanda tangan digital akan digunakan untuk menyetujui dokumen mahasiswa
            </DialogDescription>
          </DialogHeader>
          <ESignatureSetup
            onSave={handleSaveESignature}
            onCancel={() => setShowESignatureDialog(false)}
            dosenName={profile.nama}
            nip={profile.nip}
            existingSignature={profile.esignature?.signatureImage}
          />
        </DialogContent>
      </Dialog>

      {/* Delete E-Signature Confirmation Dialog */}
      <AlertDialog open={showDeleteSignatureDialog} onOpenChange={setShowDeleteSignatureDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Tanda Tangan Digital?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini akan menghapus tanda tangan digital Anda. Anda tidak akan bisa menyetujui dokumen mahasiswa sampai membuat tanda tangan baru.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteESignature}
              className="bg-red-600 hover:bg-red-700"
            >
              Ya, Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
