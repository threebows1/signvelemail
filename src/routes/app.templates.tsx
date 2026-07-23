import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { templates } from "@/components/signatures/templates";

export const Route = createFileRoute("/app/templates")({
  head: () => ({
    meta: [
      { title: "Templates — Sign Vel" },
      { name: "description", content: "Browse email signature templates across corporate, creative, minimal, and executive styles." },
      { property: "og:title", content: "Sign Vel Templates" },
      { property: "og:description", content: "A curated gallery of email signature templates — from minimalist to fully-branded corporate." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Templates,
});

const categories = ["All", "Corporate", "Creative", "Minimal", "Bold", "Executive"] as const;

function Templates() {
  const [filter, setFilter] = useState<(typeof categories)[number]>("All");
  const visible = filter === "All" ? templates : templates.filter((t) => t.category === filter);

  return (
    <div className="p-8 md:p-12 max-w-7xl">
      <div className="flex items-start justify-between mb-10">
        <div>
          <span className="font-[JetBrains_Mono] text-[10px] uppercase tracking-[0.2em] text-primary font-medium block mb-2">
            (Gallery)
          </span>
          <h1 className="text-3xl font-[Inter_Tight] font-bold tracking-tight">Signature Templates</h1>
          <p className="text-sm text-muted-foreground mt-2 max-w-xl">
            Every template is fully editable and deploys to Gmail, Outlook, and Apple Mail with one click.
          </p>
        </div>
        <span className="text-xs text-muted-foreground font-[JetBrains_Mono]">
          {visible.length} / {templates.length}
        </span>
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            className={`px-4 py-1.5 text-xs font-medium rounded-full border transition-colors ${
              filter === c
                ? "bg-foreground text-background border-foreground"
                : "bg-white text-muted-foreground border-border hover:border-foreground/40"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {visible.map((t) => (
          <div
            key={t.id}
            className="group bg-white ring-1 ring-black/5 rounded-2xl overflow-hidden hover:ring-primary/30 hover:shadow-lg hover:-translate-y-0.5 transition-all"
          >
            <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-stone-50/60">
              <div className="flex items-center gap-3 min-w-0">
                <span className={`size-2.5 rounded-full ${t.accent} shrink-0`} />
                <div className="min-w-0">
                  <p className="font-medium text-sm truncate">{t.name}</p>
                  <p className="text-[10px] font-[JetBrains_Mono] uppercase tracking-widest text-muted-foreground">
                    {t.category}
                  </p>
                </div>
              </div>
              <Link to="/app/editor/$id" params={{ id: t.id }}>
                <Button size="sm" variant="outline" className="text-xs h-8">
                  Use template →
                </Button>
              </Link>
            </div>
            <div className="p-5 bg-stone-50/40 min-h-[280px] overflow-hidden">
              <div className="rounded-lg ring-1 ring-black/5 overflow-hidden bg-white text-left">
                <div className="origin-top-left" style={{ transform: "scale(0.86)", transformOrigin: "top left", width: "116%" }}>
                  {t.render(defaultData)}
                </div>
              </div>
            </div>
            <div className="px-5 py-3 border-t border-border text-xs text-muted-foreground leading-relaxed">
              {t.description}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
