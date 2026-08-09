import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { templates, renderSignature } from "@/components/signatures/templates";
import { defaultData } from "@/lib/signature-store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sign Vel — Email signatures for teams" },
      { name: "description", content: "Browse real email signature designs, customize every detail, and deploy across Gmail, Outlook, and Apple Mail with one click." },
      { property: "og:title", content: "Sign Vel — Email signatures for teams" },
      { property: "og:description", content: "Browse real email signature designs, customize every detail, and deploy across Gmail, Outlook, and Apple Mail with one click." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

// Curated showcase of real signatures rendered from the actual templates.
const showcaseIds = [
  "al-riyady",
  "left-line",
  "photo-card",
  "exec-serif",
  "mono",
  "bold-dark",
];
const galleryIds = [
  "gradient-header",
  "icon-grid",
  "vertical-ribbon",
  "underline-accent",
  "business-card",
  "circle-icons",
];

const emailClients = ["Gmail", "Outlook", "Apple Mail", "Yahoo", "Thunderbird"];

function Index() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/20 selection:text-primary">
      <Navigation />
      <main>
        <HeroSection />
        <ShowcaseSection />
        <FeaturesSection />
        <CompatibilitySection />
        <CtaSection />
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
          <a href="#showcase" className="text-sm font-medium hover:text-primary transition-colors">
            Showcase
          </a>
          <Link to="/app/templates" className="text-sm font-medium hover:text-primary transition-colors">
            Templates
          </Link>
          <Link to="/pricing" className="text-sm font-medium hover:text-primary transition-colors">
            Pricing
          </Link>
        </div>
      </div>
      <Link to="/login" search={{ next: "/app" }}>
        <Button size="sm" className="bg-foreground text-background hover:bg-foreground/90">
          Get Started
        </Button>
      </Link>
    </nav>
  );
}

function HeroSection() {
  const featured = templates.find((t) => t.id === "al-riyady")!;
  return (
    <section className="max-w-7xl mx-auto px-6 pt-20 pb-24 grid lg:grid-cols-2 gap-16 items-center">
      <div className="animate-slide-up">
        <span className="font-[JetBrains_Mono] text-[10px] uppercase tracking-[0.2em] text-primary font-medium block mb-6">
          (01) Email signatures, designed
        </span>
        <h1 className="text-6xl md:text-7xl font-[Manrope] font-bold tracking-tighter text-balance leading-[0.9] mb-8">
          Every signature,<br />precisely yours.
        </h1>
        <p className="text-xl text-muted-foreground text-pretty max-w-[45ch] mb-10 leading-relaxed">
          Browse real signature designs, customize every pixel, and deploy across your whole team — Gmail, Outlook, and Apple Mail in one click.
        </p>
        <div className="flex items-center gap-4">
          <Link to="/app">
            <Button className="px-8 py-6 text-base font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90">
              Start Building
            </Button>
          </Link>
          <a href="#showcase">
            <Button variant="outline" className="px-8 py-6 text-base font-semibold rounded-lg border-border hover:bg-black/5">
              View Designs
            </Button>
          </a>
        </div>
        <div className="flex items-center gap-6 mt-10 text-xs font-[JetBrains_Mono] uppercase tracking-widest text-muted-foreground">
          <span>{templates.length} templates</span>
          <span className="size-1 rounded-full bg-border" />
          <span>22 social icons</span>
          <span className="size-1 rounded-full bg-border" />
          <span>Free 7-day trial</span>
        </div>
      </div>

      {/* Real, rendered signature — not a mockup */}
      <div className="animate-slide-up-delay">
        <div className="bg-white ring-1 ring-black/5 p-8 rounded-2xl shadow-xl">
          <div className="overflow-hidden">
            <div style={{ transform: "scale(0.92)", transformOrigin: "top center" }}>
              {renderSignature(featured, defaultData)}
            </div>
          </div>
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
            <div className="flex items-center gap-2">
              <span className="size-2.5 rounded-full bg-primary" />
              <span className="text-xs font-[JetBrains_Mono] uppercase tracking-widest text-muted-foreground">
                {featured.name}
              </span>
            </div>
            <Link to="/app/editor/$id" params={{ id: featured.id }}>
              <span className="text-xs font-medium text-primary hover:underline cursor-pointer">
                Use this design →
              </span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function ShowcaseSection() {
  return (
    <section id="showcase" className="bg-foreground text-background py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-14">
          <div>
            <span className="font-[JetBrains_Mono] text-[10px] uppercase tracking-[0.2em] text-accent font-medium block mb-4">
              (02) Signature Showcase
            </span>
            <h2 className="text-4xl md:text-5xl font-[Manrope] font-bold tracking-tight">
              Real designs. Ready to deploy.
            </h2>
          </div>
          <Link to="/app/templates">
            <Button className="px-6 py-3 bg-accent text-accent-foreground rounded-lg font-medium text-sm hover:bg-accent/90">
              Browse all templates
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {showcaseIds.map((id) => {
            const t = templates.find((x) => x.id === id);
            if (!t) return null;
            return (
              <div
                key={id}
                className="group bg-white text-foreground rounded-2xl overflow-hidden ring-1 ring-white/10 hover:ring-accent/40 hover:-translate-y-1 transition-all"
              >
                <div className="p-6 bg-stone-50/40 min-h-[240px] overflow-hidden flex items-center justify-center">
                  <div style={{ transform: "scale(0.78)", transformOrigin: "top center" }}>
                    {renderSignature(t, defaultData)}
                  </div>
                </div>
                <div className="flex items-center justify-between px-5 py-3.5 border-t border-border bg-white">
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">{t.name}</p>
                    <p className="text-[10px] font-[JetBrains_Mono] uppercase tracking-widest text-muted-foreground">
                      {t.category}
                    </p>
                  </div>
                  <Link to="/app/editor/$id" params={{ id: t.id }}>
                    <Button size="sm" variant="outline" className="text-xs h-8 shrink-0">
                      Customize →
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  const features = [
    {
      kicker: "Branding",
      title: "Upload your logo & photo",
      body: "Drop in your company logo and profile photo. Fetch branding from any website to pull colors automatically.",
      templateId: "icon-grid",
    },
    {
      kicker: "Templates",
      title: "30+ tested layouts",
      body: "Corporate, creative, minimal, bold, and executive designs — every template is tested across email clients.",
      templateId: "gradient-header",
    },
    {
      kicker: "Social",
      title: "22 social icon styles",
      body: "Brand-color, solid, outline, or plain. Reorder your socials and let recipients discover your channels.",
      templateId: "circle-icons",
    },
    {
      kicker: "Install",
      title: "One-click to any client",
      body: "Export to Gmail, Outlook, Apple Mail and more with step-by-step install guides for Windows and Mac.",
      templateId: "business-card",
    },
  ];

  return (
    <section className="max-w-7xl mx-auto px-6 py-24">
      <div className="flex items-center gap-3 mb-14">
        <span className="font-[JetBrains_Mono] text-[10px] uppercase tracking-[0.2em] text-primary font-medium">
          (03) Everything you need
        </span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {features.map((f) => {
          const t = templates.find((x) => x.id === f.templateId);
          return (
            <div
              key={f.title}
              className="bg-card border border-border rounded-2xl overflow-hidden flex flex-col"
            >
              <div className="p-8 bg-stone-50/40 min-h-[200px] overflow-hidden flex items-center justify-center">
                {t && (
                  <div style={{ transform: "scale(0.72)", transformOrigin: "center" }}>
                    {renderSignature(t, defaultData)}
                  </div>
                )}
              </div>
              <div className="p-6 flex-1">
                <span className="font-[JetBrains_Mono] text-[10px] uppercase tracking-[0.2em] text-primary font-medium block mb-2">
                  {f.kicker}
                </span>
                <h3 className="text-xl font-[Manrope] font-bold tracking-tight mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.body}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function CompatibilitySection() {
  return (
    <section className="max-w-7xl mx-auto px-6 pb-24">
      <div className="bg-card border border-border rounded-2xl p-12 text-center">
        <h2 className="text-2xl md:text-3xl font-[Manrope] font-bold tracking-tight mb-3">
          Works everywhere your team sends email
        </h2>
        <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
          Installation guides included for every major client, on Windows and Mac.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
          {emailClients.map((c) => (
            <span
              key={c}
              className="font-[Manrope] font-semibold text-lg text-foreground/70 hover:text-primary transition-colors"
            >
              {c}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function CtaSection() {
  return (
    <section id="cta" className="max-w-7xl mx-auto px-6 pb-24">
      <div className="rounded-3xl bg-primary text-primary-foreground p-12 md:p-16 text-center relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-accent/30 blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <h2 className="text-4xl md:text-5xl font-[Manrope] font-bold tracking-tight mb-4">
            Build your signature in minutes.
          </h2>
          <p className="text-primary-foreground/80 text-lg mb-8 max-w-md mx-auto">
            Start free for 7 days. No credit card required.
          </p>
          <Link to="/app">
            <Button className="px-10 py-6 text-base font-semibold rounded-lg bg-background text-foreground hover:bg-background/90">
              Start Building
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border py-12 px-6 bg-card">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="flex items-center gap-3">
          <Logo size={40} wordmarkClassName="text-sm" />
          <span className="text-xs text-muted-foreground">&copy; 2026</span>
        </div>
        <div className="flex gap-8 text-[10px] font-[JetBrains_Mono] uppercase tracking-widest text-muted-foreground">
          <a href="#" className="hover:text-primary transition-colors">Security</a>
          <a href="#" className="hover:text-primary transition-colors">Legal</a>
          <a href="#" className="hover:text-primary transition-colors">Changelog</a>
        </div>
      </div>
    </footer>
  );
}
