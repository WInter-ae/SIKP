# Code Convention - SIKP

Dokumen ini menjelaskan aturan dan konvensi penulisan kode untuk proyek SIKP (Sistem Informasi Kerja Praktik).

## Daftar Isi

- [Teknologi Stack](#teknologi-stack)
- [Struktur Direktori](#struktur-direktori)
- [Aturan Penamaan File dan Folder](#aturan-penamaan-file-dan-folder)
- [Aturan Penulisan Kode](#aturan-penulisan-kode)
- [Struktur Komponen](#struktur-komponen)
- [State Management](#state-management)
- [Routing](#routing)
- [Styling](#styling)
- [Type Safety](#type-safety)

---

## Teknologi Stack

- **Framework**: React Router v7
- **Runtime**: React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: Radix UI
- **Form Handling**: React Hook Form + Zod
- **Authentication**: Better Auth
- **Package Manager**: pnpm

---

## Struktur Direktori

### Root Directory (`app/`)

```
app/
├── assets/          # Aset statis (gambar, font, dll)
├── components/      # Komponen global yang dapat digunakan di seluruh aplikasi
├── contexts/        # Context providers untuk state management global
├── feature/         # Fitur-fitur aplikasi (struktur modular)
├── hooks/           # Custom hooks yang dapat digunakan ulang
├── lib/             # Utility functions dan konfigurasi
├── routes/          # Route files (React Router v7 file-based routing)
├── welcome/         # Landing page atau welcome screen
├── app.css          # Global styles
├── root.tsx         # Root component
└── routes.ts        # Route configuration
```

### Struktur Feature Module

Setiap feature harus memiliki struktur sebagai berikut:

```
feature/
└── nama-feature/
    ├── components/      # Komponen spesifik untuk feature ini
    ├── pages/           # Page components untuk feature ini
    ├── hooks/           # Custom hooks spesifik feature (opsional)
    ├── types/           # Type definitions spesifik feature
    │   └── index.d.ts
    ├── context/         # Context providers spesifik feature (opsional)
    ├── data/            # Data statis atau konstanta (opsional)
    ├── index.ts         # Barrel export (opsional)
    └── README.md        # Dokumentasi feature (opsional)
```

**Contoh Feature yang Baik:**

- `feature/cover-letter/`
- `feature/during-intern/`
- `feature/hearing/`
- `feature/submission/`

---

## Aturan Penamaan File dan Folder

### 1. Folder

- Gunakan **kebab-case** (huruf kecil dengan tanda hubung)
- Nama harus deskriptif dan mencerminkan isi folder
- Contoh: `cover-letter`, `during-intern`, `create-teams`

### 2. File Component (`.tsx`)

- Gunakan **kebab-case** untuk nama file
- Suffix `-page.tsx` untuk page components
- Suffix `-dialog.tsx`, `-card.tsx`, `-form.tsx` untuk komponen spesifik
- Contoh:
  - `cover-letter-page.tsx`
  - `process-step.tsx`
  - `invite-member-dialog.tsx`
  - `member-list.tsx`

### 3. File Type (`.d.ts` atau `.ts`)

- Gunakan `index.d.ts` untuk type definitions dalam folder `types/`
- Gunakan **kebab-case** untuk file utility
- Contoh:
  - `types/index.d.ts`
  - `lib/utils.ts`
  - `lib/auth-client.ts`

### 4. File Route

- Ikuti konvensi React Router v7 file-based routing
- Prefix dengan underscore `_` untuk layout routes
- Gunakan dot `.` untuk nested routes
- Gunakan `$` untuk dynamic parameters
- Contoh:
  - `_sidebar.tsx` (layout)
  - `_sidebar.mahasiswa._index.tsx`
  - `_sidebar.mahasiswa.kp._timeline.tsx`
  - `detail-referensi.$id.tsx` (dynamic route)

### 5. File Context

- Suffix dengan `-context.tsx`
- Contoh: `theme-context.tsx`, `timeline-context.tsx`

### 6. File Hook

- Prefix dengan `use-`
- Gunakan **kebab-case**
- Contoh: `use-mobile.ts`, `use-theme.ts`

### 7. File Icon Component

- Suffix dengan `icon.tsx` atau nama deskriptif
- Contoh: `eyeicon.tsx`, `check.tsx`, `doc.tsx`

---

## Aturan Penulisan Kode

### 1. Import Statements

**Urutan Import:**

```tsx
// 1. External dependencies (React, libraries)
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";

// 2. Radix UI atau library UI
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";

// 3. Internal utilities dan helpers
import { cn } from "~/lib/utils";

// 4. Components
import ProcessStep from "~/feature/cover-letter/components/process-step";
import { Button } from "~/components/ui/button";

// 5. Types
import type { ProcessStepProps } from "../types";
import type { Route } from "./+types/root";

// 6. Styles (jika ada)
import "./app.css";
```

**Gunakan alias path:**

- Gunakan `~/` untuk merujuk ke root `app/` directory
- Contoh: `~/components/ui/button`, `~/lib/utils`, `~/feature/cover-letter/...`

### 2. Component Declaration

**Gunakan Function Declaration (bukan Arrow Function) untuk Component Utama:**

```tsx
// ✅ BENAR
function CoverLetterPage() {
  return <div>...</div>;
}

export default CoverLetterPage;

// ❌ SALAH
const CoverLetterPage = () => {
  return <div>...</div>;
};
```

**Untuk komponen kecil atau internal, arrow function diperbolehkan:**

```tsx
const InternalComponent = () => <div>...</div>;
```

### 3. Props Interface

**Definisikan props dengan TypeScript interface:**

```tsx
interface ProcessStepProps {
  title: string;
  description: string;
  status: "submitted" | "rejected" | "resubmitted" | "approved";
  comment?: string; // Optional props dengan ?
  onAction?: () => void;
  actionText?: string;
  showDocumentPreview?: boolean;
}

function ProcessStep({
  title,
  description,
  status,
  comment,
  onAction,
  actionText,
  showDocumentPreview = false, // Default value
}: ProcessStepProps) {
  // Component logic
}
```

### 4. Naming Conventions

**Variables dan Functions:**

- Gunakan **camelCase**
- Nama harus deskriptif
- Boolean variables prefix dengan `is`, `has`, `should`

```tsx
const userName = "John";
const isAuthenticated = true;
const hasPermission = false;
const shouldShowModal = true;

function handleSubmit() {}
function calculateTotal() {}
```

**Components:**

- Gunakan **PascalCase**
- Nama harus deskriptif tentang fungsi komponen

```tsx
function ProcessStep() {}
function CoverLetterPage() {}
function InviteMemberDialog() {}
```

**Constants:**

- Gunakan **UPPER_SNAKE_CASE** untuk konstanta global
- Gunakan **camelCase** untuk konstanta lokal

```tsx
const API_BASE_URL = "https://api.example.com";
const MAX_FILE_SIZE = 5242880;

const defaultValues = { name: "", email: "" };
```

**Types dan Interfaces:**

- Gunakan **PascalCase**
- Suffix dengan `Props` untuk component props
- Suffix dengan `Type` untuk type definitions (opsional)

```tsx
interface ProcessStepProps {}
interface ThemeContextType {}
type ButtonVariant = "default" | "destructive" | "outline";
```

### 5. Destructuring

**Destructure props dan state:**

```tsx
// ✅ BENAR
function Component({ title, description, onAction }: ComponentProps) {
  const { user, isLoading } = useAuth();
  // ...
}

// ❌ SALAH
function Component(props: ComponentProps) {
  const data = useAuth();
  return <div>{props.title}</div>;
}
```

### 6. Conditional Rendering

**Gunakan pattern yang jelas dan konsisten:**

```tsx
// Short circuit untuk simple rendering
{isLoading && <Spinner />}

// Ternary untuk dua kondisi
{isAuthenticated ? <Dashboard /> : <Login />}

// Early return untuk complex logic
if (!data) {
  return <Loading />;
}

return <div>{data.content}</div>;
```

### 7. Event Handlers

**Prefix dengan `handle` untuk event handlers:**

```tsx
const handleSubmit = () => {};
const handleClick = () => {};
const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {};
```

### 8. Comments

**Gunakan comments untuk logic yang kompleks:**

```tsx
// Calculate total with discount
const total = items.reduce((sum, item) => sum + item.price, 0) * 0.9;

// TODO: Implement pagination
// FIXME: Fix validation bug
```

**Hindari comments yang obvious:**

```tsx
// ❌ SALAH
// Set name to John
const name = "John";

// ✅ BENAR (no comment needed)
const name = "John";
```

---

## Struktur Komponen

### 1. Component Structure

**Urutan dalam component file:**

```tsx
// 1. Imports
import { useState } from "react";
import { Button } from "~/components/ui/button";
import type { ComponentProps } from "./types";

// 2. Type definitions (jika tidak di file terpisah)
interface LocalProps {
  title: string;
}

// 3. Constants (jika ada)
const DEFAULT_VALUE = 10;

// 4. Helper functions (jika ada)
function calculateTotal(items: Item[]) {
  return items.reduce((sum, item) => sum + item.price, 0);
}

// 5. Main component
function MainComponent({ title }: ComponentProps) {
  // 5a. Hooks
  const [count, setCount] = useState(0);
  const navigate = useNavigate();

  // 5b. Derived state / memoization
  const total = useMemo(() => calculateTotal(items), [items]);

  // 5c. Event handlers
  const handleClick = () => {
    setCount(count + 1);
  };

  // 5d. Effects
  useEffect(() => {
    // Effect logic
  }, []);

  // 5e. Early returns (jika ada)
  if (!data) {
    return <Loading />;
  }

  // 5f. Main render
  return <div>{/* JSX */}</div>;
}

// 6. Export
export default MainComponent;
```

### 2. Component Size

- **Small components**: < 100 lines (ideal)
- **Medium components**: 100-200 lines
- **Large components**: > 200 lines (consider splitting)

**Jika component terlalu besar, pecah menjadi:**

- Sub-components di file terpisah
- Custom hooks untuk logic
- Helper functions di file terpisah

---

## State Management

### 1. Local State

Gunakan `useState` untuk state lokal component:

```tsx
const [count, setCount] = useState(0);
const [isOpen, setIsOpen] = useState(false);
```

### 2. Context API

**Untuk state yang perlu dibagikan antar banyak components:**

```tsx
// contexts/theme-context.tsx
import { createContext, useContext, useState, type ReactNode } from "react";

interface ThemeContextType {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
```

**Aturan Context:**

- Buat context di folder `contexts/` untuk global context
- Buat context di folder `feature/[nama-feature]/context/` untuk feature-specific context
- Selalu export custom hook (`useTheme`, `useTimeline`, dll)
- Selalu check undefined context dan throw error

### 3. Form State

Gunakan **React Hook Form** untuk form management:

```tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

function LoginForm() {
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (data: z.infer<typeof schema>) => {
    // Handle submit
  };

  return <form onSubmit={form.handleSubmit(onSubmit)}>{/* fields */}</form>;
}
```

---

## Routing

### 1. File-based Routing

Gunakan React Router v7 file-based routing conventions:

```
routes/
├── _index.tsx                                      # /
├── login.tsx                                       # /login
├── register.tsx                                    # /register
├── _sidebar.tsx                                    # Layout dengan sidebar
├── _sidebar.dashboard.tsx                          # /dashboard (dengan sidebar)
├── _sidebar.mahasiswa._index.tsx                   # /mahasiswa
├── _sidebar.mahasiswa.kp._timeline.tsx             # /mahasiswa/kp (dengan timeline layout)
├── _sidebar.mahasiswa.kp._timeline.pengajuan.tsx   # /mahasiswa/kp/pengajuan
└── detail-referensi.$id.tsx                        # /detail-referensi/:id
```

**Konvensi:**

- `_index.tsx` = index route
- `_layout.tsx` = layout route (prefix dengan `_`)
- Nested routes gunakan dot `.`
- Dynamic parameters gunakan `$`

### 2. Navigation

```tsx
import { Link, useNavigate } from "react-router";

// Menggunakan Link component
<Link to="/mahasiswa/kp/pengajuan">Pengajuan</Link>;

// Menggunakan navigate programmatically
const navigate = useNavigate();
navigate("/mahasiswa/kp/pengajuan");
```

---

## Styling

### 1. Tailwind CSS

**Gunakan Tailwind utility classes:**

```tsx
<div className="bg-white rounded-lg shadow-md p-6 mb-8">
  <h1 className="text-3xl font-bold text-gray-800 mb-2">Title</h1>
</div>
```

### 2. Conditional Classes

**Gunakan template literals untuk conditional classes:**

```tsx
<div className={`${isActive ? "bg-blue-500" : "bg-gray-500"} p-4 rounded`}>
  Content
</div>
```

### 3. Class Variance Authority (CVA)

**Untuk komponen dengan banyak variants, gunakan CVA:**

```tsx
import { cva, type VariantProps } from "class-variance-authority";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-all",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-white hover:bg-destructive/90",
        outline: "border bg-background hover:bg-accent",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 px-3",
        lg: "h-10 px-6",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);
```

### 4. cn() Utility

**Gunakan `cn()` utility untuk merge classes:**

```tsx
import { cn } from "~/lib/utils";

<Button className={cn("bg-blue-500", isDark && "bg-blue-900", className)} />;
```

---

## Type Safety

### 1. Type Definitions

**Letakkan type definitions di folder `types/`:**

```
feature/
└── cover-letter/
    └── types/
        └── index.d.ts
```

```typescript
// types/index.d.ts
export interface ProcessStepProps {
  title: string;
  description: string;
  status: "submitted" | "rejected" | "resubmitted" | "approved";
  comment?: string;
  onAction?: () => void;
  actionText?: string;
  showDocumentPreview?: boolean;
}
```

### 2. Import Types

**Gunakan `type` keyword untuk import types:**

```tsx
import type { ProcessStepProps } from "../types";
import type { Route } from "./+types/root";
```

### 3. Props Typing

**Selalu type props components:**

```tsx
// ✅ BENAR
function Button({ variant, size, children }: ButtonProps) {
  return <button>{children}</button>;
}

// ❌ SALAH
function Button({ variant, size, children }) {
  return <button>{children}</button>;
}
```

### 4. Event Handlers

**Type event handlers dengan React types:**

```tsx
const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  console.log(e.target.value);
};

const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
};

const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
  console.log(e.currentTarget);
};
```

### 5. Children Props

**Type children dengan ReactNode:**

```tsx
interface LayoutProps {
  children: React.ReactNode;
}

function Layout({ children }: LayoutProps) {
  return <div>{children}</div>;
}
```

---

## Best Practices

### 1. Component Organization

- **One component per file** (kecuali untuk small helper components)
- **Group related files** dalam folder yang sama
- **Colocate** - letakkan files yang berkaitan dekat satu sama lain

### 2. Code Reusability

- **Extract reusable logic** ke custom hooks
- **Create generic components** di `components/` folder
- **Avoid duplication** - gunakan shared components dan utilities

### 3. Performance

- **Use React.memo** untuk components yang render sering dengan props yang sama
- **Use useMemo dan useCallback** untuk expensive computations
- **Lazy load** components yang tidak diperlukan di initial load

### 4. Error Handling

- **Always handle errors** dalam async operations
- **Provide user feedback** untuk error states
- **Use ErrorBoundary** untuk catch component errors

### 5. Accessibility

- **Use semantic HTML**
- **Add aria labels** untuk screen readers
- **Ensure keyboard navigation** works
- **Test with accessibility tools**

### 6. Testing (Coming Soon)

- Unit tests untuk utilities dan pure functions
- Integration tests untuk features
- E2E tests untuk critical user flows

---

## Checklist untuk Pull Request

Sebelum submit PR, pastikan:

- [ ] Code mengikuti naming conventions
- [ ] Files ditempatkan di folder yang benar
- [ ] Types didefinisikan dengan benar
- [ ] Tidak ada TypeScript errors
- [ ] Import statements terorganisir dengan baik
- [ ] Components mengikuti structure guidelines
- [ ] Styling menggunakan Tailwind dengan konsisten
- [ ] Code readable dan maintainable
- [ ] Tidak ada console.log atau debug code

---

## Resources

- [React Router v7 Docs](https://reactrouter.com/dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Radix UI Docs](https://www.radix-ui.com/)
- [Better Auth Docs](https://www.better-auth.com/)

---

**Last Updated:** 3 Desember 2025
