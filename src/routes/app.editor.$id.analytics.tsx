import { createFileRoute, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getSignature, type SavedSignature } from "@/lib/signature-store";
import { Check, RotateCcw, RotateCw, BarChart3, TrendingUp, Users, MousePointer2 } from "lucide-react";

export const Route = createFileRoute("/app/editor/$id/analytics")({
  component: EditorAnalyticsPage,
});

function EditorAnalyticsPage() {
  const { id } = useParams({ from: "/app/editor/$id/analytics" });
  const [sig, setSig] = useState<SavedSignature | null>(null);

  useEffect(() => {
    getSignature(id).then((s) => setSig(s || null));
  }, [id]);

  if (!sig) return null;

  const stats = [
    { label: "Total Views", value: "1,284", icon: Users, change: "+12%" },
    { label: "Link Clicks", value: "342", icon: MousePointer2, change: "+5%" },
    { label: "CTR", value: "26.6%", icon: TrendingUp, change: "+2%" },
  ];

  return (
    <div className="flex flex-col h-full bg-white">
      <header className="p-6 border-b border-[#EFEBE6] flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-xl font-bold text-[#14121F]">Analytics</h2>
          <div className="flex items-center gap-4 mt-1">
            <button className="text-[11px] font-bold text-[#9E958F] hover:text-[#F38121] flex items-center gap-1 uppercase tracking-wider transition-colors">
              <RotateCcw size={12} /> Undo
            </button>
            <button className="text-[11px] font-bold text-[#9E958F] hover:text-[#F38121] flex items-center gap-1 uppercase tracking-wider transition-colors">
              <RotateCw size={12} /> Redo
            </button>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[#00E5A0] bg-[#00E5A0]/5">
          <Check size={14} strokeWidth={3} />
          <span className="text-[10px] font-bold uppercase tracking-widest">Live</span>
        </div>
      </header>
      
      <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-hide">
        <section className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 size={16} className="text-[#F38121]" />
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-[#4A443F]">Performance Overview</h3>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            {stats.map((stat) => (
              <div key={stat.label} className="p-5 bg-[#F9F7F5] border border-[#EFEBE6] rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="size-10 rounded-xl bg-white border border-[#EFEBE6] flex items-center justify-center text-[#F38121]">
                    <stat.icon size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#9E958F]">{stat.label}</p>
                    <p className="text-xl font-bold text-[#14121F]">{stat.value}</p>
                  </div>
                </div>
                <div className="text-[11px] font-bold text-[#00E5A0] bg-[#00E5A0]/10 px-2 py-1 rounded-lg">
                  {stat.change}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 p-6 bg-[#14121F] rounded-2xl text-white space-y-4">
            <h4 className="text-sm font-bold">Pro Analytics</h4>
            <p className="text-xs text-white/60 leading-relaxed">
              Upgrade to Pro to see detailed heatmap data, device breakdown, and geographic insights for your signature.
            </p>
            <button className="w-full py-3 bg-[#F38121] hover:bg-[#E6751B] rounded-xl text-xs font-bold uppercase tracking-widest transition-all">
              Upgrade Now
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
