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
import { TEMPLATE_CATEGORIES } from "../types/template.types";
import type { TemplateType } from "../types/template.types";
import { toast } from "sonner";
import {
  getAllTemplates,
  deleteTemplate,
  toggleTemplateActive,
  downloadTemplate,
  type TemplateResponse,
} from "~/lib/services/template-api";

export default function TemplateManagementPage() {
  const navigate = useNavigate();
  const { user } = useUser();
  const [templates, setTemplates] = useState<TemplateResponse[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<TemplateType | "all">("all");
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
      
      // Handle authorization errors
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

  // Show loading state while checking authorization
  if (!isAuthorized) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">Memeriksa akses...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Filter templates
  const filteredTemplates = templates.filter((template) => {
    const matchesSearch =
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === "all" || template.type === filterType;
    return matchesSearch && matchesType;
  });

  // Create template - akan dipanggil dari CreateTemplateDialog
  const handleCreateTemplate = async () => {
    // Dialog akan handle create dan refresh
    setCreateDialogOpen(false);
    await fetchTemplates();
    toast.success("Template berhasil dibuat");
  };

  // Edit template - akan dipanggil dari EditTemplateDialog
  const handleEditTemplate = async () => {
    setEditDialogOpen(false);
    setSelectedTemplate(null);
    await fetchTemplates();
    toast.success("Template berhasil diupdate");
  };

  // Delete template
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
    } catch (error: unknown) {
      console.error("Error deleting template:", error);
      
      if ((error as Error).message?.includes("Forbidden")) {
        toast.error("Anda tidak memiliki izin untuk menghapus template");
        navigate("/login");
        return;
      }
      
      toast.error("Terjadi kesalahan saat menghapus template");
    } finally {
      setIsLoading(false);
      setDeleteDialogOpen(false);
      setTemplateToDelete(null);
    }
  };

  // Toggle active status
  const handleToggleActive = async (id: string) => {
    setIsLoading(true);
    try {
      const response = await toggleTemplateActive(id);
      if (response.success) {
        await fetchTemplates();
        toast.success("Status template berhasil diubah");
      } else {
        toast.error(response.message || "Gagal mengubah status template");
      }
    } catch (error: unknown) {
      console.error("Error toggling template status:", error);
      
      if ((error as Error).message?.includes("Forbidden")) {
        toast.error("Anda tidak memiliki izin untuk mengubah status template");
        navigate("/login");
        return;
      }
      
      toast.error("Terjadi kesalahan saat mengubah status");
    } finally {
      setIsLoading(false);
    }
  };

  // Download template
  const handleDownloadTemplate = async (template: TemplateResponse) => {
    try {
      await downloadTemplate(template.id, template.originalName);
      toast.success("Template berhasil didownload");
    } catch (error: unknown) {
      console.error("Error downloading template:", error);
      
      if ((error as Error).message?.includes("Forbidden")) {
        toast.error("Anda tidak memiliki akses untuk mendownload template");
        return;
      }
      
      toast.error("Gagal mendownload template");
    }
  };

  // View template (placeholder - bisa dibuat dialog preview)
  const handleViewTemplate = (template: TemplateResponse) => {
    // TODO: Implement preview dialog
    console.log("View template:", template);
    toast.info("Fitur preview akan segera tersedia");
  };

  const getTypeLabel = (type: TemplateType) => {
    return TEMPLATE_CATEGORIES.find((c) => c.value === type)?.label || type;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Template Management
        </h1>
        <p className="text-muted-foreground">
          Kelola template dokumen untuk berbagai keperluan mahasiswa
        </p>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Template
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{templates.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Template Aktif
            </CardTitle>
            <FileText className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {templates.filter((t) => t.isActive).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Daftar Template</CardTitle>
              <CardDescription>
                Kelola semua template dokumen di sini
              </CardDescription>
            </div>
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Tambah Template
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search and Filter */}
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari template..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select
                value={filterType}
                onValueChange={(value) =>
                  setFilterType(value as TemplateType | "all")
                }
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Jenis</SelectItem>
                  {TEMPLATE_CATEGORIES.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama Template</TableHead>
                  <TableHead>Tipe</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Terakhir Diupdate</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTemplates.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center py-8 text-muted-foreground"
                    >
                      {searchQuery || filterType !== "all"
                        ? "Tidak ada template yang sesuai dengan filter"
                        : "Belum ada template. Klik tombol 'Tambah Template' untuk membuat."}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTemplates.map((template) => (
                    <TableRow key={template.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{template.name}</div>
                          {template.description && (
                            <div className="text-sm text-muted-foreground line-clamp-1">
                              {template.description}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {getTypeLabel(template.type)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            template.isActive ? "default" : "destructive"
                          }
                        >
                          {template.isActive ? "Aktif" : "Nonaktif"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(template.updatedAt).toLocaleDateString(
                          "id-ID",
                          {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          },
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedTemplate(template);
                                setEditDialogOpen(true);
                              }}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleViewTemplate(template)}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Lihat
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDownloadTemplate(template)}
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleToggleActive(template.id)}
                            >
                              {template.isActive ? (
                                <ToggleLeft className="h-4 w-4 mr-2" />
                              ) : (
                                <ToggleRight className="h-4 w-4 mr-2" />
                              )}
                              {template.isActive ? "Nonaktifkan" : "Aktifkan"}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => {
                                setTemplateToDelete(template);
                                setDeleteDialogOpen(true);
                              }}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Hapus
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
        </CardContent>
      </Card>

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
            <AlertDialogTitle>Hapus Template</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus template &quot;
              {templateToDelete?.name}&quot;? Tindakan ini tidak dapat
              dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTemplate}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isLoading}
            >
              {isLoading ? "Menghapus..." : "Hapus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
