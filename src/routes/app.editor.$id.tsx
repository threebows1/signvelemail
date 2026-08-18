import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { getTemplate, templates, renderSignature } from "@/components/signatures/templates";
import {
  defaultData,
  getSignature,
  newSignatureId,
  saveSignature,
  type SavedSignature,
  type SignatureData,
  type SocialKey,
} from "@/lib/signature-store";
import { ExportDialog } from "@/components/signatures/ExportDialog";
import { socialGlyphMap, socialBrandColor } from "@/components/signatures/social-icons";
import { ArrowDown, ArrowUp, Check, ChevronRight, Download, Palette, Plus, Share2, Sliders, User } from "lucide-react";
import { ALL_SOCIAL_KEYS, FEATURED_SOCIAL_KEYS } from "@/lib/signature-store";

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
type DesignSub = "template" | "palette" | "type" | "icons";
type TemplateFilter = "All" | "Corporate" | "Minimal" | "Creative" | "Bold";

const PALETTES: { name: string; primary: string; accent: string; dark: string }[] = [
  { name: "Sign Vel", primary: "#5B2EFF", accent: "#00E5A0", dark: "#14121F" },
  { name: "Mint", primary: "#0E8A6B", accent: "#00E5A0", dark: "#0B3B2E" },
  { name: "Corporate", primary: "#143A8A", accent: "#6EA8FF", dark: "#0B1B3A" },
  { name: "Sunset", primary: "#F97316", accent: "#FBBF24", dark: "#7C2D12" },
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

const SOCIAL_FIELDS: { key: SocialKey; label: string; placeholder?: string }[] = [
  { key: "linkedin", label: "LinkedIn", placeholder: "https://linkedin.com/in/…" },
  { key: "twitter", label: "Twitter / X", placeholder: "https://x.com/…" },
  { key: "facebook", label: "Facebook", placeholder: "https://facebook.com/…" },
  { key: "instagram", label: "Instagram", placeholder: "https://instagram.com/…" },
  { key: "youtube", label: "YouTube", placeholder: "https://youtube.com/@…" },
  { key: "tiktok", label: "TikTok", placeholder: "https://tiktok.com/@…" },
  { key: "whatsapp", label: "WhatsApp", placeholder: "https://wa.me/…" },
  { key: "telegram", label: "Telegram", placeholder: "https://t.me/…" },
  { key: "pinterest", label: "Pinterest", placeholder: "https://pinterest.com/…" },
  { key: "snapchat", label: "Snapchat", placeholder: "https://snapchat.com/add/…" },
  { key: "threads", label: "Threads", placeholder: "https://threads.net/@…" },
  { key: "medium", label: "Medium", placeholder: "https://medium.com/@…" },
  { key: "behance", label: "Behance", placeholder: "https://behance.net/…" },
  { key: "dribbble", label: "Dribbble", placeholder: "https://dribbble.com/…" },
  { key: "calendly", label: "Calendly", placeholder: "https://calendly.com/…" },
  { key: "discord", label: "Discord", placeholder: "https://discord.gg/…" },
  { key: "twitch", label: "Twitch", placeholder: "https://twitch.tv/…" },
  { key: "spotify", label: "Spotify", placeholder: "https://open.spotify.com/…" },
  { key: "slack", label: "Slack", placeholder: "https://…slack.com" },
  { key: "bluesky", label: "Bluesky", placeholder: "https://bsky.app/profile/…" },
  { key: "mastodon", label: "Mastodon", placeholder: "https://mastodon.social/@…" },
  { key: "website", label: "Website", placeholder: "https://…" },
];

function Editor() {
  const { id } = Route.useParams();
  const navigate = useNavigate();

  // NOTE: keep the initial id/timestamp deterministic so SSR and client markup match.
  const defaultSig: SavedSignature = {
    id: "SIG-NEW",
    name: "Untitled Signature",
    templateId: "left-line",
    status: "Draft",
    updatedAt: 0,
    data: { ...defaultData },
  };

  const [sig, setSig] = useState<SavedSignature>(defaultSig);
  const [tab, setTab] = useState<Tab>("content");
  const [designSub, setDesignSub] = useState<DesignSub>("palette");
  const [templateFilter, setTemplateFilter] = useState<TemplateFilter>("All");
  const [exportOpen, setExportOpen] = useState(false);
  const [savedNote, setSavedNote] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  // Load or bootstrap
  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (id === "new") {
        if (!cancelled) setSig({ ...defaultSig, id: newSignatureId(), updatedAt: Date.now() });
        return;
      }
      const found = await getSignature(id);
      if (found) {
        if (!cancelled) setSig(found);
        return;
      }
      // If id matches a template id, start a new sig from that template
      const t = getTemplate(id);
      if (!cancelled) {
        setSig({
          id: newSignatureId(),
          name: t ? `${t.name} Signature` : "Untitled Signature",
          templateId: t?.id ?? "left-line",
          status: "Draft",
          updatedAt: Date.now(),
          data: { ...defaultData },
        });
      }
    }
    load();
    return () => { cancelled = true; };
  }, [id]);

  const template = getTemplate(sig.templateId) ?? templates[0];

  function patch<K extends keyof SignatureData>(k: K, v: SignatureData[K]) {
    setSig((s) => ({ ...s, data: { ...s.data, [k]: v }, updatedAt: Date.now() }));
  }
  function patchSocial(k: keyof SignatureData["socials"], v: string) {
    setSig((s) => ({ ...s, data: { ...s.data, socials: { ...s.data.socials, [k]: v } }, updatedAt: Date.now() }));
  }

  async function handleSave(status: "Draft" | "Active" = sig.status) {
    const toSave = { ...sig, status, updatedAt: Date.now() };
    await saveSignature(toSave);
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
    <div className="h-screen flex flex-col overflow-hidden">
      <header className="px-8 py-4 border-b border-border bg-white flex items-center justify-between shrink-0 z-10">
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

      <div className="flex-1 flex min-h-0">
        {/* Left panel */}
        <div className="w-96 border-r border-border bg-white flex flex-col min-h-0 shrink-0">
          <div className="flex border-b border-border bg-[#FAFAFD] py-3">
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
                className="flex-1 flex flex-col items-center gap-1.5 group"
              >
                <span
                  className={`size-10 rounded-full flex items-center justify-center border transition-all ${
                    tab === t.id
                      ? "bg-foreground text-background border-foreground shadow-[0_2px_8px_rgba(20,18,31,0.22)]"
                      : "bg-white text-muted-foreground border-border group-hover:border-foreground/40 group-hover:text-foreground"
                  }`}
                >
                  <t.Icon className="size-4" />
                </span>
                <span
                  className={`text-[11px] transition-colors ${
                    tab === t.id ? "text-foreground font-semibold" : "text-muted-foreground font-medium"
                  }`}
                >
                  {t.label}
                </span>
              </button>
            ))}
          </div>


          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {tab === "content" && (
              <>
                <Section title="Media">
                  <UploadField label="Profile Photo" value={sig.data.photoUrl || ""} onChange={(v) => patch("photoUrl", v)} />
                  <UploadField label="Company Logo" value={sig.data.logoUrl || ""} onChange={(v) => patch("logoUrl", v)} />
                </Section>
                <Section title="Identity">
                  <Field label="Full Name" value={sig.data.name} onChange={(v) => patch("name", v)} />
                  <Field label="Job Title" value={sig.data.title} onChange={(v) => patch("title", v)} />
                  <Field label="Department" value={sig.data.department || ""} onChange={(v) => patch("department", v)} />
                  <Field label="Company" value={sig.data.company} onChange={(v) => patch("company", v)} />
                </Section>
                <Section title="Contact">
                  <Field label="Email" value={sig.data.email} onChange={(v) => patch("email", v)} type="email" />
                  <Field label="Mobile" value={sig.data.mobile} onChange={(v) => patch("mobile", v)} />
                  <Field label="Office Phone" value={sig.data.phone} onChange={(v) => patch("phone", v)} />
                  <Field label="Address" value={sig.data.address} onChange={(v) => patch("address", v)} />
                  <Field label="Address / Map URL" value={sig.data.mapUrl || ""} onChange={(v) => patch("mapUrl", v)} placeholder="https://maps.google.com/…" />
                  <Field label="Website" value={sig.data.website} onChange={(v) => patch("website", v)} placeholder="company.com" />
                </Section>
              </>
            )}

            {tab === "social" && (
              <Section title="Social Links">
                <p className="text-[11px] text-muted-foreground -mt-1 mb-1">
                  Only filled platforms are rendered. Use the arrows to reorder how they appear.
                </p>
                <SocialEditor sig={sig} setSig={setSig} />
              </Section>
            )}


            {tab === "extras" && (
              <>
                <Section title="Marketing">
                  <Field label="Tagline" value={sig.data.tagline || ""} onChange={(v) => patch("tagline", v)} placeholder="Building signature moments." />
                  <Field label="Quote" value={sig.data.quote || ""} onChange={(v) => patch("quote", v)} placeholder="Optional inspirational quote" />
                  <Field label="CTA Label" value={sig.data.ctaLabel || ""} onChange={(v) => patch("ctaLabel", v)} placeholder="Book a meeting" />
                  <Field label="CTA URL" value={sig.data.ctaUrl || ""} onChange={(v) => patch("ctaUrl", v)} placeholder="https://cal.com/…" />
                </Section>
                <Section title="Legal">
                  <label className="text-[10px] font-[JetBrains_Mono] text-muted-foreground uppercase">Disclaimer</label>
                  <textarea
                    value={sig.data.disclaimer || ""}
                    onChange={(e) => patch("disclaimer", e.target.value)}
                    rows={5}
                    className="w-full bg-stone-50 border border-border px-3 py-2 text-sm rounded focus:outline-none focus:ring-1 focus:ring-primary/40"
                  />
                </Section>
                <Section title="Visibility">
                  <Toggle label="Show icons" checked={sig.data.showIcons} onChange={(v) => patch("showIcons", v)} />
                  <Toggle label="Show social icons" checked={sig.data.showSocials} onChange={(v) => patch("showSocials", v)} />
                  <Toggle label="Show disclaimer" checked={sig.data.showDisclaimer} onChange={(v) => patch("showDisclaimer", v)} />
                </Section>
              </>
            )}

            {tab === "design" && (
              <DesignPane
                sig={sig}
                setSig={setSig}
                patch={patch}
                designSub={designSub}
                setDesignSub={setDesignSub}
                templateFilter={templateFilter}
                setTemplateFilter={setTemplateFilter}
              />
            )}
          </div>
        </div>

        {/* Preview — fixed, never scrolls out of view */}
        <div className="flex-1 bg-stone-50/50 p-8 flex flex-col items-center min-h-0 overflow-hidden">
          <div className="w-full max-w-3xl flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-4 shrink-0">
              <span className="text-[10px] font-[JetBrains_Mono] uppercase tracking-widest text-muted-foreground">
                Live Preview · {template.name}
              </span>
              <span className="text-[10px] font-[JetBrains_Mono] uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                Auto-saved <ChevronRight className="size-3" />
              </span>
            </div>
            <div className="bg-white shadow-sm ring-1 ring-black/5 rounded-lg overflow-hidden flex-1 min-h-0 overflow-y-auto">
              <div ref={previewRef}>{renderSignature(template, sig.data)}</div>
            </div>
            <div className="mt-6 flex items-center gap-3 shrink-0">
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
    <label className="flex items-center justify-between gap-3 text-sm py-1 cursor-pointer">
      <span className="min-w-0 flex-1">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`relative shrink-0 w-[38px] h-[22px] rounded-full transition-colors ${checked ? "bg-primary" : "bg-[#E4E4EE]"}`}
      >
        <span
          className={`absolute top-[2px] left-[2px] size-[18px] bg-white rounded-full shadow-sm transition-transform ${
            checked ? "translate-x-4" : "translate-x-0"
          }`}
        />
      </button>
    </label>
  );
}


function SliderField({
  label,
  min,
  max,
  step = 1,
  value,
  onChange,
  suffix = "",
  display,
}: {
  label: string;
  min: number;
  max: number;
  step?: number;
  value: number;
  onChange: (v: number) => void;
  suffix?: string;
  display?: (v: number) => string;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <label className="text-[10px] font-[JetBrains_Mono] text-muted-foreground uppercase">{label}</label>
        <span className="text-[10px] font-[JetBrains_Mono] text-foreground">{display ? display(value) : `${value}${suffix}`}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-primary"
      />
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] font-[JetBrains_Mono] text-muted-foreground uppercase">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-stone-50 border border-border px-3 py-2 text-sm rounded"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

function UploadField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [err, setErr] = useState<string | null>(null);
  function handleFiles(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setErr("Please choose an image file.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setErr("Image must be under 2 MB.");
      return;
    }
    setErr(null);
    const reader = new FileReader();
    reader.onload = () => onChange(String(reader.result || ""));
    reader.readAsDataURL(file);
  }
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-[JetBrains_Mono] text-muted-foreground uppercase">{label}</label>
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}
        className="flex items-center gap-3 p-2 border border-dashed border-border rounded bg-stone-50 hover:border-primary/40 transition-colors"
      >
        {value ? (
          <img src={value} alt={label} className="size-14 rounded object-cover ring-1 ring-border" />
        ) : (
          <div className="size-14 rounded bg-white ring-1 ring-border flex items-center justify-center text-[10px] text-muted-foreground uppercase font-[JetBrains_Mono]">
            None
          </div>
        )}
        <div className="flex-1 min-w-0">
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="px-2.5 py-1 rounded border border-border bg-white text-[11px] font-medium hover:border-foreground/40"
            >
              {value ? "Replace" : "Upload"}
            </button>
            {value && (
              <button
                type="button"
                onClick={() => onChange("")}
                className="px-2.5 py-1 rounded border border-border bg-white text-[11px] font-medium hover:border-destructive/40 text-destructive"
              >
                Remove
              </button>
            )}
          </div>
          <p className="text-[10px] text-muted-foreground mt-1 truncate">
            {value ? "Uploaded — drop a new image to replace." : "Drag & drop or click Upload · PNG/JPG · max 2 MB"}
          </p>
          {err && <p className="text-[10px] text-destructive mt-0.5">{err}</p>}
        </div>
      </div>
    </div>
  );
}

/* ---- Fetch Branding from website ---- */
type BrandInfo = { logoUrl?: string; primary?: string; accent?: string };

function BrandingField({
  value,
  onChange,
  onBranding,
}: {
  value: string;
  onChange: (v: string) => void;
  onBranding: (b: BrandInfo) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function fetchBranding() {
    if (!value.trim()) {
      setMsg("Enter a website first");
      setTimeout(() => setMsg(null), 3000);
      return;
    }
    setLoading(true);
    setMsg(null);
    try {
      const domain = value.trim().replace(/^https?:\/\//, "").replace(/^www\./, "").split("/")[0];
      const logoUrl = `https://logo.clearbit.com/${domain}`;
      const res = await fetch(logoUrl);
      if (!res.ok) throw new Error("No logo found");
      const blob = await res.blob();
      const dataUrl: string = await new Promise((resolve, reject) => {
        const r = new FileReader();
        r.onload = () => resolve(String(r.result || ""));
        r.onerror = reject;
        r.readAsDataURL(blob);
      });
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = dataUrl;
      await img.decode();
      const c = document.createElement("canvas");
      const w = (c.width = 64);
      const h = (c.height = 64);
      const ctx = c.getContext("2d")!;
      ctx.drawImage(img, 0, 0, w, h);
      const { data } = ctx.getImageData(0, 0, w, h);
      const buckets = new Map<string, { r: number; g: number; b: number; count: number; sat: number }>();
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
        if (a < 200) continue;
        const max = Math.max(r, g, b), min = Math.min(r, g, b);
        const lum = (max + min) / 2;
        if (lum < 25 || lum > 235) continue;
        const sat = max === 0 ? 0 : (max - min) / max;
        if (sat < 0.2) continue;
        const key = `${r >> 5}-${g >> 5}-${b >> 5}`;
        const cur = buckets.get(key);
        if (cur) {
          cur.r += r; cur.g += g; cur.b += b; cur.count++; cur.sat += sat;
        } else {
          buckets.set(key, { r, g, b, count: 1, sat });
        }
      }
      const sorted = [...buckets.values()].sort((a, b) => b.count * b.sat - a.count * a.sat);
      const toHex = (n: number) => n.toString(16).padStart(2, "0");
      const pick = (b: { r: number; g: number; b: number; count: number }) =>
        `#${toHex(Math.round(b.r / b.count))}${toHex(Math.round(b.g / b.count))}${toHex(Math.round(b.b / b.count))}`;
      const primary = sorted[0] ? pick(sorted[0]) : undefined;
      const accent = sorted[1] ? pick(sorted[1]) : undefined;
      onBranding({ logoUrl: dataUrl, primary, accent });
      setMsg("Branding applied ✓");
    } catch {
      setMsg("Couldn't fetch — logo may not be public");
    } finally {
      setLoading(false);
      setTimeout(() => setMsg(null), 3000);
    }
  }

  return (
    <div className="space-y-1">
      <label className="text-[10px] font-[JetBrains_Mono] text-muted-foreground uppercase">Website</label>
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="company.com"
          className="flex-1 bg-stone-50 border border-border px-3 py-2 text-sm rounded focus:outline-none focus:ring-1 focus:ring-primary/40"
        />
        <button
          type="button"
          onClick={fetchBranding}
          disabled={loading}
          className="px-3 py-2 rounded border border-primary bg-primary text-primary-foreground text-[11px] font-medium hover:bg-primary/90 disabled:opacity-60 whitespace-nowrap"
        >
          {loading ? "Fetching…" : "Fetch branding"}
        </button>
      </div>
      {msg && <p className="text-[10px] text-muted-foreground">{msg}</p>}
    </div>
  );
}

function SocialEditor({
  sig,
  setSig,
}: {
  sig: SavedSignature;
  setSig: React.Dispatch<React.SetStateAction<SavedSignature>>;
}) {
  const [showMore, setShowMore] = useState(false);

  const labelMap: Record<SocialKey, { label: string; placeholder: string }> = {
    linkedin: { label: "LinkedIn", placeholder: "https://linkedin.com/in/…" },
    twitter: { label: "Twitter / X", placeholder: "https://x.com/…" },
    facebook: { label: "Facebook", placeholder: "https://facebook.com/…" },
    instagram: { label: "Instagram", placeholder: "https://instagram.com/…" },
    youtube: { label: "YouTube", placeholder: "https://youtube.com/@…" },
    tiktok: { label: "TikTok", placeholder: "https://tiktok.com/@…" },
    whatsapp: { label: "WhatsApp", placeholder: "https://wa.me/…" },
    telegram: { label: "Telegram", placeholder: "https://t.me/…" },
    pinterest: { label: "Pinterest", placeholder: "https://pinterest.com/…" },
    snapchat: { label: "Snapchat", placeholder: "https://snapchat.com/add/…" },
    threads: { label: "Threads", placeholder: "https://threads.net/@…" },
    medium: { label: "Medium", placeholder: "https://medium.com/@…" },
    behance: { label: "Behance", placeholder: "https://behance.net/…" },
    dribbble: { label: "Dribbble", placeholder: "https://dribbble.com/…" },
    calendly: { label: "Calendly", placeholder: "https://calendly.com/…" },
    discord: { label: "Discord", placeholder: "https://discord.gg/…" },
    twitch: { label: "Twitch", placeholder: "https://twitch.tv/…" },
    spotify: { label: "Spotify", placeholder: "https://open.spotify.com/…" },
    slack: { label: "Slack", placeholder: "https://…slack.com" },
    bluesky: { label: "Bluesky", placeholder: "https://bsky.app/profile/…" },
    mastodon: { label: "Mastodon", placeholder: "https://mastodon.social/@…" },
    website: { label: "Website", placeholder: "https://…" },
  };

  // Build the current effective order (persist featured order first if none saved)
  const savedOrder = sig.data.socialOrder && sig.data.socialOrder.length ? sig.data.socialOrder : null;
  const baseOrder: SocialKey[] = savedOrder
    ? [...savedOrder, ...ALL_SOCIAL_KEYS.filter((k) => !savedOrder.includes(k))]
    : [...FEATURED_SOCIAL_KEYS, ...ALL_SOCIAL_KEYS.filter((k) => !FEATURED_SOCIAL_KEYS.includes(k))];

  const featuredKeys = baseOrder.filter((k) => FEATURED_SOCIAL_KEYS.includes(k));
  const moreKeys = baseOrder.filter((k) => !FEATURED_SOCIAL_KEYS.includes(k));

  function setSocial(k: SocialKey, v: string) {
    setSig((s) => ({
      ...s,
      data: { ...s.data, socials: { ...s.data.socials, [k]: v } },
      updatedAt: Date.now(),
    }));
  }

  function move(list: SocialKey[], key: SocialKey, dir: -1 | 1) {
    const idx = list.indexOf(key);
    const target = idx + dir;
    if (idx < 0 || target < 0 || target >= list.length) return;
    // Reorder within its group, then rebuild full order preserving groups
    const newGroup = [...list];
    [newGroup[idx], newGroup[target]] = [newGroup[target], newGroup[idx]];
    const rebuilt: SocialKey[] =
      list === featuredKeys ? [...newGroup, ...moreKeys] : [...featuredKeys, ...newGroup];
    setSig((s) => ({ ...s, data: { ...s.data, socialOrder: rebuilt }, updatedAt: Date.now() }));
  }

  function Row({ k, list }: { k: SocialKey; list: SocialKey[] }) {
    const meta = labelMap[k];
    const idx = list.indexOf(k);
    return (
      <div className="flex items-end gap-1.5">
        <div className="flex-1">
          <Field
            label={meta.label}
            value={sig.data.socials[k] || ""}
            onChange={(v) => setSocial(k, v)}
            placeholder={meta.placeholder}
          />
        </div>
        <div className="flex flex-col gap-0.5 pb-[2px]">
          <button
            type="button"
            onClick={() => move(list, k, -1)}
            disabled={idx === 0}
            className="p-1 rounded border border-border bg-stone-50 hover:bg-stone-100 disabled:opacity-30"
            aria-label={`Move ${meta.label} up`}
          >
            <ArrowUp size={12} />
          </button>
          <button
            type="button"
            onClick={() => move(list, k, 1)}
            disabled={idx === list.length - 1}
            className="p-1 rounded border border-border bg-stone-50 hover:bg-stone-100 disabled:opacity-30"
            aria-label={`Move ${meta.label} down`}
          >
            <ArrowDown size={12} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {featuredKeys.map((k) => (
        <Row key={k} k={k} list={featuredKeys} />
      ))}
      <button
        type="button"
        onClick={() => setShowMore((v) => !v)}
        className="mt-2 w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded border border-dashed border-border text-[12px] text-muted-foreground hover:bg-stone-50"
      >
        <Plus size={14} />
        {showMore ? "Hide extra platforms" : `Show ${moreKeys.length} more platforms`}
      </button>
      {showMore && (
        <div className="space-y-2 pt-1">
          {moreKeys.map((k) => (
            <Row key={k} k={k} list={moreKeys} />
          ))}
        </div>
      )}
    </div>
  );
}

function SocialIconPreview({ sig }: { sig: SavedSignature }) {
  const d = sig.data;
  const style = (d.socialIconStyle ?? "color") as "color" | "solid" | "outline" | "plain";
  const size = d.socialIconSize ?? 30;
  const finalColor = d.socialIconColor || d.primaryColor;
  const keys = FEATURED_SOCIAL_KEYS;
  const glyph = Math.round(size * 0.62);
  return (
    <div className="rounded-lg border border-border bg-stone-50 p-3">
      <p className="text-[10px] uppercase tracking-wider font-[JetBrains_Mono] text-muted-foreground mb-2">
        Live preview
      </p>
      <div className="flex items-center gap-1.5 flex-wrap">
        {keys.map((k) => {
          const Glyph = socialGlyphMap[k];
          const isColor = style === "color";
          const isPlain = style === "plain";
          const isOutline = style === "outline";
          const brand = socialBrandColor[k] || finalColor;
          const glyphColor = isColor ? brand : isPlain || isOutline ? finalColor : "#fff";
          return (
            <span
              key={k}
              title={k}
              style={{
                width: size,
                height: size,
                background: isColor || isPlain || isOutline ? "transparent" : finalColor,
                color: glyphColor,
                fill: glyphColor,
                border: isOutline ? `1px solid ${finalColor}` : "none",
                borderRadius: isColor || isPlain ? 0 : "9999px",
              }}
              className="inline-flex items-center justify-center overflow-hidden"
            >
              <Glyph style={{ width: glyph, height: glyph, color: glyphColor, fill: glyphColor }} />
            </span>
          );
        })}
      </div>
    </div>
  );
}



/* ============================================================
 * Design tab — sub-tabbed panes (Template · Palette · Type · Icons)
 * ============================================================ */

function DesignPane({
  sig,
  setSig,
  patch,
  designSub,
  setDesignSub,
  templateFilter,
  setTemplateFilter,
}: {
  sig: SavedSignature;
  setSig: React.Dispatch<React.SetStateAction<SavedSignature>>;
  patch: <K extends keyof SignatureData>(k: K, v: SignatureData[K]) => void;
  designSub: DesignSub;
  setDesignSub: React.Dispatch<React.SetStateAction<DesignSub>>;
  templateFilter: TemplateFilter;
  setTemplateFilter: React.Dispatch<React.SetStateAction<TemplateFilter>>;
}) {
  const subs: { id: DesignSub; label: string }[] = [
    { id: "template", label: "Template" },
    { id: "palette", label: "Palette" },
    { id: "type", label: "Type" },
    { id: "icons", label: "Icons" },
  ];

  return (
    <div className="-mx-5 -mt-5">
      {/* Sticky sub-nav */}
      <div className="sticky top-0 z-10 bg-[#FAFAFD] border-b border-[#EDEDF4] px-5 py-3">
        <div
          className="grid grid-cols-4 gap-0 p-[3px] rounded-[11px]"
          style={{ background: "#EFEFF5" }}
        >
          {subs.map((s) => {
            const active = designSub === s.id;
            return (
              <button
                key={s.id}
                onClick={() => setDesignSub(s.id)}
                className="text-[12px] py-1.5 rounded-[8px] transition-all"
                style={{
                  background: active ? "#fff" : "transparent",
                  color: active ? "#14121F" : "#6B7280",
                  fontWeight: active ? 600 : 500,
                  boxShadow: active ? "0 1px 3px rgba(20,18,31,.14)" : "none",
                }}
              >
                {s.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-5 pt-5 pb-4">
        {designSub === "template" && (
          <TemplatePane
            sig={sig}
            setSig={setSig}
            filter={templateFilter}
            setFilter={setTemplateFilter}
          />
        )}
        {designSub === "palette" && <PalettePane sig={sig} patch={patch} />}
        {designSub === "type" && <TypePane sig={sig} patch={patch} />}
        {designSub === "icons" && <IconsPane sig={sig} patch={patch} />}
      </div>
    </div>
  );
}

/* ---- Template pane ---- */
function TemplatePane({
  sig,
  setSig,
  filter,
  setFilter,
}: {
  sig: SavedSignature;
  setSig: React.Dispatch<React.SetStateAction<SavedSignature>>;
  filter: TemplateFilter;
  setFilter: React.Dispatch<React.SetStateAction<TemplateFilter>>;
}) {
  const filters: TemplateFilter[] = ["All", "Corporate", "Minimal", "Creative", "Bold"];
  const filtered = filter === "All" ? templates : templates.filter((t) => t.category === filter);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-1.5">
        {filters.map((f) => {
          const active = filter === f;
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="px-3 py-1 rounded-full text-[11px] transition-colors"
              style={{
                background: active ? "#14121F" : "transparent",
                color: active ? "#fff" : "#6B7280",
                border: active ? "1px solid #14121F" : "1px solid #E4E4EE",
                fontWeight: active ? 600 : 500,
              }}
            >
              {f}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        {filtered.map((t) => {
          const selected = sig.templateId === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setSig((s) => ({ ...s, templateId: t.id }))}
              className="text-left p-2.5 rounded-[12px] transition-all bg-white"
              style={{
                border: selected ? "2px solid #5B2EFF" : "1px solid #E4E4EE",
                background: selected ? "#F8F6FF" : "#fff",
              }}
            >
              <div
                className="rounded-md p-2 mb-2 flex flex-col justify-between"
                style={{ background: "#F5F5FA", height: 52 }}
              >
                <div className="space-y-1">
                  <div className="h-[3px] rounded-full bg-[#D4D4DE]" style={{ width: "72%" }} />
                  <div className="h-[3px] rounded-full bg-[#D4D4DE]" style={{ width: "54%" }} />
                  <div className="h-[3px] rounded-full bg-[#D4D4DE]" style={{ width: "40%" }} />
                </div>
                <div className="flex items-center gap-1 mt-1">
                  <span className={`inline-block ${t.accent}`} style={{ width: 7, height: 7, borderRadius: 999 }} />
                  <span className="inline-block bg-[#D4D4DE]" style={{ width: 7, height: 7, borderRadius: 999 }} />
                  <span className="inline-block bg-[#D4D4DE]" style={{ width: 7, height: 7, borderRadius: 999 }} />
                </div>
              </div>
              <div className="flex items-center justify-between gap-1">
                <span className="text-[13px] font-semibold text-[#14121F] truncate">{t.name}</span>
                {selected && <Check className="size-3.5 shrink-0" style={{ color: "#5B2EFF" }} />}
              </div>
              <div className="text-[11px] text-[#9A9AA8] mt-0.5">{t.category}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ---- Palette pane ---- */
function PalettePane({
  sig,
  patch,
}: {
  sig: SavedSignature;
  patch: <K extends keyof SignatureData>(k: K, v: SignatureData[K]) => void;
}) {
  const selected = PALETTES.find(
    (p) => p.primary.toLowerCase() === (sig.data.primaryColor || "").toLowerCase()
  );

  function applyPalette(p: (typeof PALETTES)[number]) {
    patch("primaryColor", p.primary);
    patch("accentColor", p.accent);
    patch("themeColor", p.primary);
    patch("iconColor", p.primary);
    patch("socialIconColor", p.primary);
    patch("linkColor", p.primary);
    patch("dividingLineColor", p.primary);
    patch("titleColor", p.dark);
    patch("textColor", p.dark);
  }

  const roles: { key: keyof SignatureData; label: string; fallback?: keyof SignatureData }[] = [
    { key: "themeColor", label: "Theme", fallback: "primaryColor" },
    { key: "primaryColor", label: "Primary" },
    { key: "accentColor", label: "Accent" },
    { key: "titleColor", label: "Title", fallback: "textColor" },
    { key: "textColor", label: "Text" },
    { key: "mutedColor", label: "Muted" },
    { key: "linkColor", label: "Link", fallback: "primaryColor" },
    { key: "socialIconColor", label: "Social icon", fallback: "primaryColor" },
    { key: "dividingLineColor", label: "Divider", fallback: "primaryColor" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between">
        <div className="flex items-baseline gap-2">
          <h4 className="text-[15px] font-semibold text-[#14121F]">Palettes</h4>
          <span className="text-[12px] text-[#9A9AA8]">4 presets · or edit below</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        {PALETTES.map((p) => {
          const active = selected?.name === p.name;
          return (
            <button
              key={p.name}
              onClick={() => applyPalette(p)}
              className="p-2.5 rounded-[12px] text-left transition-all"
              style={{
                border: active ? "2px solid #5B2EFF" : "1px solid #E9E9F1",
                background: active ? "#F8F6FF" : "#fff",
              }}
            >
              <div
                className="flex overflow-hidden rounded-lg"
                style={{ height: 34 }}
              >
                <span style={{ background: p.primary, flex: 2 }} />
                <span style={{ background: p.accent, flex: 1 }} />
                <span style={{ background: p.dark, flex: 1 }} />
              </div>
              <div className="flex items-center justify-between mt-1.5 gap-1">
                <span className="text-[13px] font-medium text-[#14121F] truncate">{p.name}</span>
                {active && <Check className="size-3.5 shrink-0" style={{ color: "#5B2EFF" }} />}
              </div>
            </button>
          );
        })}
      </div>

      <div className="pt-2 border-t" style={{ borderColor: "#EDEDF4" }}>
        <div className="flex items-center justify-between mb-2">
          <span
            className="text-[11px] font-semibold uppercase"
            style={{ letterSpacing: "0.16em", color: "#8A8A98" }}
          >
            Roles in this palette
          </span>
          <button
            type="button"
            className="text-[12px] font-semibold"
            style={{ color: "#5B2EFF" }}
            onClick={() => {
              const el = document.getElementById("role-primaryColor-input") as HTMLInputElement | null;
              el?.click();
            }}
          >
            Edit all
          </button>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {roles.map((r) => (
            <RoleChip
              key={String(r.key)}
              label={r.label}
              value={
                (sig.data[r.key] as string) ||
                (r.fallback ? (sig.data[r.fallback] as string) : "#000000")
              }
              onChange={(v) => patch(r.key as any, v as any)}
              inputId={`role-${String(r.key)}-input`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function RoleChip({
  label,
  value,
  onChange,
  inputId,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  inputId?: string;
}) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <button
      type="button"
      onClick={() => ref.current?.click()}
      className="flex items-center gap-2 rounded-[10px] py-2 px-2.5 text-left transition-colors hover:bg-[#FAFAFD]"
      style={{ border: "1px solid #EDEDF4", background: "#fff" }}
    >
      <span
        className="rounded"
        style={{ width: 20, height: 20, background: value, border: "1px solid rgba(0,0,0,.06)" }}
      />
      <span className="text-[12px] text-[#14121F] flex-1 truncate">{label}</span>
      <span className="text-[11px] font-mono text-[#9A9AA8]">{value.toUpperCase()}</span>
      <input
        id={inputId}
        ref={ref}
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="sr-only"
      />
    </button>
  );
}

/* ---- Type pane ---- */
function TypePane({
  sig,
  patch,
}: {
  sig: SavedSignature;
  patch: <K extends keyof SignatureData>(k: K, v: SignatureData[K]) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <label className="text-[12px] text-[#6B7280]">Font family</label>
        <select
          value={sig.data.fontFamily}
          onChange={(e) => patch("fontFamily", e.target.value)}
          className="w-full bg-white border px-3 py-2 text-sm rounded-lg"
          style={{ borderColor: "#E4E4EE" }}
        >
          {FONTS.map((f) => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>
      </div>

      <SliderField
        label="Body size"
        min={10}
        max={20}
        value={sig.data.fontSize ?? 13}
        onChange={(v) => patch("fontSize", v)}
        suffix="px"
      />
      <Toggle
        label="Separate title size"
        checked={!!sig.data.separateTitleFontSize}
        onChange={(v) => patch("separateTitleFontSize", v)}
      />
      {sig.data.separateTitleFontSize && (
        <SliderField
          label="Title size"
          min={12}
          max={32}
          value={sig.data.titleFontSize ?? 17}
          onChange={(v) => patch("titleFontSize", v)}
          suffix="px"
        />
      )}
      <SliderField
        label="Line height"
        min={10}
        max={22}
        value={Math.round((sig.data.lineHeight ?? 1.3) * 10)}
        onChange={(v) => patch("lineHeight", v / 10)}
        display={(v) => (v / 10).toFixed(1)}
      />

      <div className="space-y-1.5">
        <label className="text-[12px] text-[#6B7280]">Spacing</label>
        <div
          className="grid grid-cols-3 gap-0 p-[3px] rounded-[11px]"
          style={{ background: "#EFEFF5" }}
        >
          {(["compact", "medium", "large"] as const).map((s, i) => {
            const current = sig.data.spacing || "large";
            const active = current === s;
            return (
              <button
                key={s}
                onClick={() => patch("spacing", s)}
                className="text-[12px] py-1.5 rounded-[8px] transition-all"
                style={{
                  background: active ? "#fff" : "transparent",
                  color: active ? "#14121F" : "#6B7280",
                  fontWeight: active ? 600 : 500,
                  boxShadow: active ? "0 1px 3px rgba(20,18,31,.14)" : "none",
                }}
              >
                {["S", "M", "L"][i]}
              </button>
            );
          })}
        </div>
      </div>

      <Toggle
        label="Separate website line"
        checked={!!sig.data.separateWebsite}
        onChange={(v) => patch("separateWebsite", v)}
      />
    </div>
  );
}

/* ---- Icons pane ---- */
function IconsPane({
  sig,
  patch,
}: {
  sig: SavedSignature;
  patch: <K extends keyof SignatureData>(k: K, v: SignatureData[K]) => void;
}) {
  const socialStyles: { id: "solid" | "outline" | "color"; label: string }[] = [
    { id: "solid", label: "Solid" },
    { id: "outline", label: "Outline" },
    { id: "color", label: "Brand" },
  ];
  const current = sig.data.socialIconStyle || "color";

  return (
    <div className="space-y-4">
      <Toggle
        label="Show social icons"
        checked={sig.data.showSocials}
        onChange={(v) => patch("showSocials", v)}
      />

      <div className="space-y-1.5">
        <label className="text-[12px] text-[#6B7280]">Icon style</label>
        <div className="grid grid-cols-3 gap-2">
          {socialStyles.map((s) => {
            const active = current === s.id;
            return (
              <button
                key={s.id}
                onClick={() => patch("socialIconStyle", s.id)}
                className="rounded-[10px] py-3 text-[12px] font-medium transition-all"
                style={{
                  border: active ? "2px solid #5B2EFF" : "1px solid #E4E4EE",
                  background: active ? "#F6F4FF" : "#fff",
                  color: active ? "#14121F" : "#6B7280",
                }}
              >
                {s.label}
              </button>
            );
          })}
        </div>
      </div>

      <SliderField
        label="Icon size"
        min={14}
        max={48}
        value={sig.data.socialIconSize ?? 30}
        onChange={(v) => patch("socialIconSize", v)}
        suffix="px"
      />

      <SocialIconPreview sig={sig} />

      <div className="pt-3 border-t" style={{ borderColor: "#EDEDF4" }}>
        <Toggle
          label="Show dividing lines"
          checked={sig.data.showDividingLines !== false}
          onChange={(v) => patch("showDividingLines", v)}
        />
        <SliderField
          label="Line thickness"
          min={1}
          max={8}
          value={sig.data.dividingLineSize ?? 2}
          onChange={(v) => patch("dividingLineSize", v)}
          suffix="px"
        />
      </div>

      <div className="pt-3 border-t" style={{ borderColor: "#EDEDF4" }}>
        <SliderField
          label="Logo width"
          min={60}
          max={320}
          value={sig.data.logoWidth ?? 150}
          onChange={(v) => patch("logoWidth", v)}
          suffix="px"
        />
      </div>
    </div>
  );
}
