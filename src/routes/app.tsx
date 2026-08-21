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
    { id: "templates", label: "Templates", icon: LayoutTemplate, to: "/app/editor/$id", exact: true },
    { id: "personal", label: "Personal Info", icon: User, to: "/app/editor/$id/details" },
    { id: "business", label: "Business Info", icon: Building2, to: "/app/editor/$id/business" },
    { id: "design", label: "Design", icon: Palette, to: "/app/editor/$id/design" },
    { id: "social", label: "Social", icon: MousePointer2, to: "/app/editor/$id/social" },
    { id: "cta", label: "Call to Action", icon: MousePointer2, to: "/app/editor/$id/cta" },
    { id: "disclaimer", label: "Disclaimer", icon: FileText, to: "/app/editor/$id/disclaimer" },
    { id: "analytics", label: "Analytics", icon: BarChart3, to: "/app/editor/$id/analytics" },
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
              
            />
          )}
          <RailItem 
            to="/app/settings"
            icon={SettingsIcon}
            label="Settings"
            
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
  const { pathname } = useLocation();
  const effectiveTo = to.replace("/$id", params?.id ? `/${params.id}` : "");
  const isActive = exact ? pathname === effectiveTo : pathname.startsWith(effectiveTo);

  return (
    <Link
      to={to}
      params={params}
      activeOptions={{ exact }}
      className={`group flex flex-col items-center justify-center gap-1.5 w-full py-3.5 rounded-none transition-all relative ${
        isActive 
          ? "text-[#F38121]" 
          : "text-[#9E958F] hover:text-[#4A443F]"
      }`}
    >
      <div className={`p-2.5 rounded-2xl transition-all duration-300 ${
        isActive 
          ? "bg-[#F38121]/10 shadow-[0_4px_12px_rgba(243,129,33,0.1)]" 
          : "group-hover:bg-[#F9F7F5]"
      }`}>
        <Icon size={22} strokeWidth={isActive ? 2.5 : 2} className="transition-transform duration-300 group-active:scale-90" />
      </div>
      <span className={`text-[9px] font-bold uppercase tracking-[0.12em] text-center px-1 transition-colors ${
        isActive ? "text-[#F38121]" : "text-[#9E958F]"
      }`}>
        {label}
      </span>
      {isActive && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[#F38121] rounded-r-full shadow-[0_0_8px_rgba(243,129,33,0.4)]" />
      )}
    </Link>
  );
}
