import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { deleteSignature, useSignatures } from "@/lib/signature-store";
import { getTemplate } from "@/components/signatures/templates";
import { Trash2 } from "lucide-react";

export const Route = createFileRoute("/app/")({
  component: Dashboard,
});

function Dashboard() {
  const signatures = useSignatures();
  const active = signatures.filter((s) => s.status === "Active").length;

  return (
    <div className="p-8 md:p-12 max-w-6xl">
      <div className="flex items-center justify-between mb-12">
        <div>
          <span className="font-[JetBrains_Mono] text-[10px] uppercase tracking-[0.2em] text-primary font-medium block mb-2">
            (Dashboard)
          </span>
          <h1 className="text-3xl font-[Inter_Tight] font-bold tracking-tight">Organization</h1>
        </div>
        <Link to="/app/templates">
          <Button className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90">
            + New Signature
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <MetricCard label="Signatures Saved" value={String(signatures.length)} />
        <MetricCard label="Active" value={String(active)} />
        <MetricCard label="Templates Available" value="30" />
      </div>

      <div className="bg-white ring-1 ring-black/5 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <h2 className="font-[Inter_Tight] font-bold tracking-tight">Your Signatures</h2>
          <span className="text-[10px] font-[JetBrains_Mono] text-muted-foreground uppercase tracking-widest">
            {signatures.length} total
          </span>
        </div>
        {signatures.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="text-muted-foreground mb-4">No signatures yet.</p>
            <Link to="/app/templates">
              <Button>Create your first signature</Button>
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {signatures.map((sig) => {
              const tmpl = getTemplate(sig.templateId);
              return (
                <div key={sig.id} className="px-6 py-5 flex items-center justify-between hover:bg-secondary/30 transition-colors group">
                  <Link to="/app/editor/$id" params={{ id: sig.id }} className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="h-10 w-1 bg-primary rounded-full" />
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{sig.name}</p>
                      <p className="text-[10px] font-[JetBrains_Mono] text-muted-foreground uppercase tracking-tighter">
                        {sig.id} · {tmpl?.name ?? sig.templateId} · {new Date(sig.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </Link>
                  <div className="flex items-center gap-4">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-[JetBrains_Mono] ${
                        sig.status === "Active" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {sig.status.toUpperCase()}
                    </span>
                    <button
                      onClick={() => confirm(`Delete "${sig.name}"?`) && deleteSignature(sig.id)}
                      className="text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
                      aria-label="Delete"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white ring-1 ring-black/5 p-6 rounded-xl">
      <p className="text-[10px] font-[JetBrains_Mono] text-muted-foreground uppercase tracking-widest mb-2">{label}</p>
      <p className="text-3xl font-[Inter_Tight] font-bold tracking-tight">{value}</p>
    </div>
  );
}
