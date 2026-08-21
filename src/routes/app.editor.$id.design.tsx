import { createFileRoute, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getSignature, saveSignature, type SavedSignature } from "@/lib/signature-store";
import { Check, RotateCcw, RotateCw, Palette } from "lucide-react";

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
    <div className="flex flex-col h-full bg-white">
      <header className="p-6 border-b border-[#EFEBE6] flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-xl font-bold text-[#14121F]">Design</h2>
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
          <div className="flex items-center gap-2 mb-2">
            <Palette size={16} className="text-[#F38121]" />
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-[#4A443F]">Colors</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {colors.map((c) => (
              <div key={c.key} className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-[#9E958F]">
                  {c.label}
                </label>
                <div className="flex items-center gap-2 p-2 bg-[#F9F7F5] border border-[#EFEBE6] rounded-xl">
                  <input
                    type="color"
                    value={(sig.data as any)[c.key]}
                    onChange={(e) => handleUpdate(c.key, e.target.value)}
                    className="size-8 rounded-lg border-0 bg-transparent cursor-pointer"
                  />
                  <span className="text-xs font-mono font-bold text-[#4A443F] uppercase">
                    {(sig.data as any)[c.key]}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-[11px] font-bold uppercase tracking-widest text-[#4A443F]">Typography</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-[#9E958F]">Font Family</label>
              <select 
                value={sig.data.fontFamily}
                onChange={(e) => handleUpdate("fontFamily", e.target.value)}
                className="w-full h-11 px-4 bg-[#F9F7F5] border-[#EFEBE6] rounded-xl text-sm font-medium text-[#4A443F]"
              >
                <option value="Rubik, Arial, sans-serif">Rubik</option>
                <option value="Inter, system-ui, sans-serif">Inter</option>
                <option value="Instrument Serif, serif">Instrument Serif</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-[#9E958F]">Font Size</label>
                <input 
                  type="number" 
                  value={sig.data.fontSize} 
                  onChange={(e) => handleUpdate("fontSize", Number(e.target.value))}
                  className="w-full h-11 px-4 bg-[#F9F7F5] border-[#EFEBE6] rounded-xl text-sm font-medium" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-[#9E958F]">Line Height</label>
                <input 
                  type="number" 
                  step="0.1"
                  value={sig.data.lineHeight} 
                  onChange={(e) => handleUpdate("lineHeight", Number(e.target.value))}
                  className="w-full h-11 px-4 bg-[#F9F7F5] border-[#EFEBE6] rounded-xl text-sm font-medium" 
                />
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
