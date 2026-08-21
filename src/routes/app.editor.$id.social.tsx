import { createFileRoute, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getSignature, saveSignature, type SavedSignature, ALL_SOCIAL_KEYS, type SocialKey } from "@/lib/signature-store";
import { Check, RotateCcw, RotateCw, Share2 } from "lucide-react";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/app/editor/$id/social")({
  component: EditorSocialPage,
});

function EditorSocialPage() {
  const { id } = useParams({ from: "/app/editor/$id/social" });
  const [sig, setSig] = useState<SavedSignature | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    getSignature(id).then((s) => setSig(s || null));
  }, [id]);

  if (!sig) return null;

  const handleUpdate = async (key: SocialKey, value: string) => {
    const updated = {
      ...sig,
      data: { 
        ...sig.data, 
        socials: { ...sig.data.socials, [key]: value } 
      },
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
          <h2 className="text-xl font-bold text-[#14121F]">Social Links</h2>
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
      
      <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
        <p className="text-[13px] text-[#9E958F] leading-relaxed font-medium">
          Add your social media profiles to the signature. Leave empty to hide the icon.
        </p>
        
        <div className="space-y-4">
          {ALL_SOCIAL_KEYS.map((key) => (
            <div key={key} className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-widest text-[#9E958F] flex items-center gap-2">
                <Share2 size={12} className="text-[#F38121]" />
                {key}
              </label>
              <Input
                value={sig.data.socials[key] || ""}
                onChange={(e) => handleUpdate(key, e.target.value)}
                placeholder={`https://${key}.com/yourname`}
                className="h-11 bg-[#F9F7F5] border-[#EFEBE6] rounded-xl focus-visible:ring-[#F38121]/20 focus-visible:border-[#F38121]"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
