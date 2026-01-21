"use client";

import { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { TEMPLATE_CATEGORIES } from "../types/template.types";
import type { Template, TemplateType, TemplateField } from "../types/template.types";
import { toast } from "sonner";
import { Loader2, FileCode, Settings } from "lucide-react";
import { TemplateFieldConfigurator } from "./template-field-configurator";
import { extractTemplateVariables } from "../services/template.service";

interface EditTemplateDialogProps {
  template: Template | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (id: string, data: {
    name: string;
    type: TemplateType;
    description: string;
    content: string;
    fileExtension: "html" | "docx" | "txt";
    fields: TemplateField[];
  }) => void;
}

export function EditTemplateDialog({
  template,
  open,
  onOpenChange,
  onSubmit,
}: EditTemplateDialogProps) {
  const [name, setName] = useState(template?.name || "");
  const [type, setType] = useState<TemplateType>(template?.type || "berita-acara");
  const [description, setDescription] = useState(template?.description || "");
  const [fileExtension, setFileExtension] = useState<"html" | "docx" | "txt">(
    template?.fileExtension || "html"
  );
  const [content, setContent] = useState(template?.content || "");
  const [fields, setFields] = useState<TemplateField[]>(template?.fields || []);
  const [isEditorReady, setIsEditorReady] = useState(false);
  const [detectedVariables, setDetectedVariables] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState("template");

  // Update state when template changes
  useEffect(() => {
    if (template) {
      setName(template.name);
      setType(template.type);
      setDescription(template.description || "");
      setFileExtension(template.fileExtension);
      setContent(template.content);
      setFields(template.fields || []);
      setDetectedVariables(extractTemplateVariables(template.content));
    }
  }, [template]);

  // Update detected variables when content changes
  useEffect(() => {
    if (content) {
      setDetectedVariables(extractTemplateVariables(content));
    }
  }, [content]);

  const handleSubmit = () => {
    if (!template) return;
    
    if (!name.trim()) {
      toast.error("Nama template harus diisi");
      return;
    }
    if (!content.trim()) {
      toast.error("Content template tidak boleh kosong");
      return;
    }

    onSubmit(template.id, {
      name: name.trim(),
      type,
      description: description.trim(),
      content: content.trim(),
      fileExtension,
      fields,
    });
  };

  const getEditorLanguage = () => {
    switch (fileExtension) {
      case "html":
        return "html";
      case "docx":
        return "xml";
      case "txt":
        return "plaintext";
      default:
        return "plaintext";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-none w-[90vw] h-[96vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Edit Template</DialogTitle>
          <DialogDescription>
            Edit template dan konfigurasi field form
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="template" className="flex items-center gap-2">
              <FileCode className="h-4 w-4" />
              Template Editor
            </TabsTrigger>
            <TabsTrigger value="fields" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Field Configuration
            </TabsTrigger>
          </TabsList>

          <TabsContent value="template" className="flex-1 overflow-y-auto space-y-4 py-4">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Nama Template</Label>
                <Input
                  id="edit-name"
                  placeholder="Nama template"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-type">Jenis Template</Label>
                <Select value={type} onValueChange={(value) => setType(value as TemplateType)}>
                  <SelectTrigger id="edit-type">
                    <SelectValue placeholder="Pilih jenis template" />
                  </SelectTrigger>
                  <SelectContent>
                    {TEMPLATE_CATEGORIES.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-fileExtension">Format File</Label>
              <Select 
                value={fileExtension} 
                onValueChange={(value) => setFileExtension(value as "html" | "docx" | "txt")}
              >
                <SelectTrigger id="edit-fileExtension">
                  <SelectValue placeholder="Pilih format file" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="html">HTML</SelectItem>
                  <SelectItem value="docx">DOCX</SelectItem>
                  <SelectItem value="txt">TXT</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Deskripsi</Label>
              <Textarea
                id="edit-description"
                placeholder="Deskripsi template..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label>Editor Konten Template</Label>
              <div className="border rounded-lg overflow-hidden" style={{ height: "75vh" }}>
                {!isEditorReady && (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                )}
                <Editor
                  height="100%"
                  language={getEditorLanguage()}
                  value={content}
                  onChange={(value) => setContent(value || "")}
                  onMount={() => setIsEditorReady(true)}
                  theme="vs-dark"
                  options={{
                    minimap: { enabled: true },
                    fontSize: 14,
                    lineNumbers: "on",
                    wordWrap: "on",
                    automaticLayout: true,
                    scrollBeyondLastLine: false,
                    tabSize: 2,
                  }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Gunakan Ctrl+F untuk mencari, Ctrl+H untuk find & replace. Variable: {`{{nama_variable}}`}
              </p>
            </div>
          </TabsContent>

          <TabsContent value="fields" className="flex-1 overflow-y-auto py-4">
            <TemplateFieldConfigurator
              fields={fields}
              onChange={setFields}
              detectedVariables={detectedVariables}
            />
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button onClick={handleSubmit}>Simpan Perubahan</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
