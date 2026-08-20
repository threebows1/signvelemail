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
  Share2, 
  Download,
  Mail
} from "lucide-react";

export const Route = createFileRoute("/app/editor/$id/")({
  component: EditorPage,
});

function EditorPage() {
  const { id } = useParams({ from: "/app/editor/$id" });
  const [sig, setSig] = useState<SavedSignature | null>(null);

  useEffect(() => {
    getSignature(id).then((s) => setSig(s || null));
  }, [id]);

  if (!sig) return null;

  const template = templates.find((t) => t.id === sig.templateId) || templates[0];

  return (
    <div className="flex h-full overflow-hidden bg-[#FDFCFB]">
      {/* Left Sidebar: Settings / Forms */}
      <aside className="w-[420px] border-r border-[#EFEBE6] bg-white flex flex-col shrink-0 shadow-sm">
        <header className="p-6 border-b border-[#EFEBE6] flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-[#14121F]">{sig.name}</h2>
            <div className="flex items-center gap-4 mt-1">
              <button className="text-[11px] font-semibold text-[#9E958F] hover:text-[#F38121] flex items-center gap-1">
                <RotateCcw size={12} /> Undo
              </button>
              <button className="text-[11px] font-semibold text-[#9E958F] hover:text-[#F38121] flex items-center gap-1">
                <RotateCw size={12} /> Redo
              </button>
            </div>
          </div>
          <div className="flex items-center gap-1 text-[#00E5A0]">
            <Check size={16} strokeWidth={3} />
            <span className="text-[10px] font-bold uppercase tracking-wider">Saved</span>
          </div>
        </header>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          <section>
            <h3 className="text-sm font-bold text-[#14121F] mb-4">Templates</h3>
            <div className="space-y-4">
              <p className="text-[12px] text-[#9E958F] leading-relaxed">
                Choose a base layout for your signature, or upload your own custom HTML template.
              </p>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-widest text-[#9E958F]">
                  <span>Custom HTML Templates</span>
                  <span className="text-[#F38121]">1 Remaining</span>
                </div>
                <Button variant="outline" className="w-full border-[#F38121] text-[#F38121] hover:bg-[#FFF4EB] border-dashed rounded-xl h-12 font-bold">
                  Add Custom Template
                </Button>
              </div>

              <div className="space-y-4 mt-8">
                <h4 className="text-[11px] font-bold uppercase tracking-widest text-[#9E958F]">Base Templates</h4>
                <div className="space-y-3">
                  {templates.slice(0, 6).map((t) => (
                    <div 
                      key={t.id}
                      onClick={() => setSig({ ...sig, templateId: t.id })}
                      className={`relative cursor-pointer p-4 rounded-2xl border-2 transition-all group ${
                        sig.templateId === t.id 
                          ? "border-[#F38121] bg-white shadow-md shadow-[#F38121]/5" 
                          : "border-[#EFEBE6] bg-[#FDFCFB] hover:border-[#F38121]/30"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`size-4 rounded-full border-2 flex items-center justify-center ${
                          sig.templateId === t.id ? "border-[#F38121]" : "border-[#CDC8C3]"
                        }`}>
                          {sig.templateId === t.id && <div className="size-2 rounded-full bg-[#F38121]" />}
                        </div>
                        <span className="text-sm font-bold text-[#4A443F]">{t.name}</span>
                      </div>
                      <div className="mt-3 opacity-40 grayscale group-hover:grayscale-0 group-hover:opacity-100 transition-all scale-75 origin-left pointer-events-none">
                         {renderSignature(t, sig.data)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>

        <footer className="p-6 border-t border-[#EFEBE6] flex items-center justify-between text-[11px] text-[#9E958F] font-semibold">
          <div className="flex gap-4">
            <a href="#" className="hover:text-[#F38121]">Documentation</a>
            <a href="#" className="hover:text-[#F38121]">Contact</a>
            <a href="#" className="hover:text-[#F38121]">Legal</a>
          </div>
          <a href="#" className="hover:text-[#F38121]">Donate</a>
        </footer>
      </aside>

      {/* Right Content: Preview Area */}
      <main className="flex-1 flex flex-col bg-[#F9F7F5] overflow-hidden">
        <header className="h-[72px] px-8 bg-white border-b border-[#EFEBE6] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-[#9E958F] hover:text-[#4A443F] cursor-pointer flex items-center gap-1 uppercase tracking-widest">
              Knowledge Base <ChevronRight size={14} className="rotate-90" />
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="rounded-full border-[#EFEBE6] text-[#4A443F] font-bold px-5 hover:bg-[#FDFCFB]">
              Publish Changes
            </Button>
            <Button variant="outline" className="rounded-full border-[#EFEBE6] text-[#4A443F] font-bold px-5 hover:bg-[#FDFCFB]">
              Share
            </Button>
            <Button className="rounded-full bg-[#F38121] hover:bg-[#E6751B] text-white font-bold px-6">
              Install Signature
            </Button>
            <div className="size-10 rounded-full bg-[#FFF4EB] text-[#F38121] flex items-center justify-center font-bold text-sm ml-2 border border-[#F38121]/10">
              KR
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-12 flex flex-col items-center">
          <div className="w-full max-w-[800px] bg-white rounded-2xl shadow-sm border border-[#EFEBE6] overflow-hidden">
            {/* Fake Email Header */}
            <div className="px-8 py-6 border-b border-[#EFEBE6] space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-[#9E958F]">To:</span>
                <span className="text-sm text-[#CDC8C3]">Your Recipient</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-[#9E958F]">Subject:</span>
                <span className="text-sm text-[#4A443F]">Check out my new Email Signature</span>
              </div>
            </div>

            {/* Signature Content Area */}
            <div className="p-12 min-h-[400px]">
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                {renderSignature(template, sig.data)}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
