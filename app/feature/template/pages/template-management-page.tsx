"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
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
} from "lucide-react";
import { CreateTemplateDialog } from "../components/create-template-dialog";
import { EditTemplateDialog } from "../components/edit-template-dialog";
import { TEMPLATE_CATEGORIES } from "../types/template.types";
import type { Template, TemplateType, TemplateField } from "../types/template.types";
import { toast } from "sonner";

export default function TemplateManagementPage() {
  const [templates, setTemplates] = useState<Template[]>([
    {
      id: "1",
      name: "Berita Acara Sidang KP 2025",
      type: "berita-acara",
      description: "Template berita acara untuk sidang kerja praktek tahun 2025",
      content: `<!DOCTYPE html>
<html>
<head>
    <title>Berita Acara Sidang</title>
</head>
<body>
    <h1>BERITA ACARA SIDANG KERJA PRAKTEK</h1>
    <p>Pada hari ini, {{tanggal}}, telah dilaksanakan sidang kerja praktek.</p>
    <p>Nama Mahasiswa: {{nama_mahasiswa}}</p>
    <p>NIM: {{nim}}</p>
    <p>Judul: {{judul}}</p>
</body>
</html>`,
      fileExtension: "html",
      fields: [
        { variable: "tanggal", label: "Tanggal Sidang", type: "date", required: true, order: 0 },
        { variable: "nama_mahasiswa", label: "Nama Mahasiswa", type: "text", required: true, order: 1 },
        { variable: "nim", label: "NIM", type: "text", required: true, order: 2 },
        { variable: "judul", label: "Judul KP", type: "textarea", required: true, order: 3 },
      ],
      version: 1,
      createdAt: "2025-01-15T10:00:00Z",
      updatedAt: "2025-01-15T10:00:00Z",
      isActive: true,
    },
    {
      id: "2",
      name: "Form Nilai KP",
      type: "form-nilai",
      description: "Template form penilaian kerja praktek",
      content: `<!DOCTYPE html>
<html>
<head>
    <title>Form Nilai KP</title>
</head>
<body>
    <h1>FORM PENILAIAN KERJA PRAKTEK</h1>
    <table>
        <tr>
            <td>Nama</td>
            <td>: {{nama_mahasiswa}}</td>
        </tr>
        <tr>
            <td>NIM</td>
            <td>: {{nim}}</td>
        </tr>
        <tr>
            <td>Nilai</td>
            <td>: {{nilai}}</td>
        </tr>
    </table>
</body>
</html>`,
      fileExtension: "html",
      fields: [
        { variable: "nama_mahasiswa", label: "Nama Mahasiswa", type: "text", required: true, order: 0 },
        { variable: "nim", label: "NIM", type: "text", required: true, order: 1 },
        { variable: "nilai", label: "Nilai", type: "number", required: true, order: 2 },
      ],
      version: 1,
      createdAt: "2025-01-16T09:00:00Z",
      updatedAt: "2025-01-16T09:00:00Z",
      isActive: true,
    },
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<TemplateType | "all">("all");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<Template | null>(null);

  // Filter templates
  const filteredTemplates = templates.filter((template) => {
    const matchesSearch =
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === "all" || template.type === filterType;
    return matchesSearch && matchesType;
  });

  // Create template
  const handleCreateTemplate = (data: {
    name: string;
    type: TemplateType;
    description: string;
    content: string;
    fileExtension: "html" | "docx" | "txt";
    fields: TemplateField[];
  }) => {
    const newTemplate: Template = {
      id: Date.now().toString(),
      ...data,
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true,
    };
    setTemplates([...templates, newTemplate]);
    setCreateDialogOpen(false);
    toast.success("Template berhasil dibuat");
  };

  // Edit template
  const handleEditTemplate = (
    id: string,
    data: {
      name: string;
      type: TemplateType;
      description: string;
      content: string;
      fileExtension: "html" | "docx" | "txt";
      fields: TemplateField[];
    }
  ) => {
    setTemplates(
      templates.map((t) =>
        t.id === id
          ? { ...t, ...data, updatedAt: new Date().toISOString() }
          : t
      )
    );
    setEditDialogOpen(false);
    setSelectedTemplate(null);
    toast.success("Template berhasil diupdate");
  };

  // Delete template
  const handleDeleteTemplate = () => {
    if (!templateToDelete) return;
    setTemplates(templates.filter((t) => t.id !== templateToDelete.id));
    setDeleteDialogOpen(false);
    setTemplateToDelete(null);
    toast.success("Template berhasil dihapus");
  };

  // Toggle active status
  const handleToggleActive = (id: string) => {
    setTemplates(
      templates.map((t) =>
        t.id === id ? { ...t, isActive: !t.isActive } : t
      )
    );
    toast.success("Status template berhasil diubah");
  };

  // Download template
  const handleDownloadTemplate = (template: Template) => {
    const blob = new Blob([template.content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${template.name}.${template.fileExtension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Template berhasil didownload");
  };

  const getTypeLabel = (type: TemplateType) => {
    return TEMPLATE_CATEGORIES.find((c) => c.value === type)?.label || type;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Template Management</h1>
        <p className="text-muted-foreground">
          Kelola template dokumen untuk berbagai keperluan mahasiswa
        </p>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Template</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{templates.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Template Aktif</CardTitle>
            <FileText className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {templates.filter((t) => t.isActive).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Berita Acara</CardTitle>
            <FileText className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {templates.filter((t) => t.type === "berita-acara").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Form Nilai</CardTitle>
            <FileText className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {templates.filter((t) => t.type === "form-nilai").length}
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
                onValueChange={(value) => setFilterType(value as TemplateType | "all")}
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
                  <TableHead>Jenis</TableHead>
                  <TableHead>Format</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Terakhir Diupdate</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTemplates.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
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
                        <Badge variant="outline">{getTypeLabel(template.type)}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{template.fileExtension.toUpperCase()}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={template.isActive ? "default" : "destructive"}>
                          {template.isActive ? "Aktif" : "Nonaktif"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(template.updatedAt).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
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
                            <DropdownMenuItem onClick={() => handleDownloadTemplate(template)}>
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleToggleActive(template.id)}>
                              <Eye className="h-4 w-4 mr-2" />
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
        onSubmit={handleCreateTemplate}
      />

      <EditTemplateDialog
        template={selectedTemplate}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSubmit={handleEditTemplate}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Template</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus template "{templateToDelete?.name}"?
              Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteTemplate} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
