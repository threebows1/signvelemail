import { createFileRoute, useParams } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import { getSignature, saveSignature, type SavedSignature } from "@/lib/signature-store";
import { Check, Trash2, Upload, Plus, X, Building2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/app/editor/$id/business")({
  component: EditorBusinessPage,
});

function EditorBusinessPage() {
  const { id } = useParams({ from: "/app/editor/$id/business" });
  const [sig, setSig] = useState<SavedSignature | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const logoRef = useRef<HTMLInputElement>(null);

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
      handleUpdate({ logoUrl: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  const updatePhone = (index: number, value: string) => {
    const newPhones = [...(sig.data.phones || [])];
    newPhones[index] = { ...newPhones[index], value };
    handleUpdate({ phones: newPhones });
  };

  const updatePhoneType = (index: number, type: any) => {
    const newPhones = [...(sig.data.phones || [])];
    newPhones[index] = { ...newPhones[index], type };
    handleUpdate({ phones: newPhones });
  };

  const addPhone = () => {
    const newPhones = [...(sig.data.phones || []), { type: "main", value: "" }];
    handleUpdate({ phones: newPhones });
  };

  const removePhone = (index: number) => {
    const newPhones = (sig.data.phones || []).filter((_, i) => i !== index);
    handleUpdate({ phones: newPhones });
  };

  return (
    <div className="flex flex-col h-full bg-white font-[Inter_Tight]">
      <header className="px-6 py-5 border-b border-[#EFEBE6] flex items-center justify-between shrink-0">
        <h2 className="text-lg font-bold text-[#14121F]">Business Info</h2>
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full transition-all duration-300 ${
          isSaving ? "text-[#9E958F] bg-[#F9F7F5]" : "text-[#00E5A0] bg-[#00E5A0]/5"
        }`}>
          <Check size={14} strokeWidth={3} className={isSaving ? "animate-pulse" : ""} />
          <span className="text-[10px] font-bold uppercase tracking-widest">{isSaving ? "Saving..." : "Saved"}</span>
        </div>
      </header>
      
      <div className="flex-1 overflow-y-auto p-6 space-y-10 scrollbar-hide pb-24">
        {/* Company Logo Section */}
        <section className="space-y-6">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="size-6 rounded-lg bg-[#F38121]/10 flex items-center justify-center">
              <Building2 size={14} className="text-[#F38121]" />
            </div>
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-[#4A443F]">Company Logo</h3>
          </div>
          
          <div className="flex items-start gap-6">
            <div 
              onClick={() => logoRef.current?.click()}
              className="group relative size-32 rounded-3xl bg-[#F9F7F5] border-2 border-dashed border-[#EFEBE6] hover:border-[#F38121] transition-all cursor-pointer overflow-hidden flex flex-col items-center justify-center gap-2 shrink-0"
            >
              {sig.data.logoUrl ? (
                <>
                  <img src={sig.data.logoUrl} alt="Logo" className="w-full h-full object-contain p-6" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Trash2 size={20} className="text-white" onClick={(e) => { e.stopPropagation(); handleUpdate({ logoUrl: "" }); }} />
                  </div>
                </>
              ) : (
                <>
                  <div className="size-10 rounded-full bg-white flex items-center justify-center shadow-sm border border-[#EFEBE6]">
                    <Upload size={18} className="text-[#F38121]" />
                  </div>
                  <span className="text-[10px] font-bold text-[#9E958F] uppercase tracking-wider text-center px-4 leading-relaxed">
                    Drop logo here or browse
                  </span>
                </>
              )}
              <input ref={logoRef} type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
            </div>

            <div className="flex-1 space-y-5 pt-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#4A443F]">Show Placeholder</span>
                <Switch 
                  checked={sig.data.showPlaceholderLogo}
                  onCheckedChange={(val) => handleUpdate({ showPlaceholderLogo: val })}
                />
              </div>
              <div className="space-y-4">
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-[#9E958F]">
                  <span>Logo Width</span>
                  <span className="text-xs text-[#4A443F]">{sig.data.logoWidth || 150}px</span>
                </div>
                <Slider 
                  value={[sig.data.logoWidth || 150]}
                  min={50}
                  max={300}
                  step={1}
                  onValueChange={([val]) => handleUpdate({ logoWidth: val })}
                />
              </div>
            </div>
          </div>
        </section>

        <div className="h-px bg-[#EFEBE6]" />

        {/* Business Fields */}
        <div className="space-y-8">
          <div className="space-y-2.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-[#9E958F]">Company Name</label>
            <input
              type="text"
              value={sig.data.company || ""}
              onChange={(e) => handleUpdate({ company: e.target.value })}
              placeholder="Sign Vel"
              className="w-full h-12 px-4 bg-[#F9F7F5] border border-[#EFEBE6] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#F38121]/20 transition-all text-sm font-bold text-[#4A443F]"
            />
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-bold uppercase tracking-widest text-[#9E958F]">Phone Numbers</label>
            <div className="space-y-3">
              {(sig.data.phones || []).map((phone, idx) => (
                <div key={idx} className="flex gap-2">
                  <div className="w-[110px] shrink-0">
                    <Select value={phone.type} onValueChange={(val) => updatePhoneType(idx, val)}>
                      <SelectTrigger className="h-12 bg-[#F9F7F5] border-[#EFEBE6] rounded-2xl text-[10px] font-bold uppercase tracking-widest focus:ring-[#F38121]/20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="main" className="text-[10px] font-bold uppercase tracking-widest">Main</SelectItem>
                        <SelectItem value="mobile" className="text-[10px] font-bold uppercase tracking-widest">Mobile</SelectItem>
                        <SelectItem value="office" className="text-[10px] font-bold uppercase tracking-widest">Office</SelectItem>
                        <SelectItem value="direct" className="text-[10px] font-bold uppercase tracking-widest">Direct</SelectItem>
                        <SelectItem value="fax" className="text-[10px] font-bold uppercase tracking-widest">Fax</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={phone.value}
                      onChange={(e) => updatePhone(idx, e.target.value)}
                      placeholder="+1 (000) 000-0000"
                      className="w-full h-12 px-4 bg-[#F9F7F5] border border-[#EFEBE6] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#F38121]/20 transition-all text-sm font-bold text-[#4A443F] pr-10"
                    />
                    <button 
                      onClick={() => removePhone(idx)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-[#CDC8C3] hover:text-[#F38121] transition-colors"
                    >
                      <X size={14} strokeWidth={3} />
                    </button>
                  </div>
                </div>
              ))}
              <button 
                onClick={addPhone}
                className="w-full h-12 border-2 border-dashed border-[#EFEBE6] hover:border-[#F38121] hover:text-[#F38121] text-[#9E958F] rounded-2xl flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest transition-all group"
              >
                <Plus size={14} strokeWidth={3} className="transition-transform group-hover:rotate-90" />
                Add Phone Number
              </button>
            </div>
          </div>

          <div className="space-y-2.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-[#9E958F]">Office Address</label>
            <input
              type="text"
              value={sig.data.address || ""}
              onChange={(e) => handleUpdate({ address: e.target.value })}
              placeholder="500 Market Street, Suite 400"
              className="w-full h-12 px-4 bg-[#F9F7F5] border border-[#EFEBE6] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#F38121]/20 transition-all text-sm font-bold text-[#4A443F]"
            />
          </div>

          <div className="space-y-2.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-[#9E958F]">Website URL</label>
            <input
              type="text"
              value={sig.data.website || ""}
              onChange={(e) => handleUpdate({ website: e.target.value })}
              placeholder="signvel.com"
              className="w-full h-12 px-4 bg-[#F9F7F5] border border-[#EFEBE6] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#F38121]/20 transition-all text-sm font-bold text-[#4A443F]"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

