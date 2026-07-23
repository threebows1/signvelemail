import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import logoMonogram from "@/assets/logo-monogram.png";

export const Route = createFileRoute("/app/editor/$id")({
  head: ({ params }) => ({
    meta: [
      { title: `Editor ${params.id} — Signature Studio` },
      { name: "description", content: "Edit your team's email signature with the visual editor." },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Editor,
});

function Editor() {
  const { id } = Route.useParams();

  return (
    <div className="h-full flex flex-col">
      <header className="px-8 py-4 border-b border-border bg-white flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <span className="font-[JetBrains_Mono] text-[10px] uppercase tracking-[0.2em] text-primary font-medium">
            Editor
          </span>
          <span className="text-muted-foreground">/</span>
          <span className="font-[Inter_Tight] font-bold text-sm">{id === "new" ? "New Signature" : id}</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/app">
            <Button variant="outline" size="sm">
              Cancel
            </Button>
          </Link>
          <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
            Save & Deploy
          </Button>
        </div>
      </header>

      <div className="flex-1 flex h-[calc(100vh-64px)]">
        <div className="w-80 border-r border-border bg-white p-6 overflow-y-auto">
          <h3 className="font-[Inter_Tight] font-bold text-sm uppercase tracking-widest mb-6">Content</h3>
          <div className="space-y-5">
            <FormField label="Full Name" value="Marcus Sterling" />
            <FormField label="Job Title" value="Principal Creative Director" />
            <FormField label="Company" value="Signature Studio" />
            <FormField label="Email" value="marcus@studio.id" />
            <FormField label="Phone" value="+1 555 012 3456" />
            <FormField label="Website" value="studio.id" />

            <div className="space-y-1.5">
              <label className="text-[10px] font-[JetBrains_Mono] text-muted-foreground uppercase">Accent Color</label>
              <div className="flex gap-2">
                <div className="size-6 rounded-full bg-primary ring-2 ring-primary ring-offset-2" />
                <div className="size-6 rounded-full bg-foreground" />
                <div className="size-6 rounded-full bg-blue-600" />
                <div className="size-6 rounded-full bg-emerald-700" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-[JetBrains_Mono] text-muted-foreground uppercase">Layout</label>
              <div className="grid grid-cols-2 gap-2">
                <button className="px-3 py-2 text-xs border border-primary bg-primary/5 rounded text-primary font-medium">Left Line</button>
                <button className="px-3 py-2 text-xs border border-border rounded text-muted-foreground hover:bg-secondary transition-colors">Stacked</button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 bg-stone-50/50 p-12 flex flex-col items-center justify-center relative overflow-y-auto">
          <span className="absolute top-6 left-8 text-[10px] font-[JetBrains_Mono] text-muted-foreground opacity-40 uppercase tracking-widest">
            Live Preview
          </span>
          <div className="bg-white p-12 shadow-sm ring-1 ring-black/5 rounded-lg w-full max-w-lg">
            <div className="flex items-start gap-8 border-l-2 border-primary pl-8">
              <img
                src={logoMonogram}
                alt="Studio monogram"
                width={64}
                height={64}
                className="size-16 rounded bg-stone-50 shrink-0 border border-black/5 object-cover"
              />
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

          <div className="absolute bottom-8 flex items-center gap-3">
            <button className="px-3 py-1.5 text-[10px] font-[JetBrains_Mono] uppercase tracking-widest border border-border rounded hover:bg-white transition-colors">
              Copy HTML
            </button>
            <button className="px-3 py-1.5 text-[10px] font-[JetBrains_Mono] uppercase tracking-widest border border-border rounded hover:bg-white transition-colors">
              Test Send
            </button>
          </div>
        </div>
      </div>
    </div>
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
