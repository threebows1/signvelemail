import { createFileRoute, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getSignature, saveSignature, type SavedSignature } from "@/lib/signature-store";
import { Check, RotateCcw, RotateCw } from "lucide-react";
import { FIELDS, type FieldKey } from "@/components/signature-form/fields";

export const Route = createFileRoute("/app/editor/$id/details")({
  component: EditorDetailsPage,
});

function EditorDetailsPage() {
  const { id } = useParams({ from: "/app/editor/$id/details" });
  const [sig, setSig] = useState<SavedSignature | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    getSignature(id).then((s) => setSig(s || null));
  }, [id]);

  if (!sig) return null;

  const personalFields = FIELDS.filter(f => f.section === "identity");

  const handleUpdate = async (key: FieldKey, value: string) => {
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

  return (
    <div className="flex flex-col h-full bg-white">
      <header className="p-6 border-b border-[#EFEBE6] flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-xl font-bold text-[#14121F]">Personal Info</h2>
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
        {personalFields.map((field) => (
          <div key={field.key} className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-widest text-[#9E958F]">
              {field.label}
            </label>
            <input
              type="text"
              value={sig.data[field.key as FieldKey] || ""}
              onChange={(e) => handleUpdate(field.key as FieldKey, e.target.value)}
              placeholder={field.placeholder}
              className="w-full h-11 px-4 bg-[#F9F7F5] border-[#EFEBE6] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F38121]/20 focus:border-[#F38121] transition-all text-sm font-medium text-[#4A443F]"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
