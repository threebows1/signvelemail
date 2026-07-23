import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/app/")({
  component: Dashboard,
});

function Dashboard() {
  const signatures = [
    { id: "SIG-082", name: "Executive Minimalist", status: "Active", usage: "12 members", date: "Oct 12, 2024" },
    { id: "SIG-041", name: "Support Mono", status: "Draft", usage: "3 members", date: "Oct 14, 2024" },
    { id: "SIG-099", name: "Sales Showcase", status: "Active", usage: "45 members", date: "Oct 18, 2024" },
  ];

  return (
    <div className="p-8 md:p-12 max-w-6xl">
      <div className="flex items-center justify-between mb-12">
        <div>
          <span className="font-[JetBrains_Mono] text-[10px] uppercase tracking-[0.2em] text-primary font-medium block mb-2">
            (Dashboard)
          </span>
          <h1 className="text-3xl font-[Inter_Tight] font-bold tracking-tight">Organization</h1>
        </div>
        <Link to="/app/editor/new">
          <Button className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90">
            + New Signature
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <MetricCard label="Active Signatures" value="8" />
        <MetricCard label="Team Members" value="238" />
        <MetricCard label="Brand Score" value="94" />
      </div>

      <div className="bg-white ring-1 ring-black/5 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <h2 className="font-[Inter_Tight] font-bold tracking-tight">Recent Signatures</h2>
          <span className="text-[10px] font-[JetBrains_Mono] text-muted-foreground uppercase tracking-widest">Sort by Date</span>
        </div>
        <div className="divide-y divide-border">
          {signatures.map((sig) => (
            <div
              key={sig.id}
              className="px-6 py-5 flex items-center justify-between hover:bg-secondary/30 transition-colors group"
            >
              <div className="flex items-center gap-4">
                <div className="h-10 w-1 bg-primary rounded-full" />
                <div>
                  <p className="font-medium text-sm">{sig.name}</p>
                  <p className="text-[10px] font-[JetBrains_Mono] text-muted-foreground uppercase tracking-tighter">
                    {sig.id} · {sig.date}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <span className="text-xs text-muted-foreground">{sig.usage}</span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded font-[JetBrains_Mono] ${
                    sig.status === "Active"
                      ? "bg-primary/10 text-primary"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {sig.status.toUpperCase()}
                </span>
                <Link to="/app/editor/$id" params={{ id: sig.id }}>
                  <button className="text-xs text-muted-foreground hover:text-primary transition-colors opacity-0 group-hover:opacity-100">
                    Edit
                  </button>
                </Link>
              </div>
            </div>
          ))}
        </div>
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
