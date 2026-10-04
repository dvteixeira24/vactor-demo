import { requireUser } from "@/lib/session";
import { DashboardNav } from "@/components/layout/DashboardNav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireUser("/dashboard");

  return (
    <div className="container-page py-10">
      <div className="grid gap-8 lg:grid-cols-[200px_1fr]">
        <aside>
          <DashboardNav />
        </aside>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
