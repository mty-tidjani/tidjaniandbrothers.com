import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { Sidebar } from "@/components/admin/Sidebar";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) {
    redirect("/admin/login");
  }

  return (
    <SessionProvider>
      <div className="dark bg-background text-on-background relative flex min-h-screen">
        <div className="ambient-mesh" aria-hidden="true" />
        <Sidebar isAdmin={session.user.role === "ADMIN"} />
        <main className="p-margin-mobile md:p-gutter w-full flex-1 md:ml-64">
          <div className="container-max">{children}</div>
        </main>
      </div>
    </SessionProvider>
  );
}
