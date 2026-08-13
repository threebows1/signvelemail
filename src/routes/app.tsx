import { createFileRoute, Link, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import { Logo } from "@/components/Logo";
import { TrialBanner, TrialGuard } from "@/components/TrialGuard";
import { signOut, useAuth } from "@/lib/auth";

export const Route = createFileRoute("/app")({
  head: () => ({ meta: [
    { title: "Dashboard — Sign Vel" },
    { name: "description", content: "Manage your team's email signatures from the Sign Vel dashboard." },
    { name: "twitter:card", content: "summary" },
  ]}), component: AppLayout,
});

function AppLayout() {
  const { pathname } = useLocation(); const navigate = useNavigate(); const { isStaff } = useAuth();
  const allowWhenExpired = pathname.startsWith("/app/settings") || pathname.startsWith("/app/admin");
  return <div className="min-h-screen bg-background text-foreground font-sans flex">
    <aside className="w-64 border-r border-border bg-white p-6 flex flex-col sticky top-0 h-screen overflow-y-auto">
      <Link to="/" aria-label="Sign Vel home" className="mb-10"><Logo size={44} wordmarkClassName="text-lg" /></Link>
      <nav className="flex flex-col gap-1">
        <NavItem to="/app" label="Dashboard" />
        <NavLabel>People</NavLabel>
        <NavItem to="/app/employees" label="Employees" />
        <NavItem to="/app/departments" label="Departments" />
        <NavLabel>Signatures</NavLabel>
        <NavItem to="/app/editor/new" label="Editor" />
        <NavItem to="/app/templates" label="Templates" />
        <NavLabel>Deployment</NavLabel>
        <NavItem to="/app/emails" label="Emails" />
        <NavLabel>Admin</NavLabel>
        <NavItem to="/app/settings" label="Settings" />
        {isStaff && <NavItem to="/app/admin" label="Admin Console" />}
      </nav>
      <div className="mt-auto pt-6 border-t border-border"><button onClick={async()=>{await signOut();navigate({to:"/"})}} className="w-full text-left text-xs font-[JetBrains_Mono] uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">Sign Out</button></div>
    </aside>
    <main className="flex-1 overflow-auto"><TrialBanner />{allowWhenExpired?<Outlet/>:<TrialGuard><Outlet/></TrialGuard>}</main>
  </div>;
}
function NavLabel({children}:{children:React.ReactNode}) { return <div className="mt-5 mb-1 px-3 text-[10px] font-[JetBrains_Mono] uppercase tracking-[0.18em] text-muted-foreground">{children}</div> }
function NavItem({to,label}:{to:string;label:string}) { return <Link to={to} activeOptions={{exact:to==="/app"}} className="px-3 py-2 text-sm rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors" activeProps={{className:"px-3 py-2 text-sm rounded-lg bg-foreground text-background font-medium"}}>{label}</Link> }
