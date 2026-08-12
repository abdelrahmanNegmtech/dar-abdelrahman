import type { ReactNode } from "react";
import { AdminSidebar } from "@/features/sidebar";
import { requireAdmin } from "@/lib/supabase/auth";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  await requireAdmin();

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <AdminSidebar />
      <main className="flex min-w-0 flex-1 flex-col">
        <div className="dar-page-gradient min-h-full flex-1 p-6 xl:p-8">{children}</div>
      </main>
    </div>
  );
}
