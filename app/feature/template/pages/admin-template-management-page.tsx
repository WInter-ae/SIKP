"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useUser } from "~/contexts/user-context";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Badge } from "~/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  FileText,
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Download,
  Filter,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { CreateTemplateDialog } from "../components/create-template-dialog";
import { EditTemplateDialog } from "../components/edit-template-dialog";
import type { TemplateType } from "../types/template.types";
import { toast } from "sonner";
import {
  getAllTemplates,
  deleteTemplate,
  downloadTemplate,
  type TemplateResponse,
} from "~/lib/services/template.service";

export default function TemplateManagementPage() {
  const navigate = useNavigate();
  const { user } = useUser();
  const [templates, setTemplates] = useState<TemplateResponse[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] =
    useState<TemplateResponse | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] =
    useState<TemplateResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);

  // Check admin access
  useEffect(() => {
    if (!user) {
      toast.error("Anda harus login terlebih dahulu");
      navigate("/login");
      return;
    }

    if (user.role !== "ADMIN") {
      toast.error("Anda tidak memiliki akses ke halaman ini");
      navigate("/");
      return;
    }

    setIsAuthorized(true);
  }, [user, navigate]);

  // Fetch templates on mount (only after authorized)
  useEffect(() => {
    if (isAuthorized) {
      fetchTemplates();
    }
  }, [isAuthorized]);

  const fetchTemplates = async () => {
    setIsLoading(true);
    try {
      const response = await getAllTemplates();
      if (response.success && response.data) {
        setTemplates(response.data);
      } else {
        toast.error(response.message || "Gagal memuat templates");
      }
    } catch (error: unknown) {
      console.error("Error fetching templates:", error);

      if (
        (error as Error).message?.includes("Unauthorized") ||
        (error as Error).message?.includes("Forbidden")
      ) {
        toast.error("Sesi Anda telah berakhir atau Anda tidak memiliki akses");
        navigate("/login");
        return;
      }

      toast.error("Terjadi kesalahan saat memuat templates");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthorized) {
    return (
      <div className="p-4 sm:p-6 md:p-8 flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground font-medium">Memeriksa akses keamanan...</p>
        </div>
      </div>
    );
  }

  const filteredTemplates = templates.filter((template) =>
    template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    template.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateTemplate = async () => {
    setCreateDialogOpen(false);
    await fetchTemplates();
    toast.success("Template berhasil ditambahkan");
  };

  const handleEditTemplate = async () => {
    setEditDialogOpen(false);
    setSelectedTemplate(null);
    await fetchTemplates();
    toast.success("Perubahan berhasil disimpan");
  };

  const handleDeleteTemplate = async () => {
    if (!templateToDelete) return;
    setIsLoading(true);
    try {
      const response = await deleteTemplate(templateToDelete.id);
      if (response.success) {
        await fetchTemplates();
        toast.success("Template berhasil dihapus");
      } else {
        toast.error(response.message || "Gagal menghapus template");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan saat menghapus template");
    } finally {
      setIsLoading(false);
      setDeleteDialogOpen(false);
      setTemplateToDelete(null);
    }
  };

  const handleDownloadTemplate = async (template: TemplateResponse) => {
    try {
      await downloadTemplate(template.id, template.originalName);
      toast.success(`Template "${template.name}" berhasil diunduh`);
    } catch (error) {
      toast.error("Gagal mengunduh template");
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 bg-background min-h-screen">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="relative pb-2">
            <h1 className="text-xl sm:text-3xl font-bold text-foreground">
              Manajemen Template Dokumen
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Kelola format dokumen resmi untuk keperluan Kerja Praktik
            </p>
            <div className="absolute bottom-0 left-0 h-1 w-20 bg-linear-to-r from-blue-600 via-yellow-300 to-red-500 rounded-full" />
          </div>
          <Button
            onClick={() => setCreateDialogOpen(true)}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Tambah Template
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-l-4 border-l-blue-600 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                Total Template
              </CardTitle>
              <div className="p-2 bg-blue-50 rounded-lg">
                <FileText className="h-4 w-4 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{templates.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Table Section */}
        <div className="space-y-4">
          <Card className="shadow-sm">
            <CardContent className="p-4 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari nama atau deskripsi template..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-10"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50 hover:bg-muted/50">
                    <TableHead className="pl-6 py-4 font-semibold text-foreground">Nama Dokumen</TableHead>
                    <TableHead className="py-4 font-semibold text-foreground">Deskripsi</TableHead>
                    <TableHead className="py-4 font-semibold text-foreground">Terakhir Diupdate</TableHead>
                    <TableHead className="pr-6 py-4 text-right font-semibold text-foreground">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-10">
                        <p className="text-muted-foreground animate-pulse">Memuat data template...</p>
                      </TableCell>
                    </TableRow>
                  ) : filteredTemplates.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-10">
                        <p className="text-muted-foreground italic">
                          {searchQuery ? "Tidak ditemukan template yang sesuai" : "Belum ada template tersedia"}
                        </p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredTemplates.map((template) => (
                      <TableRow key={template.id} className="hover:bg-muted/50 transition-colors">
                        <TableCell className="pl-6 py-4 font-medium text-foreground">
                          {template.name}
                        </TableCell>
                        <TableCell className="py-4 text-sm text-muted-foreground max-w-xs truncate">
                          {template.description || "-"}
                        </TableCell>
                        <TableCell className="py-4 text-sm text-muted-foreground">
                          {new Date(template.updatedAt).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "long",
                            year: "numeric"
                          })}
                        </TableCell>
                        <TableCell className="pr-6 py-4 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted rounded-full">
                                <MoreVertical className="h-4 w-4 text-muted-foreground" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 py-2">
                                Navigasi
                              </DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedTemplate(template);
                                  setEditDialogOpen(true);
                                }}
                                className="cursor-pointer"
                              >
                                <Edit className="h-4 w-4 mr-2 text-blue-600" />
                                <span>Edit Data</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDownloadTemplate(template)}
                                className="cursor-pointer"
                              >
                                <Download className="h-4 w-4 mr-2 text-blue-600" />
                                <span>Unduh Dokumen</span>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => {
                                  setTemplateToDelete(template);
                                  setDeleteDialogOpen(true);
                                }}
                                className="text-red-600 focus:text-red-600 cursor-pointer"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                <span>Hapus Permanen</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </div>
      </div>

      {/* Dialogs */}
      <CreateTemplateDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={handleCreateTemplate}
      />

      <EditTemplateDialog
        template={selectedTemplate}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSuccess={handleEditTemplate}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold">Hapus Template</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground leading-relaxed">
              Apakah Anda yakin ingin menghapus template <span className="font-bold text-foreground italic">&quot;{templateToDelete?.name}&quot;</span>? 
              Tindakan ini akan menghapus file dari sistem dan tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4">
            <AlertDialogCancel className="font-semibold">Batalkan</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTemplate}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold"
              disabled={isLoading}
            >
              {isLoading ? "Menghapus..." : "Ya, Hapus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
