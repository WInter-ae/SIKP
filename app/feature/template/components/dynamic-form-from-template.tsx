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
import { Card, CardContent } from "~/components/ui/card";
import type { TemplateField } from "../types/template.types";
import { toast } from "sonner";

interface DynamicFormFromTemplateProps {
  fields: TemplateField[];
  onSubmit: (data: Record<string, string>) => void;
  initialData?: Record<string, string>;
  submitButtonText?: string;
}

/**
 * Component yang auto-generate form berdasarkan template fields
 * Form ini akan menyesuaikan otomatis ketika admin mengubah template
 */
export function DynamicFormFromTemplate({
  fields,
  onSubmit,
  initialData = {},
  submitButtonText = "Submit",
}: DynamicFormFromTemplateProps) {
  const [formData, setFormData] = useState<Record<string, string>>(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Sort fields by order
  const sortedFields = [...fields].sort((a, b) => a.order - b.order);

  const handleChange = (variable: string, value: string) => {
    setFormData(prev => ({ ...prev, [variable]: value }));
    // Clear error when user types
    if (errors[variable]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[variable];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    fields.forEach(field => {
      const value = formData[field.variable]?.trim() || "";

      // Required validation
      if (field.required && !value) {
        newErrors[field.variable] = `${field.label} wajib diisi`;
      }

      // Type-specific validation
      if (value) {
        if (field.type === "email" && !value.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
          newErrors[field.variable] = "Format email tidak valid";
        }

        if (field.type === "number" && isNaN(Number(value))) {
          newErrors[field.variable] = "Harus berupa angka";
        }

        // Custom validation
        if (field.validation) {
          if (field.validation.min && value.length < field.validation.min) {
            newErrors[field.variable] = field.validation.message || 
              `Minimal ${field.validation.min} karakter`;
          }
          if (field.validation.max && value.length > field.validation.max) {
            newErrors[field.variable] = field.validation.message || 
              `Maksimal ${field.validation.max} karakter`;
          }
          if (field.validation.pattern && !new RegExp(field.validation.pattern).test(value)) {
            newErrors[field.variable] = field.validation.message || "Format tidak valid";
          }
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Mohon perbaiki kesalahan pada form");
      return;
    }

    onSubmit(formData);
  };

  const renderField = (field: TemplateField) => {
    const commonProps = {
      id: field.variable,
      value: formData[field.variable] || field.defaultValue || "",
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => 
        handleChange(field.variable, e.target.value),
      placeholder: field.placeholder,
      className: errors[field.variable] ? "border-destructive" : "",
    };

    switch (field.type) {
      case "textarea":
        return (
          <Textarea
            {...commonProps}
            rows={4}
          />
        );

      case "select":
        return (
          <Select
            value={formData[field.variable] || field.defaultValue || ""}
            onValueChange={(value) => handleChange(field.variable, value)}
          >
            <SelectTrigger className={errors[field.variable] ? "border-destructive" : ""}>
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

      case "date":
        return (
          <Input
            {...commonProps}
            type="date"
          />
        );

      case "number":
        return (
          <Input
            {...commonProps}
            type="number"
          />
        );

      case "email":
        return (
          <Input
            {...commonProps}
            type="email"
          />
        );

      default:
        return (
          <Input
            {...commonProps}
            type="text"
          />
        );
    }
  };

  if (fields.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <p className="text-muted-foreground">
            Template belum dikonfigurasi. Hubungi admin untuk konfigurasi template.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sortedFields.map((field) => (
          <div
            key={field.variable}
            className={field.type === "textarea" ? "col-span-full" : ""}
          >
            <div className="space-y-2">
              <Label htmlFor={field.variable}>
                {field.label}
                {field.required && <span className="text-destructive ml-1">*</span>}
              </Label>
              {renderField(field)}
              {field.helpText && (
                <p className="text-xs text-muted-foreground">{field.helpText}</p>
              )}
              {errors[field.variable] && (
                <p className="text-xs text-destructive">{errors[field.variable]}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <Button type="submit" size="lg">
          {submitButtonText}
        </Button>
      </div>
    </form>
  );
}
