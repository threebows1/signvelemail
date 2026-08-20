import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { Plus, LayoutTemplate, Settings as SettingsIcon, BarChart3, ChevronRight, Copy, Share2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSignatures, newSignatureId, type SavedSignature } from "@/lib/signature-store";
import { renderSignature } from "@/components/signatures/templates";
import { FitPreview } from "@/components/signatures/FitPreview";
import { toast } from "sonner";

export const Route = createFileRoute("/app/")({
  component: Dashboard,
});

function Dashboard() {
  const { list, loading } = useSignatures();

  const handleCreate = () => {
    const id = newSignatureId();
    // In the new editor, we'll navigate to /app/editor/$id
    // But since I renamed it, I'll redirect to a common spot for now
    toast.info("Creating a new signature...");
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <header className="flex justify-between items-end mb-10">
        <div>
          <span className="font-[JetBrains_Mono] text-[10px] uppercase tracking-[0.2em] text-[#F38121] font-semibold block mb-2">
            (Workplace)
          </span>
          <h1 className="text-3xl font-[Inter_Tight] font-bold tracking-tight text-[#14121F]">Email Signatures</h1>
        </div>
        <Button onClick={handleCreate} className="bg-[#F38121] hover:bg-[#E6751B] text-white rounded-full px-6 gap-2">
          <Plus size={18} />
          Create New Signature
        </Button>
      </header>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-[280px] rounded-2xl bg-[#F9F7F5] animate-pulse" />
          ))}
        </div>
      ) : list.length === 0 ? (
        <div className="bg-white border border-[#EFEBE6] rounded-2xl p-16 text-center">
          <div className="size-16 bg-[#FDFCFB] rounded-2xl flex items-center justify-center mx-auto mb-6 text-[#9E958F]">
            <LayoutTemplate size={32} />
          </div>
          <h2 className="text-xl font-bold text-[#14121F]">No signatures yet</h2>
          <p className="text-[#9E958F] mt-2 mb-8 max-w-sm mx-auto">
            Create your first professional email signature using our library of templates.
          </p>
          <Button onClick={handleCreate} className="bg-[#F38121] hover:bg-[#E6751B] text-white rounded-full px-8">
            Get Started
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {list.map((sig) => (
            <SignatureCard key={sig.id} sig={sig} />
          ))}
        </div>
      )}
    </div>
  );
}

function SignatureCard({ sig }: { sig: SavedSignature }) {
  const template = { id: sig.templateId, render: () => null } as any; // Simplified for renderSignature if needed

  return (
    <div className="group bg-white border border-[#EFEBE6] rounded-2xl overflow-hidden hover:border-[#F38121]/30 hover:shadow-lg hover:shadow-[#F38121]/5 transition-all">
      <div className="relative h-[200px] bg-[#FDFCFB] p-4 flex items-center justify-center">
        <div className="w-full h-full overflow-hidden bg-white rounded-lg shadow-sm border border-[#EFEBE6]">
          {/* We would render the signature here, but need the full template object */}
          <div className="p-4 text-[10px] text-muted-foreground flex items-center justify-center h-full italic">
            Preview: {sig.name}
          </div>
        </div>
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <Button size="sm" variant="secondary" className="rounded-full font-semibold">Edit</Button>
          <Button size="sm" variant="secondary" className="rounded-full font-semibold">Install</Button>
        </div>
      </div>
      <div className="p-4 flex items-center justify-between">
        <div>
          <h3 className="font-bold text-[#14121F]">{sig.name}</h3>
          <p className="text-[11px] text-[#9E958F] font-medium uppercase tracking-wider mt-0.5">
            {new Date(sig.updatedAt).toLocaleDateString()}
          </p>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button className="p-2 text-[#9E958F] hover:text-[#14121F] rounded-lg hover:bg-[#F9F7F5] transition-colors">
            <Copy size={16} />
          </button>
          <button className="p-2 text-[#9E958F] hover:text-destructive rounded-lg hover:bg-destructive/5 transition-colors">
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
