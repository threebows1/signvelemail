import { createFileRoute, useParams } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import { getSignature, saveSignature, type SavedSignature } from "@/lib/signature-store";
import { Check, Trash2, Upload, HelpCircle, User } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";

export const Route = createFileRoute("/app/editor/$id/details")({
  component: EditorDetailsPage,
});

function EditorDetailsPage() {
  const { id } = useParams({ from: "/app/editor/$id/details" });
  const [sig, setSig] = useState<SavedSignature | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const photoRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getSignature(id).then((s) => setSig(s || null));
  }, [id]);

  if (!sig) return null;

  const handleUpdate = async (updates: Partial<SavedSignature["data"]>) => {
    const updated = {
      ...sig,
      data: { ...sig.data, ...updates },
      updatedAt: Date.now()
    };
    setSig(updated);
    setIsSaving(true);
    await saveSignature(updated);
    setIsSaving(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      handleUpdate({ photoUrl: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-col h-full bg-white font-[Inter_Tight]">
      <header className="px-6 py-5 border-b border-[#EFEBE6] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold text-[#14121F]">Personal Info</h2>
          <HelpCircle size={16} className="text-[#CDC8C3] cursor-help" />
        </div>
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full transition-all duration-300 ${
          isSaving ? "text-[#9E958F] bg-[#F9F7F5]" : "text-[#00E5A0] bg-[#00E5A0]/5"
        }`}>
          <Check size={14} strokeWidth={3} className={isSaving ? "animate-pulse" : ""} />
          <span className="text-[10px] font-bold uppercase tracking-widest">{isSaving ? "Saving..." : "Saved"}</span>
        </div>
      </header>
      
      <div className="flex-1 overflow-y-auto p-6 space-y-10 scrollbar-hide pb-24">
        {/* Profile Image Section */}
        <section className="space-y-6">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="size-6 rounded-lg bg-[#F38121]/10 flex items-center justify-center">
              <User size={14} className="text-[#F38121]" />
            </div>
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-[#4A443F]">Profile Image</h3>
          </div>
          
          <div className="flex items-start gap-6">
            <div 
              onClick={() => photoRef.current?.click()}
              className={`group relative size-32 rounded-3xl bg-[#F9F7F5] border-2 border-dashed border-[#EFEBE6] hover:border-[#F38121] transition-all cursor-pointer overflow-hidden flex flex-col items-center justify-center gap-2 shrink-0 ${
                sig.data.cropPhotoCircle ? "rounded-full" : ""
              }`}
            >
              {sig.data.photoUrl ? (
                <>
                  <img src={sig.data.photoUrl} alt="Profile" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Trash2 size={20} className="text-white" onClick={(e) => { e.stopPropagation(); handleUpdate({ photoUrl: "" }); }} />
                  </div>
                </>
              ) : (
                <>
                  <div className="size-10 rounded-full bg-white flex items-center justify-center shadow-sm border border-[#EFEBE6]">
                    <Upload size={18} className="text-[#F38121]" />
                  </div>
                  <span className="text-[10px] font-bold text-[#9E958F] uppercase tracking-wider text-center px-4 leading-relaxed">
                    Drop photo here or browse
                  </span>
                </>
              )}
              <input ref={photoRef} type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
            </div>

            <div className="flex-1 space-y-5 pt-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#4A443F]">Crop into circle</span>
                <Switch 
                  checked={sig.data.cropPhotoCircle}
                  onCheckedChange={(val) => handleUpdate({ cropPhotoCircle: val })}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#4A443F]">Show Placeholder</span>
                <Switch 
                  checked={sig.data.showPlaceholderPhoto}
                  onCheckedChange={(val) => handleUpdate({ showPlaceholderPhoto: val })}
                />
              </div>
              <div className="space-y-4">
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-[#9E958F]">
                  <span>Image Width</span>
                  <span className="text-xs text-[#4A443F]">{sig.data.photoWidth || 100}px</span>
                </div>
                <Slider 
                  value={[sig.data.photoWidth || 100]}
                  min={40}
                  max={200}
                  step={1}
                  onValueChange={([val]) => handleUpdate({ photoWidth: val })}
                />
              </div>
            </div>
          </div>
        </section>

        <div className="h-px bg-[#EFEBE6]" />

        {/* Identity Fields */}
        <div className="space-y-6">
          <div className="space-y-2.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-[#9E958F]">Full Name</label>
            <input
              type="text"
              value={sig.data.name || ""}
              onChange={(e) => handleUpdate({ name: e.target.value })}
              placeholder="Alex Rivera"
              className="w-full h-12 px-4 bg-[#F9F7F5] border border-[#EFEBE6] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#F38121]/20 transition-all text-sm font-bold text-[#4A443F]"
            />
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-6">
            <div className="space-y-2.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-[#9E958F]">Job Title</label>
              <input
                type="text"
                value={sig.data.title || ""}
                onChange={(e) => handleUpdate({ title: e.target.value })}
                placeholder="Brand Designer"
                className="w-full h-12 px-4 bg-[#F9F7F5] border border-[#EFEBE6] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#F38121]/20 transition-all text-sm font-bold text-[#4A443F]"
              />
            </div>
            <div className="space-y-2.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-[#9E958F]">Department</label>
              <input
                type="text"
                value={sig.data.department || ""}
                onChange={(e) => handleUpdate({ department: e.target.value })}
                placeholder="Design"
                className="w-full h-12 px-4 bg-[#F9F7F5] border border-[#EFEBE6] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#F38121]/20 transition-all text-sm font-bold text-[#4A443F]"
              />
            </div>
          </div>
          
          <div className="space-y-2.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-[#9E958F]">Email Address</label>
            <input
              type="email"
              value={sig.data.email || ""}
              onChange={(e) => handleUpdate({ email: e.target.value })}
              placeholder="alex@signvel.com"
              className="w-full h-12 px-4 bg-[#F9F7F5] border border-[#EFEBE6] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#F38121]/20 transition-all text-sm font-bold text-[#4A443F]"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

