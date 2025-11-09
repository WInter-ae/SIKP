import { cn } from "~/lib/utils"
import { Button } from "~/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "~/components/ui/field"
import { Input } from "~/components/ui/input"
import { Github } from "lucide-react"
import { Link } from "react-router"

export function RegisterForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  return (
    <form className={cn("flex flex-col gap-6", className)} {...props}>
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Buat Akun Anda</h1>
          <p className="text-muted-foreground text-sm text-balance">
            Isi formulir di bawah ini untuk membuat akun Anda
          </p>
        </div>
        <Field>
          <FieldLabel htmlFor="name">Nama Lengkap</FieldLabel>
          <Input id="name" type="text" placeholder="John Doe" required />
        </Field>
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input id="email" type="email" placeholder="m@example.com" required />
          <FieldDescription>
            Kami akan menggunakan email ini untuk menghubungi Anda. Kami tidak akan membagikan email Anda kepada siapa pun.
          </FieldDescription>
        </Field>
        <Field>
          <FieldLabel htmlFor="password">Kata Sandi</FieldLabel>
          <Input id="password" type="password" required />
          <FieldDescription>
            Minimal 8 karakter.
          </FieldDescription>
        </Field>
        <Field>
          <FieldLabel htmlFor="confirm-password">Konfirmasi Kata Sandi</FieldLabel>
          <Input id="confirm-password" type="password" required />
          <FieldDescription>Silakan konfirmasi kata sandi Anda.</FieldDescription>
        </Field>
        <Field>
          <Button type="submit">Buat Akun</Button>
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
