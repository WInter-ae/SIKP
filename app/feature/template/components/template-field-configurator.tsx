"use client";

import { useState } from "react";
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
import { Textarea } from "~/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Switch } from "~/components/ui/switch";
import { Plus, Trash2, GripVertical, AlertCircle } from "lucide-react";
import type { TemplateField, FieldType } from "../types/template.types";
import { toast } from "sonner";

interface TemplateFieldConfiguratorProps {
  fields: TemplateField[];
  onChange: (fields: TemplateField[]) => void;
  detectedVariables: string[];
}

/**
 * Component untuk configure field metadata dari template variables
 * Admin bisa set label, type, required, dll untuk setiap variable
 */
export function TemplateFieldConfigurator({
  fields,
  onChange,
  detectedVariables,
}: TemplateFieldConfiguratorProps) {
  const [editingField, setEditingField] = useState<string | null>(null);

  // Auto-generate fields dari detected variables yang belum dikonfigurasi
  const handleAutoGenerate = () => {
    const existingVariables = fields.map(f => f.variable);
    const newVariables = detectedVariables.filter(v => !existingVariables.includes(v));
    
    const newFields: TemplateField[] = newVariables.map((variable, index) => ({
      variable,
      label: formatVariableName(variable),
      type: "text",
      required: true,
      placeholder: `Masukkan ${formatVariableName(variable).toLowerCase()}`,
      order: fields.length + index,
    }));

    onChange([...fields, ...newFields]);
    toast.success(`${newFields.length} field baru ditambahkan`);
  };

  // Format variable name to readable label
  const formatVariableName = (variable: string): string => {
    return variable
      .split("_")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Update field
  const updateField = (index: number, updates: Partial<TemplateField>) => {
    const newFields = [...fields];
    newFields[index] = { ...newFields[index], ...updates };
    onChange(newFields);
  };

  // Remove field
  const removeField = (index: number) => {
    onChange(fields.filter((_, i) => i !== index));
    toast.success("Field berhasil dihapus");
  };

  // Add new field manually
  const addField = () => {
    const newField: TemplateField = {
      variable: "new_field",
      label: "New Field",
      type: "text",
      required: false,
      order: fields.length,
    };
    onChange([...fields, newField]);
  };

  // Move field up/down
  const moveField = (index: number, direction: "up" | "down") => {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === fields.length - 1) return;

    const newFields = [...fields];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    [newFields[index], newFields[targetIndex]] = [newFields[targetIndex], newFields[index]];
    
    // Update order
    newFields.forEach((field, i) => field.order = i);
    onChange(newFields);
  };

  // Check for unmapped variables
  const unmappedVariables = detectedVariables.filter(
    v => !fields.some(f => f.variable === v)
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Konfigurasi Field Form</h3>
          <p className="text-sm text-muted-foreground">
            Set metadata untuk setiap variable agar form mahasiswa ter-generate otomatis
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleAutoGenerate} variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Auto Generate
          </Button>
          <Button onClick={addField} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Tambah Field
          </Button>
        </div>
      </div>

      {/* Warning for unmapped variables */}
      {unmappedVariables.length > 0 && (
        <div className="flex items-start gap-2 p-4 border border-amber-500/50 bg-amber-500/10 rounded-lg">
          <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
              Variable belum dikonfigurasi
            </p>
            <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
              Ditemukan {unmappedVariables.length} variable yang belum dikonfigurasi: {" "}
              {unmappedVariables.map(v => (
                <Badge key={v} variant="outline" className="mr-1">
                  {`{{${v}}}`}
                </Badge>
              ))}
            </p>
            <Button 
              onClick={handleAutoGenerate} 
              variant="outline" 
              size="sm" 
              className="mt-2"
            >
              Konfigurasi Sekarang
            </Button>
          </div>
        </div>
      )}

      {/* Field List */}
      <div className="space-y-3">
        {fields.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8 text-center">
              <p className="text-muted-foreground mb-4">
                Belum ada field dikonfigurasi. Klik "Auto Generate" untuk membuat field otomatis dari template.
              </p>
            </CardContent>
          </Card>
        ) : (
          fields.map((field, index) => (
            <Card key={index}>
              <CardContent className="pt-6">
                <div className="flex gap-4">
                  {/* Drag Handle */}
                  <div className="flex flex-col gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 cursor-move"
                      onClick={() => moveField(index, "up")}
                      disabled={index === 0}
                    >
                      ↑
                    </Button>
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 cursor-move"
                      onClick={() => moveField(index, "down")}
                      disabled={index === fields.length - 1}
                    >
                      ↓
                    </Button>
                  </div>

                  {/* Field Configuration */}
                  <div className="flex-1 grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Variable Name</Label>
                      <Input
                        value={field.variable}
                        onChange={(e) => updateField(index, { variable: e.target.value })}
                        placeholder="nama_mahasiswa"
                      />
                      <p className="text-xs text-muted-foreground">
                        Gunakan di template: {`{{${field.variable}}}`}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label>Label Form</Label>
                      <Input
                        value={field.label}
                        onChange={(e) => updateField(index, { label: e.target.value })}
                        placeholder="Nama Mahasiswa"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Tipe Input</Label>
                      <Select
                        value={field.type}
                        onValueChange={(value) => updateField(index, { type: value as FieldType })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="text">Text</SelectItem>
                          <SelectItem value="textarea">Textarea</SelectItem>
                          <SelectItem value="number">Number</SelectItem>
                          <SelectItem value="date">Date</SelectItem>
                          <SelectItem value="email">Email</SelectItem>
                          <SelectItem value="select">Select/Dropdown</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Placeholder</Label>
                      <Input
                        value={field.placeholder || ""}
                        onChange={(e) => updateField(index, { placeholder: e.target.value })}
                        placeholder="Masukkan nama..."
                      />
                    </div>

                    {field.type === "select" && (
                      <div className="space-y-2 col-span-2">
                        <Label>Options (pisahkan dengan koma)</Label>
                        <Input
                          value={field.options?.join(", ") || ""}
                          onChange={(e) => updateField(index, { 
                            options: e.target.value.split(",").map(o => o.trim()).filter(Boolean)
                          })}
                          placeholder="Option 1, Option 2, Option 3"
                        />
                      </div>
                    )}

                    <div className="space-y-2 col-span-2">
                      <Label>Help Text (Optional)</Label>
                      <Input
                        value={field.helpText || ""}
                        onChange={(e) => updateField(index, { helpText: e.target.value })}
                        placeholder="Teks bantuan untuk user"
                      />
                    </div>

                    <div className="flex items-center justify-between col-span-2">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={field.required}
                          onCheckedChange={(checked) => updateField(index, { required: checked })}
                        />
                        <Label>Wajib Diisi</Label>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeField(index)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Hapus
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
