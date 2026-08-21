import { createFileRoute, useParams, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getSignature, saveSignature, type SavedSignature } from "@/lib/signature-store";
import { templates, renderSignature } from "@/components/signatures/templates";
import { 
  RotateCcw, 
  RotateCw, 
  Check, 
  Search,
  ArrowRight
} from "lucide-react";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/app/editor/$id/")({
  component: EditorTemplatesPage,
});

function EditorTemplatesPage() {
  const { id } = useParams({ from: "/app/editor/$id/" });
  const [sig, setSig] = useState<SavedSignature | null>(null);
  const [search, setSearch] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    getSignature(id).then((s) => setSig(s || null));
  }, [id]);

  if (!sig) return null;

  const filteredTemplates = templates.filter(t => 
    t.name.toLowerCase().includes(search.toLowerCase()) || 
    (t.category && t.category.toLowerCase().includes(search.toLowerCase()))
  );

  const handleTemplateSelect = async (templateId: string) => {
    const updated = { ...sig, templateId, updatedAt: Date.now() };
    setSig(updated);
    setIsSaving(true);
    await saveSignature(updated);
    setIsSaving(false);
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <header className="p-6 border-b border-[#EFEBE6] flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-xl font-bold text-[#14121F]">Templates</h2>
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
        <section className="space-y-4">
          <p className="text-[13px] text-[#9E958F] leading-relaxed font-medium">
            Choose a base layout for your signature. You can customize colors, fonts, and details in the next steps.
          </p>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#CDC8C3]" size={16} />
            <Input 
              placeholder="Search templates..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-11 bg-[#F9F7F5] border-[#EFEBE6] rounded-xl focus-visible:ring-[#F38121]/20 focus-visible:border-[#F38121]"
            />
          </div>

          <div className="space-y-4 mt-8">
            <div className="flex items-center justify-between">
              <h4 className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#9E958F]">Base Templates</h4>
              <span className="text-[10px] font-bold text-[#F38121] bg-[#FFF4EB] px-2 py-0.5 rounded-full">
                {filteredTemplates.length} Available
              </span>
            </div>
            
            <div className="grid grid-cols-1 gap-4 pb-8">
              {filteredTemplates.map((t) => (
                <div 
                  key={t.id}
                  onClick={() => handleTemplateSelect(t.id)}
                  className={`relative cursor-pointer p-4 rounded-2xl border-2 transition-all group overflow-hidden ${
                    sig.templateId === t.id 
                      ? "border-[#F38121] bg-white shadow-xl shadow-[#F38121]/5" 
                      : "border-[#EFEBE6] bg-[#FDFCFB] hover:border-[#F38121]/30 hover:bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`size-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                        sig.templateId === t.id ? "border-[#F38121] bg-[#F38121]" : "border-[#CDC8C3]"
                      }`}>
                        {sig.templateId === t.id && <Check size={12} className="text-white" strokeWidth={4} />}
                      </div>
                      <span className="text-sm font-bold text-[#4A443F] tracking-tight">{t.name}</span>
                    </div>
                  </div>
                  <div className="mt-2 opacity-60 grayscale-[0.5] group-hover:grayscale-0 group-hover:opacity-100 transition-all scale-[0.6] origin-top-left pointer-events-none border border-[#EFEBE6] p-2 rounded-lg bg-white">
                     {renderSignature(t, sig.data)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      <footer className="p-6 border-t border-[#EFEBE6] shrink-0">
         <Link 
          to="/app/editor/$id" 
          params={{ id }}
          hash="details"
          className="w-full bg-[#14121F] hover:bg-[#1E1B2E] text-white rounded-xl py-3.5 px-6 flex items-center justify-center gap-2 font-bold transition-all shadow-lg shadow-[#14121F]/10 group"
        >
          Personal Details
          <ArrowRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </footer>
    </div>
  );
}
