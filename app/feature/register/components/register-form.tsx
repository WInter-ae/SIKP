import { cn } from "~/lib/utils"
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
import { Github } from "lucide-react"
import { Link } from "react-router"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

// Schema validasi untuk form register
const registerSchema = z
  .object({
    name: z
      .string()
      .min(1, "Nama lengkap wajib diisi")
      .min(3, "Nama lengkap minimal 3 karakter")
      .max(100, "Nama lengkap maksimal 100 karakter"),
    email: z
      .string()
      .min(1, "Email wajib diisi")
      .email("Format email tidak valid"),
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

type RegisterFormData = z.infer<typeof registerSchema>

export function RegisterForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    mode: "onBlur", // Validasi saat blur
  })

  const onSubmit = (data: RegisterFormData) => {
    console.log("Register data:", data)
    // TODO: Implement register logic
  }

  return (
    <form
      className={cn("flex flex-col gap-6", className)}
      onSubmit={form.handleSubmit(onSubmit)}
      {...props}
    >
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Buat Akun Anda</h1>
          <p className="text-muted-foreground text-sm text-balance">
            Isi formulir di bawah ini untuk membuat akun Anda
          </p>
        </div>

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
                placeholder="m@example.com"
                aria-invalid={fieldState.invalid}
                autoComplete="email"
              />
              {fieldState.invalid ? (
                <FieldError errors={[fieldState.error]} />
              ) : (
                <FieldDescription>
                  Kami akan menggunakan email ini untuk menghubungi Anda. Kami
                  tidak akan membagikan email Anda kepada siapa pun.
                </FieldDescription>
              )}
            </Field>
          )}
        />

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

        <Field>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Memproses..." : "Buat Akun"}
          </Button>
        </Field>

        <FieldSeparator>Atau lanjutkan dengan</FieldSeparator>

        <Field>
          <Button variant="outline" type="button">
            <Github />
            Daftar dengan GitHub
          </Button>
          <FieldDescription className="px-6 text-center">
            Sudah punya akun? <Link to="/login">Masuk</Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  )
}
