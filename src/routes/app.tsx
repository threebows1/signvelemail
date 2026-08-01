import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { Logo } from "@/components/Logo";
import { TrialBanner, TrialGuard } from "@/components/TrialGuard";

export const Route = createFileRoute("/app")({
  head: () => ({
    meta: [
      { title: "Dashboard — Sign Vel" },
      { name: "description", content: "Manage your team's email signatures from the Sign Vel dashboard." },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AppLayout,
});

function AppLayout() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans flex">
      <aside className="w-64 border-r border-border bg-white p-6 flex flex-col sticky top-0 h-screen">
        <Link to="/" aria-label="Sign Vel home" className="mb-12">
          <Logo size={44} wordmarkClassName="text-lg" />
        </Link>

        <nav className="flex flex-col gap-1">
          <NavItem to="/app" label="Dashboard" />
          <NavItem to="/app/editor/new" label="Editor" />
          <NavItem to="/app/templates" label="Templates" />
          <NavItem to="/app/emails" label="Emails" />
          <NavItem to="/app/settings" label="Settings" />
        </nav>

        <div className="mt-auto pt-6 border-t border-border">
          <Link to="/">
            <button className="w-full text-left text-xs font-[JetBrains_Mono] uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">
              Sign Out
            </button>
          </Link>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <TrialBanner />
        <TrialGuard>
          <Outlet />
        </TrialGuard>
      </main>
    </div>
  );
}

function NavItem({ to, label, active }: { to: string; label: string; active?: boolean }) {
  return (
    <Link
      to={to}
      className={`px-3 py-2 text-sm rounded-lg transition-colors ${
        active
          ? "bg-foreground text-background font-medium"
          : "text-muted-foreground hover:text-foreground hover:bg-secondary"
      }`}
    >
      {label}
    </Link>
  );
}
