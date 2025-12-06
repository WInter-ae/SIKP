import { useState } from "react";
import type { BeritaAcara } from "../types";

export function useBeritaAcara() {
  const [beritaAcara, setBeritaAcara] = useState<BeritaAcara | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const saveDraft = (data: Partial<BeritaAcara>, onSuccess?: () => void) => {
    const draft: BeritaAcara = {
      ...data,
      status: "draft",
      createdAt: beritaAcara?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as BeritaAcara;

    setBeritaAcara(draft);
    
    if (typeof window !== "undefined") {
      localStorage.setItem("berita-acara-draft", JSON.stringify(draft));
    }
    
    if (onSuccess) onSuccess();
  };

  const submitBeritaAcara = async (
    data: Partial<BeritaAcara>,
    onSuccess?: () => void,
    onError?: () => void
  ) => {
    setIsSubmitting(true);

    try {
      // Simulasi API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const submitted: BeritaAcara = {
        id: beritaAcara?.id || `BA-${Date.now()}`,
        ...data,
        status: "submitted",
        createdAt: beritaAcara?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as BeritaAcara;

      setBeritaAcara(submitted);
      
      if (typeof window !== "undefined") {
        localStorage.removeItem("berita-acara-draft");
      }

      if (onSuccess) onSuccess();
      return submitted;
    } catch (error) {
      console.error("Error submitting berita acara:", error);
      if (onError) onError();
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateSurat = (onSuccess?: (nomorSurat: string) => void, onError?: () => void) => {
    if (!beritaAcara || beritaAcara.status !== "approved") {
      if (onError) onError();
      return;
    }

    const nomorSurat = `BA/KP/${new Date().getFullYear()}/${Math.floor(
      Math.random() * 1000,
    )
      .toString()
      .padStart(4, "0")}`;
    
    if (onSuccess) onSuccess(nomorSurat);
  };

  const loadFromLocalStorage = () => {
    if (typeof window !== "undefined") {
      const savedDraft = localStorage.getItem("berita-acara-draft");
      if (savedDraft) {
        try {
          const parsed = JSON.parse(savedDraft);
          setBeritaAcara(parsed);
          return parsed;
        } catch (error) {
          console.error("Error parsing saved draft:", error);
        }
      }
    }
    return null;
  };

  const resetData = (onSuccess?: () => void) => {
    setBeritaAcara(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("berita-acara-draft");
    }
    if (onSuccess) onSuccess();
  };

  return {
    beritaAcara,
    setBeritaAcara,
    isSubmitting,
    saveDraft,
    submitBeritaAcara,
    generateSurat,
    loadFromLocalStorage,
    resetData,
  };
}
