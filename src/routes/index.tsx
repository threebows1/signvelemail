import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { templates, renderSignature } from "@/components/signatures/templates";
import { defaultData } from "@/lib/signature-store";
import { FitPreview } from "@/components/signatures/FitPreview";


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

const showcaseIds = ["al-riyady"];

const emailClients = [
  { name: "Gmail", time: "1 min" },
  { name: "Outlook", time: "2 min" },
  { name: "Apple Mail", time: "1 min" },
  { name: "Yahoo", time: "1 min" },
  { name: "Thunderbird", time: "2 min" },
];

/** Editorial italic accent used across headings. */
function Ital({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-[Instrument_Serif] italic font-normal text-primary tracking-normal">
      {children}
    </span>
  );
}

function Kicker({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-[JetBrains_Mono] text-[10px] uppercase tracking-[0.22em] text-primary block">
      {children}
    </span>
  );
}

function Index() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/20 selection:text-primary">
      <TickerBar />
      <Navigation />
      <main>
        <HeroSection />
        <ShowcaseSection />
        <StepsSection />
        <FeaturesSection />
        <CompatibilityStrip />
        <CtaSection />
      </main>
      <Footer />
    </div>
  );
}

function TickerBar() {
  return (
    <div className="w-full bg-foreground text-background text-[10px] font-[JetBrains_Mono] uppercase tracking-[0.18em] py-2 px-6 flex items-center justify-center gap-3">
      <span className="text-accent">New</span>
      <span className="text-background/70">Bulk-deploy your whole directory in one push.</span>
      <Link to="/pricing" className="hover:text-accent transition-colors">
        Start a 7-day trial →
      </Link>
    </div>
  );
}

function Navigation() {
  return (
    <nav className="sticky top-0 z-50 w-full bg-background/85 backdrop-blur-md border-b border-border px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-10">
        <Link to="/" aria-label="Sign Vel home">
          <Logo size={44} wordmarkClassName="text-lg" />
        </Link>
        <div className="hidden md:flex items-center gap-7 text-[13px] font-medium">
          <a href="#showcase" className="hover:text-primary transition-colors">Showcase</a>
          <Link to="/app/templates" className="hover:text-primary transition-colors">Templates</Link>
          <Link to="/pricing" className="hover:text-primary transition-colors">Pricing</Link>
        </div>
      </div>
      <div className="flex items-center gap-5">
        <Link to="/login" search={{ next: "/app" }} className="text-[13px] font-medium hover:text-primary transition-colors">
          Sign in
        </Link>
        <Link to="/login" search={{ next: "/app" }}>
          <Button size="sm" className="rounded-full px-5 bg-foreground text-background hover:bg-foreground/90">
            Get Started
          </Button>
        </Link>
      </div>
    </nav>
  );
}

function HeroSection() {
  const featured = templates.find((t) => t.id === "al-riyady")!;
  return (
    <section className="max-w-7xl mx-auto px-6 pt-16 pb-20 grid lg:grid-cols-[1fr_1.05fr] gap-14 items-center">
      <div className="animate-slide-up">
        <Kicker>(01) Email signatures, designed</Kicker>
        <h1 className="mt-6 text-5xl md:text-6xl font-[Manrope] font-bold tracking-tighter leading-[0.95] text-balance">
          Every signature,
          <br />
          <Ital>precisely yours.</Ital>
        </h1>
        <p className="mt-6 text-base md:text-lg text-muted-foreground max-w-[42ch] leading-relaxed">
          Browse real signature designs, customize every pixel, and deploy across your whole team — Gmail, Outlook, and Apple Mail in one click.
        </p>
        <div className="flex items-center gap-3 mt-8">
          <Link to="/app">
            <Button className="rounded-full px-7 py-5 text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90">
              Start Building
            </Button>
          </Link>
          <a href="#showcase">
            <Button variant="outline" className="rounded-full px-7 py-5 text-sm font-semibold border-border">
              View Designs
            </Button>
          </a>
        </div>
        <dl className="grid grid-cols-3 gap-6 mt-12 pt-6 border-t border-border max-w-md">
          {[
            [`${templates.length}`, "Templates"],
            ["22", "Social icons"],
            ["5", "Mail clients"],
          ].map(([n, label]) => (
            <div key={label}>
              <dt className="text-2xl font-[Manrope] font-bold tracking-tight">{n}</dt>
              <dd className="text-[10px] font-[JetBrains_Mono] uppercase tracking-[0.18em] text-muted-foreground mt-1">
                {label}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="animate-slide-up-delay">
        <div className="bg-white ring-1 ring-black/5 rounded-2xl shadow-xl p-7">
          <div className="flex items-center justify-between mb-5">
            <span className="text-[10px] font-[JetBrains_Mono] uppercase tracking-[0.18em] text-muted-foreground">
              {featured.name}
            </span>
            <span className="flex items-center gap-1.5 text-[10px] font-[JetBrains_Mono] uppercase tracking-[0.18em] text-accent-foreground">
              <span className="size-1.5 rounded-full bg-accent" /> Live preview
            </span>
          </div>
          <div className="overflow-hidden">
            <div style={{ transform: "scale(0.94)", transformOrigin: "top left" }}>
              {renderSignature(featured, defaultData)}
            </div>
          </div>
          <div className="mt-5 pt-4 border-t border-border flex justify-end">
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
    <section id="showcase" className="bg-foreground text-background py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <span className="font-[JetBrains_Mono] text-[10px] uppercase tracking-[0.22em] text-accent block mb-4">
              (02) Signature showcase
            </span>
            <h2 className="text-3xl md:text-5xl font-[Manrope] font-bold tracking-tight leading-tight">
              Real designs.{" "}
              <span className="font-[Instrument_Serif] italic font-normal text-accent">Ready to deploy.</span>
            </h2>
          </div>
          <Link to="/app/templates">
            <Button className="rounded-full px-6 bg-accent text-accent-foreground hover:bg-accent/90 text-sm font-medium">
              Browse all templates
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 items-stretch">
          {showcaseIds.map((id) => {
            const t = templates.find((x) => x.id === id);
            if (!t) return null;
            return (
              <div
                key={id}
                className="group flex h-full flex-col bg-white text-foreground rounded-xl overflow-hidden ring-1 ring-white/10 hover:ring-accent/40 hover:-translate-y-1 transition-all"
              >
                <FitPreview className="h-[240px] w-full sm:h-[260px] lg:h-[280px]" max={0.9} padding={18}>
                  {renderSignature(t, defaultData)}
                </FitPreview>

                <div className="mt-auto grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 border-t border-border">
                  <div className="min-w-0">
                    <p className="font-medium text-[13px] truncate">{t.name}</p>
                    <p className="text-[10px] font-[JetBrains_Mono] uppercase tracking-[0.18em] text-muted-foreground truncate">
                      {t.category}
                    </p>
                  </div>
                  <Link to="/app/editor/$id" params={{ id: t.id }} className="shrink-0">
                    <span className="text-[11px] font-medium text-primary hover:underline whitespace-nowrap">
                      Customize →
                    </span>
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

/* ---------------- Four steps (zigzag) ---------------- */

function StepRow({
  step,
  kicker,
  title,
  body,
  visual,
  flip = false,
}: {
  step: string;
  kicker: string;
  title: string;
  body: string;
  visual: React.ReactNode;
  flip?: boolean;
}) {
  return (
    <div className="grid md:grid-cols-2 gap-10 items-center py-12 border-t border-border">
      <div className={flip ? "md:order-2" : ""}>
        <span className="font-[JetBrains_Mono] text-[10px] uppercase tracking-[0.22em] text-muted-foreground block mb-3">
          Step {step} — {kicker}
        </span>
        <h3 className="text-2xl md:text-3xl font-[Manrope] font-bold tracking-tight mb-3">{title}</h3>
        <p className="text-sm md:text-base text-muted-foreground leading-relaxed max-w-[46ch]">{body}</p>
      </div>
      <div className={flip ? "md:order-1" : ""}>{visual}</div>
    </div>
  );
}

function Panel({ children, label }: { children: React.ReactNode; label?: string }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-5">
      {label && (
        <p className="text-[10px] font-[JetBrains_Mono] uppercase tracking-[0.18em] text-muted-foreground mb-4">
          {label}
        </p>
      )}
      {children}
    </div>
  );
}

function StepsSection() {
  const gridTemplates = ["al-riyady"];
  return (
    <section className="max-w-7xl mx-auto px-6 py-20">
      <Kicker>(03) Four steps</Kicker>
      <h2 className="mt-5 text-4xl md:text-5xl font-[Manrope] font-bold tracking-tighter leading-[1.02] max-w-[18ch]">
        From template to <Ital>every mailbox.</Ital>
      </h2>

      <div className="mt-10">
        <StepRow
          step="01"
          kicker="Choose"
          title="Pick a template"
          body="Start from a library of layouts built for real inboxes. One column, two columns, or vertical — every design is tested across mail clients."
          visual={
            <Panel label="Templates">
              <div className="grid grid-cols-3 gap-3">
                {gridTemplates.map((id, i) => {
                  const t = templates.find((x) => x.id === id);
                  return (
                    <div
                      key={id}
                      className={`rounded-lg border p-2 h-24 overflow-hidden bg-background ${
                        i === 0 ? "border-primary ring-2 ring-primary/20" : "border-border"
                      }`}
                    >
                      {t && (
                        <div style={{ transform: "scale(0.32)", transformOrigin: "top left", width: "312%" }}>
                          {renderSignature(t, defaultData)}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              <p className="mt-4 text-[11px] text-muted-foreground">
                Filter by layout and category, then jump straight into the editor.
              </p>
            </Panel>
          }
        />

        <StepRow
          step="02"
          kicker="Customize"
          title="Match your brand"
          body="Upload a logo and headshot, set fonts and colors, or pull the palette straight from your website. Lock the fields that shouldn't change."
          flip
          visual={
            <Panel label="Brand">
              <div className="flex items-center gap-2 mb-5">
                {["#5B2EFF", "#14121F", "#3B82F6", "#00E5A0"].map((c) => (
                  <span
                    key={c}
                    className="size-6 rounded-full ring-1 ring-black/10"
                    style={{ backgroundColor: c }}
                  />
                ))}
                <span className="ml-auto text-[10px] font-[JetBrains_Mono] uppercase tracking-[0.18em] text-muted-foreground">
                  Brand
                </span>
              </div>
              <div className="flex gap-2 mb-5">
                {["Rubik", "Manrope", "Mono"].map((f, i) => (
                  <span
                    key={f}
                    className={`px-3 py-1.5 rounded-md text-[11px] font-medium border ${
                      i === 0 ? "bg-secondary border-primary/30 text-secondary-foreground" : "border-border text-muted-foreground"
                    }`}
                  >
                    {f}
                  </span>
                ))}
              </div>
              <div className="rounded-lg border border-border bg-background p-4 overflow-hidden">
                <div style={{ transform: "scale(0.82)", transformOrigin: "top left" }}>
                  {renderSignature(templates[0], defaultData)}
                </div>
              </div>
            </Panel>
          }
        />

        <StepRow
          step="03"
          kicker="Install"
          title="Install in a minute"
          body="Pick your client and follow the illustrated steps. Guides cover Windows and Mac for every major mail app."
          visual={
            <Panel label="Install guides">
              <ul className="divide-y divide-border">
                {emailClients.map((c) => (
                  <li key={c.name} className="flex items-center justify-between py-3">
                    <span className="flex items-center gap-3 text-sm font-medium">
                      <span className="size-6 rounded-md bg-secondary" />
                      {c.name}
                    </span>
                    <span className="text-[10px] font-[JetBrains_Mono] uppercase tracking-[0.18em] text-muted-foreground">
                      {c.time}
                    </span>
                  </li>
                ))}
              </ul>
            </Panel>
          }
        />

        <StepRow
          step="04"
          kicker="Deploy"
          title="Roll it out to the team"
          body="Colleagues get a link with their own details pre-filled. Upload a CSV or sync your directory and send the whole list at once."
          flip
          visual={
            <Panel label="Team — 48 members">
              <ul className="divide-y divide-border">
                {[
                  ["Alex Rivera", "Brand Designer", true],
                  ["Dana Okonkwo", "Operations", true],
                  ["Ivo Brandt", "Support Engineer", false],
                  ["Lena Whitfield", "VP Revenue", false],
                ].map(([name, role, done]) => (
                  <li key={name as string} className="flex items-center justify-between py-3">
                    <span className="flex items-center gap-3">
                      <span className="size-7 rounded-full bg-secondary text-secondary-foreground text-[10px] font-semibold grid place-items-center">
                        {(name as string).split(" ").map((p) => p[0]).join("")}
                      </span>
                      <span>
                        <span className="block text-sm font-medium">{name as string}</span>
                        <span className="block text-[11px] text-muted-foreground">{role as string}</span>
                      </span>
                    </span>
                    <span
                      className={`text-[10px] font-[JetBrains_Mono] uppercase tracking-[0.18em] ${
                        done ? "text-accent-foreground" : "text-muted-foreground"
                      }`}
                    >
                      {done ? "Installed" : "Sent"}
                    </span>
                  </li>
                ))}
              </ul>
            </Panel>
          }
        />
      </div>
    </section>
  );
}

function FeaturesSection() {
  const items = [
    ["Branding", "Upload your logo & photo", "Drop in your company logo and profile photo. Fetch branding from any website to pull colors automatically."],
    ["Templates", `${templates.length} tested layouts`, "Corporate, creative, minimal, bold, and executive designs — all verified across mail clients."],
    ["Social", "22 social icon styles", "Brand-color, solid, outline, or plain. Reorder your channels in a click."],
    ["Install", "One click to any client", "Export to Gmail, Outlook, Apple Mail and more, with step-by-step guides."],
  ];

  return (
    <section className="max-w-7xl mx-auto px-6 pb-20">
      <Kicker>(04) Everything you need</Kicker>
      <div className="mt-8 grid lg:grid-cols-[0.85fr_1.15fr] gap-6 items-start">
        <div className="border-l-2 border-primary pl-6">
          {items.map(([kicker, title, body], i) => (
            <div key={title} className={`${i > 0 ? "border-t border-border pt-6 mt-6" : ""}`}>
              <span className="font-[JetBrains_Mono] text-[10px] uppercase tracking-[0.22em] text-muted-foreground block mb-2">
                {kicker}
              </span>
              <h3 className="text-xl font-[Manrope] font-bold tracking-tight mb-1.5">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-[44ch]">{body}</p>
            </div>
          ))}
        </div>

        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <span className="font-[JetBrains_Mono] text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              Branding — automatic
            </span>
            <span className="flex items-center gap-1.5 text-[10px] font-[JetBrains_Mono] uppercase tracking-[0.18em] text-accent-foreground">
              <span className="size-1.5 rounded-full bg-accent" /> Live
            </span>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="rounded-xl border border-dashed border-border bg-background h-28 grid place-items-center gap-2">
              <Logo size={44} showWordmark={false} />
              <span className="text-[11px] text-muted-foreground">Drop your logo</span>
            </div>
            <div className="rounded-xl border border-dashed border-border bg-background h-28 grid place-items-center gap-2">
              <span className="size-10 rounded-full bg-secondary text-secondary-foreground text-xs font-semibold grid place-items-center">
                AR
              </span>
              <span className="text-[11px] text-muted-foreground">Drop a headshot</span>
            </div>
          </div>
          <p className="mt-6 text-[10px] font-[JetBrains_Mono] uppercase tracking-[0.18em] text-muted-foreground">
            Fetched from signvel.com
          </p>
          <div className="mt-3 grid grid-cols-5 gap-2">
            {["#5B2EFF", "#3B82F6", "#00E5A0", "#14121F", "#9D4EDD"].map((c) => (
              <span key={c} className="h-9 rounded-md ring-1 ring-black/10" style={{ backgroundColor: c }} />
            ))}
          </div>
          <p className="mt-3 text-[10px] font-[JetBrains_Mono] uppercase tracking-[0.18em] text-muted-foreground">
            Accent set to #5B2EFF
          </p>
        </div>
      </div>
    </section>
  );
}

function CompatibilityStrip() {
  return (
    <section className="max-w-7xl mx-auto px-6 pb-20">
      <div className="bg-card border border-border rounded-2xl px-8 py-7 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-lg font-[Manrope] font-bold tracking-tight">
            Works everywhere your team sends email
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Installation guides for every major client, on Windows and Mac.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-x-7 gap-y-3 text-[10px] font-[JetBrains_Mono] uppercase tracking-[0.18em] text-muted-foreground">
          {emailClients.map((c) => (
            <span key={c.name} className="hover:text-primary transition-colors">
              {c.name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function CtaSection() {
  return (
    <section id="cta" className="max-w-7xl mx-auto px-6 pb-20">
      <div className="rounded-3xl bg-primary text-primary-foreground p-14 md:p-20 text-center relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-accent/30 blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <h2 className="text-4xl md:text-5xl font-[Manrope] font-bold tracking-tight leading-[1.05]">
            Build your signature
            <br />
            <span className="font-[Instrument_Serif] italic font-normal">in minutes.</span>
          </h2>
          <p className="text-primary-foreground/80 mt-4 mb-8">
            Start free for 7 days. No credit card required.
          </p>
          <Link to="/app">
            <Button className="rounded-full px-9 py-5 text-sm font-semibold bg-background text-foreground hover:bg-background/90">
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
    <footer className="border-t border-border py-10 px-6 bg-card">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-3">
          <Logo size={40} wordmarkClassName="text-sm" />
          <span className="text-xs text-muted-foreground">&copy; 2026</span>
        </div>
        <div className="flex gap-8 text-[10px] font-[JetBrains_Mono] uppercase tracking-[0.18em] text-muted-foreground">
          <a href="#" className="hover:text-primary transition-colors">Security</a>
          <a href="#" className="hover:text-primary transition-colors">Legal</a>
          <a href="#" className="hover:text-primary transition-colors">Changelog</a>
        </div>
      </div>
    </footer>
  );
}
