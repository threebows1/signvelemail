import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { getTemplate, templates } from "@/components/signatures/templates";
import {
  defaultData,
  getSignature,
  newSignatureId,
  saveSignature,
  type SavedSignature,
  type SignatureData,
} from "@/lib/signature-store";
import { ExportDialog } from "@/components/signatures/ExportDialog";
import { Check, ChevronRight, Download, Palette, Share2, Sliders, User } from "lucide-react";

export const Route = createFileRoute("/app/editor/$id")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.id === "new" ? "New" : params.id} — Signature Editor · Sign Vel` },
      { name: "description", content: "Customize your email signature with layout, colors, contact info, socials, and export for every mail client." },
      { property: "og:title", content: "Sign Vel Signature Editor" },
      { property: "og:description", content: "Design and export email signatures for Gmail, Outlook, Apple Mail and more." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Editor,
});

type Tab = "content" | "design" | "social" | "extras";

const PRESETS = [
  { name: "Sign Vel", primary: "#5B2EFF", accent: "#00E5A0" },
  { name: "Al Riyady", primary: "#C88A1E", accent: "#0A2A5E" },
  { name: "Corporate", primary: "#1E40AF", accent: "#60A5FA" },
  { name: "Emerald", primary: "#059669", accent: "#A7F3D0" },
  { name: "Rose", primary: "#E11D48", accent: "#FDA4AF" },
  { name: "Charcoal", primary: "#18181B", accent: "#71717A" },
  { name: "Sunset", primary: "#F97316", accent: "#FBBF24" },
  { name: "Ocean", primary: "#0EA5E9", accent: "#22D3EE" },
];

const FONTS = [
  { label: "Sans (Arial)", value: "Arial, Helvetica, sans-serif" },
  { label: "Rubik", value: "Rubik, Arial, sans-serif" },
  { label: "Inter", value: "Inter, Arial, sans-serif" },
  { label: "Serif (Georgia)", value: "Georgia, 'Times New Roman', serif" },
  { label: "Times", value: "'Times New Roman', Times, serif" },
  { label: "Verdana", value: "Verdana, Geneva, sans-serif" },
  { label: "Tahoma", value: "Tahoma, Geneva, sans-serif" },
  { label: "Trebuchet", value: "'Trebuchet MS', sans-serif" },
  { label: "Monospace", value: "'JetBrains Mono', Menlo, monospace" },
];

function Editor() {
  const { id } = Route.useParams();
  const navigate = useNavigate();

  // Load or bootstrap
  const initial: SavedSignature = useMemo(() => {
    if (id === "new") {
      return {
        id: newSignatureId(),
        name: "Untitled Signature",
        templateId: "left-line",
        status: "Draft",
        updatedAt: Date.now(),
        data: { ...defaultData },
      };
    }
    const found = getSignature(id);
    if (found) return found;
    // If id matches a template id, start a new sig from that template
    const t = getTemplate(id);
    return {
      id: newSignatureId(),
      name: t ? `${t.name} Signature` : "Untitled Signature",
      templateId: t?.id ?? "left-line",
      status: "Draft",
      updatedAt: Date.now(),
      data: { ...defaultData },
    };
  }, [id]);

  const [sig, setSig] = useState<SavedSignature>(initial);
  const [tab, setTab] = useState<Tab>("content");
  const [exportOpen, setExportOpen] = useState(false);
  const [savedNote, setSavedNote] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  const template = getTemplate(sig.templateId) ?? templates[0];

  function patch<K extends keyof SignatureData>(k: K, v: SignatureData[K]) {
    setSig((s) => ({ ...s, data: { ...s.data, [k]: v }, updatedAt: Date.now() }));
  }
  function patchSocial(k: keyof SignatureData["socials"], v: string) {
    setSig((s) => ({ ...s, data: { ...s.data, socials: { ...s.data.socials, [k]: v } }, updatedAt: Date.now() }));
  }

  function handleSave(status: "Draft" | "Active" = sig.status) {
    const toSave = { ...sig, status, updatedAt: Date.now() };
    saveSignature(toSave);
    setSig(toSave);
    setSavedNote(true);
    setTimeout(() => setSavedNote(false), 1600);
    if (id === "new" || id !== toSave.id) navigate({ to: "/app/editor/$id", params: { id: toSave.id }, replace: true });
  }

  // Auto-save on any change
  useEffect(() => {
    const t = setTimeout(() => saveSignature(sig), 400);
    return () => clearTimeout(t);
  }, [sig]);

  return (
    <div className="h-full flex flex-col">
      <header className="px-8 py-4 border-b border-border bg-white flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3 min-w-0">
          <span className="font-[JetBrains_Mono] text-[10px] uppercase tracking-[0.2em] text-primary font-medium">Editor</span>
          <span className="text-muted-foreground">/</span>
          <input
            value={sig.name}
            onChange={(e) => setSig({ ...sig, name: e.target.value })}
            className="font-[Inter_Tight] font-bold text-sm bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-primary/30 rounded px-1 min-w-0"
          />
          <span className="text-[10px] font-[JetBrains_Mono] uppercase tracking-widest text-muted-foreground">
            {sig.id}
          </span>
          {savedNote && (
            <span className="text-[10px] font-[JetBrains_Mono] text-emerald-600 flex items-center gap-1">
              <Check className="size-3" /> Saved
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Link to="/app">
            <Button variant="outline" size="sm">Back</Button>
          </Link>
          <Button size="sm" variant="outline" onClick={() => setExportOpen(true)} className="gap-2">
            <Share2 className="size-4" /> Export
          </Button>
          <Button size="sm" onClick={() => handleSave("Active")} className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
            <Download className="size-4" /> Save &amp; Deploy
          </Button>
        </div>
      </header>

      <div className="flex-1 flex h-[calc(100vh-64px)]">
        {/* Left panel */}
        <div className="w-96 border-r border-border bg-white flex flex-col">
          <div className="flex border-b border-border">
            {(
              [
                { id: "content", label: "Content", Icon: User },
                { id: "design", label: "Design", Icon: Palette },
                { id: "social", label: "Social", Icon: Share2 },
                { id: "extras", label: "Extras", Icon: Sliders },
              ] as const
            ).map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-medium transition-colors ${
                  tab === t.id ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <t.Icon className="size-3.5" /> {t.label}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {tab === "content" && (
              <>
                <Section title="Identity">
                  <Field label="Full Name" value={sig.data.name} onChange={(v) => patch("name", v)} />
                  <Field label="Job Title" value={sig.data.title} onChange={(v) => patch("title", v)} />
                  <div className="grid grid-cols-2 gap-2">
                    <Field label="Department" value={sig.data.department || ""} onChange={(v) => patch("department", v)} />
                    <Field label="Pronouns" value={sig.data.pronouns || ""} onChange={(v) => patch("pronouns", v)} />
                  </div>
                  <Field label="Company" value={sig.data.company} onChange={(v) => patch("company", v)} />
                </Section>
                <Section title="Contact">
                  <Field label="Email" value={sig.data.email} onChange={(v) => patch("email", v)} type="email" />
                  <Field label="Mobile" value={sig.data.mobile} onChange={(v) => patch("mobile", v)} />
                  <Field label="Office Phone" value={sig.data.phone} onChange={(v) => patch("phone", v)} />
                  <Field label="Address" value={sig.data.address} onChange={(v) => patch("address", v)} />
                  <Field label="Website" value={sig.data.website} onChange={(v) => patch("website", v)} />
                </Section>
                <Section title="Media">
                  <Field label="Photo URL" value={sig.data.photoUrl || ""} onChange={(v) => patch("photoUrl", v)} placeholder="https://…/avatar.jpg" />
                  <Field label="Company Logo URL" value={sig.data.logoUrl || ""} onChange={(v) => patch("logoUrl", v)} placeholder="https://…/logo.png" />
                </Section>
              </>
            )}

            {tab === "design" && (
              <>
                <Section title="Template">
                  <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1">
                    {templates.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setSig((s) => ({ ...s, templateId: t.id }))}
                        className={`text-left p-2 rounded-lg border text-xs transition-all ${
                          sig.templateId === t.id ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border hover:border-foreground/30"
                        }`}
                      >
                        <span className={`inline-block size-2 rounded-full ${t.accent} mr-1.5`} />
                        <span className="font-medium">{t.name}</span>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{t.category}</p>
                      </button>
                    ))}
                  </div>
                </Section>

                <Section title="Color presets">
                  <div className="flex flex-wrap gap-2">
                    {PRESETS.map((p) => (
                      <button
                        key={p.name}
                        onClick={() => {
                          patch("primaryColor", p.primary);
                          patch("accentColor", p.accent);
                        }}
                        className="flex items-center gap-1.5 pl-1 pr-2 py-1 rounded-full border border-border hover:border-foreground/30 text-[11px]"
                      >
                        <span className="size-4 rounded-full" style={{ background: p.primary }} />
                        <span className="size-4 rounded-full -ml-2" style={{ background: p.accent }} />
                        {p.name}
                      </button>
                    ))}
                  </div>
                </Section>

                <Section title="Custom colors">
                  <ColorField label="Primary" value={sig.data.primaryColor} onChange={(v) => patch("primaryColor", v)} />
                  <ColorField label="Accent" value={sig.data.accentColor} onChange={(v) => patch("accentColor", v)} />
                  <ColorField label="Text" value={sig.data.textColor} onChange={(v) => patch("textColor", v)} />
                  <ColorField label="Muted" value={sig.data.mutedColor} onChange={(v) => patch("mutedColor", v)} />
                </Section>

                <Section title="Typography">
                  <label className="text-[10px] font-[JetBrains_Mono] text-muted-foreground uppercase">Font family</label>
                  <select
                    value={sig.data.fontFamily}
                    onChange={(e) => patch("fontFamily", e.target.value)}
                    className="w-full bg-stone-50 border border-border px-3 py-2 text-sm rounded"
                  >
                    {FONTS.map((f) => (
                      <option key={f.value} value={f.value}>{f.label}</option>
                    ))}
                  </select>
                </Section>
              </>
            )}

            {tab === "social" && (
              <Section title="Social profiles">
                <Field label="LinkedIn" value={sig.data.socials.linkedin || ""} onChange={(v) => patchSocial("linkedin", v)} placeholder="https://linkedin.com/in/…" />
                <Field label="Twitter / X" value={sig.data.socials.twitter || ""} onChange={(v) => patchSocial("twitter", v)} />
                <Field label="Facebook" value={sig.data.socials.facebook || ""} onChange={(v) => patchSocial("facebook", v)} />
                <Field label="Instagram" value={sig.data.socials.instagram || ""} onChange={(v) => patchSocial("instagram", v)} />
                <Field label="YouTube" value={sig.data.socials.youtube || ""} onChange={(v) => patchSocial("youtube", v)} />
                <Field label="GitHub" value={sig.data.socials.github || ""} onChange={(v) => patchSocial("github", v)} />
                <Field label="TikTok" value={sig.data.socials.tiktok || ""} onChange={(v) => patchSocial("tiktok", v)} />
                <Toggle label="Show social icons" checked={sig.data.showSocials} onChange={(v) => patch("showSocials", v)} />
              </Section>
            )}

            {tab === "extras" && (
              <>
                <Section title="Marketing">
                  <Field label="Tagline" value={sig.data.tagline || ""} onChange={(v) => patch("tagline", v)} />
                  <Field label="Personal Quote" value={sig.data.quote || ""} onChange={(v) => patch("quote", v)} />
                  <Field label="CTA Label" value={sig.data.ctaLabel || ""} onChange={(v) => patch("ctaLabel", v)} placeholder="Book a meeting" />
                  <Field label="CTA URL" value={sig.data.ctaUrl || ""} onChange={(v) => patch("ctaUrl", v)} placeholder="https://cal.com/…" />
                </Section>
                <Section title="Legal">
                  <label className="text-[10px] font-[JetBrains_Mono] text-muted-foreground uppercase">Disclaimer</label>
                  <textarea
                    value={sig.data.disclaimer || ""}
                    onChange={(e) => patch("disclaimer", e.target.value)}
                    rows={4}
                    className="w-full bg-stone-50 border border-border px-3 py-2 text-sm rounded"
                  />
                  <Toggle label="Show disclaimer" checked={sig.data.showDisclaimer} onChange={(v) => patch("showDisclaimer", v)} />
                </Section>
                <Section title="Options">
                  <Toggle label="Show icons" checked={sig.data.showIcons} onChange={(v) => patch("showIcons", v)} />
                </Section>
              </>
            )}
          </div>
        </div>

        {/* Preview */}
        <div className="flex-1 bg-stone-50/50 p-8 flex flex-col items-center overflow-y-auto">
          <div className="w-full max-w-3xl">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-[JetBrains_Mono] uppercase tracking-widest text-muted-foreground">
                Live Preview · {template.name}
              </span>
              <span className="text-[10px] font-[JetBrains_Mono] uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                Auto-saved <ChevronRight className="size-3" />
              </span>
            </div>
            <div className="bg-white shadow-sm ring-1 ring-black/5 rounded-lg overflow-hidden">
              <div ref={previewRef}>{template.render(sig.data)}</div>
            </div>
            <div className="mt-6 flex items-center gap-3">
              <Button onClick={() => setExportOpen(true)} className="gap-2">
                <Share2 className="size-4" /> Copy &amp; Install
              </Button>
              <span className="text-xs text-muted-foreground">
                Works with Gmail, Outlook (Windows &amp; Mac), Apple Mail, Yahoo, Thunderbird &amp; iOS Mail.
              </span>
            </div>
          </div>
        </div>
      </div>

      <ExportDialog
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        previewRef={previewRef}
        signatureName={sig.name}
      />
    </div>
  );
}

/* ---- Field primitives ---- */
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2 pb-4 border-b border-border last:border-0">
      <h4 className="text-[10px] font-[JetBrains_Mono] font-medium uppercase tracking-widest text-muted-foreground">{title}</h4>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] font-[JetBrains_Mono] text-muted-foreground uppercase">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-stone-50 border border-border px-3 py-2 text-sm rounded focus:outline-none focus:ring-1 focus:ring-primary/40"
      />
    </div>
  );
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] font-[JetBrains_Mono] text-muted-foreground uppercase">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="size-9 rounded border border-border shrink-0 cursor-pointer"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 bg-stone-50 border border-border px-3 py-2 text-sm rounded font-mono"
        />
      </div>
    </div>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center justify-between text-sm py-1 cursor-pointer">
      <span>{label}</span>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative w-9 h-5 rounded-full transition-colors ${checked ? "bg-primary" : "bg-muted"}`}
      >
        <span className={`absolute top-0.5 size-4 bg-white rounded-full transition-transform ${checked ? "translate-x-4" : "translate-x-0.5"}`} />
      </button>
    </label>
  );
}
