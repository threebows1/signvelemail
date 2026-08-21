import { createFileRoute, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getSignature, saveSignature, type SavedSignature, ALL_SOCIAL_KEYS, type SocialKey } from "@/lib/signature-store";
import { Check, Share2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

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

  const handleUpdate = async (updates: any) => {
    const updated = {
      ...sig,
      data: { 
        ...sig.data,
        ...updates
      },
      updatedAt: Date.now()
    };
    setSig(updated);
    setIsSaving(true);
    await saveSignature(updated);
    setIsSaving(false);
  };

  const handleSocialUpdate = async (key: SocialKey, value: string) => {
    await handleUpdate({
      socials: { ...sig.data.socials, [key]: value }
    });
  };

  return (
    <div className="flex flex-col h-full bg-white font-[Inter_Tight]">
      <header className="px-6 py-5 border-b border-[#EFEBE6] flex items-center justify-between shrink-0">
        <h2 className="text-lg font-bold text-[#14121F]">Social Media</h2>
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full transition-all duration-300 ${
          isSaving ? "text-[#9E958F] bg-[#F9F7F5]" : "text-[#00E5A0] bg-[#00E5A0]/5"
        }`}>
          <Check size={14} strokeWidth={3} className={isSaving ? "animate-pulse" : ""} />
          <span className="text-[10px] font-bold uppercase tracking-widest">{isSaving ? "Saving..." : "Saved"}</span>
        </div>
      </header>
      
      <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-hide pb-20">
        <section className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-[#F9F7F5] border border-[#EFEBE6] rounded-2xl">
            <div className="space-y-0.5">
              <h3 className="text-sm font-bold text-[#4A443F]">Enable Social Links</h3>
              <p className="text-[11px] text-[#9E958F] font-medium uppercase tracking-wider">Show icons in signature</p>
            </div>
            <Switch 
              checked={sig.data.showSocials}
              onCheckedChange={(val) => handleUpdate({ showSocials: val })}
            />
          </div>

          <div className="h-px bg-[#EFEBE6]" />

          <div className="space-y-4">
            {ALL_SOCIAL_KEYS.map((key) => (
              <div key={key} className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-[#9E958F] flex items-center gap-2">
                  <Share2 size={12} className="text-[#F38121]" />
                  {key}
                </label>
                <Input
                  value={sig.data.socials[key] || ""}
                  onChange={(e) => handleSocialUpdate(key as SocialKey, e.target.value)}
                  placeholder={`https://${key}.com/yourname`}
                  className="h-11 bg-[#F9F7F5] border-[#EFEBE6] rounded-xl focus-visible:ring-[#F38121]/20 focus-visible:border-[#F38121] text-sm font-medium text-[#4A443F]"
                />
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

