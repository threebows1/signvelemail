import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FitPreview } from "@/components/signatures/FitPreview";
import { templates, renderSignature } from "@/components/signatures/templates";
import { defaultData } from "@/lib/signature-store";

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

const categories = ["All", "Corporate", "Creative", "Minimal", "Bold", "Executive", "Custom"] as const;
const layouts = [
  { id: "all", label: "All layouts" },
  { id: "single", label: "Single column" },
  { id: "two-column", label: "Two columns" },
  { id: "vertical", label: "Vertical" },
] as const;

function Templates() {
  const [filter, setFilter] = useState<(typeof categories)[number]>("All");
  const [layout, setLayout] = useState<(typeof layouts)[number]["id"]>("all");
  const visible = templates.filter(
    (t) => (filter === "All" || t.category === filter) && (layout === "all" || t.layout === layout),
  );

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

      <div className="space-y-2 mb-8">
        <div className="flex flex-wrap gap-2">
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
        <div className="flex flex-wrap gap-2">
          {layouts.map((l) => (
            <button
              key={l.id}
              onClick={() => setLayout(l.id)}
              className={`px-3 py-1 text-[11px] font-[JetBrains_Mono] uppercase tracking-wider rounded-full border transition-colors ${
                layout === l.id
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-white text-muted-foreground border-border hover:border-primary/40"
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
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
            <div className="p-5 bg-stone-50/40 overflow-hidden">
              <div className="rounded-lg ring-1 ring-black/5 overflow-hidden bg-white text-left">
                <FitPreview max={0.86} shrinkWrap maxHeight={280}>
                  {renderSignature(t, defaultData)}
                </FitPreview>
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
