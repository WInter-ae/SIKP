"use client";

import { useState, useEffect } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import type { Template, TemplateField } from "../types/template.types";
import { toast } from "sonner";
import { ScrollArea } from "~/components/ui/scroll-area";

interface GenerateTemplateDialogProps {
  template: Template | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GenerateTemplateDialog({
  template,
  open,
  onOpenChange,
}: GenerateTemplateDialogProps) {
  const [formData, setFormData] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (template) {
      // Initialize form with default values
      const initialData = template.fields.reduce(
        (acc, field) => {
          acc[field.variable] = field.defaultValue || "";
          return acc;
        },
        {} as { [key: string]: string },
      );
      setFormData(initialData);
    }
  }, [template]);

  const handleInputChange = (variable: string, value: string) => {
    setFormData((prev) => ({ ...prev, [variable]: value }));
  };

  const handleSubmit = () => {
    if (!template) return;

    // Validation
    for (const field of template.fields) {
      if (field.required && !formData[field.variable]?.trim()) {
        toast.error(`Field "${field.label}" harus diisi.`);
        return;
      }
    }

    // Replace variables in content
    let generatedContent = template.content;
    for (const key in formData) {
      const regex = new RegExp(`{{${key}}}`, "g");
      generatedContent = generatedContent.replace(regex, formData[key]);
    }

    // Trigger download
    const blob = new Blob([generatedContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${template.name}_generated.${template.fileExtension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success("Dokumen berhasil digenerate dan didownload!");
    onOpenChange(false);
  };

  const renderField = (field: TemplateField) => {
    const value = formData[field.variable] || "";

    switch (field.type) {
      case "textarea":
        return (
          <Textarea
            id={field.variable}
            placeholder={field.placeholder}
            value={value}
            onChange={(e) => handleInputChange(field.variable, e.target.value)}
            required={field.required}
            rows={4}
          />
        );
      case "select":
        return (
          <Select
            value={value}
            onValueChange={(val) => handleInputChange(field.variable, val)}
            required={field.required}
          >
            <SelectTrigger>
              <SelectValue placeholder={field.placeholder || "Pilih..."} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      case "number":
      case "date":
      case "time":
      case "email":
      case "text":
      default:
        return (
          <Input
            id={field.variable}
            type={field.type}
            placeholder={field.placeholder}
            value={value}
            onChange={(e) => handleInputChange(field.variable, e.target.value)}
            required={field.required}
          />
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Generate Dokumen: {template?.name}</DialogTitle>
          <DialogDescription>
            Isi form di bawah ini untuk mengenerate dokumen secara otomatis.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] p-4">
            <div className="space-y-4">
            {template?.fields
                .sort((a, b) => a.order - b.order)
                .map((field) => (
                <div key={field.variable} className="space-y-2">
                    <Label htmlFor={field.variable}>
                    {field.label}
                    {field.required && <span className="text-destructive">*</span>}
                    </Label>
                    {renderField(field)}
                    {field.helpText && (
                    <p className="text-xs text-muted-foreground">{field.helpText}</p>
                    )}
                </div>
                ))}
            </div>
        </ScrollArea>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button onClick={handleSubmit}>Generate & Download</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
