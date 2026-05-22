import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export default async function AdminPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAdmin();
  if (!session) redirect("/admin/login");

  return (
    <div className="flex min-h-screen bg-sm-black">
      <AdminSidebar />
      <div className="flex-1 overflow-auto p-6 pt-8 md:p-10">{children}</div>
    </div>
  );
}
