import { createFileRoute, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getSignature, saveSignature, type SavedSignature } from "@/lib/signature-store";
import { Check, Palette, Type } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";

export const Route = createFileRoute("/app/editor/$id/design")({
  component: EditorDesignPage,
});

function EditorDesignPage() {
  const { id } = useParams({ from: "/app/editor/$id/design" });
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

  const colors = [
    { label: "Primary Color", key: "primaryColor" },
    { label: "Accent Color", key: "accentColor" },
    { label: "Text Color", key: "textColor" },
    { label: "Link Color", key: "linkColor" },
  ];

  return (
    <div className="flex flex-col h-full bg-white font-[Inter_Tight]">
      <header className="px-6 py-5 border-b border-[#EFEBE6] flex items-center justify-between shrink-0">
        <h2 className="text-lg font-bold text-[#14121F]">Design</h2>
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full transition-all duration-300 ${
          isSaving ? "text-[#9E958F] bg-[#F9F7F5]" : "text-[#00E5A0] bg-[#00E5A0]/5"
        }`}>
          <Check size={14} strokeWidth={3} className={isSaving ? "animate-pulse" : ""} />
          <span className="text-[10px] font-bold uppercase tracking-widest">{isSaving ? "Saving..." : "Saved"}</span>
        </div>
      </header>
      
      <div className="flex-1 overflow-y-auto p-6 space-y-10 scrollbar-hide pb-24">
        <section className="space-y-6">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="size-6 rounded-lg bg-[#F38121]/10 flex items-center justify-center">
              <Palette size={14} className="text-[#F38121]" />
            </div>
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-[#4A443F]">Colors</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-x-6 gap-y-5">
            {colors.map((c) => (
              <div key={c.key} className="space-y-2.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-[#9E958F]">
                  {c.label}
                </label>
                <div className="flex items-center gap-3 p-2 bg-[#F9F7F5] border border-[#EFEBE6] rounded-2xl group focus-within:border-[#F38121]/30 transition-all">
                  <div className="relative size-10 rounded-xl overflow-hidden shadow-sm border border-[#EFEBE6]">
                    <input
                      type="color"
                      value={(sig.data as any)[c.key]}
                      onChange={(e) => handleUpdate(c.key, e.target.value)}
                      className="absolute inset-[-5px] size-[150%] cursor-pointer"
                    />
                  </div>
                  <span className="text-xs font-mono font-bold text-[#4A443F] uppercase tracking-wider">
                    {(sig.data as any)[c.key]}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="h-px bg-[#EFEBE6]" />

        <section className="space-y-6">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="size-6 rounded-lg bg-[#F38121]/10 flex items-center justify-center">
              <Type size={14} className="text-[#F38121]" />
            </div>
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-[#4A443F]">Typography</h3>
          </div>

          <div className="space-y-6">
            <div className="space-y-2.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-[#9E958F]">Font Family</label>
              <select 
                value={sig.data.fontFamily}
                onChange={(e) => handleUpdate("fontFamily", e.target.value)}
                className="w-full h-12 px-4 bg-[#F9F7F5] border-[#EFEBE6] rounded-2xl text-sm font-bold text-[#4A443F] focus:outline-none focus:ring-2 focus:ring-[#F38121]/20 transition-all appearance-none cursor-pointer"
              >
                <option value="Rubik, Arial, sans-serif">Rubik</option>
                <option value="Inter, system-ui, sans-serif">Inter</option>
                <option value="Instrument Serif, serif">Instrument Serif</option>
              </select>
            </div>

            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold uppercase tracking-widest text-[#9E958F]">Font Size</label>
                <span className="text-xs font-bold text-[#4A443F] bg-[#F9F7F5] px-2 py-0.5 rounded-lg border border-[#EFEBE6]">
                  {sig.data.fontSize}px
                </span>
              </div>
              <Slider 
                value={[sig.data.fontSize || 14]}
                min={10}
                max={20}
                step={1}
                onValueChange={([val]) => handleUpdate("fontSize", val)}
              />
            </div>

            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold uppercase tracking-widest text-[#9E958F]">Line Height</label>
                <span className="text-xs font-bold text-[#4A443F] bg-[#F9F7F5] px-2 py-0.5 rounded-lg border border-[#EFEBE6]">
                  {sig.data.lineHeight}
                </span>
              </div>
              <Slider 
                value={[sig.data.lineHeight || 1.3]}
                min={1}
                max={2}
                step={0.1}
                onValueChange={([val]) => handleUpdate("lineHeight", val)}
              />
            </div>
          </div>
        </section>

        <div className="h-px bg-[#EFEBE6]" />

        <section className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-[#F9F7F5] border border-[#EFEBE6] rounded-2xl">
            <div className="space-y-0.5">
              <h3 className="text-sm font-bold text-[#4A443F]">Dividing Lines</h3>
              <p className="text-[11px] text-[#9E958F] font-medium uppercase tracking-wider">Show decorative separators</p>
            </div>
            <Switch 
              checked={sig.data.showDividingLines !== false}
              onCheckedChange={(val) => handleUpdate("showDividingLines", val)}
            />
          </div>
        </section>
      </div>
    </div>
  );
}

