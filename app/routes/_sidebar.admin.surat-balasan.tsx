import { ProtectedRoute } from "~/components/protected-route";
import AdminResponseLetterPage from "~/feature/response-letter/pages/admin-response-letter-page";

export default function Page() {
  return (
    <ProtectedRoute requiredRoles={["ADMIN"]}>
      <AdminResponseLetterPage />
    </ProtectedRoute>
  );
}
