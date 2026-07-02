import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth/get-user";
import { DashboardNav } from "@/components/dashboard/DashboardNav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getAuthUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen flex-col bg-muted/30 md:flex-row">
      <DashboardNav user={user} />
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto max-w-5xl p-4 pb-8 md:p-6 md:pb-10">
          {children}
        </div>
      </main>
    </div>
  );
}
