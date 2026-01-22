# Database Schema - SIKP (Sistem Informasi Kerja Praktik)

## 📋 Ringkasan Fitur Frontend

### 1. **Manajemen Mahasiswa (Student Management)**
- Profile mahasiswa (NIM, nama, email, prodi, fakultas, angkatan)
- Data magang (perusahaan, posisi, periode, mentor, dosen pembimbing)
- Status progress magang

### 2. **Logbook Mahasiswa**
- Mahasiswa buat entri logbook harian (tanggal, aktivitas, deskripsi)
- Status: PENDING, APPROVED, REJECTED
- Mentor lapangan paraf/approve logbook
- Filter berdasarkan tanggal dan status
- Statistik logbook (total, pending, approved, rejected)

### 3. **Penilaian (Assessment)**
- Mentor lapangan beri nilai dengan 5 kriteria:
  - Kehadiran (20%)
  - Kerjasama (30%)
  - Sikap/Etika (20%)
  - Prestasi Kerja (20%)
  - Kreatifitas (10%)
- Total score weighted average
- Feedback/catatan dari mentor
- Mahasiswa lihat penilaian

### 4. **Laporan KP (Internship Report)**
- Upload file laporan (PDF)
- Status: DRAFT, SUBMITTED, APPROVED, REVISION, REJECTED
- Review dan scoring oleh dosen
- Metadata (fileName, fileUrl, fileSize)
- Review notes

### 5. **Pengajuan Judul**
- Mahasiswa ajukan judul laporan KP
- Data: judul Indonesia, judul Inggris, tempat magang, periode, deskripsi
- Teknologi dan metodologi
- Status: diajukan, disetujui, ditolak, revisi
- Dosen verifikasi dengan catatan
- History revisi

### 6. **Mentor Lapangan**
- Profile mentor (nama, email, perusahaan, posisi)
- Lihat daftar mahasiswa bimbingan (mentees)
- Approve logbook (single & bulk)
- Beri penilaian mahasiswa

### 7. **Tim KP (Team)**
- Mahasiswa bisa mengajukan magang dalam tim
- Tim hanya untuk tahap **pengajuan dan pasca magang**
- Saat magang: **setiap mahasiswa bekerja individual** (logbook, assessment, report masing-masing)
- Get data tim dan anggota untuk keperluan administrasi

### 8. **User Management**
- Multi-role: MAHASISWA, MENTOR_LAPANGAN, DOSEN
- Authentication & authorization

---

## 🗄️ Drizzle Schema

```typescript
import { pgTable, uuid, varchar, text, timestamp, integer, decimal, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ==================== ENUMS ====================

export const userRoleEnum = pgEnum('user_role', ['MAHASISWA', 'MENTOR_LAPANGAN', 'DOSEN', 'ADMIN']);

export const internshipStatusEnum = pgEnum('internship_status', ['PENDING', 'AKTIF', 'SELESAI', 'BATAL']);

export const logbookStatusEnum = pgEnum('logbook_status', ['PENDING', 'APPROVED', 'REJECTED']);

export const reportStatusEnum = pgEnum('report_status', ['DRAFT', 'SUBMITTED', 'APPROVED', 'REVISION', 'REJECTED']);

export const titleStatusEnum = pgEnum('title_status', ['DIAJUKAN', 'DISETUJUI', 'DITOLAK', 'REVISI']);

// ==================== TABLES ====================

// Users Table (Authentication)
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  role: userRoleEnum('role').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Student Profiles
export const students = pgTable('students', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull().unique(),
  nim: varchar('nim', { length: 20 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 20 }),
  prodi: varchar('prodi', { length: 100 }).notNull(),
  fakultas: varchar('fakultas', { length: 100 }),
  angkatan: varchar('angkatan', { length: 10 }).notNull(),
  semester: integer('semester').notNull(),
  ipk: decimal('ipk', { precision: 3, scale: 2 }),
  address: text('address'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Mentor Profiles (Pembimbing Lapangan)
export const mentors = pgTable('mentors', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 20 }),
  company: varchar('company', { length: 255 }).notNull(),
  position: varchar('position', { length: 100 }).notNull(),
  address: text('address'),
  signature: text('signature'), // Base64 signature - setup once in profile
  signatureSetAt: timestamp('signature_set_at'), // When signature was created/updated
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Dosen Profiles (Lecturer)
export const lecturers = pgTable('lecturers', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull().unique(),
  nip: varchar('nip', { length: 30 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 20 }),
  prodi: varchar('prodi', { length: 100 }),
  fakultas: varchar('fakultas', { length: 100 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Teams (Tim KP)
export const teams = pgTable('teams', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  leaderId: uuid('leader_id').references(() => students.id).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Team Members
export const teamMembers = pgTable('team_members', {
  id: uuid('id').primaryKey().defaultRandom(),
  teamId: uuid('team_id').references(() => teams.id).notNull(),
  studentId: uuid('student_id').references(() => students.id).notNull(),
  joinedAt: timestamp('joined_at').defaultNow().notNull(),
});

// Internships (Data Magang)
export const internships = pgTable('internships', {
  id: uuid('id').primaryKey().defaultRandom(),
  studentId: uuid('student_id').references(() => students.id).notNull().unique(),
  // Note: teamId TIDAK ada - saat magang mahasiswa individual
  company: varchar('company', { length: 255 }).notNull(),
  position: varchar('position', { length: 100 }).notNull(),
  mentorId: uuid('mentor_id').references(() => mentors.id),
  lecturerId: uuid('lecturer_id').references(() => lecturers.id),
  startDate: timestamp('start_date').notNull(), // Periode magang dari input mahasiswa
  endDate: timestamp('end_date').notNull(), // Periode magang dari input mahasiswa
  status: internshipStatusEnum('status').notNull().default('PENDING'),
  progress: integer('progress').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Logbook Entries
export const logbooks = pgTable('logbooks', {
  id: uuid('id').primaryKey().defaultRandom(),
  studentId: uuid('student_id').references(() => students.id).notNull(),
  internshipId: uuid('internship_id').references(() => internships.id).notNull(),
  date: timestamp('date').notNull(),
  activity: varchar('activity', { length: 255 }).notNull(),
  description: text('description').notNull(),
  mentorSignature: text('mentor_signature'), // Base64 string (data:image/png;base64,...)
  mentorSignedAt: timestamp('mentor_signed_at'),
  status: logbookStatusEnum('status').notNull().default('PENDING'),
  rejectionNote: text('rejection_note'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Assessments (Penilaian)
export const assessments = pgTable('assessments', {
  id: uuid('id').primaryKey().defaultRandom(),
  studentId: uuid('student_id').references(() => students.id).notNull().unique(),
  internshipId: uuid('internship_id').references(() => internships.id).notNull(),
  mentorId: uuid('mentor_id').references(() => mentors.id).notNull(),
  kehadiran: integer('kehadiran').notNull(), // 0-100
  kerjasama: integer('kerjasama').notNull(), // 0-100
  sikapEtika: integer('sikap_etika').notNull(), // 0-100
  prestasiKerja: integer('prestasi_kerja').notNull(), // 0-100
  kreatifitas: integer('kreatifitas').notNull(), // 0-100
  totalScore: decimal('total_score', { precision: 5, scale: 2 }).notNull(), // Weighted average
  feedback: text('feedback'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// KP Reports (Laporan KP)
export const reports = pgTable('reports', {
  id: uuid('id').primaryKey().defaultRandom(),
  studentId: uuid('student_id').references(() => students.id).notNull().unique(),
  internshipId: uuid('internship_id').references(() => internships.id).notNull(),
  fileName: varchar('file_name', { length: 255 }).notNull(),
  fileUrl: varchar('file_url', { length: 500 }).notNull(),
  fileSize: integer('file_size').notNull(), // in bytes
  description: text('description'),
  notes: text('notes'),
  status: reportStatusEnum('status').notNull().default('DRAFT'),
  uploadedAt: timestamp('uploaded_at').defaultNow().notNull(),
  submittedAt: timestamp('submitted_at'),
  reviewedAt: timestamp('reviewed_at'),
  reviewedBy: uuid('reviewed_by').references(() => lecturers.id),
  reviewNote: text('review_note'),
  score: decimal('score', { precision: 5, scale: 2 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Title Submissions (Pengajuan Judul)
export const titleSubmissions = pgTable('title_submissions', {
  id: uuid('id').primaryKey().defaultRandom(),
  studentId: uuid('student_id').references(() => students.id).notNull(),
  teamId: uuid('team_id').references(() => teams.id),
  internshipId: uuid('internship_id').references(() => internships.id).notNull(),
  judulIndonesia: varchar('judul_indonesia', { length: 500 }).notNull(),
  judulInggris: varchar('judul_inggris', { length: 500 }),
  tempatMagang: varchar('tempat_magang', { length: 255 }).notNull(),
  periodeMulai: timestamp('periode_mulai').notNull(),
  periodeSelesai: timestamp('periode_selesai').notNull(),
  deskripsi: text('deskripsi').notNull(),
  metodologi: text('metodologi'),
  teknologi: text('teknologi'), // JSON array stored as text
  status: titleStatusEnum('status').notNull().default('DIAJUKAN'),
  tanggalPengajuan: timestamp('tanggal_pengajuan').defaultNow().notNull(),
  tanggalVerifikasi: timestamp('tanggal_verifikasi'),
  verifiedBy: uuid('verified_by').references(() => lecturers.id),
  catatanDosen: text('catatan_dosen'),
  revisionCount: integer('revision_count').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Title Revision History
export const titleRevisions = pgTable('title_revisions', {
  id: uuid('id').primaryKey().defaultRandom(),
  titleSubmissionId: uuid('title_submission_id').references(() => titleSubmissions.id).notNull(),
  tanggal: timestamp('tanggal').defaultNow().notNull(),
  catatan: text('catatan').notNull(),
  createdBy: uuid('created_by').references(() => lecturers.id).notNull(),
});

// Notifications
export const notifications = pgTable('notifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  message: text('message').notNull(),
  type: varchar('type', { length: 50 }).notNull(), // 'INFO', 'WARNING', 'SUCCESS', 'ERROR'
  link: varchar('link', { length: 500 }),
  isRead: integer('is_read').notNull().default(0), // 0 = unread, 1 = read
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ==================== RELATIONS ====================

export const usersRelations = relations(users, ({ one }) => ({
  student: one(students, {
    fields: [users.id],
    references: [students.userId],
  }),
  mentor: one(mentors, {
    fields: [users.id],
    references: [mentors.userId],
  }),
  lecturer: one(lecturers, {
    fields: [users.id],
    references: [lecturers.userId],
  }),
}));

export const studentsRelations = relations(students, ({ one, many }) => ({
  user: one(users, {
    fields: [students.userId],
    references: [users.id],
  }),
  internship: one(internships),
  logbooks: many(logbooks),
  assessment: one(assessments),
  report: one(reports),
  titleSubmissions: many(titleSubmissions),
  teamMemberships: many(teamMembers),
  leadingTeams: many(teams),
}));

export const mentorsRelations = relations(mentors, ({ one, many }) => ({
  user: one(users, {
    fields: [mentors.userId],
    references: [users.id],
  }),
  internships: many(internships),
  assessments: many(assessments),
}));

export const lecturersRelations = relations(lecturers, ({ one, many }) => ({
  user: one(users, {
    fields: [lecturers.userId],
    references: [users.id],
  }),
  internships: many(internships),
  reviewedReports: many(reports),
  verifiedTitles: many(titleSubmissions),
  titleRevisions: many(titleRevisions),
}));

export const teamsRelations = relations(teams, ({ one, many }) => ({
  leader: one(students, {
    fields: [teams.leaderId],
    references: [students.id],
  }),
  members: many(teamMembers),
  internships: many(internships),
  titleSubmissions: many(titleSubmissions),
}));

export const teamMembersRelations = relations(teamMembers, ({ one }) => ({
  team: one(teams, {
    fields: [teamMembers.teamId],
    references: [teams.id],
  }),
  student: one(students, {
    fields: [teamMembers.studentId],
    references: [students.id],
  }),
}));

export const internshipsRelations = relations(internships, ({ one, many }) => ({
  student: one(students, {
    fields: [internships.studentId],
    references: [students.id],
  }),
  // team: TIDAK ada - saat magang mahasiswa individual
  mentor: one(mentors, {
    fields: [internships.mentorId],
    references: [mentors.id],
  }),
  lecturer: one(lecturers, {
    fields: [internships.lecturerId],
    references: [lecturers.id],
  }),
  logbooks: many(logbooks),
  assessment: one(assessments),
  report: one(reports),
  titleSubmissions: many(titleSubmissions),
}));

export const logbooksRelations = relations(logbooks, ({ one }) => ({
  student: one(students, {
    fields: [logbooks.studentId],
    references: [students.id],
  }),
  internship: one(internships, {
    fields: [logbooks.internshipId],
    references: [internships.id],
  }),
}));

export const assessmentsRelations = relations(assessments, ({ one }) => ({
  student: one(students, {
    fields: [assessments.studentId],
    references: [students.id],
  }),
  internship: one(internships, {
    fields: [assessments.internshipId],
    references: [internships.id],
  }),
  mentor: one(mentors, {
    fields: [assessments.mentorId],
    references: [mentors.id],
  }),
}));

export const reportsRelations = relations(reports, ({ one }) => ({
  student: one(students, {
    fields: [reports.studentId],
    references: [students.id],
  }),
  internship: one(internships, {
    fields: [reports.internshipId],
    references: [internships.id],
  }),
  reviewer: one(lecturers, {
    fields: [reports.reviewedBy],
    references: [lecturers.id],
  }),
}));

export const titleSubmissionsRelations = relations(titleSubmissions, ({ one, many }) => ({
  student: one(students, {
    fields: [titleSubmissions.studentId],
    references: [students.id],
  }),
  team: one(teams, {
    fields: [titleSubmissions.teamId],
    references: [teams.id],
  }),
  internship: one(internships, {
    fields: [titleSubmissions.internshipId],
    references: [internships.id],
  }),
  verifier: one(lecturers, {
    fields: [titleSubmissions.verifiedBy],
    references: [lecturers.id],
  }),
  revisions: many(titleRevisions),
}));

export const titleRevisionsRelations = relations(titleRevisions, ({ one }) => ({
  titleSubmission: one(titleSubmissions, {
    fields: [titleRevisions.titleSubmissionId],
    references: [titleSubmissions.id],
  }),
  creator: one(lecturers, {
    fields: [titleRevisions.createdBy],
    references: [lecturers.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));
```

---

## 📊 Database Diagram Overview

```
users (auth)
  ├── students (mahasiswa)
  │   ├── internships (data magang - INDIVIDUAL per student)
  │   │   ├── logbooks (catatan harian - INDIVIDUAL)
  │   │   ├── assessments (penilaian - INDIVIDUAL)
  │   │   ├── reports (laporan KP - INDIVIDUAL)
  │   │   └── titleSubmissions (pengajuan judul - bisa tim atau individual)
  │   │       └── titleRevisions (history revisi)
  │   └── teams (tim KP - hanya untuk pengajuan & pasca magang)
  │       └── teamMembers
  ├── mentors (pembimbing lapangan)
  │   ├── internships (mahasiswa bimbingan - individual)
  │   └── assessments (penilaian yang diberikan - per student)
  └── lecturers (dosen pembimbing)
      ├── internships (mahasiswa bimbingan - individual)
      ├── reports (review laporan - individual)
      └── titleSubmissions (verifikasi judul - bisa tim atau individual)
```

---

## 🔑 Key Features

### 1. **Multi-Role System**
- MAHASISWA: Isi logbook, upload laporan, ajukan judul
- MENTOR_LAPANGAN: Approve logbook, beri penilaian
- DOSEN: Verifikasi judul, review laporan, assign score
- ADMIN: Manage all data

### 2. **One-to-One Relationships**
- Student ↔ Internship (unique constraint)
- Student ↔ Assessment (unique constraint)
- Student ↔ Report (unique constraint)

### 3. **One-to-Many Relationships**
- Student → Logbooks (many entries)
- Student → TitleSubmissions (bisa submit multiple times)
- Mentor → Internships (multiple students)
- Lecturer → Reviews

### 4. **Many-to-Many via Junction**
- Students ↔ Teams via teamMembers

### 5. **Enums for Data Consistency**
- Status fields dengan predefined values
- Role-based access control

### 6. **Timestamps**
- createdAt, updatedAt untuk audit trail
- Specific timestamps: uploadedAt, submittedAt, reviewedAt, etc.

### 7. **Soft References**
- Optional foreign keys (mentorId?, lecturerId?) untuk flexibility

---

## 🚀 Migration Example (Drizzle Kit)

```bash
# Generate migration
npx drizzle-kit generate:pg

# Run migration
npx drizzle-kit push:pg
```

---

## 📝 Notes

1. **UUID Primary Keys**: Lebih secure, global unique
2. **Enum Types**: PostgreSQL native enums untuk better performance
3. **Timestamps**: Semua table punya created_at dan updated_at
4. **Indexes**: Tambahkan indexes untuk foreign keys dan frequently queried columns
5. **Constraints**: 
   - Unique constraints: email, nim, nip
   - Check constraints: score 0-100, progress 0-100
6. **JSON Fields**: teknologi stored as text, parse/stringify di application layer
7. **File Storage**: fileUrl points to cloud storage (S3, GCS, dll)
8. **Signature**: Base64 encoded image stored as text

---

## 🔐 Security Considerations

1. Password hashing (bcrypt/argon2) di application layer
2. JWT tokens untuk authentication
3. Role-based permissions di API routes
4. File upload validation (type, size)
5. SQL injection protection via Drizzle ORM
6. Soft delete option (add deletedAt timestamp jika perlu)

---

## 📈 Indexing Recommendations

```sql
CREATE INDEX idx_students_user_id ON students(user_id);
CREATE INDEX idx_students_nim ON students(nim);
CREATE INDEX idx_internships_student_id ON internships(student_id);
CREATE INDEX idx_internships_mentor_id ON internships(mentor_id);
CREATE INDEX idx_logbooks_student_id ON logbooks(student_id);
CREATE INDEX idx_logbooks_date ON logbooks(date);
CREATE INDEX idx_logbooks_status ON logbooks(status);
CREATE INDEX idx_assessments_student_id ON assessments(student_id);
CREATE INDEX idx_reports_student_id ON reports(student_id);
CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_title_submissions_student_id ON title_submissions(student_id);
CREATE INDEX idx_title_submissions_status ON title_submissions(status);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
```

---

## 🔌 Backend API Endpoints

### Authentication
```
POST   /api/auth/register          - Register user baru (mahasiswa, mentor, dosen)
POST   /api/auth/login             - Login dengan email & password
POST   /api/auth/logout            - Logout user
GET    /api/auth/session           - Get current session
POST   /api/auth/forgot-password   - Request reset password
POST   /api/auth/reset-password    - Reset password dengan token
```

### Mahasiswa (Student) - Role: MAHASISWA
```
GET    /api/mahasiswa/profile                    - Get profile mahasiswa
PUT    /api/mahasiswa/profile                    - Update profile
GET    /api/mahasiswa/internship                 - Get data magang current user
PUT    /api/mahasiswa/internship/period          - Update periode magang (startDate, endDate)
POST   /api/mahasiswa/internship                 - Create internship data
```

### Logbook - Role: MAHASISWA
```
POST   /api/mahasiswa/logbook                    - Create logbook entry
GET    /api/mahasiswa/logbook                    - Get all logbook entries
GET    /api/mahasiswa/logbook/:id                - Get single logbook
PUT    /api/mahasiswa/logbook/:id                - Update logbook (hanya jika PENDING)
DELETE /api/mahasiswa/logbook/:id                - Delete logbook (hanya jika PENDING)
GET    /api/mahasiswa/logbook/stats              - Get logbook statistics
```

### Report - Role: MAHASISWA
```
POST   /api/mahasiswa/report/upload              - Upload laporan KP (file PDF)
GET    /api/mahasiswa/report                     - Get laporan mahasiswa
PUT    /api/mahasiswa/report/:id                 - Update metadata laporan
POST   /api/mahasiswa/report/:id/submit          - Submit laporan untuk review
GET    /api/mahasiswa/report/:id/download        - Download file laporan
```

### Title Submission - Role: MAHASISWA
```
POST   /api/mahasiswa/title                      - Submit judul KP
GET    /api/mahasiswa/title                      - Get title submissions
PUT    /api/mahasiswa/title/:id                  - Update title (jika PENDING)
GET    /api/mahasiswa/title/:id/revisions        - Get revision history
```

### Mentor Lapangan - Role: MENTOR_LAPANGAN
```
GET    /api/mentor/profile                       - Get mentor profile
PUT    /api/mentor/profile                       - Update mentor profile
PUT    /api/mentor/signature                     - Save/Update signature (Base64)
GET    /api/mentor/signature                     - Get mentor signature
DELETE /api/mentor/signature                     - Delete signature

GET    /api/mentor/mentees                       - Get daftar mahasiswa bimbingan
GET    /api/mentor/mentees/:studentId            - Get detail mentee
GET    /api/mentor/logbook/:studentId            - Get logbook entries mahasiswa
POST   /api/mentor/logbook/:logbookId/approve    - Approve logbook (auto signature)
POST   /api/mentor/logbook/:studentId/approve-all - Approve all pending logbooks

POST   /api/mentor/assessment                    - Submit assessment mahasiswa
GET    /api/mentor/assessment/:studentId         - Get assessment mahasiswa
PUT    /api/mentor/assessment/:id                - Update assessment
```

### Dosen Pembimbing - Role: DOSEN
```
GET    /api/dosen/profile                        - Get dosen profile
PUT    /api/dosen/profile                        - Update profile
GET    /api/dosen/students                       - Get daftar mahasiswa bimbingan
GET    /api/dosen/students/:studentId            - Get detail mahasiswa

GET    /api/dosen/reports                        - Get laporan pending review
GET    /api/dosen/reports/:reportId              - Get detail laporan
PUT    /api/dosen/reports/:reportId/review       - Review laporan (approve/revision/reject)
POST   /api/dosen/reports/:reportId/score        - Beri nilai laporan

GET    /api/dosen/titles                         - Get title submissions pending
GET    /api/dosen/titles/:titleId                - Get detail title submission
PUT    /api/dosen/titles/:titleId/verify         - Verify title (approve/revision/reject)
POST   /api/dosen/titles/:titleId/revision       - Add revision note
```

### Admin - Role: ADMIN
```
GET    /api/admin/users                          - Get all users with filters
POST   /api/admin/users                          - Create user
PUT    /api/admin/users/:userId                  - Update user
DELETE /api/admin/users/:userId                  - Delete user
POST   /api/admin/users/:userId/reset-password   - Reset user password

GET    /api/admin/internships                    - Get all internships
PUT    /api/admin/internships/:id/status         - Update internship status
POST   /api/admin/internships/:id/assign-mentor  - Assign mentor lapangan
POST   /api/admin/internships/:id/assign-dosen   - Assign dosen pembimbing

GET    /api/admin/stats                          - Dashboard statistics
```

---

## 🔄 Database Migrations

### Migration 1: Initial Schema
```sql
-- Create ENUM types
CREATE TYPE user_role AS ENUM ('MAHASISWA', 'MENTOR_LAPANGAN', 'DOSEN', 'ADMIN');
CREATE TYPE internship_status AS ENUM ('PENDING', 'AKTIF', 'SELESAI', 'BATAL');
CREATE TYPE logbook_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
CREATE TYPE report_status AS ENUM ('DRAFT', 'SUBMITTED', 'APPROVED', 'REVISION', 'REJECTED');
CREATE TYPE title_status AS ENUM ('PENDING', 'APPROVED', 'REVISION', 'REJECTED');

-- Create tables (see schema above for full definitions)
CREATE TABLE users (...);
CREATE TABLE students (...);
CREATE TABLE mentors (...);
CREATE TABLE lecturers (...);
CREATE TABLE teams (...);
CREATE TABLE team_members (...);
CREATE TABLE internships (...);
CREATE TABLE logbooks (...);
CREATE TABLE assessments (...);
CREATE TABLE reports (...);
CREATE TABLE title_submissions (...);
CREATE TABLE title_revisions (...);
CREATE TABLE notifications (...);

-- Create indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_students_nim ON students(nim);
CREATE INDEX idx_internships_student_id ON internships(student_id);
CREATE INDEX idx_logbooks_student_id ON logbooks(student_id);
CREATE INDEX idx_logbooks_date ON logbooks(date);
CREATE INDEX idx_logbooks_status ON logbooks(status);
CREATE INDEX idx_assessments_student_id ON assessments(student_id);
CREATE INDEX idx_reports_student_id ON reports(student_id);
CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_title_submissions_student_id ON title_submissions(student_id);
CREATE INDEX idx_title_submissions_status ON title_submissions(status);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
```

### Migration 2: Add Mentor Signature Support
```sql
-- Add signature fields to mentors table
ALTER TABLE mentors 
  ADD COLUMN signature TEXT,
  ADD COLUMN signature_set_at TIMESTAMP;

-- Add index for signature queries
CREATE INDEX idx_mentors_signature 
  ON mentors(signature_set_at) 
  WHERE signature IS NOT NULL;
  
-- Update logbooks to include signed timestamp index
CREATE INDEX idx_logbooks_mentor_signed 
  ON logbooks(mentor_signed_at)
  WHERE mentor_signature IS NOT NULL;
```

### Migration 3: Add Periode Magang Comments
```sql
-- Add comments to startDate and endDate for clarity
COMMENT ON COLUMN internships.start_date IS 'Periode magang - diinput mahasiswa sekali, disimpan di localStorage & database';
COMMENT ON COLUMN internships.end_date IS 'Periode magang - diinput mahasiswa sekali, disimpan di localStorage & database';
COMMENT ON COLUMN logbooks.mentor_signature IS 'Base64 signature - copied from mentors.signature saat approve';
```

---

## 🎨 Frontend-Backend Integration

### 1. Periode Magang (Logbook Page)
**File**: `app/feature/during-intern/pages/logbook-page.tsx`

**Flow**:
```
1. Page Mount:
   - Check localStorage for saved periode
   - If exists: Load from localStorage
   - If not: Call GET /api/mahasiswa/internship
   
2. User Input Periode (first time):
   - Input: startDate, endDate, startDay, endDay
   - Save to localStorage (instant UX)
   - Call PUT /api/mahasiswa/internship/period
   - Generate dates array from periode
   
3. Sync Check:
   - On page load, compare localStorage vs database
   - If different, show sync warning
```

**API Integration**:
```typescript
// services/student-api.ts
import { updateInternshipPeriod, getMyInternship } from "~/feature/during-intern/services/student-api";

// Load periode saat mount
const { data: internship } = await getMyInternship();
// internship.startDate, internship.endDate

// Save periode saat submit
await updateInternshipPeriod({
  startDate: "2026-01-15",
  endDate: "2026-04-15"
});
```

**Backend**:
```typescript
// PUT /api/mahasiswa/internship/period
{
  startDate: "2026-01-15",  // ISO string or YYYY-MM-DD
  endDate: "2026-04-15"
}

Response:
{
  success: true,
  message: "Periode magang berhasil disimpan",
  data: {
    id: "...",
    startDate: "2026-01-15T00:00:00Z",
    endDate: "2026-04-15T00:00:00Z",
    // ... other internship fields
  }
}
```

---

### 2. Mentor Signature (Profile Page)
**File**: `app/feature/field-mentor/components/signature-setup.tsx`

**Flow**:
```
1. First Time Setup:
   - Mentor opens Profile page
   - Section "Tanda Tangan Digital"
   - Canvas untuk drawing signature
   - Click "Simpan" → Call PUT /api/mentor/signature
   
2. Display Signature:
   - GET /api/mentor/profile (include signature field)
   - Render: <img src={mentor.signature} />
   
3. Edit/Delete:
   - Button "Edit" → Open canvas dengan existing signature
   - Button "Hapus" → Confirmation → DELETE /api/mentor/signature
```

**API Integration**:
```typescript
// services/mentor-api.ts
import { saveMentorSignature, getMentorSignature, deleteMentorSignature } from "~/feature/field-mentor/services/mentor-api";

// Save signature
const base64 = sigCanvas.current.toDataURL("image/png");
await saveMentorSignature(base64);

// Get signature
const { data } = await getMentorSignature();
// data.signature: "data:image/png;base64,..."

// Delete signature
await deleteMentorSignature();
```

**Backend**:
```typescript
// PUT /api/mentor/signature
{
  signature: "data:image/png;base64,iVBORw0KGgoAAAA..."
}

// Validation:
- Check format starts with "data:image/"
- Max size: 100KB
- Allowed types: image/png, image/jpeg

// Save to database:
UPDATE mentors SET 
  signature = $1,
  signature_set_at = NOW(),
  updated_at = NOW()
WHERE user_id = $2;
```

---

### 3. Approve Logbook (Mentor Page)
**File**: `app/feature/field-mentor/components/approve-logbook-button.tsx`

**Flow**:
```
1. Mentor clicks "Paraf" button
2. (Optional) Dialog dengan notes input
3. Call POST /api/mentor/logbook/:logbookId/approve
4. Backend:
   - Get mentor.signature from profile
   - If no signature → Error: "Setup signature dulu"
   - Copy signature to logbooks.mentor_signature
   - Set logbooks.status = 'APPROVED'
   - Set logbooks.mentor_signed_at = NOW()
5. Frontend: Show success toast, refresh list
```

**API Integration**:
```typescript
// services/mentor-api.ts
import { approveLogbook } from "~/feature/field-mentor/services/mentor-api";

// Approve single logbook
await approveLogbook(logbookId, "Pekerjaan sudah baik");

// Approve multiple (bulk)
await approveAllLogbooks(studentId, "Semua sudah sesuai");
```

**Backend**:
```typescript
// POST /api/mentor/logbook/:logbookId/approve
{
  notes?: "Pekerjaan sudah sesuai"
}

// Backend logic:
1. Get mentor by auth user
2. Check mentor.signature exists:
   - If null → Error 400 "Setup signature required"
3. Check logbook belongs to mentor's mentee
4. Update logbook:
   UPDATE logbooks SET
     status = 'APPROVED',
     mentor_signature = (SELECT signature FROM mentors WHERE id = $1),
     mentor_signed_at = NOW(),
     rejection_note = $2  -- if notes provided
   WHERE id = $3;

Response:
{
  success: true,
  message: "Logbook berhasil disetujui",
  data: {
    id: "...",
    status: "APPROVED",
    mentorSignature: "data:image/png;base64,...",
    mentorSignedAt: "2026-01-22T10:30:00Z"
  }
}
```

---

### 4. Student Data Display
**Files**: 
- `app/feature/during-intern/pages/logbook-page.tsx`
- `app/feature/during-intern/pages/during-intern-page.tsx`
- `app/feature/field-mentor/pages/*`

**Flow**:
```
1. Page mount
2. Call GET /api/mahasiswa/profile
3. Call GET /api/mahasiswa/internship
4. Display data:
   - Nama, NIM, Prodi (default: "Manajemen Informatika")
   - Fakultas (default: "Ilmu Komputer")
   - Tempat KP, Bagian/Bidang
   - Periode KP (dari workPeriod localStorage atau internship.startDate/endDate)
```

**API Integration**:
```typescript
// services/student-api.ts
import { getMyProfile, getMyInternship } from "~/feature/during-intern/services/student-api";

const { data: profile } = await getMyProfile();
// profile.name, profile.nim, profile.prodi, profile.fakultas

const { data: internship } = await getMyInternship();
// internship.company, internship.position, internship.startDate, internship.endDate
```

---

## 📝 Implementation Checklist

### Backend Setup
- [ ] Install Drizzle ORM: `npm install drizzle-orm`
- [ ] Install PostgreSQL driver: `npm install postgres`
- [ ] Install drizzle-kit: `npm install -D drizzle-kit`
- [ ] Create `drizzle.config.ts`
- [ ] Copy schema definitions from this file
- [ ] Create migration: `npx drizzle-kit generate:pg`
- [ ] Run migration: `npx drizzle-kit push:pg`
- [ ] Setup environment variables (DATABASE_URL)

### Authentication
- [ ] Implement JWT or session-based auth
- [ ] Password hashing (bcrypt/argon2)
- [ ] Role-based access control (RBAC)
- [ ] Auth middleware for protected routes
- [ ] Refresh token strategy

### API Endpoints (by Priority)
**HIGH Priority** (Core features):
- [ ] POST /api/auth/login
- [ ] POST /api/auth/register
- [ ] GET /api/mahasiswa/profile
- [ ] GET /api/mahasiswa/internship
- [ ] PUT /api/mahasiswa/internship/period ⭐ NEW
- [ ] POST /api/mahasiswa/logbook
- [ ] GET /api/mahasiswa/logbook
- [ ] GET /api/mentor/profile
- [ ] PUT /api/mentor/signature ⭐ NEW
- [ ] GET /api/mentor/signature ⭐ NEW
- [ ] POST /api/mentor/logbook/:id/approve ⭐ UPDATED (no signature param)
- [ ] GET /api/mentor/mentees

**MEDIUM Priority**:
- [ ] POST /api/mahasiswa/report/upload
- [ ] POST /api/mentor/assessment
- [ ] GET /api/dosen/reports
- [ ] PUT /api/dosen/reports/:id/review
- [ ] POST /api/mahasiswa/title
- [ ] GET /api/dosen/titles

**LOW Priority**:
- [ ] GET /api/admin/users
- [ ] GET /api/admin/stats
- [ ] Notifications endpoints

### File Storage
- [ ] Setup S3 / Google Cloud Storage / Local storage
- [ ] Upload handler for PDF files
- [ ] Generate signed URLs for download
- [ ] Set max file size (10MB for reports)
- [ ] Validate file types (PDF only for reports)

### Validation
- [ ] Input validation (Zod / Yup / Joi)
- [ ] Email format validation
- [ ] NIM format validation
- [ ] Date range validation (endDate > startDate)
- [ ] File size validation
- [ ] Base64 signature validation
- [ ] Sanitize HTML/XSS prevention

### Testing
- [ ] Unit tests for business logic
- [ ] Integration tests for API endpoints
- [ ] E2E tests for critical flows
- [ ] Load testing for bulk operations
- [ ] Security testing (SQL injection, XSS)

### Deployment
- [ ] Setup CI/CD pipeline
- [ ] Database backup strategy
- [ ] Environment configuration
- [ ] Logging and monitoring
- [ ] Error tracking (Sentry)
- [ ] Performance monitoring

---

## 🔒 Security Considerations

### Authentication & Authorization
```typescript
// Middleware example
function requireRole(allowedRoles: UserRole[]) {
  return async (req, res, next) => {
    const user = req.user; // from auth middleware
    if (!allowedRoles.includes(user.role)) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized"
      });
    }
    next();
  };
}

// Usage
app.post('/api/mentor/logbook/:id/approve', 
  requireAuth, 
  requireRole(['MENTOR_LAPANGAN']),
  approveLogbookHandler
);
```

### Data Validation
```typescript
// Example with Zod
import { z } from 'zod';

const updatePeriodSchema = z.object({
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
}).refine(data => new Date(data.endDate) > new Date(data.startDate), {
  message: "endDate must be after startDate"
});

// In handler
const body = updatePeriodSchema.parse(req.body);
```

### SQL Injection Prevention
```typescript
// ✅ GOOD - Use parameterized queries
const result = await db.query.users.findFirst({
  where: eq(users.email, email)
});

// ❌ BAD - Never use string concatenation
const query = `SELECT * FROM users WHERE email = '${email}'`;
```

### File Upload Security
```typescript
// Validate file type
const allowedTypes = ['application/pdf'];
if (!allowedTypes.includes(file.mimetype)) {
  throw new Error('Only PDF files allowed');
}

// Validate file size (10MB)
if (file.size > 10 * 1024 * 1024) {
  throw new Error('File too large');
}

// Generate safe filename
const safeFilename = `${uuid()}.pdf`;
```

### Signature Validation
```typescript
function validateSignature(signature: string): boolean {
  // Check format
  if (!signature.startsWith('data:image/')) {
    return false;
  }
  
  // Check size (max 100KB)
  const sizeInBytes = (signature.length * 3) / 4;
  if (sizeInBytes > 100 * 1024) {
    return false;
  }
  
  // Check allowed types
  const validTypes = ['data:image/png', 'data:image/jpeg'];
  if (!validTypes.some(type => signature.startsWith(type))) {
    return false;
  }
  
  return true;
}
```

---

## 📊 Performance Optimization

### Database Indexes
```sql
-- Already included in migration above
-- Add more indexes based on query patterns

-- For mentor dashboard (filter by date range)
CREATE INDEX idx_logbooks_date_status 
  ON logbooks(date, status);

-- For student search
CREATE INDEX idx_students_search 
  ON students USING gin(to_tsvector('indonesian', name || ' ' || nim));

-- For report filtering
CREATE INDEX idx_reports_status_submitted 
  ON reports(status, submitted_at);
```

### Caching Strategy
```typescript
// Cache mentor signature (rarely changes)
const getCachedMentorSignature = async (mentorId: string) => {
  const cacheKey = `mentor:signature:${mentorId}`;
  let signature = await redis.get(cacheKey);
  
  if (!signature) {
    const mentor = await db.query.mentors.findFirst({
      where: eq(mentors.id, mentorId),
      columns: { signature: true }
    });
    signature = mentor.signature;
    await redis.set(cacheKey, signature, { ex: 3600 }); // 1 hour
  }
  
  return signature;
};
```

### Pagination
```typescript
// For list endpoints
app.get('/api/mahasiswa/logbook', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const offset = (page - 1) * limit;
  
  const logbooks = await db.query.logbooks.findMany({
    where: eq(logbooks.studentId, req.user.studentId),
    limit,
    offset,
    orderBy: desc(logbooks.date)
  });
  
  const total = await db.select({ count: count() })
    .from(logbooks)
    .where(eq(logbooks.studentId, req.user.studentId));
  
  return res.json({
    success: true,
    data: logbooks,
    meta: {
      page,
      limit,
      totalItems: total[0].count,
      totalPages: Math.ceil(total[0].count / limit)
    }
  });
});
```

---

## 🧪 Testing Examples

### Unit Test - Signature Validation
```typescript
import { describe, it, expect } from 'vitest';
import { validateSignature } from './signature-validator';

describe('validateSignature', () => {
  it('should accept valid PNG signature', () => {
    const validSig = 'data:image/png;base64,iVBORw0KGgo...';
    expect(validateSignature(validSig)).toBe(true);
  });
  
  it('should reject signature without data:image prefix', () => {
    const invalidSig = 'iVBORw0KGgo...';
    expect(validateSignature(invalidSig)).toBe(false);
  });
  
  it('should reject signature larger than 100KB', () => {
    const largeSig = 'data:image/png;base64,' + 'A'.repeat(150000);
    expect(validateSignature(largeSig)).toBe(false);
  });
});
```

### Integration Test - Approve Logbook
```typescript
import { describe, it, expect, beforeAll } from 'vitest';
import { app } from '../app';
import supertest from 'supertest';

describe('POST /api/mentor/logbook/:id/approve', () => {
  let mentorToken: string;
  let logbookId: string;
  
  beforeAll(async () => {
    // Setup: Create mentor with signature
    const mentor = await createTestMentor();
    mentorToken = await getAuthToken(mentor);
    logbookId = await createTestLogbook();
  });
  
  it('should approve logbook with mentor signature', async () => {
    const response = await supertest(app)
      .post(`/api/mentor/logbook/${logbookId}/approve`)
      .set('Authorization', `Bearer ${mentorToken}`)
      .send({ notes: 'Good work' })
      .expect(200);
    
    expect(response.body.success).toBe(true);
    expect(response.body.data.status).toBe('APPROVED');
    expect(response.body.data.mentorSignature).toBeDefined();
  });
  
  it('should return error if mentor has no signature', async () => {
    const mentorNoSig = await createTestMentor({ signature: null });
    const token = await getAuthToken(mentorNoSig);
    
    const response = await supertest(app)
      .post(`/api/mentor/logbook/${logbookId}/approve`)
      .set('Authorization', `Bearer ${token}`)
      .send({})
      .expect(400);
    
    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain('signature');
  });
});
```

---

## 📦 Environment Variables

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/sikp
DATABASE_SSL=false

# Authentication
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=7d
REFRESH_TOKEN_SECRET=your-refresh-secret
REFRESH_TOKEN_EXPIRES_IN=30d

# File Storage
STORAGE_TYPE=s3 # or 'local' or 'gcs'
AWS_REGION=ap-southeast-1
AWS_S3_BUCKET=sikp-files
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key

# Or for local storage
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760 # 10MB in bytes

# API
API_BASE_URL=https://api.sikp.ac.id
FRONTEND_URL=https://sikp.ac.id
API_PORT=8787

# Email (for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=noreply@sikp.ac.id
SMTP_PASSWORD=your-password

# Redis (optional, for caching)
REDIS_URL=redis://localhost:6379

# Monitoring
SENTRY_DSN=https://...
LOG_LEVEL=info
```

---

**Schema Version**: 1.0.0  
**Last Updated**: January 22, 2026  
**Database**: PostgreSQL 14+  
**ORM**: Drizzle ORM
