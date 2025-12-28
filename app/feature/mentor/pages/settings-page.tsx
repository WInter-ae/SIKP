// External dependencies
import { useState } from "react";
import { toast } from "sonner";
import { Save, Bell, Lock, Globe, Moon, Sun, Monitor } from "lucide-react";

// Internal utilities
import { cn } from "~/lib/utils";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Switch } from "~/components/ui/switch";
import PageHeader from "../components/page-header";
import BackButton from "../components/back-button";

// Types
import type { Settings } from "../types";

const DEFAULT_SETTINGS: Settings = {
  theme: "light",
  language: "id",
  emailNotifications: true,
  pushNotifications: true,
  weeklyReport: false,
  oldPassword: "",
  newPassword: "",
  confirmPassword: "",
};

function SettingsPage() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleSelectChange(name: string, value: string) {
    setSettings((prev) => ({ ...prev, [name]: value }));
  }

  function handleSaveSettings() {
    toast.success("Pengaturan berhasil disimpan!");
  }

  function handleChangePassword() {
    if (
      !settings.oldPassword ||
      !settings.newPassword ||
      !settings.confirmPassword
    ) {
      toast.error("Mohon lengkapi semua field password!");
      return;
    }

    if (settings.newPassword !== settings.confirmPassword) {
      toast.error("Password baru dan konfirmasi password tidak cocok!");
      return;
    }

    if (settings.newPassword.length < 8) {
      toast.error("Password minimal 8 karakter!");
      return;
    }

    toast.success("Password berhasil diubah!");
    setSettings((prev) => ({
      ...prev,
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    }));
  }

  function getThemeIcon(theme: string) {
    switch (theme) {
      case "light":
        return <Sun className="h-4 w-4" />;
      case "dark":
        return <Moon className="h-4 w-4" />;
      default:
        return <Monitor className="h-4 w-4" />;
    }
  }

  return (
    <div className="p-6">
      <PageHeader
        title="Pengaturan"
        description="Kelola preferensi dan pengaturan akun Anda"
      />

      {/* Appearance Settings */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getThemeIcon(settings.theme)}
            Tampilan
          </CardTitle>
          <CardDescription>
            Atur tampilan aplikasi sesuai preferensi Anda
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="theme">Tema</Label>
            <Select
              value={settings.theme}
              onValueChange={(value) => handleSelectChange("theme", value)}
            >
              <SelectTrigger id="theme" className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">
                  <div className="flex items-center gap-2">
                    <Sun className="h-4 w-4" />
                    <span>Terang</span>
                  </div>
                </SelectItem>
                <SelectItem value="dark">
                  <div className="flex items-center gap-2">
                    <Moon className="h-4 w-4" />
                    <span>Gelap</span>
                  </div>
                </SelectItem>
                <SelectItem value="system">
                  <div className="flex items-center gap-2">
                    <Monitor className="h-4 w-4" />
                    <span>Sistem</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="language" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Bahasa
            </Label>
            <Select
              value={settings.language}
              onValueChange={(value) => handleSelectChange("language", value)}
            >
              <SelectTrigger id="language" className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="id">Bahasa Indonesia</SelectItem>
                <SelectItem value="en">English</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifikasi
          </CardTitle>
          <CardDescription>
            Atur notifikasi yang ingin Anda terima
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="emailNotifications">Notifikasi Email</Label>
              <p className="text-sm text-muted-foreground">
                Terima notifikasi melalui email
              </p>
            </div>
            <Switch
              id="emailNotifications"
              checked={settings.emailNotifications}
              onCheckedChange={(checked) =>
                setSettings((prev) => ({ ...prev, emailNotifications: checked }))
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="pushNotifications">Notifikasi Push</Label>
              <p className="text-sm text-muted-foreground">
                Terima notifikasi push di browser
              </p>
            </div>
            <Switch
              id="pushNotifications"
              checked={settings.pushNotifications}
              onCheckedChange={(checked) =>
                setSettings((prev) => ({ ...prev, pushNotifications: checked }))
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="weeklyReport">Laporan Mingguan</Label>
              <p className="text-sm text-muted-foreground">
                Terima ringkasan aktivitas setiap minggu
              </p>
            </div>
            <Switch
              id="weeklyReport"
              checked={settings.weeklyReport}
              onCheckedChange={(checked) =>
                setSettings((prev) => ({ ...prev, weeklyReport: checked }))
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Save Settings Button */}
      <div className="flex justify-end mb-6">
        <Button onClick={handleSaveSettings}>
          <Save className="mr-2 h-4 w-4" />
          Simpan Pengaturan
        </Button>
      </div>

      {/* Password Change */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            Ubah Password
          </CardTitle>
          <CardDescription>
            Perbarui password Anda untuk keamanan akun
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="oldPassword">Password Lama</Label>
            <Input
              id="oldPassword"
              name="oldPassword"
              type="password"
              value={settings.oldPassword}
              onChange={handleInputChange}
              placeholder="Masukkan password lama"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="newPassword">Password Baru</Label>
            <Input
              id="newPassword"
              name="newPassword"
              type="password"
              value={settings.newPassword}
              onChange={handleInputChange}
              placeholder="Masukkan password baru (min. 8 karakter)"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="confirmPassword">Konfirmasi Password Baru</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={settings.confirmPassword}
              onChange={handleInputChange}
              placeholder="Ulangi password baru"
              className="mt-1"
            />
          </div>

          <div className="flex justify-end">
            <Button onClick={handleChangePassword}>
              <Lock className="mr-2 h-4 w-4" />
              Ubah Password
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Back Button */}
      <BackButton />
    </div>
  );
}

export default SettingsPage;
