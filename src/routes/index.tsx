import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sign Vel — Email signatures for teams" },
      { name: "description", content: "Deploy precise, professional email signatures across your entire organization." },
      { property: "og:title", content: "Sign Vel — Email signatures for teams" },
      { property: "og:description", content: "Deploy precise, professional email signatures across your entire organization." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/20 selection:text-primary">
      <Navigation />
      <main>
        <HeroSection />
        <DashboardSection />
        <EditorSection />
      </main>
      <Footer />
    </div>
  );
}

function Navigation() {
  return (
    <nav className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-md border-b border-border px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-8">
        <Link to="/" aria-label="Sign Vel home">
          <Logo size={48} wordmarkClassName="text-xl" />
        </Link>
        <div className="hidden md:flex items-center gap-6">
          <a href="#" className="text-sm font-medium hover:text-primary transition-colors">
            Product
          </a>
          <Link to="/app/templates" className="text-sm font-medium hover:text-primary transition-colors">
            Templates
          </Link>
          <Link to="/pricing" className="text-sm font-medium hover:text-primary transition-colors">
            Pricing
          </Link>
        </div>
      </div>
      <Link to="/login">
        <Button size="sm" className="bg-foreground text-background hover:bg-foreground/90">
          Get Started
        </Button>
      </Link>

    </nav>
  );
}

function HeroSection() {
  return (
    <section className="max-w-7xl mx-auto px-6 pt-24 pb-32 grid lg:grid-cols-2 gap-16 items-center">
      <div className="animate-slide-up">
        <span className="font-[JetBrains_Mono] text-[10px] uppercase tracking-[0.2em] text-primary font-medium block mb-6">
          (01) The Standard for Teams
        </span>
        <h1 className="text-6xl md:text-7xl font-[Inter_Tight] font-bold tracking-tighter text-balance leading-[0.9] mb-8">
          The architecture of team identity.
        </h1>
        <p className="text-xl text-muted-foreground text-pretty max-w-[45ch] mb-10 leading-relaxed">
          Deploy precise, professional email signatures across your entire organization. A unified visual language for every interaction.
        </p>
        <div className="flex items-center gap-4">
          <Link to="/app">
            <Button className="px-8 py-6 text-base font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90">
              Start Building
            </Button>
          </Link>
          <Button variant="outline" className="px-8 py-6 text-base font-semibold rounded-lg border-border hover:bg-black/5">
            View Gallery
          </Button>
        </div>
      </div>

      <div className="animate-slide-up-delay">
        <div className="bg-white ring-1 ring-black/5 p-8 rounded-2xl shadow-xl transform rotate-1">
          <div className="flex items-start gap-6 border-l-2 border-primary pl-6">
            <div className="size-16 rounded bg-stone-50 shrink-0 border border-black/5 flex items-center justify-center">
              <Logo size={44} showWordmark={false} />
            </div>
            <div>
              <h3 className="text-xl font-bold font-[Inter_Tight] tracking-tight">Marcus Sterling</h3>
              <p className="text-sm text-muted-foreground mb-4">Principal Creative Director</p>
              <div className="space-y-1">
                <p className="text-xs font-[JetBrains_Mono] text-muted-foreground uppercase tracking-tighter">
                  +1 (555) 012 3456
                </p>
                <p className="text-xs font-[JetBrains_Mono] text-muted-foreground uppercase tracking-tighter">
                  marcus@studio.id
                </p>
                <p className="text-xs font-[JetBrains_Mono] text-muted-foreground uppercase tracking-tighter italic">
                  studio.id
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function DashboardSection() {
  const signatures = [
    { id: "SIG-082", name: "Executive Minimalist", status: "Active", usage: "Used by 12 team members", width: "50%" },
    { id: "SIG-041", name: "Support Mono", status: "Draft", usage: "Internal operations only", width: "33%" },
    { id: "SIG-099", name: "Sales Showcase", status: "Active", usage: "Used by 45 team members", width: "66%" },
  ];

  return (
    <section className="bg-foreground text-background py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div>
            <span className="font-[JetBrains_Mono] text-[10px] uppercase tracking-[0.2em] text-primary/80 font-medium block mb-4">
              (02) Organization Dashboard
            </span>
            <h2 className="text-4xl font-[Inter_Tight] font-bold tracking-tight">Manage your brand ecosystem.</h2>
          </div>
          <Link to="/app">
            <Button className="px-6 py-3 bg-primary text-white rounded-lg font-medium text-sm hover:bg-primary/90">
              Create New Signature
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {signatures.map((sig) => (
            <div
              key={sig.id}
              className="bg-white/5 border border-white/10 p-6 rounded-xl group hover:border-primary/50 transition-all cursor-pointer"
            >
              <div className="flex justify-between items-start mb-6">
                <span className="text-[10px] font-[JetBrains_Mono] opacity-40">{sig.id}</span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded font-[JetBrains_Mono] ${
                    sig.status === "Active"
                      ? "bg-primary/20 text-primary"
                      : "bg-white/10 text-white/50"
                  }`}
                >
                  {sig.status.toUpperCase()}
                </span>
              </div>
              <div className="h-24 bg-white/5 rounded-lg mb-4 flex items-center justify-center">
                <div className="h-0.5 bg-white/10" style={{ width: sig.width }} />
              </div>
              <h4 className="font-medium text-lg">{sig.name}</h4>
              <p className="text-xs opacity-50">{sig.usage}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function EditorSection() {
  return (
    <section className="max-w-7xl mx-auto px-6 py-24">
      <div className="flex items-center gap-3 mb-12">
        <span className="font-[JetBrains_Mono] text-[10px] uppercase tracking-[0.2em] text-primary font-medium">
          (03) Visual Editor
        </span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <div className="bg-white ring-1 ring-black/5 rounded-2xl overflow-hidden flex h-[640px] shadow-2xl">
        <div className="w-16 border-r border-border bg-stone-50 flex flex-col items-center py-6 gap-8">
          <div className="size-8 bg-foreground rounded-full" />
          <div className="size-5 text-muted-foreground hover:text-primary transition-colors cursor-pointer">
            <div className="w-full h-full bg-current rounded-sm" />
          </div>
          <div className="size-5 text-muted-foreground/30 cursor-not-allowed">
            <div className="w-full h-full bg-current rounded-sm" />
          </div>
          <div className="size-5 text-muted-foreground/30 cursor-not-allowed">
            <div className="w-full h-full bg-current rounded-sm" />
          </div>
        </div>

        <div className="w-80 border-r border-border p-8 flex flex-col">
          <h3 className="font-bold mb-6 text-sm uppercase tracking-widest">Fields</h3>
          <div className="space-y-6 flex-1 overflow-y-auto">
            <FormField label="Full Name" value="Marcus Sterling" />
            <FormField label="Job Title" value="Principal Creative Director" />
            <FormField label="Company" value="Sign Vel" />
            <div className="space-y-1.5">
              <label className="text-[10px] font-[JetBrains_Mono] text-muted-foreground uppercase">Color Accent</label>
              <div className="flex gap-2">
                <div className="size-6 rounded-full bg-primary ring-2 ring-primary ring-offset-2" />
                <div className="size-6 rounded-full bg-stone-800" />
                <div className="size-6 rounded-full bg-blue-600" />
                <div className="size-6 rounded-full bg-emerald-700" />
              </div>
            </div>
          </div>
          <Link to="/app/editor/$id" params={{ id: "new" }}>
            <Button className="w-full py-3 bg-foreground text-background text-xs font-bold uppercase tracking-widest rounded-lg mt-8 hover:bg-foreground/90">
              Push to Team
            </Button>
          </Link>
        </div>

        <div className="flex-1 bg-stone-50/50 p-12 flex items-center justify-center relative">
          <span className="absolute top-6 left-8 text-[10px] font-[JetBrains_Mono] text-muted-foreground opacity-40">
            LIVE PREVIEW (600x240)
          </span>
          <div className="bg-white p-12 shadow-sm ring-1 ring-black/5 rounded-lg w-full max-w-md">
            <div className="flex items-start gap-8 border-l-2 border-primary pl-8">
              <div>
                <h3 className="text-2xl font-bold font-[Inter_Tight] tracking-tighter">Marcus Sterling</h3>
                <p className="text-sm text-muted-foreground mb-6 font-medium italic">Principal Creative Director</p>
                <div className="space-y-1.5">
                  <p className="text-[11px] font-[JetBrains_Mono] text-muted-foreground uppercase">
                    T: +1 555 012 3456
                  </p>
                  <p className="text-[11px] font-[JetBrains_Mono] text-muted-foreground uppercase">
                    E: marcus@studio.id
                  </p>
                  <p className="text-[11px] font-[JetBrains_Mono] text-muted-foreground uppercase font-bold tracking-tighter">
                    W: studio.id
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FormField({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-[JetBrains_Mono] text-muted-foreground uppercase">{label}</label>
      <input
        type="text"
        defaultValue={value}
        className="w-full bg-stone-50 border border-border px-3 py-2 text-sm rounded focus:outline-none focus:ring-1 focus:ring-primary/40 transition-all"
      />
    </div>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border py-12 px-6 bg-white">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="flex items-center gap-3">
          <Logo size={40} wordmarkClassName="text-sm" />
          <span className="text-xs text-muted-foreground">&copy; 2024</span>
        </div>
        <div className="flex gap-8 text-[10px] font-[JetBrains_Mono] uppercase tracking-widest text-muted-foreground">
          <a href="#" className="hover:text-primary transition-colors">
            Security
          </a>
          <a href="#" className="hover:text-primary transition-colors">
            Legal
          </a>
          <a href="#" className="hover:text-primary transition-colors">
            Changelog
          </a>
        </div>
      </div>
    </footer>
  );
}
