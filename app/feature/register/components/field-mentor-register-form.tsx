// 1. External dependencies
import { useState } from "react"
import { Link, useNavigate } from "react-router"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Building2, Phone, Briefcase, KeyRound } from "lucide-react"
import { toast } from "sonner"

// 2. Internal utilities
import { cn } from "~/lib/utils"
import { authClient } from "~/lib/auth-client"

// 3. Components
import { Button } from "~/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "~/components/ui/field"
import { Input } from "~/components/ui/input"

// Schema validasi untuk form register pembimbing lapangan
const fieldMentorRegisterSchema = z
  .object({
    registrationCode: z
      .string()
      .min(1, "Kode registrasi wajib diisi")
      .regex(
        /^MNT-\d{6}-\d{4}$/,
        "Format kode tidak valid (contoh: MNT-123456-0001)"
      ),
    name: z
      .string()
      .min(1, "Nama lengkap wajib diisi")
      .min(3, "Nama lengkap minimal 3 karakter")
      .max(100, "Nama lengkap maksimal 100 karakter"),
    email: z
      .string()
      .min(1, "Email wajib diisi")
      .email("Format email tidak valid"),
    nip: z
      .string()
      .min(1, "NIP/NIK wajib diisi")
      .min(5, "NIP/NIK minimal 5 karakter")
      .max(30, "NIP/NIK maksimal 30 karakter"),
    company: z
      .string()
      .min(1, "Nama perusahaan wajib diisi")
      .min(3, "Nama perusahaan minimal 3 karakter")
      .max(200, "Nama perusahaan maksimal 200 karakter"),
    position: z
      .string()
      .min(1, "Posisi/jabatan wajib diisi")
      .min(3, "Posisi minimal 3 karakter")
      .max(100, "Posisi maksimal 100 karakter"),
    phone: z
      .string()
      .min(1, "Nomor telepon wajib diisi")
      .min(10, "Nomor telepon minimal 10 digit")
      .max(15, "Nomor telepon maksimal 15 digit"),
    password: z
      .string()
      .min(1, "Kata sandi wajib diisi")
      .min(8, "Kata sandi minimal 8 karakter")
      .max(100, "Kata sandi maksimal 100 karakter"),
    confirmPassword: z
      .string()
      .min(1, "Konfirmasi kata sandi wajib diisi"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Kata sandi tidak cocok",
    path: ["confirmPassword"],
  })

type FieldMentorRegisterFormData = z.infer<typeof fieldMentorRegisterSchema>

interface FieldMentorRegisterFormProps
  extends React.ComponentProps<"form"> {}

export function FieldMentorRegisterForm({
  className,
  ...props
}: FieldMentorRegisterFormProps) {
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)

  const form = useForm<FieldMentorRegisterFormData>({
    resolver: zodResolver(fieldMentorRegisterSchema),
    defaultValues: {
      registrationCode: "",
      name: "",
      email: "",
      nip: "",
      company: "",
      position: "",
      phone: "",
      password: "",
      confirmPassword: "",
    },
    mode: "onBlur",
  })

  const onSubmit = async (data: FieldMentorRegisterFormData) => {
    try {
      setError(null)

      // TODO: Validate registration code with API
      // const codeValidation = await fetch(`/api/validate-mentor-code/${data.registrationCode}`)
      // if (!codeValidation.ok) {
      //   setError("Kode registrasi tidak valid atau sudah digunakan")
      //   return
      // }

      const result = await authClient.signUp.email({
        email: data.email,
        password: data.password,
        name: data.name,
      })

      if (result.error) {
        setError(result.error.message || "Registrasi gagal. Silakan coba lagi.")
        return
      }

      // TODO: Submit additional mentor data to API
      // await fetch('/api/mentor/register', {
      //   method: 'POST',
      //   body: JSON.stringify({
      //     userId: result.data.user.id,
      //     registrationCode: data.registrationCode,
      //     nip: data.nip,
      //     company: data.company,
      //     position: data.position,
      //     phone: data.phone,
      //     status: 'pending_approval'
      //   })
      // })

      toast.success("Registrasi berhasil! Menunggu persetujuan admin.")
      navigate("/login")
    } catch (err) {
      setError("Terjadi kesalahan. Silakan coba lagi.")
      console.error("Register error:", err)
    }
  }

  return (
    <form
      className={cn("flex flex-col gap-6", className)}
      onSubmit={form.handleSubmit(onSubmit)}
      {...props}
    >
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">
            Registrasi Pembimbing Lapangan
          </h1>
          <p className="text-muted-foreground text-sm text-balance">
            Gunakan kode registrasi yang diberikan oleh mahasiswa untuk
            mendaftar
          </p>
        </div>

        {error && (
          <div
            role="alert"
            className="rounded-md bg-destructive/15 p-3 text-sm text-destructive"
          >
            {error}
          </div>
        )}

        <Controller
          name="registrationCode"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="registrationCode">
                Kode Registrasi
              </FieldLabel>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  {...field}
                  id="registrationCode"
                  type="text"
                  placeholder="MNT-123456-0001"
                  aria-invalid={fieldState.invalid}
                  className="pl-10"
                />
              </div>
              {fieldState.invalid ? (
                <FieldError errors={[fieldState.error]} />
              ) : (
                <FieldDescription>
                  Masukkan kode yang diberikan oleh mahasiswa
                </FieldDescription>
              )}
            </Field>
          )}
        />

        <FieldSeparator />

        <Controller
          name="name"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="name">Nama Lengkap</FieldLabel>
              <Input
                {...field}
                id="name"
                type="text"
                placeholder="John Doe"
                aria-invalid={fieldState.invalid}
                autoComplete="name"
              />
              {fieldState.invalid && (
                <FieldError errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />

        <Controller
          name="email"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                {...field}
                id="email"
                type="email"
                placeholder="mentor@company.com"
                aria-invalid={fieldState.invalid}
                autoComplete="email"
              />
              {fieldState.invalid && (
                <FieldError errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />

        <Controller
          name="nip"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="nip">NIP/NIK</FieldLabel>
              <Input
                {...field}
                id="nip"
                type="text"
                placeholder="198501012010011001"
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && (
                <FieldError errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Controller
            name="company"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="company">Nama Perusahaan</FieldLabel>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    {...field}
                    id="company"
                    type="text"
                    placeholder="PT. Teknologi Indonesia"
                    aria-invalid={fieldState.invalid}
                    className="pl-10"
                  />
                </div>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            name="position"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="position">Posisi/Jabatan</FieldLabel>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    {...field}
                    id="position"
                    type="text"
                    placeholder="Senior Developer"
                    aria-invalid={fieldState.invalid}
                    className="pl-10"
                  />
                </div>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </div>

        <Controller
          name="phone"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="phone">Nomor Telepon</FieldLabel>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  {...field}
                  id="phone"
                  type="tel"
                  placeholder="081234567890"
                  aria-invalid={fieldState.invalid}
                  autoComplete="tel"
                  className="pl-10"
                />
              </div>
              {fieldState.invalid && (
                <FieldError errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />

        <FieldSeparator />

        <Controller
          name="password"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="password">Kata Sandi</FieldLabel>
              <Input
                {...field}
                id="password"
                type="password"
                aria-invalid={fieldState.invalid}
                autoComplete="new-password"
              />
              {fieldState.invalid ? (
                <FieldError errors={[fieldState.error]} />
              ) : (
                <FieldDescription>Minimal 8 karakter.</FieldDescription>
              )}
            </Field>
          )}
        />

        <Controller
          name="confirmPassword"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="confirm-password">
                Konfirmasi Kata Sandi
              </FieldLabel>
              <Input
                {...field}
                id="confirm-password"
                type="password"
                aria-invalid={fieldState.invalid}
                autoComplete="new-password"
              />
              {fieldState.invalid ? (
                <FieldError errors={[fieldState.error]} />
              ) : (
                <FieldDescription>
                  Silakan konfirmasi kata sandi Anda.
                </FieldDescription>
              )}
            </Field>
          )}
        />

        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Mendaftar..." : "Daftar"}
        </Button>

        <div className="text-center text-sm">
          Sudah punya akun?{" "}
          <Link to="/login" className="font-medium underline underline-offset-4">
            Masuk di sini
          </Link>
        </div>
      </FieldGroup>
    </form>
  )
}
