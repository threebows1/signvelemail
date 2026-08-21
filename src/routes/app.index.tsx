import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Plus, LayoutTemplate, Copy, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSignatures, newSignatureId, saveSignature, defaultData, type SavedSignature } from "@/lib/signature-store";
import { templates, renderSignature } from "@/components/signatures/templates";
import { FitPreview } from "@/components/signatures/FitPreview";
import { toast } from "sonner";
import { useState } from "react";

export const Route = createFileRoute("/app/")({
  component: Dashboard,
});

function Dashboard() {
  const { list, loading } = useSignatures();
  const navigate = useNavigate();
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    setCreating(true);
    const id = newSignatureId();
    const sig: SavedSignature = {
      id,
      name: "Untitled Signature",
      templateId: "al-riyady",
      status: "Draft",
      updatedAt: Date.now(),
      data: { ...defaultData },
    };
    
    const res = await saveSignature(sig);
    if (res.ok) {
      navigate({ to: "/app/editor/$id", params: { id } });
    } else {
      toast.error("Failed to create signature");
    }
    setCreating(false);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto font-[Inter_Tight]">
      <header className="flex justify-between items-end mb-10">
        <div>
          <span className="font-[JetBrains_Mono] text-[10px] uppercase tracking-[0.2em] text-[#F38121] font-bold block mb-2">
            Workplace
          </span>
          <h1 className="text-3xl font-bold tracking-tight text-[#14121F]">Email Signatures</h1>
        </div>
        <Button 
          onClick={handleCreate} 
          disabled={creating}
          className="bg-[#F38121] hover:bg-[#E6751B] text-white rounded-full px-6 gap-2"
        >
          {creating ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
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
        <div className="bg-white border border-[#EFEBE6] rounded-2xl p-16 text-center shadow-sm">
          <div className="size-16 bg-[#FDFCFB] rounded-2xl flex items-center justify-center mx-auto mb-6 text-[#9E958F] border border-[#EFEBE6]">
            <LayoutTemplate size={32} />
          </div>
          <h2 className="text-xl font-bold text-[#14121F]">No signatures yet</h2>
          <p className="text-[#9E958F] mt-2 mb-8 max-w-sm mx-auto">
            Create your first professional email signature using our library of templates.
          </p>
          <Button 
            onClick={handleCreate} 
            disabled={creating}
            className="bg-[#F38121] hover:bg-[#E6751B] text-white rounded-full px-8"
          >
            {creating ? "Creating..." : "Get Started"}
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {list.slice(0, 1).map((sig) => (
            <SignatureCard key={sig.id} sig={sig} />
          ))}
        </div>
      )}
    </div>
  );
}

function SignatureCard({ sig }: { sig: SavedSignature }) {
  const navigate = useNavigate();
  const template = templates.find(t => t.id === sig.templateId) || templates[0];

  const handleEdit = () => {
    navigate({ to: "/app/editor/$id", params: { id: sig.id } });
  };

  return (
    <div className="group bg-white border border-[#EFEBE6] rounded-2xl overflow-hidden hover:border-[#F38121]/30 hover:shadow-xl hover:shadow-[#F38121]/5 transition-all font-[Inter_Tight]">
      <div className="relative h-[220px] bg-white p-6 flex items-center justify-center border-b border-[#EFEBE6]">
        <div className="w-full h-full overflow-hidden bg-white rounded-xl shadow-sm border border-[#EFEBE6] flex items-center justify-center p-2">
          <FitPreview max={0.8} padding={12}>
            {renderSignature(template, sig.data)}
          </FitPreview>
        </div>
        <div className="absolute inset-0 bg-[#14121F]/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
          <Button size="sm" variant="secondary" onClick={handleEdit} className="rounded-full font-semibold px-5">Edit</Button>
          <Button size="sm" variant="secondary" className="rounded-full font-semibold px-5">Install</Button>
        </div>
      </div>
      <div className="p-5 flex items-center justify-between">
        <div>
          <h3 className="font-bold text-[#14121F] truncate max-w-[180px] text-sm tracking-tight">{sig.name}</h3>
          <p className="text-[10px] text-[#9E958F] font-semibold uppercase tracking-widest mt-1">
            Last edited {new Date(sig.updatedAt).toLocaleDateString()}
          </p>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button className="p-2.5 text-[#9E958F] hover:text-[#F38121] rounded-xl hover:bg-[#FFF4EB] transition-colors" title="Duplicate">
            <Copy size={16} />
          </button>
          <button className="p-2.5 text-[#9E958F] hover:text-destructive rounded-xl hover:bg-destructive/5 transition-colors" title="Delete">
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
