import Link from "next/link";
import { requireUser } from "@/lib/session";

const links = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/profile", label: "Profile" },
  { href: "/dashboard/clips", label: "Clips" },
  { href: "/dashboard/offers", label: "Offers" },
];

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
          <nav
            aria-label="Dashboard"
            className="flex gap-2 overflow-x-auto lg:flex-col"
          >
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium text-ink-soft transition-colors hover:bg-surface hover:text-ink"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </aside>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
