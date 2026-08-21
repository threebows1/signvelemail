import { createFileRoute, useParams } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import { getSignature, saveSignature, type SavedSignature } from "@/lib/signature-store";
import { Check, RotateCcw, RotateCw, Trash2, Upload, Plus, X } from "lucide-react";
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
      
      <div className="flex-1 overflow-y-auto p-6 space-y-10 scrollbar-hide pb-20">
        {/* Company Logo Section */}
        <section className="space-y-6">
          <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#9E958F] block">
            Company Logo
          </label>
          
          <div className="flex items-start gap-6">
            <div 
              onClick={() => logoRef.current?.click()}
              className="group relative size-32 rounded-2xl bg-[#F9F7F5] border-2 border-dashed border-[#EFEBE6] hover:border-[#F38121] transition-all cursor-pointer overflow-hidden flex flex-col items-center justify-center gap-2 shrink-0"
            >
              {sig.data.logoUrl ? (
                <>
                  <img src={sig.data.logoUrl} alt="Logo" className="w-full h-full object-contain p-4" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Trash2 size={20} className="text-white" onClick={(e) => { e.stopPropagation(); handleUpdate({ logoUrl: "" }); }} />
                  </div>
                </>
              ) : (
                <>
                  <Upload size={24} className="text-[#F38121]" />
                  <span className="text-[10px] font-bold text-[#9E958F] uppercase tracking-wider text-center px-2 leading-tight">
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
              <div className="space-y-3">
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-[#9E958F]">
                  <span>Logo Width</span>
                  <span>{sig.data.logoWidth || 150}px</span>
                </div>
                <Slider 
                  value={[sig.data.logoWidth || 150]}
                  min={50}
                  max={300}
                  step={1}
                  onValueChange={([val]) => handleUpdate({ logoWidth: val })}
                  className="py-1"
                />
              </div>
            </div>
          </div>
        </section>

        <div className="h-px bg-[#EFEBE6]" />

        {/* Business Fields */}
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#9E958F]">Company Name</label>
            <input
              type="text"
              value={sig.data.company || ""}
              onChange={(e) => handleUpdate({ company: e.target.value })}
              placeholder="Sign Vel"
              className="w-full h-11 px-4 bg-[#F9F7F5] border border-[#EFEBE6] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F38121]/10 focus:border-[#F38121] transition-all text-sm font-medium text-[#4A443F]"
            />
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#9E958F]">Telephone Numbers</label>
            <div className="space-y-3">
              {(sig.data.phones || []).map((phone, idx) => (
                <div key={idx} className="flex gap-2">
                  <div className="w-[120px] shrink-0">
                    <Select value={phone.type} onValueChange={(val) => updatePhoneType(idx, val)}>
                      <SelectTrigger className="h-11 bg-[#F9F7F5] border-[#EFEBE6] rounded-xl text-xs font-bold uppercase tracking-wider">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="main">Main</SelectItem>
                        <SelectItem value="mobile">Mobile</SelectItem>
                        <SelectItem value="office">Office</SelectItem>
                        <SelectItem value="direct">Direct</SelectItem>
                        <SelectItem value="fax">Fax</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={phone.value}
                      onChange={(e) => updatePhone(idx, e.target.value)}
                      placeholder="+1 (000) 000-0000"
                      className="w-full h-11 px-4 bg-[#F9F7F5] border border-[#EFEBE6] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F38121]/10 focus:border-[#F38121] transition-all text-sm font-medium text-[#4A443F]"
                    />
                    <button 
                      onClick={() => removePhone(idx)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#CDC8C3] hover:text-destructive transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              ))}
              <button 
                onClick={addPhone}
                className="w-full h-11 border-2 border-dashed border-[#EFEBE6] hover:border-[#F38121] hover:text-[#F38121] text-[#9E958F] rounded-xl flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider transition-all"
              >
                <Plus size={16} /> Add Another
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#9E958F]">Address</label>
            <input
              type="text"
              value={sig.data.address || ""}
              onChange={(e) => handleUpdate({ address: e.target.value })}
              placeholder="500 Market Street, Suite 400"
              className="w-full h-11 px-4 bg-[#F9F7F5] border border-[#EFEBE6] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F38121]/10 focus:border-[#F38121] transition-all text-sm font-medium text-[#4A443F]"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#9E958F]">Website URL</label>
            <input
              type="text"
              value={sig.data.website || ""}
              onChange={(e) => handleUpdate({ website: e.target.value })}
              placeholder="signvel.com"
              className="w-full h-11 px-4 bg-[#F9F7F5] border border-[#EFEBE6] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F38121]/10 focus:border-[#F38121] transition-all text-sm font-medium text-[#4A443F]"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
