import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";

export const Route = createFileRoute("/login")({
  validateSearch: (s: Record<string, unknown>) => ({
    next: typeof s.next === "string" ? s.next : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Sign In — Sign Vel" },
      { name: "description", content: "Sign in to Sign Vel to manage your team's email signatures." },
      { property: "og:title", content: "Sign In — Sign Vel" },
      { property: "og:description", content: "Sign in to Sign Vel to manage your team's email signatures." },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Login,
});

function Login() {
  const { next: nextParam } = useSearch({ from: "/login" });
  const next = nextParam ?? "/app";
  const navigate = useNavigate();

  function handleContinue() {
    navigate({ href: next });
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans flex flex-col">
      <header className="px-6 py-4 flex items-center justify-between border-b border-border">
        <Link to="/" aria-label="Sign Vel home">
          <Logo size={44} wordmarkClassName="text-lg" />
        </Link>
        <Link to="/">
          <Button variant="ghost" size="sm">
            Back
          </Button>
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm bg-white ring-1 ring-black/5 p-10 rounded-2xl shadow-xl">
          <span className="font-[JetBrains_Mono] text-[10px] uppercase tracking-[0.2em] text-primary font-medium block mb-3">
            Authentication
          </span>
          <h1 className="text-2xl font-[Inter_Tight] font-bold tracking-tight mb-6">Sign in</h1>

          <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); handleContinue(); }}>
            <div className="space-y-1.5">
              <label className="text-[10px] font-[JetBrains_Mono] text-muted-foreground uppercase">Work Email</label>
              <input
                type="email"
                placeholder="you@company.com"
                className="w-full bg-stone-50 border border-border px-3 py-2 text-sm rounded focus:outline-none focus:ring-1 focus:ring-primary/40 transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-[JetBrains_Mono] text-muted-foreground uppercase">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full bg-stone-50 border border-border px-3 py-2 text-sm rounded focus:outline-none focus:ring-1 focus:ring-primary/40 transition-all"
              />
            </div>
            <Button type="submit" className="w-full py-3 bg-foreground text-background font-semibold text-sm rounded-lg hover:bg-foreground/90">
              Continue
            </Button>
          </form>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            No account?{" "}
            <a href="#" className="underline decoration-primary/50 underline-offset-4 hover:text-primary">
              Request access
            </a>
          </p>
        </div>
      </main>

      <footer className="border-t border-border px-6 py-4 text-center text-[10px] font-[JetBrains_Mono] text-muted-foreground uppercase">
        © 2024 Sign Vel
      </footer>
    </div>
  );
}
