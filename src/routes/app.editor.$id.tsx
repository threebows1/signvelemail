import { createFileRoute, Outlet, useParams, useLocation, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getSignature, type SavedSignature } from "@/lib/signature-store";
import { Loader2 } from "lucide-react";
import { templates, renderSignature } from "@/components/signatures/templates";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

export const Route = createFileRoute("/app/editor/$id")({
  component: EditorWrapper,
});

function EditorWrapper() {
  const { id } = useParams({ from: "/app/editor/$id" });
  const [sig, setSig] = useState<SavedSignature | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSignature(id).then((s) => {
      if (s) setSig(s);
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-[#FDFCFB]">
        <Loader2 className="animate-spin text-[#F38121]" size={32} />
      </div>
    );
  }

  if (!sig) {
    return (
      <div className="h-full flex items-center justify-center bg-[#FDFCFB]">
        <p className="text-[#9E958F]">Signature not found</p>
      </div>
    );
  }

  const template = templates.find((t) => t.id === sig.templateId) || templates[0];

  return (
    <div className="flex h-full overflow-hidden bg-white font-[Inter_Tight]">
      {/* Scrollable Sidebar (Forms) */}
      <div className="w-[420px] flex flex-col shrink-0 border-r border-[#EFEBE6] bg-white z-20">
        <Outlet />
      </div>

      {/* Sticky Main Area (Preview) */}
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
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-12 flex flex-col items-center scrollbar-hide">
          <div className="w-full max-w-[800px] bg-white rounded-3xl shadow-2xl shadow-[#14121F]/5 border border-[#EFEBE6] overflow-hidden">
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
        </div>
      </main>
    </div>
  );
}
