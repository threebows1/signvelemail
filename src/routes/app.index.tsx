import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { deleteSignature, saveSignature, useSignatures, newSignatureId, type SavedSignature } from "@/lib/signature-store";
import { getTemplate, renderSignature } from "@/components/signatures/templates";
import { Copy, Link2, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/")({
  component: Dashboard,
});

function Dashboard() {
  const { list: signatures } = useSignatures();
  const navigate = useNavigate();
  const active = signatures.filter((s: SavedSignature) => s.status === "Active").length;
  const [renaming, setRenaming] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");

  async function copySignatureHtml(sig: SavedSignature) {
    // Render template to HTML string via a hidden container
    const container = document.createElement("div");
    container.style.position = "fixed";
    container.style.left = "-99999px";
    document.body.appendChild(container);
    const { createRoot } = await import("react-dom/client");
    const tmpl = getTemplate(sig.templateId);
    if (!tmpl) return;
    const root = createRoot(container);
    root.render(renderSignature(tmpl, sig.data) as any);
    await new Promise((r) => setTimeout(r, 100));
    try {
      const html = container.innerHTML;
      const blob = new Blob([html], { type: "text/html" });
      const text = new Blob([container.innerText], { type: "text/plain" });
      await navigator.clipboard.write([new ClipboardItem({ "text/html": blob, "text/plain": text })]);
      toast.success("Signature copied — paste into your email client");
    } catch {
      toast.error("Copy failed. Try opening the editor to export.");
    } finally {
      root.unmount();
      container.remove();
    }
  }

  function copyShareLink(sig: SavedSignature) {
    const url = `${window.location.origin}/app/editor/${sig.id}`;
    navigator.clipboard.writeText(url).then(
      () => toast.success("Share link copied"),
      () => toast.error("Couldn't copy link"),
    );
  }

  async function duplicate(sig: SavedSignature) {
    const copy: SavedSignature = {
      ...sig,
      id: newSignatureId(),
      name: `${sig.name} (Copy)`,
      status: "Draft",
      updatedAt: Date.now(),
      data: { ...sig.data },
    };
    await saveSignature(copy);
    toast.success("Signature duplicated");
  }

  async function commitRename(sig: SavedSignature) {
    if (renameValue.trim()) {
      await saveSignature({ ...sig, name: renameValue.trim(), updatedAt: Date.now() });
      toast.success("Renamed");
    }
    setRenaming(null);
  }

  return (
    <div className="p-8 md:p-12 max-w-6xl">
      <div className="flex items-center justify-between mb-12">
        <div>
          <span className="font-[JetBrains_Mono] text-[10px] uppercase tracking-[0.2em] text-primary font-medium block mb-2">
            (Dashboard)
          </span>
          <h1 className="text-3xl font-[Inter_Tight] font-bold tracking-tight">Organization</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <MetricCard label="Signatures Saved" value={String(signatures.length)} />
        <MetricCard label="Active" value={String(active)} />
        <MetricCard label="Templates Available" value="31" />
      </div>

      <div className="bg-white ring-1 ring-black/5 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <h2 className="font-[Inter_Tight] font-bold tracking-tight">Your Signatures</h2>
          <span className="text-[10px] font-[JetBrains_Mono] text-muted-foreground uppercase tracking-widest">
            {signatures.length} total
          </span>
        </div>

        <div className="p-6">
          <button
            onClick={() => navigate({ to: "/app/templates" })}
            className="w-full group relative overflow-hidden rounded-2xl border-2 border-dashed border-primary/40 bg-gradient-to-br from-primary/5 via-primary/[0.02] to-accent/5 hover:border-primary hover:from-primary/10 hover:to-accent/10 transition-all py-10 flex flex-col items-center justify-center gap-3"
          >
            <div className="size-14 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <Plus className="size-7" strokeWidth={2.5} />
            </div>
            <div className="text-center">
              <p className="font-[Inter_Tight] font-bold text-xl tracking-tight">Create New Signature</p>
              <p className="text-sm text-muted-foreground mt-1">Pick from 31 templates or start from scratch</p>
            </div>
          </button>
        </div>

        {signatures.length === 0 ? (
          <div className="px-6 pb-12 text-center">
            <p className="text-muted-foreground text-sm">No signatures yet — click above to create your first.</p>
          </div>
        ) : (
          <div className="divide-y divide-border border-t border-border">
            {signatures.map((sig) => {
              const tmpl = getTemplate(sig.templateId);
              const isRenaming = renaming === sig.id;
              return (
                <div key={sig.id} className="px-6 py-4 flex items-center justify-between hover:bg-secondary/30 transition-colors group gap-4">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="h-10 w-1 bg-primary rounded-full" />
                    <div className="min-w-0 flex-1">
                      {isRenaming ? (
                        <input
                          autoFocus
                          value={renameValue}
                          onChange={(e) => setRenameValue(e.target.value)}
                          onBlur={() => commitRename(sig)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") commitRename(sig);
                            if (e.key === "Escape") setRenaming(null);
                          }}
                          className="font-medium text-sm bg-white border border-primary rounded px-2 py-0.5 w-full"
                        />
                      ) : (
                        <Link to="/app/editor/$id" params={{ id: sig.id }} className="font-medium text-sm truncate hover:text-primary block">
                          {sig.name}
                        </Link>
                      )}
                      <p className="text-[10px] font-[JetBrains_Mono] text-muted-foreground uppercase tracking-tighter">
                        {sig.id} · {tmpl?.name ?? sig.templateId} · {new Date(sig.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-[JetBrains_Mono] mr-2 ${
                        sig.status === "Active" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {sig.status.toUpperCase()}
                    </span>
                    <IconBtn label="Rename" onClick={() => { setRenaming(sig.id); setRenameValue(sig.name); }}>
                      <Pencil className="size-4" />
                    </IconBtn>
                    <IconBtn label="Copy signature" onClick={() => copySignatureHtml(sig)}>
                      <Copy className="size-4" />
                    </IconBtn>
                    <IconBtn label="Copy share link" onClick={() => copyShareLink(sig)}>
                      <Link2 className="size-4" />
                    </IconBtn>
                    <IconBtn label="Duplicate" onClick={() => duplicate(sig)}>
                      <Plus className="size-4" />
                    </IconBtn>
                    <IconBtn
                      label="Delete"
                      danger
                      onClick={async () => {
                        if (confirm(`Delete "${sig.name}"?`)) {
                          await deleteSignature(sig.id);
                          toast.success("Signature deleted");
                        }
                      }}
                    >
                      <Trash2 className="size-4" />
                    </IconBtn>
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

function IconBtn({
  children,
  onClick,
  label,
  danger,
}: {
  children: React.ReactNode;
  onClick: () => void;
  label: string;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className={`p-2 rounded hover:bg-secondary transition-colors ${
        danger ? "text-muted-foreground hover:text-destructive" : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {children}
    </button>
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
