import { redirect } from "react-router";

/**
 * /login sekarang redirect ke halaman utama (/)
 * Login sudah menjadi halaman index.
 */
export function loader() {
  return redirect("/");
}

export default function LoginRedirect() {
  return null;
}
