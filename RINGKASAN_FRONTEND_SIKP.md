# RINGKASAN FRONTEND SIKP
## Sistem Informasi Kerja Praktik

> **⚡ Update Terbaru (2026-02-13):** Sistem autentikasi menggunakan **OAuth 2.0 Authorization Code + PKCE** terintegrasi SSO UNSRI, API client berbasis **axios**, role source-of-truth dari `roles[]` (lowercase), dan logic SSO telah dipecah ke modul `app/features/sso`.

---

## 📋 Daftar Isi

1. [Overview Proyek](#1-overview-proyek)
2. [Teknologi Stack](#2-teknologi-stack)
3. [Struktur Proyek](#3-struktur-proyek)
4. [Arsitektur Aplikasi](#4-arsitektur-aplikasi)
5. [Fitur-Fitur Utama](#5-fitur-fitur-utama)
6. [Autentikasi & Otorisasi](#6-autentikasi--otorisasi)
7. [Integrasi API](#7-integrasi-api)
8. [Sistem Routing](#8-sistem-routing)
9. [State Management](#9-state-management)
10. [Komponen UI](#10-komponen-ui)
11. [Alur Bisnis Utama](#11-alur-bisnis-utama)
12. [Dokumentasi & Konvensi](#12-dokumentasi--konvensi)
13. [Development & Build](#13-development--build)
14. [Known Issues & TODOs](#14-known-issues--todos)
15. [Rekomendasi](#15-rekomendasi)

---

## 1. Overview Proyek

**SIKP (Sistem Informasi Kerja Praktik)** adalah aplikasi web berbasis React untuk mengelola seluruh proses Kerja Praktik mahasiswa, dari pembentukan tim hingga evaluasi akhir.

### Tujuan Aplikasi
- Mendigitalkan proses pengajuan dan persetujuan Kerja Praktik
- Memfasilitasi kolaborasi antara mahasiswa, dosen, admin, dan pembimbing lapangan
- Menyediakan tracking timeline yang jelas untuk setiap tahap KP
- Mengelola dokumen dan template secara terpusat
- Mempermudah penilaian dan evaluasi dengan e-signature

### Stakeholders
- **Mahasiswa**: Membuat tim, mengajukan KP, upload dokumen, logbook
- **Dosen**: Verifikasi judul, sidang, penilaian
- **Admin**: Approve pengajuan, kelola template
- **Kaprodi**: Persetujuan tambahan
- **Wakil Dekan**: Approval level tinggi
- **Pembimbing Lapangan**: Monitoring dan evaluasi mahasiswa di tempat KP

---

## 2. Teknologi Stack

### Core Framework
- **React Router v7** - Framework utama dengan file-based routing
- **React 19** - UI Library dengan React Server Components support
- **TypeScript** - Static typing untuk type safety
- **Vite 7** - Build tool dan development server

### UI & Styling
- **Tailwind CSS v4** - Utility-first CSS framework
- **shadcn/ui** - Component library berbasis Radix UI
- **Radix UI** - Unstyled accessible components
- **Lucide React** - Icon library (konsisten dengan shadcn)
- **next-themes** - Dark mode management

### Form & Validation
- **React Hook Form** - Form state management
- **Zod v4** - Schema validation

### Data Fetching & State
- **Custom API Client** - Wrapper axios dengan type safety + refresh token otomatis saat 401
- **Context API** - Global state (User, Theme)
- **sessionStorage** - Penyimpanan token OAuth per-tab (lebih aman dari localStorage)

### Document Management
- **docxtemplater** - Generate DOCX documents
- **pizzip** - ZIP file handling untuk DOCX
- **file-saver** - Download files
- **html2canvas** - HTML to canvas conversion
- **jspdf** - PDF generation
- **@monaco-editor/react** - Code editor untuk template

### Authentication
- **OAuth 2.0 + PKCE** - Authorization Code Flow via SSO UNSRI
- **Token Management** - access/refresh token di sessionStorage + auto refresh
- **Role-Based Access** - sumber role dari SSO `roles[]` (lowercase)

### Other Libraries
- **sonner** - Toast notifications
- **class-variance-authority** - Variant-based styling
- **clsx & tailwind-merge** - Conditional className utility

### Development Tools
- **ESLint** - Linting dengan TypeScript support
- **Prettier** - Code formatting
- **pnpm** - Package manager

---

## 3. Struktur Proyek

### Root Directory
```
SIKP/
├── app/                          # Source code utama
│   ├── assets/                   # Static assets (images)
│   ├── components/               # Shared components
│   │   ├── ui/                   # shadcn/ui components
│   │   ├── header.tsx
│   │   ├── footer.tsx
│   │   └── protected-route.tsx   # Route guard
│   ├── contexts/                 # Context providers
│   │   ├── user-context.tsx      # User state & auth
│   │   └── theme-context.tsx     # Dark mode
│   ├── feature/                  # Feature modules
│   │   ├── cover-letter/         # Surat pengantar
│   │   ├── create-teams/         # Buat tim
│   │   ├── dosen/                # Fitur dosen
│   │   ├── dosen-grading/        # Penilaian dosen
│   │   ├── during-intern/        # Saat magang
│   │   ├── evaluation/           # Evaluasi
│   │   ├── field-mentor/         # Pembimbing lapangan
│   │   ├── hearing/              # Sidang
│   │   ├── kp-report/            # Laporan KP
│   │   ├── login/                # Login
│   │   ├── mentor/               # Mentor
│   │   ├── register/             # Registrasi
│   │   ├── repository/           # Repositori laporan
│   │   ├── response-letter/      # Surat balasan
│   │   ├── sidebar/              # Sidebar navigation
│   │   ├── submission/           # Pengajuan KP
│   │   ├── template/             # Template management
│   │   └── timeline/             # Timeline component
│   ├── hooks/                    # Custom hooks
│   │   └── use-mobile.ts
│   ├── features/                 # Feature modules tambahan (SSO split clean-code)
│   │   └── sso/
│   │       ├── components/       # Pure presentational callback views
│   │       ├── hooks/            # use-sso-callback (business flow)
│   │       ├── pages/            # sso-callback-page.tsx
│   │       ├── services/         # sso-client.ts, pkce.ts
│   │       ├── types/
│   │       └── utils/            # role-routing.ts
│   ├── lib/                      # Utilities & services
│   │   ├── api-client.ts         # API wrapper
│   │   ├── sso-client.ts         # Primary SSO entrypoint (renamed)
│   │   ├── auth-client.ts        # Backward-compatible re-export ke features/sso
│   │   ├── types.ts              # Global types
│   │   ├── utils.ts              # Utility functions
│   │   └── services/             # API service modules
│   │       ├── team.service.ts
│   │       └── template-api.ts
│   ├── routes/                   # React Router routes
│   │   ├── _index.tsx            # Home page
│   │   ├── _sidebar.tsx          # Sidebar layout
│   │   ├── _sidebar.admin.*.tsx  # Admin routes
│   │   ├── _sidebar.dosen.*.tsx  # Dosen routes
│   │   └── _sidebar.mahasiswa.*  # Mahasiswa routes
│   ├── welcome/                  # Welcome/landing page
│   ├── app.css                   # Global styles
│   ├── root.tsx                  # Root component
│   └── routes.ts                 # Route configuration
├── public/                       # Public static files
│   ├── avatars/
│   └── images/
├── package.json
├── vite.config.ts               # Vite configuration
├── tsconfig.json                # TypeScript config
├── eslint.config.ts             # ESLint config
├── react-router.config.ts       # React Router config
├── components.json              # shadcn config
├── CODE_CONVENTION.md           # Coding standards
├── E-SIGNATURE_FLOW.md          # E-signature docs
├── TEMPLATE_MANAGEMENT_GUIDE.md # Template guide
├── IMPLEMENTATION_EXAMPLE.tsx   # Implementation patterns
└── Dockerfile                   # Containerization
```

### Feature Module Structure
Setiap feature mengikuti struktur modular:
```
feature/nama-feature/
├── components/      # Feature-specific components
├── pages/          # Page components
├── hooks/          # Custom hooks (optional)
├── types/          # Type definitions
│   └── index.d.ts
├── context/        # Context providers (optional)
├── data/           # Static data (optional)
└── README.md       # Feature documentation (optional)
```

---

## 4. Arsitektur Aplikasi

### Design Patterns

#### 1. **Feature-Based Architecture**
- Setiap fitur adalah modul independen
- Komponen, types, dan logic dikelompokkan per fitur
- Reusability melalui shared components di `/app/components`

#### 2. **Context Pattern untuk State Global**
```typescript
// User Context - Authentication state
UserContext → useUser()
  ├── user: User | null
  ├── token: string | null
  ├── isAuthenticated: boolean
  └── logout()

// Theme Context - Dark mode
ThemeContext → useTheme()
  ├── isDarkMode: boolean
  └── toggleTheme()
```

#### 3. **Protected Routes Pattern**
```typescript
<ProtectedRoute requiredRoles={["mahasiswa"]}>
  <PageContent />
</ProtectedRoute>
```
- Redirect ke login jika belum authenticated
- Role-based access control
- Loading state handling

#### 4. **Service Layer Pattern**
```typescript
// Separation of concerns
api-client.ts → Generic API wrapper
sso-client.ts → SSO Authentication logic
services/
  ├── team.service.ts → Team operations
  └── template-api.ts → Template operations
```

#### 5. **Type-Safe API Calls**
```typescript
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T | null;
}

const response = await apiClient<Team[]>('/api/teams');
```

### Data Flow

```
User Action
    ↓
Component (React Hook Form)
    ↓
Validation (Zod Schema)
    ↓
API Service Layer
    ↓
API Client (fetch wrapper)
    ↓
Backend API
    ↓
Response → Update State
    ↓
Re-render UI
```

### Component Hierarchy

```
root.tsx (Layout + Providers)
├── ThemeProvider
├── UserProvider
│   └── App
│       ├── _sidebar.tsx (Layout)
│       │   ├── AppSidebar
│       │   └── SidebarInset
│       │       └── Page Components
│       └── Toaster (Notifications)
└── ErrorBoundary
```

---

## 5. Fitur-Fitur Utama

### 5.1 Authentication & User Management
- **Custom Authentication** - Implementasi sendiri tanpa library eksternal
- **Login/Logout** dengan JWT token dari backend
- **Multi-role registration**:
  - Mahasiswa (NIM-based) via `registerMahasiswa()`
  - Dosen (NIP-based)
  - Pembimbing Lapangan (invitation code)
- **Token Storage** - localStorage untuk persistence
- **Profile management** per role
- **Protected routes** dengan role checking
- **Auth functions**: login, logout, getCurrentUser, getAuthToken, isAuthenticated

### 5.2 Team Management (`create-teams`)
- **Buat tim** (max 3 anggota)
- **Undang anggota** via NIM
- **Terima/Tolak undangan**
- **Leave team**
- **Delete team** (hanya ketua)
- **Team code** untuk join
- **Status tracking**: PENDING → FIXED

### 5.3 Submission Management (`submission`)
- **Upload dokumen** (6 jenis):
  1. Proposal Ketua
  2. Surat Kesediaan
  3. Form Permohonan
  4. KRS Semester 4
  5. Daftar Kumpulan Nilai
  6. Bukti Pembayaran UKT
- **Submit pengajuan** ke admin
- **Track status**: DRAFT → PENDING_REVIEW → APPROVED/REJECTED
- **Status history** untuk tracking perubahan
- **Admin review** dengan approve/reject per dokumen
- **Auto-generate** Surat Pengantar saat approved

### 5.4 Cover Letter (`cover-letter`)
- **Generate surat pengantar** otomatis
- **Download** dalam format DOCX/PDF
- Menggunakan template yang bisa dikustomisasi

### 5.5 Response Letter (`response-letter`)
- **Upload surat balasan** dari perusahaan
- **Verify** surat balasan oleh admin/dosen

### 5.6 During Intern (`during-intern`)
- **Logbook harian**
- **Upload dokumentasi**
- **Progress tracking**
- **Monitoring** oleh pembimbing lapangan

### 5.7 Field Mentor (`field-mentor`)
- **Lihat mentee** (mahasiswa yang dibimbing)
- **Review logbook**
- **Beri feedback**
- **Penilaian** mahasiswa

### 5.8 KP Report (`kp-report`)
- **Submit judul** laporan
- **Verifikasi judul** oleh dosen
- **Upload laporan** draft & final
- **Pilih dosen pembimbing**
- **Form approval** multi-stage

### 5.9 Hearing/Sidang (`hearing`)
- **Pengajuan sidang**
- **Berita acara** digital
- **E-signature** untuk dosen:
  - Draw signature
  - Upload image
  - Text signature
- **Verifikasi sidang** oleh dosen
- **Download berita acara** dengan signature

### 5.10 Grading (`dosen-grading`)
- **Penilaian mahasiswa** berdasarkan kriteria:
  - Kesesuaian Laporan (25%)
  - Penguasaan Materi (25%)
  - Analisis & Perancangan (25%)
  - Sikap & Etika (25%)
- **Generate PDF** nilai
- **History nilai**

### 5.11 Repository (`repository`)
- **Browse** laporan KP
- **Search** berdasarkan keyword
- **Filter** by year, prodi, perusahaan
- **View detail** laporan
- **Download** laporan approved

### 5.12 Template Management (`template`)
- **CRUD templates** (admin only)
- **Monaco code editor** untuk edit
- **Support format**: HTML, DOCX, TXT
- **Template variables** dengan syntax `{{variable}}`
- **Preview** template
- **Version control** dengan active/inactive status
- **Download** template
- **Field validation** untuk template variables

### 5.13 Evaluation (`evaluation`)
- **Evaluasi pasca-magang**
- **Survey form** untuk mahasiswa
- **Rating** tempat KP
- **Feedback** untuk perbaikan

### 5.14 Timeline (`timeline`)
- **Visual timeline** 6 tahap:
  1. Buat Tim
  2. Pengajuan
  3. Surat Pengantar
  4. Surat Balasan
  5. Saat Magang
  6. Pasca Magang
- **Progress indicator**
- **Lock/unlock** based on completion
- **Navigation** antar tahap

---

## 6. Autentikasi & Otorisasi

### Authentication Flow

**OAuth 2.0 + PKCE (SSO UNSRI)** dengan clean separation:
- `app/features/sso/services/sso-client.ts` → OAuth/token/profile logic
- `app/features/sso/hooks/use-sso-callback.ts` → callback orchestration
- `app/features/sso/components/*` → UI callback tanpa business logic
- `app/routes/callback.tsx` → route tipis (delegasi ke feature page)

```typescript
// 1. Login trigger (UI)
initiateSsoLogin()
  → redirect ke /oauth/authorize (SSO)
  → PKCE code_verifier + state disimpan di sessionStorage

// 2. Callback handling (/callback)
handleSsoCallback(code, state)
  → POST /api/auth/exchange via Backend SIKP
  → simpan { access_token, refresh_token, expires_at } di sessionStorage

// 3. Load user (UserContext)
useEffect(() => {
  fetchCurrentUser(); // GET /api/auth/me (via backend gateway)
}, []);

// 4. Protected API calls (api-client.ts)
apiClient('/api/teams')
  → axios interceptor inject Authorization Bearer token
  → auto refresh token saat 401 lalu retry request

// 5. Logout
logoutFromSso()
  → clear auth_tokens + pkce state dari sessionStorage
  → redirect '/'

// 6. Multi-role callback routing
roles[] dari SSO (lowercase)
  → admin/superadmin => /admin
  → role lintas tipe (mahasiswa+dosen) => user memilih mode login
```

### Auth Client Functions

```typescript
// app/features/sso/services/sso-client.ts
export async function initiateSsoLogin()
export async function handleSsoCallback(code: string, state: string)
export async function fetchSsoUserProfile()
export async function refreshSsoAccessToken()
export function logoutFromSso()
export function getSsoAccessToken(): string | null
export function hasValidSsoSession(): boolean
```

### Clean-Code Split (SSO)

✅ **Single Responsibility** - route, hook, service, dan UI dipisah jelas  
✅ **Maintainability** - perubahan flow OAuth cukup di `features/sso`  
✅ **Backward Compatible** - `app/lib/auth-client.ts` dan `app/features/sso/services/auth-client.ts` tetap ada sebagai adapter alias, dengan entrypoint baru `app/lib/sso-client.ts`  

### Role-Based Access Control (RBAC)

#### User Roles
```typescript
// Source of truth dari SSO
roles: string[] // lowercase, contoh: ["mahasiswa", "dosen", "lektor"]
```

#### Route Protection
```tsx
// routes/_sidebar.admin.*.tsx
<ProtectedRoute requiredRoles={["admin"]}>
  <AdminPage />
</ProtectedRoute>

// routes/_sidebar.dosen.*.tsx
<ProtectedRoute requiredRoles={["dosen"]}>
  <DosenPage />
</ProtectedRoute>

// routes/_sidebar.mahasiswa.*.tsx
<ProtectedRoute requiredRoles={["mahasiswa"]}>
  <MahasiswaPage />
</ProtectedRoute>
```

**Catatan:** `superadmin` diperlakukan setara `admin` untuk redirect dan akses admin pages.

#### Permission Matrix

| Fitur | Mahasiswa | Dosen | Admin | Kaprodi | WD | P. Lapangan |
|-------|-----------|-------|-------|---------|-------|-------------|
| Buat Tim | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Submit Pengajuan | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Approve Pengajuan | ❌ | ❌ | ✅ | ✅ | ✅ | ❌ |
| Verifikasi Judul | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Verifikasi Sidang | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Penilaian | ❌ | ✅ | ❌ | ❌ | ❌ | ✅ |
| Kelola Template | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| Logbook | ✅ | 👁️ | 👁️ | ❌ | ❌ | 👁️ |

Legend: ✅ Full Access, 👁️ Read Only, ❌ No Access

---

## 7. Integrasi API

### API Configuration

```typescript
// Base URL (Environment Variables)
const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_APP_AUTH_URL ||
  "https://backend-sikp.backend-sikp.workers.dev";

// Development Proxy (vite.config.ts)
server: {
  proxy: {
    "/api": {
      target: "http://127.0.0.1:8787",
      changeOrigin: true,
    },
  },
}
```

### API Client Architecture

#### Generic API Wrapper
```typescript
// lib/api-client.ts
async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>>

// Usage
const response = await apiClient<Team[]>('/api/teams/my-teams');
if (response.success) {
  setTeams(response.data);
}
```

#### Features
- **Auto token injection** dari localStorage
- **Type-safe responses** dengan generics
- **Error handling** terpusat
- **FormData support** untuk upload file
- **Consistent response format**:
  ```typescript
  {
    success: boolean;
    message: string;
    data: T | null;
  }
  ```

### Service Modules

#### Team Service (`lib/services/team.service.ts`)
```typescript
createTeam()              → POST /api/teams
getMyTeams()              → GET /api/teams/my-teams
getTeamMembers(teamId)    → GET /api/teams/:teamId/members
inviteTeamMember(...)     → POST /api/teams/:teamId/invite
respondToInvitation(...)  → POST /api/teams/invitations/:id/respond
leaveTeam(teamId)         → DELETE /api/teams/:teamId/leave
deleteTeam(teamId)        → DELETE /api/teams/:teamId
```

#### Template Service (`lib/services/template-api.ts`)
```typescript
getAllTemplates(params)   → GET /api/templates
getActiveTemplates()      → GET /api/templates/active
getTemplateById(id)       → GET /api/templates/:id
createTemplate(data)      → POST /api/templates
updateTemplate(id, data)  → PATCH /api/templates/:id
deleteTemplate(id)        → DELETE /api/templates/:id
toggleTemplateActive(id)  → PATCH /api/templates/:id/toggle-active
downloadTemplate(id)      → GET /api/templates/:id/download
```

### Error Handling Pattern

```typescript
try {
  const response = await apiClient<Team>('/api/teams', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  
  if (!response.success) {
    toast.error(response.message);
    return;
  }
  
  toast.success('Tim berhasil dibuat!');
  // Handle success
  
} catch (error) {
  console.error('Error:', error);
  toast.error('Terjadi kesalahan. Silakan coba lagi.');
}
```

---

## 8. Sistem Routing

### React Router v7 File-Based Routing

SIKP menggunakan React Router v7 dengan **file-based routing convention**.

#### Routing Convention

```typescript
// routes.ts
export default flatRoutes({
  ignoredRouteFiles: ["home.tsx"],
}) satisfies RouteConfig;
```

#### Route File Naming

| File Pattern | Route | Description |
|--------------|-------|-------------|
| `_index.tsx` | `/` | Home/index route |
| `_sidebar.tsx` | `/` (layout) | Sidebar layout wrapper |
| `_sidebar.admin._index.tsx` | `/admin` | Admin dashboard |
| `_sidebar.admin.template._index.tsx` | `/admin/template` | Template list |
| `_sidebar.mahasiswa.kp._timeline.tsx` | `/mahasiswa/kp` (layout) | Timeline layout |
| `_sidebar.dosen.penilaian.$id.tsx` | `/dosen/penilaian/:id` | Dynamic route |

#### Conventions
- **`_` prefix** = Layout route (tidak generate URL sendiri)
- **`.` (dot)** = Nested route separator
- **`$param`** = Dynamic parameter
- **`_index`** = Index route untuk parent

### Layout Structure

```
Root Layout (root.tsx)
├── ThemeProvider
└── UserProvider
    └── App
        └── _sidebar.tsx (Sidebar Layout)
            ├── AppSidebar (Navigation)
            └── SidebarInset
                └── <Outlet /> (Page Content)
```

### Route Examples

#### Mahasiswa Routes
```
/mahasiswa                        → Dashboard
/mahasiswa/kp                     → Timeline wrapper
/mahasiswa/kp/buat-tim           → Team creation
/mahasiswa/kp/pengajuan          → Submission
/mahasiswa/kp/surat-pengantar    → Cover letter
/mahasiswa/kp/logbook            → Daily logbook
/mahasiswa/repositori            → Repository list
/mahasiswa/repositori/:id        → Report detail
```

#### Dosen Routes
```
/dosen                           → Dashboard
/dosen/kp/verifikasi-judul      → Title verification
/dosen/kp/verifikasi-sidang     → Hearing verification
/dosen/penilaian                → Grading list
/dosen/penilaian/beri-nilai/:id → Give grade
/dosen/penilaian/detail/:id     → Grade detail
```

#### Admin Routes
```
/admin                                → Dashboard
/admin/pengajuan-surat-pengantar     → Submission review
/admin/surat-balasan                 → Response letters
/admin/template                      → Template management
/admin/penilaian                     → All grades
```

### Navigation

```tsx
import { Link, useNavigate } from "react-router";

// Declarative
<Link to="/mahasiswa/kp/pengajuan">Pengajuan</Link>

// Programmatic
const navigate = useNavigate();
navigate('/login');
navigate('/mahasiswa/dashboard', { replace: true });
```

### Dynamic Routes

```tsx
// Route: _sidebar.dosen.penilaian.$id.tsx
import { useParams } from "react-router";

export default function GradeDetailPage() {
  const { id } = useParams();
  // id dari URL /dosen/penilaian/123
}
```

---

## 9. State Management

### Global State (Context API)

#### UserContext
```typescript
// contexts/user-context.tsx
interface UserContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  logout: () => void;
  setUser: (user: User | null) => void;
}

// Usage in components
const { user, isAuthenticated, logout } = useUser();
```

**Responsibilities:**
- Load user dari localStorage on mount
- Provide user info to all components
- Handle logout
- Authentication status

#### ThemeContext
```typescript
// contexts/theme-context.tsx
interface ThemeContextType {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

// Usage
const { isDarkMode, toggleTheme } = useTheme();
```

**Responsibilities:**
- Load saved theme preference
- Sync with system preference
- Toggle dark mode
- Apply theme class to document

### Local State Patterns

#### 1. Form State (React Hook Form)
```tsx
const form = useForm<FormData>({
  resolver: zodResolver(schema),
  defaultValues: { ... },
});

const onSubmit = form.handleSubmit(async (data) => {
  // API call
});
```

#### 2. API Data State
```tsx
const [data, setData] = useState<T[]>([]);
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState<string | null>(null);

useEffect(() => {
  loadData();
}, []);

async function loadData() {
  try {
    setIsLoading(true);
    const response = await apiClient<T[]>('/api/endpoint');
    if (response.success) {
      setData(response.data);
    }
  } catch (err) {
    setError('Error message');
  } finally {
    setIsLoading(false);
  }
}
```

#### 3. Feature-Specific Context
```tsx
// feature/timeline/context/timeline-context.tsx
const TimelineContext = createContext<TimelineContextType>(...);

export const useTimeline = () => {
  const context = useContext(TimelineContext);
  if (!context) throw new Error('useTimeline must be within provider');
  return context;
};
```

### localStorage Usage

| Key | Content | Purpose |
|-----|---------|---------|
| `auth_token` | JWT token | API authentication |
| `user_data` | JSON user object | User info & role |
| `theme` | "light" \| "dark" | Theme preference |
| `dosen-esignature` | Base64 image | Dosen signature |
| `berita-acara-draft` | JSON berita acara | Draft data |
| `nilai-kp-{id}` | JSON nilai | Grade data (dev) |

---

## 10. Komponen UI

### shadcn/ui Components

SIKP menggunakan **shadcn/ui** - component library berbasis Radix UI dengan Tailwind CSS.

#### Components Used

| Component | Usage | File |
|-----------|-------|------|
| Button | Actions, navigation | `components/ui/button.tsx` |
| Card | Content containers | `components/ui/card.tsx` |
| Dialog | Modals, popups | `components/ui/dialog.tsx` |
| Alert Dialog | Confirmations | `components/ui/alert-dialog.tsx` |
| Dropdown Menu | Context menus | `components/ui/dropdown-menu.tsx` |
| Input | Form fields | `components/ui/input.tsx` |
| Label | Form labels | `components/ui/label.tsx` |
| Select | Dropdowns | `components/ui/select.tsx` |
| Textarea | Multi-line input | `components/ui/textarea.tsx` |
| Table | Data tables | `components/ui/table.tsx` |
| Tabs | Tab interface | `components/ui/tabs.tsx` |
| Avatar | User avatars | `components/ui/avatar.tsx` |
| Badge | Status badges | `components/ui/badge.tsx` |
| Progress | Progress bars | `components/ui/progress.tsx` |
| Tooltip | Help text | `components/ui/tooltip.tsx` |
| Switch | Toggle switches | `components/ui/switch.tsx` |
| Separator | Visual dividers | `components/ui/separator.tsx` |
| Skeleton | Loading states | `components/ui/skeleton.tsx` |
| Scroll Area | Scrollable areas | `components/ui/scroll-area.tsx` |
| Accordion | Collapsible content | `components/ui/accordion.tsx` |
| Collapsible | Expand/collapse | `components/ui/collapsible.tsx` |
| Sheet | Side panels | `components/ui/sheet.tsx` |
| Sidebar | Navigation | `components/ui/sidebar.tsx` |
| Sonner | Toast notifications | `components/ui/sonner.tsx` |

### Custom Components

#### ProtectedRoute
```tsx
// components/protected-route.tsx
<ProtectedRoute requiredRoles={["MAHASISWA"]}>
  <PageContent />
</ProtectedRoute>
```
- Checks authentication
- Validates user role
- Redirects if unauthorized
- Shows loading state

#### Header & Footer
```tsx
// components/header.tsx
// components/footer.tsx
```
- Global navigation
- User menu
- Theme toggle

### Feature-Specific Components

#### Timeline Component
```tsx
// feature/timeline/components/timeline.tsx
<Timeline />
```
- Visual 6-step progression
- Active state highlighting
- Navigation between steps
- Lock/unlock based on completion

#### E-Signature Setup
```tsx
// feature/hearing/components/esignature-setup.tsx
<ESignatureSetup />
```
- 3 input methods: Draw, Upload, Text
- Canvas-based drawing
- Image preview
- localStorage persistence

#### Monaco Code Editor (Template)
```tsx
// feature/template (admin-template-management-page.tsx)
<Editor
  height="400px"
  language="html"
  value={contentTemplate}
  onChange={setContentTemplate}
/>
```
- Syntax highlighting
- Auto-completion
- Find & replace
- Multi-language support

---

## 11. Alur Bisnis Utama

### 11.1 Alur Mahasiswa - Kerja Praktik

```
1. REGISTRASI & LOGIN
   ↓
2. BUAT TIM (create-teams)
   - Mahasiswa A membuat tim
   - Generate team code
   - Undang anggota via NIM
   - Anggota terima/tolak undangan
   - Max 3 anggota
   ↓
3. PENGAJUAN KP (submission)
   - Upload 6 dokumen wajib:
     * Proposal Ketua
     * Surat Kesediaan
     * Form Permohonan
     * KRS Semester 4
     * Daftar Kumpulan Nilai
     * Bukti Pembayaran UKT
   - Isi data tempat KP
   - Submit untuk review
   ↓
4. REVIEW ADMIN
   - Admin review dokumen
   - Approve/Reject per dokumen
   - Auto-generate Surat Pengantar jika approved
   ↓
5. SURAT PENGANTAR (cover-letter)
   - Download surat pengantar
   - Kirim ke perusahaan
   ↓
6. SURAT BALASAN (response-letter)
   - Terima surat balasan dari perusahaan
   - Upload surat balasan
   - Admin verifikasi
   ↓
7. SAAT MAGANG (during-intern)
   - Isi logbook harian
   - Upload dokumentasi
   - Monitoring oleh pembimbing lapangan
   ↓
8. LAPORAN KP (kp-report)
   - Submit judul laporan
   - Dosen verifikasi judul
   - Upload draft laporan
   - Pilih dosen pembimbing
   - Revisi laporan
   - Upload laporan final
   ↓
9. SIDANG (hearing)
   - Ajukan sidang
   - Dosen verifikasi pengajuan
   - Setup e-signature dosen
   - Dosen approve dengan signature
   - Download berita acara
   ↓
10. PENILAIAN (dosen-grading)
    - Dosen beri nilai
    - Generate PDF nilai
    - Mahasiswa lihat nilai
    ↓
11. EVALUASI PASCA-MAGANG (evaluation)
    - Isi survey
    - Rating tempat KP
    - Feedback
    ↓
12. REPOSITORI (repository)
    - Laporan masuk ke repository
    - Public access untuk browsing
```

### 11.2 Alur Dosen

```
1. LOGIN
   ↓
2. VERIFIKASI JUDUL (kp-report)
   - Review pengajuan judul
   - Approve/Reject dengan komentar
   ↓
3. VERIFIKASI SIDANG (hearing)
   - Setup e-signature (pertama kali)
   - Review berita acara
   - Approve dengan signature
   ↓
4. PENILAIAN (dosen-grading)
   - Beri nilai mahasiswa
   - 4 kriteria @ 25%:
     * Kesesuaian Laporan
     * Penguasaan Materi
     * Analisis & Perancangan
     * Sikap & Etika
   - Generate PDF nilai
```

### 11.3 Alur Admin

```
1. LOGIN
   ↓
2. REVIEW PENGAJUAN (submission-admin)
   - Lihat daftar pengajuan
   - Review dokumen
   - Approve/Reject per dokumen
   - Auto-generate surat pengantar
   ↓
3. KELOLA TEMPLATE (template)
   - CRUD templates
   - Edit dengan code editor
   - Set active/inactive
   - Download templates
   ↓
4. MONITORING
   - Dashboard statistik
   - Track progress mahasiswa
   - Generate reports
```

### 11.4 Alur Pembimbing Lapangan

```
1. REGISTRASI
   - Register dengan invitation code
   ↓
2. MONITORING (field-mentor)
   - Lihat daftar mentee
   - Review logbook harian
   - Beri feedback
   ↓
3. PENILAIAN
   - Evaluasi kinerja mahasiswa
   - Submit penilaian
```

---

## 12. Dokumentasi & Konvensi

### File Documentation

#### 1. CODE_CONVENTION.md (870 lines)
Standar penulisan kode yang komprehensif:
- **Naming conventions**:
  - Folder: kebab-case
  - Components: kebab-case.tsx
  - Routes: React Router v7 convention
  - Hooks: use-*.ts
  - Context: *-context.tsx
- **Import order**:
  1. External dependencies
  2. Radix UI / UI libraries
  3. Internal utilities
  4. Components
  5. Types
  6. Styles
- **Component structure**:
  - Types & interfaces first
  - Component function
  - Export statement
- **TypeScript rules**:
  - Prefer interfaces over types
  - Use explicit return types
  - Avoid `any`
- **Styling**:
  - Tailwind utility classes
  - cn() untuk conditional classes
  - Dark mode: dark: prefix

#### 2. E-SIGNATURE_FLOW.md (171 lines)
Dokumentasi lengkap alur e-signature:
- Setup e-signature dosen (3 methods)
- Approval workflow dengan signature
- Berita acara generation
- Download flow untuk mahasiswa
- File yang dimodifikasi
- Template document planning

#### 3. TEMPLATE_MANAGEMENT_GUIDE.md (218 lines)
Panduan lengkap template management:
- CRUD templates untuk admin
- Upload vs ketik langsung
- Monaco code editor usage
- Template variables syntax `{{variable}}`
- Filter & search templates
- Contoh template HTML
- Best practices

#### 4. IMPLEMENTATION_EXAMPLE.tsx (250 lines)
Contoh lengkap implementasi page:
- useUser hook
- API integration
- Loading states
- Error handling
- Stats cards
- Data display
- Best practices patterns

#### 5. DIAGNOSTIC_ACCEPT_INVITATION.js
Tool diagnostik untuk debugging:
- Check invitations
- Validate API responses
- Console logging untuk troubleshooting

#### 6. TESTING_NILAI_KP.md
Guide untuk testing penilaian:
- Simulasi input nilai
- localStorage manipulation
- PDF generation testing

### Konvensi Penamaan

#### Files
- **Pages**: `*-page.tsx` (e.g., `login-page.tsx`)
- **Components**: `kebab-case.tsx` (e.g., `team-code-dialog.tsx`)
- **Services**: `*.service.ts` (e.g., `team.service.ts`)
- **Types**: `index.d.ts` dalam folder `types/`
- **Context**: `*-context.tsx` (e.g., `user-context.tsx`)
- **Hooks**: `use-*.ts` (e.g., `use-mobile.ts`)

#### Variables & Functions
- **camelCase** untuk variables & functions
- **PascalCase** untuk components & types
- **UPPER_CASE** untuk constants
- **Descriptive names** yang jelas

#### CSS Classes
- Tailwind utility classes
- `cn()` helper untuk conditional:
  ```tsx
  className={cn(
    "base-classes",
    condition && "conditional-classes",
    isDark ? "dark-classes" : "light-classes"
  )}
  ```

---

## 13. Development & Build

### Development Setup

```bash
# Install dependencies
pnpm install

# Start development server
pnpm run dev
# → http://localhost:5173

# Type checking
pnpm run typecheck
```

### Build Configuration

#### vite.config.ts
```typescript
export default defineConfig({
  plugins: [
    tailwindcss(),
    reactRouter(),
    tsconfigPaths()
  ],
  server: {
    proxy: {
      "/api": {
        target: "http://127.0.0.1:8787",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
```

#### tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ES2022",
    "lib": ["DOM", "DOM.Iterable", "ES2022"],
    "jsx": "react-jsx",
    "moduleResolution": "bundler",
    "baseUrl": ".",
    "paths": {
      "~/*": ["./app/*"]
    },
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  }
}
```

#### React Router Config
```typescript
// react-router.config.ts
export default {
  ssr: true,  // Server-side rendering enabled
} satisfies Config;
```

### Build Process

```bash
# Production build
pnpm run build

# Output:
# ├── build/
# │   ├── client/    # Static assets
# │   └── server/    # Server-side code

# Start production server
pnpm start
```

### Docker Deployment

```dockerfile
# Dockerfile included in project
docker build -t sikp-frontend .
docker run -p 3000:3000 sikp-frontend
```

### Environment Variables

```env
VITE_API_URL=https://backend-sikp.workers.dev
VITE_APP_AUTH_URL=https://backend-sikp.workers.dev
```

### Scripts

| Script | Command | Purpose |
|--------|---------|---------|
| `dev` | `react-router dev` | Start dev server |
| `build` | `react-router build` | Production build |
| `start` | `react-router-serve` | Serve production build |
| `typecheck` | `react-router typegen && tsc` | Type checking |

---

## 14. Known Issues & TODOs

### Known Issues

#### 1. **Build Error (Current)**
```bash
Exit Code: 1
```
**Status**: Terminal shows build failed  
**Location**: Package.json build script  
**Impact**: Cannot create production build

#### 2. **Accept Invitation Error**
**Issue**: "Cannot read properties of undefined"  
**File**: Team creation flow  
**Diagnostic Tool**: `DIAGNOSTIC_ACCEPT_INVITATION.js` available

#### 3. **Missing Template Implementation**
**User Note**: "saya belum siapkan templatenya"  
**Location**: Document generation for berita acara  
**Impact**: PDF/DOCX generation belum fully implemented

### TODOs from Code

#### Template Management
```typescript
// admin-template-management-page.tsx:256
// TODO: Implement preview dialog
```

#### Register Approval
```typescript
// register-approval-page.tsx:144
// TODO: Implement API call untuk approve

// register-approval-page.tsx:170
// TODO: Implement API call untuk reject
```

#### Field Mentor Registration
```typescript
// field-mentor-register-form.tsx:111
// TODO: Validate registration code with API

// field-mentor-register-form.tsx:133
// TODO: Submit additional mentor data to API
```

### Debug Code to Clean Up

```typescript
// submission-admin-page.tsx:71
// Debug: Log raw documents from backend

// review-modal.tsx:79
// Debug: log documents received by modal - VERY DETAILED
```

---

## 15. Rekomendasi

### Priority 1: Critical Issues

#### 1.1 Fix Build Error
- **Action**: Investigate build failure
- **Check**:
  - TypeScript errors
  - Import/export issues
  - Missing dependencies
  - Route configuration

#### 1.2 Complete Template Implementation
- **Tasks**:
  - Prepare PDF template for berita acara
  - Prepare DOCX template for surat
  - Integrate with pdf-lib or pdfkit
  - Test document generation flow
- **Benefit**: Complete e-signature feature

#### 1.3 Fix Accept Invitation Bug
- **Action**: Use diagnostic tool to identify issue
- **Check**: API response structure vs frontend expectation

### Priority 2: Code Quality

#### 2.1 Remove Debug Code
- Remove console.log statements
- Remove debug comments
- Clean up commented code

#### 2.2 Complete TODOs
- Implement missing API calls
- Add validation logic
- Complete preview dialogs

#### 2.3 Error Handling Improvements
```typescript
// Add consistent error handling
try {
  const response = await apiClient(...);
  if (!response.success) {
    // Handle API error
    toast.error(response.message);
    return;
  }
  // Success path
} catch (error) {
  // Handle network error
  console.error('Network error:', error);
  toast.error('Terjadi kesalahan jaringan');
}
```

### Priority 3: Performance

#### 3.1 Code Splitting
```typescript
// Lazy load pages
const DosenGradingPage = lazy(() => 
  import('~/feature/dosen-grading/pages/dosen-grading-list-page')
);
```

#### 3.2 API Caching
- Implement React Query or SWR
- Cache frequently accessed data
- Reduce redundant API calls

#### 3.3 Image Optimization
- Compress avatars & images
- Use WebP format
- Lazy load images

### Priority 4: Features

#### 4.1 Real-time Updates
- WebSocket for notifications
- Real-time logbook updates
- Live invitation status

#### 4.2 Advanced Search
- Full-text search in repository
- Filter by multiple criteria
- Search suggestions

#### 4.3 Analytics Dashboard
- Admin analytics
- Usage statistics
- Progress tracking charts

#### 4.4 Export Features
- Export to Excel
- Bulk download documents
- Generate reports

### Priority 5: Testing

#### 5.1 Unit Tests
```typescript
// Add vitest for unit testing
import { describe, it, expect } from 'vitest';

describe('apiClient', () => {
  it('should add auth token to headers', () => {
    // Test implementation
  });
});
```

#### 5.2 Integration Tests
- Test critical user flows
- API integration tests
- Form submission tests

#### 5.3 E2E Tests
- Playwright or Cypress
- Test complete user journeys
- Cross-browser testing

### Priority 6: Documentation

#### 6.1 API Documentation
- Document all API endpoints
- Request/response examples
- Error code reference

#### 6.2 Component Documentation
- Storybook for UI components
- Props documentation
- Usage examples

#### 6.3 User Manual
- Guide untuk setiap role
- Screenshot tutorials
- FAQ section

### Priority 7: Security

#### 7.1 Input Validation
- Sanitize user inputs
- File upload validation
- XSS prevention

#### 7.2 Token Management
- **Implement refresh tokens** - Auto-refresh sebelum expired
- **Token expiry handling** - Detect expired token & auto-logout
- **Secure token storage** - Consider httpOnly cookies alternative
- **Token validation** - Verify token integrity di client-side

#### 7.3 Rate Limiting
- Client-side rate limiting
- Prevent API abuse
- Loading states

### Code Refactoring Suggestions

#### 1. Extract Common Hooks
```typescript
// hooks/use-table-data.ts
export function useTableData<T>(endpoint: string) {
  const [data, setData] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Common data fetching logic
  
  return { data, isLoading, error, refetch };
}
```

#### 2. Create Form Components
```typescript
// components/forms/controlled-input.tsx
export function ControlledInput({
  control,
  name,
  label,
  ...props
}: ControlledInputProps) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input {...field} {...props} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
```

#### 3. Standardize Loading States
```typescript
// components/loading-state.tsx
export function LoadingState({ message = "Memuat..." }) {
  return (
    <div className="flex items-center justify-center p-8">
      <Spinner />
      <p className="ml-2 text-muted-foreground">{message}</p>
    </div>
  );
}
```

---

## Kesimpulan

**SIKP Frontend** adalah aplikasi React modern yang dibangun dengan React Router v7, TypeScript, dan Tailwind CSS. Aplikasi ini mengelola seluruh siklus hidup Kerja Praktik mahasiswa dengan fitur-fitur lengkap untuk berbagai stakeholder.

### Strengths
✅ **Modern tech stack** dengan React 19 & Router v7  
✅ **Type-safe** dengan TypeScript  
✅ **Modular architecture** dengan feature-based structure  
✅ **Comprehensive UI** dengan shadcn/ui components  
✅ **Well-documented** dengan code conventions  
✅ **Role-based access** control  
✅ **API integration** yang terstruktur  
✅ **Custom auth implementation** - Lightweight, no external dependencies  
✅ **JWT-based authentication** dengan localStorage persistence  

### Areas for Improvement
⚠️ **Build errors** perlu diperbaiki  
⚠️ **Incomplete features** (template generation)  
⚠️ **Testing** belum ada  
⚠️ **Performance optimization** needed  
⚠️ **Error handling** bisa lebih robust  

### Next Steps
1. **Fix build error** - Critical untuk deployment
2. **Complete template features** - Untuk e-signature flow
3. **Add tests** - Unit, integration, E2E
4. **Performance audit** - Code splitting, caching
5. **Security review** - Input validation, XSS prevention
6. **Documentation** - API docs, user manual

---

**Total Analysis Coverage:**
- 📁 **18 Feature Modules**
- 🗂️ **44+ Route Files**
- 🎨 **28 UI Components**
- 📦 **62 Dependencies** (40 runtime + 22 dev)
- 📝 **870 Lines** of Code Convention
- 🔐 **6 User Roles**
- 📊 **12 Major Features**
- 🔑 **Custom Auth** - No external auth library

**Analyzed on:** February 9, 2026  
**Project:** SIKP - Sistem Informasi Kerja Praktik  
**Framework:** React Router v7 + React 19  
**Build Tool:** Vite 7  
**Language:** TypeScript  

---
