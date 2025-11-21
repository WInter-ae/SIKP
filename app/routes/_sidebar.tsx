import { Outlet } from "react-router";
import { AppSidebar } from "~/feature/sidebar";
import { SidebarInset, SidebarProvider } from "~/components/ui/sidebar";

export default function Page() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  );
}
