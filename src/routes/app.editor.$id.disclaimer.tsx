import { createFileRoute, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getSignature, saveSignature, type SavedSignature } from "@/lib/signature-store";
import { Check, RotateCcw, RotateCw, ShieldAlert } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

export const Route = createFileRoute("/app/editor/$id/disclaimer")({
  component: EditorDisclaimerPage,
});

function EditorDisclaimerPage() {
  const { id } = useParams({ from: "/app/editor/$id/disclaimer" });
  const [sig, setSig] = useState<SavedSignature | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    getSignature(id).then((s) => setSig(s || null));
  }, [id]);

  if (!sig) return null;

  const handleUpdate = async (key: string, value: any) => {
    const updated = {
      ...sig,
      data: { ...sig.data, [key]: value },
      updatedAt: Date.now()
    };
    setSig(updated);
    setIsSaving(true);
    await saveSignature(updated);
    setIsSaving(false);
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <header className="p-6 border-b border-[#EFEBE6] flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-xl font-bold text-[#14121F]">Disclaimer</h2>
          <div className="flex items-center gap-4 mt-1">
            <button className="text-[11px] font-bold text-[#9E958F] hover:text-[#F38121] flex items-center gap-1 uppercase tracking-wider transition-colors">
              <RotateCcw size={12} /> Undo
            </button>
            <button className="text-[11px] font-bold text-[#9E958F] hover:text-[#F38121] flex items-center gap-1 uppercase tracking-wider transition-colors">
              <RotateCw size={12} /> Redo
            </button>
          </div>
        </div>
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full transition-all duration-300 ${
          isSaving ? "text-[#9E958F] bg-[#F9F7F5]" : "text-[#00E5A0] bg-[#00E5A0]/5"
        }`}>
          <Check size={14} strokeWidth={3} className={isSaving ? "animate-pulse" : ""} />
          <span className="text-[10px] font-bold uppercase tracking-widest">{isSaving ? "Saving..." : "Saved"}</span>
        </div>
      </header>
      
      <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-hide">
        <section className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-[#F9F7F5] border border-[#EFEBE6] rounded-2xl">
            <div className="space-y-0.5">
              <h3 className="text-sm font-bold text-[#4A443F]">Enable Disclaimer</h3>
              <p className="text-[11px] text-[#9E958F] font-medium uppercase tracking-wider">Show legal text in signature</p>
            </div>
            <Switch 
              checked={sig.data.showDisclaimer}
              onCheckedChange={(val) => handleUpdate("showDisclaimer", val)}
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <ShieldAlert size={16} className="text-[#F38121]" />
              <h3 className="text-[11px] font-bold uppercase tracking-widest text-[#4A443F]">Legal Text</h3>
            </div>
            <Textarea
              value={sig.data.disclaimer || ""}
              onChange={(e) => handleUpdate("disclaimer", e.target.value)}
              placeholder="Enter legal disclaimer text..."
              className="min-h-[200px] bg-[#F9F7F5] border-[#EFEBE6] rounded-xl focus-visible:ring-[#F38121]/20 focus-visible:border-[#F38121] text-sm leading-relaxed"
            />
          </div>
        </section>
      </div>
    </div>
  );
}
