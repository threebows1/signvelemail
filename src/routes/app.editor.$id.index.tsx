import { createFileRoute, useParams, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getSignature, saveSignature, type SavedSignature } from "@/lib/signature-store";
import { templates, renderSignature } from "@/components/signatures/templates";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { 
  ChevronLeft, 
  ChevronRight, 
  RotateCcw, 
  RotateCw, 
  Check, 
  Search,
  Plus
} from "lucide-react";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/app/editor/$id/")({
  component: EditorPage,
});

function EditorPage() {
  const { id } = useParams({ from: "/app/editor/$id" });
  const [sig, setSig] = useState<SavedSignature | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    getSignature(id).then((s) => setSig(s || null));
  }, [id]);

  if (!sig) return null;

  const template = templates.find((t) => t.id === sig.templateId) || templates[0];

  const filteredTemplates = templates.filter(t => 
    t.name.toLowerCase().includes(search.toLowerCase()) || 
    t.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleTemplateSelect = async (templateId: string) => {
    const updated = { ...sig, templateId, updatedAt: Date.now() };
    setSig(updated);
    await saveSignature(updated);
  };

  return (
    <div className="flex h-full overflow-hidden bg-white font-[Inter_Tight]">
      {/* Left Sidebar: Forms/Settings (Templates view by default) */}
      <aside className="w-[420px] border-r border-[#EFEBE6] bg-white flex flex-col shrink-0 shadow-sm z-20">
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
          <div className="flex items-center gap-1.5 text-[#00E5A0] bg-[#00E5A0]/5 px-2.5 py-1 rounded-full">
            <Check size={14} strokeWidth={3} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Saved</span>
          </div>
        </header>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-hide">
          <section>
            <div className="space-y-4">
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
                
                <div className="grid grid-cols-1 gap-4">
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
                        <span className="text-[9px] font-bold uppercase tracking-wider text-[#9E958F] opacity-0 group-hover:opacity-100 transition-opacity">
                          {t.category}
                        </span>
                      </div>
                      <div className="mt-2 opacity-60 grayscale-[0.5] group-hover:grayscale-0 group-hover:opacity-100 transition-all scale-[0.6] origin-top-left pointer-events-none border border-[#EFEBE6] p-2 rounded-lg bg-white">
                         {renderSignature(t, sig.data)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>

        <footer className="p-6 border-t border-[#EFEBE6] flex items-center justify-between text-[11px] text-[#9E958F] font-bold uppercase tracking-wider">
          <div className="flex gap-5">
            <a href="#" className="hover:text-[#F38121] transition-colors">Help</a>
            <a href="#" className="hover:text-[#F38121] transition-colors">Terms</a>
          </div>
          <div className="flex items-center gap-1.5 text-[#F38121]">
            <Plus size={12} strokeWidth={3} />
            <a href="#" className="hover:underline">Custom Template</a>
          </div>
        </footer>
      </aside>

      {/* Right Content: Sticky Preview Area */}
      <main className="flex-1 flex flex-col bg-[#F9F7F5] overflow-hidden relative">
        <header className="h-[72px] px-8 bg-white border-b border-[#EFEBE6] flex items-center justify-between shrink-0 z-10 shadow-sm">
          <div className="flex items-center gap-3">
            <Link to="/app" className="p-2 -ml-2 text-[#9E958F] hover:text-[#4A443F] hover:bg-[#F9F7F5] rounded-xl transition-all">
              <ChevronLeft size={20} />
            </Link>
            <div className="h-4 w-px bg-[#EFEBE6]" />
            <span className="text-xs font-bold text-[#9E958F] flex items-center gap-1 uppercase tracking-[0.1em]">
              Draft <ChevronRight size={14} className="text-[#CDC8C3]" /> 
              <span className="text-[#4A443F]">{sig.name}</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" className="rounded-full text-[#4A443F] font-bold px-5 hover:bg-[#F9F7F5]">
              Share
            </Button>
            <Button className="rounded-full bg-[#F38121] hover:bg-[#E6751B] text-white font-bold px-6 shadow-lg shadow-[#F38121]/20">
              Install Signature
            </Button>
            <div className="size-10 rounded-full bg-[#FFF4EB] text-[#F38121] flex items-center justify-center font-bold text-sm ml-2 border border-[#F38121]/10 cursor-pointer hover:bg-[#F38121] hover:text-white transition-all">
              AV
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-12 flex flex-col items-center scrollbar-hide">
          <div className="w-full max-w-[800px] bg-white rounded-3xl shadow-2xl shadow-[#14121F]/5 border border-[#EFEBE6] overflow-hidden animate-in fade-in zoom-in-95 duration-700">
            {/* Fake Email Header */}
            <div className="px-10 py-8 border-b border-[#F9F7F5] bg-[#FDFCFB]/50">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="text-[13px] font-bold text-[#9E958F] w-12">To</span>
                  <div className="flex-1 h-8 bg-[#F9F7F5] rounded-lg border border-[#EFEBE6] px-3 flex items-center">
                    <span className="text-[13px] text-[#4A443F] font-medium">Your Recipient</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[13px] font-bold text-[#9E958F] w-12">Subject</span>
                  <div className="flex-1 h-8 bg-[#F9F7F5] rounded-lg border border-[#EFEBE6] px-3 flex items-center">
                    <span className="text-[13px] text-[#14121F] font-bold">Check out my new Email Signature</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Signature Content Area */}
            <div className="p-16 min-h-[460px] flex flex-col justify-start">
              <div className="w-full h-px bg-gradient-to-r from-transparent via-[#EFEBE6] to-transparent mb-16 opacity-50" />
              <div className="transition-all duration-500 ease-in-out">
                {renderSignature(template, sig.data)}
              </div>
            </div>
          </div>
          
          <div className="mt-12 text-center max-w-md">
            <p className="text-[13px] text-[#CDC8C3] font-medium leading-relaxed">
              This is a live preview of how your signature will appear in most email clients. 
              Some variations may occur depending on the recipient's software.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
