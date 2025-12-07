import { useEffect, useRef, useState } from "react";
import type Quill from "quill";

interface UseQuillOptions {
  theme?: string;
  modules?: Record<string, unknown>;
  formats?: string[];
  placeholder?: string;
}

const defaultModules = {
  toolbar: [
    ["bold", "italic", "underline", "strike"],
    ["blockquote", "code-block"],
    [{ header: 1 }, { header: 2 }],
    [{ list: "ordered" }, { list: "bullet" }],
    [{ script: "sub" }, { script: "super" }],
    [{ indent: "-1" }, { indent: "+1" }],
    [{ direction: "rtl" }],
    [{ size: ["small", false, "large", "huge"] }],
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    [{ color: [] }, { background: [] }],
    [{ font: [] }],
    [{ align: [] }],
    ["clean"],
    ["link", "image"],
  ],
};

export function useQuill(options: UseQuillOptions = {}) {
  const { theme = "snow", modules = defaultModules, formats, placeholder } = options;
  
  const quillRef = useRef<HTMLDivElement>(null);
  const [quill, setQuill] = useState<Quill | null>(null);
  const quillInstanceRef = useRef<Quill | null>(null);

  useEffect(() => {
    if (quillRef.current && !quillInstanceRef.current) {
      // Dynamic import to ensure Quill is only loaded on client-side
      import("quill").then((QuillModule) => {
        const QuillClass = QuillModule.default;
        
        if (quillRef.current && !quillInstanceRef.current) {
          const quillInstance = new QuillClass(quillRef.current, {
            theme,
            modules,
            formats,
            placeholder,
          });
          
          quillInstanceRef.current = quillInstance;
          setQuill(quillInstance);
        }
      });
    }

    return () => {
      // Cleanup if needed
      quillInstanceRef.current = null;
    };
  }, [theme, modules, formats, placeholder]);

  return { quill, quillRef };
}
