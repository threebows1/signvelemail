import { createFileRoute, Link, Outlet, useLocation } from "@tanstack/react-router";
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
  const { isStaff } = useAuth();
  
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutTemplate, to: "/app" },
    { id: "templates", label: "Templates", icon: LayoutTemplate, to: "/app" },
    { id: "personal", label: "Personal Info", icon: User, to: "/app" },
    { id: "business", label: "Business Info", icon: Building2, to: "/app" },
    { id: "design", label: "Design", icon: Palette, to: "/app" },
    { id: "cta", label: "Call to Action", icon: MousePointer2, to: "/app" },
    { id: "disclaimer", label: "Disclaimer", icon: FileText, to: "/app" },
    { id: "analytics", label: "Analytics", icon: BarChart3, to: "/app" },
  ];

  return (
    <div className="flex h-screen bg-white overflow-hidden font-[Inter_Tight]">
      {/* Vertical Navigation Rail */}
      <aside className="w-[88px] bg-white border-r border-[#EFEBE6] flex flex-col items-center py-6 shrink-0 z-10">
        <Link to="/" className="mb-10">
          <Logo size={40} showWordmark={false} />
        </Link>
        
        <nav className="flex flex-col gap-2 w-full px-2">
          {navItems.map((item) => (
            <RailItem 
              key={item.id}
              to={item.to}
              icon={item.icon}
              label={item.label}
              active={pathname.includes(item.id)}
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

function RailItem({ to, icon: Icon, label, active }: { to: string; icon: any; label: string; active?: boolean }) {
  return (
    <Link
      to={to}
      className={`group flex flex-col items-center justify-center gap-1.5 w-full py-3 rounded-xl transition-all ${
        active 
          ? "bg-[#FFF4EB] text-[#F38121]" 
          : "text-[#9E958F] hover:bg-[#F9F7F5] hover:text-[#4A443F]"
      }`}
    >
      <Icon size={22} strokeWidth={active ? 2.5 : 2} />
      <span className="text-[10px] font-semibold tracking-tight text-center leading-none px-1">
        {label}
      </span>
    </Link>
  );
}
