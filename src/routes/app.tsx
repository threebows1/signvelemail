import { createFileRoute, Link, Outlet, useLocation, useParams } from "@tanstack/react-router";
import { 
  LayoutTemplate, 
  User, 
  Building2, 
  Palette, 
  MousePointer2, 
  FileText, 
  BarChart3,
  Settings as SettingsIcon,
  ShieldCheck
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/lib/auth";
import { TrialBanner } from "@/components/TrialGuard";

export const Route = createFileRoute("/app")({
  component: AppLayout,
});

function AppLayout() {
  const { pathname } = useLocation();
  const params = useParams({ strict: false }) as { id?: string };
  const { isStaff } = useAuth();
  
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutTemplate, to: "/app", exact: true },
    { id: "templates", label: "Templates", icon: LayoutTemplate, to: "/app/editor/$id" },
    { id: "personal", label: "Personal Info", icon: User, to: "/app/editor/$id" },
    { id: "business", label: "Business Info", icon: Building2, to: "/app/editor/$id" },
    { id: "design", label: "Design", icon: Palette, to: "/app/editor/$id" },
    { id: "cta", label: "Call to Action", icon: MousePointer2, to: "/app/editor/$id" },
    { id: "disclaimer", label: "Disclaimer", icon: FileText, to: "/app/editor/$id" },
    { id: "analytics", label: "Analytics", icon: BarChart3, to: "/app/editor/$id" },
  ];

  return (
    <div className="flex h-screen bg-white overflow-hidden font-[Inter_Tight]">
      {/* Vertical Navigation Rail */}
      <aside className="w-[88px] bg-white border-r border-[#EFEBE6] flex flex-col items-center py-6 shrink-0 z-10">
        <Link to="/app" className="mb-10">
          <Logo size={40} showWordmark={false} />
        </Link>
        
        <nav className="flex flex-col gap-2 w-full px-2">
          {navItems.map((item) => (
            <RailItem 
              key={item.id}
              to={item.to}
              params={params.id ? { id: params.id } : undefined}
              icon={item.icon}
              label={item.label}
              active={pathname.includes(item.id)}
              exact={item.exact}
            />
          ))}
        </nav>

        <div className="mt-auto flex flex-col gap-2 w-full px-2">
          {isStaff && (
            <RailItem 
              to="/app/admin"
              icon={ShieldCheck}
              label="Admin"
              active={pathname.includes("/admin")}
            />
          )}
          <RailItem 
            to="/app/settings"
            icon={SettingsIcon}
            label="Settings"
            active={pathname.includes("/settings")}
          />
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <TrialBanner />
        <div className="flex-1 overflow-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

function RailItem({ to, params, icon: Icon, label, exact }: { to: string; params?: any; icon: any; label: string; exact?: boolean }) {
  return (
    <Link
      to={to}
      params={params}
      activeOptions={{ exact }}
      className={({ isActive }) => `group flex flex-col items-center justify-center gap-1.5 w-full py-3.5 rounded-none transition-all relative ${
        isActive 
          ? "text-[#F38121]" 
          : "text-[#9E958F] hover:text-[#4A443F]"
      }`}
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <div className="absolute inset-y-0 left-0 w-1 bg-[#F38121] rounded-r-full" />
          )}
          <Icon size={24} strokeWidth={isActive ? 2 : 1.5} />
          <span className="text-[9px] font-bold uppercase tracking-[0.05em] text-center leading-none px-1">
            {label}
          </span>
        </>
      )}
    </Link>
  );
}
