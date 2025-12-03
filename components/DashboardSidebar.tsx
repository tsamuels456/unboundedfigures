// components/DashboardSidebar.tsx
import Link from "next/link";
import { useRouter } from "next/router";

type DashboardSidebarProps = {
  username: string;
};

const navItems = [
  { key: "overview", label: "Overview", href: "/dashboard" },
  {
    key: "submissions",
    label: "My submissions",
    href: "/submissions?filter=me", // placeholder route
  },
  {
    key: "comments",
    label: "My comments",
    href: "/submissions?tab=comments", // placeholder route
  },
  {
    key: "following",
    label: "Following",
    href: "/dashboard/following", // future feature
  },
  {
    key: "followers",
    label: "Followers",
    href: "/dashboard/followers", // future feature
  },
  {
    key: "settings",
    label: "Profile & settings",
    href: "/profile",
  },
];

export default function DashboardSidebar({ username }: DashboardSidebarProps) {
  const router = useRouter();

  const isActive = (href: string) => {
    const base = href.split("?")[0];
    if (base === "/dashboard") return router.pathname === "/dashboard";
    return router.pathname.startsWith(base);
  };

  return (
    <aside className="hidden md:block w-56 shrink-0 pr-8 border-r border-gray-200">
      <div className="sticky top-24 space-y-8">
        {/* Profile summary */}
        <div>
          <p className="text-[11px] font-semibold tracking-[0.18em] text-gray-500 uppercase">
            Figure
          </p>
          <p className="mt-1 text-sm text-gray-900">@{username}</p>
        </div>

        {/* Navigation */}
        <nav className="space-y-1 text-sm">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.key}
                href={item.href}
                className={[
                  "flex items-center justify-between rounded-md px-3 py-2 transition",
                  active
                    ? "bg-white shadow-sm text-gray-900"
                    : "text-gray-600 hover:bg-white/70 hover:text-gray-900",
                ].join(" ")}
              >
                <span>{item.label}</span>
                {active && (
                  <span className="h-1.5 w-1.5 rounded-full bg-gray-900" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Small academic footer */}
        <div className="pt-4 border-t border-gray-200 text-[11px] text-gray-500">
          <p className="font-medium">UnboundedFigures Dashboard</p>
          <p className="mt-0.5">Quietly tracking your mathematical practice.</p>
        </div>
      </div>
    </aside>
  );
}
