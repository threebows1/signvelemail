import { Logo } from "@/components/Logo";
import { Mail, Phone, Smartphone, MapPin, Link as LinkIcon, Facebook, Linkedin, Instagram, Youtube, Globe, Twitter } from "lucide-react";
import type { ReactNode } from "react";

export type TemplateMeta = {
  id: string;
  name: string;
  category: "Corporate" | "Creative" | "Minimal" | "Bold" | "Executive";
  accent: string; // tailwind bg for chip
  description: string;
  render: () => ReactNode;
};

/* ------------- Shared demo person ------------- */
const person = {
  name: "Farrukh Shahzad",
  title: "Marketing Manager",
  company: "Al Riyady Group",
  email: "farrukh@alriyady.ae",
  mobile: "+971 50 274 9769",
  phone: "+971 4 591 8185",
  address: "The Curve Building - Office No. M 47, Dubai - UAE",
  website: "alriyadygroup.ae",
};

/* ------------- 1. Al Riyady (exact reference) ------------- */
function AlRiyadyTemplate() {
  const ring = "border border-[#C88A1E]";
  const iconWrap = `flex items-center justify-center size-7 rounded-full bg-[#C88A1E] text-white shrink-0`;
  const iconOutline = `flex items-center justify-center size-7 rounded-full ${ring} text-[#C88A1E] shrink-0`;
  return (
    <div className="bg-white p-8 font-[Arial,sans-serif] text-[#333]">
      <div className="mb-2">
        <p className="text-[17px] font-bold text-black leading-tight">{person.name}</p>
        <p className="text-[15px] text-neutral-500 leading-snug">{person.title}</p>
        <p className="text-[15px] text-neutral-500 leading-snug">{person.company}</p>
      </div>
      <div className="h-[2px] bg-[#C88A1E] my-3" />
      <div className="flex items-start gap-8 my-4">
        <div className="shrink-0 w-[180px]">
          <div className="text-[#0A2A5E] font-black tracking-widest">
            <div className="text-right text-[22px] font-serif" dir="rtl">الريادي</div>
            <div className="text-[#C88A1E] text-[28px] leading-none font-black italic mt-1">AL RIYADY</div>
            <div className="border-t-2 border-[#0A2A5E] mt-1" />
            <div className="text-[#0A2A5E] text-[11px] tracking-[0.4em] mt-1 text-right">G R O U P</div>
          </div>
        </div>
        <div className="flex-1 space-y-2 text-[14px]">
          <div className="flex items-center gap-3"><span className={iconWrap}><Mail className="size-3.5" /></span><span>{person.email}</span></div>
          <div className="flex items-center gap-3"><span className={iconWrap}><Smartphone className="size-3.5" /></span><span>{person.mobile}</span></div>
          <div className="flex items-center gap-3"><span className={iconWrap}><Phone className="size-3.5" /></span><span>{person.phone}</span></div>
          <div className="flex items-center gap-3"><span className={iconWrap}><MapPin className="size-3.5" /></span><span>{person.address}</span></div>
          <div className="flex items-center gap-3"><span className={iconWrap}><LinkIcon className="size-3.5" /></span><span className="font-bold text-neutral-700">{person.website}</span></div>
        </div>
      </div>
      <div className="h-[2px] bg-[#C88A1E] mt-4 mb-3" />
      <div className="flex items-center gap-2 mb-4">
        {[Facebook, Linkedin, Instagram, Youtube].map((Icon, i) => (
          <span key={i} className={iconOutline}><Icon className="size-3.5" /></span>
        ))}
        <span className={iconOutline}><span className="text-[11px] font-bold">♪</span></span>
      </div>
      <p className="text-[11px] text-neutral-500 leading-relaxed">
        The content of this email is confidential and intended for the recipient specified in message only. It is strictly forbidden to share any part of this message with any third party, without a written consent of the sender. If you received this message by mistake, please reply to this message and follow with its deletion, so that we can ensure such a mistake does not occur in the future.
      </p>
    </div>
  );
}

/* ------------- 2. Left Line (Sign Vel default) ------------- */
function LeftLineTemplate() {
  return (
    <div className="bg-white p-8 font-sans">
      <div className="flex items-start gap-6 border-l-2 border-[#5B2EFF] pl-6">
        <div className="size-16 rounded bg-stone-50 shrink-0 border border-black/5 flex items-center justify-center">
          <Logo size={40} showWordmark={false} />
        </div>
        <div>
          <h3 className="text-xl font-bold tracking-tight text-neutral-900">{person.name}</h3>
          <p className="text-sm text-neutral-500 mb-4 italic">{person.title} · {person.company}</p>
          <div className="space-y-1 text-[12px] text-neutral-600">
            <p>T: {person.phone}</p>
            <p>E: {person.email}</p>
            <p className="font-bold text-neutral-900">W: {person.website}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------- 3. Stacked Minimal ------------- */
function StackedMinimalTemplate() {
  return (
    <div className="bg-white p-8 font-sans max-w-md">
      <p className="text-[15px] font-semibold text-neutral-900">{person.name}</p>
      <p className="text-[13px] text-neutral-500 mb-3">{person.title}, {person.company}</p>
      <div className="text-[12px] text-neutral-700 space-y-0.5">
        <p><span className="text-neutral-400">e</span> {person.email}</p>
        <p><span className="text-neutral-400">m</span> {person.mobile}</p>
        <p><span className="text-neutral-400">w</span> <span className="underline">{person.website}</span></p>
      </div>
    </div>
  );
}

/* ------------- 4. Photo + vertical rule ------------- */
function PhotoCardTemplate() {
  return (
    <div className="bg-white p-6 font-sans">
      <div className="flex items-center gap-5">
        <div className="size-20 rounded-full bg-gradient-to-br from-[#5B2EFF] to-[#00E5A0] flex items-center justify-center text-white text-2xl font-bold shrink-0">
          FS
        </div>
        <div className="border-l border-neutral-200 pl-5">
          <p className="text-lg font-bold text-neutral-900">{person.name}</p>
          <p className="text-sm text-[#5B2EFF] font-medium">{person.title}</p>
          <p className="text-xs text-neutral-500 mb-2">{person.company}</p>
          <div className="text-[11px] text-neutral-600 space-x-3">
            <span>{person.mobile}</span>·<span>{person.email}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------- 5. Corporate Blue table style ------------- */
function CorporateBlueTemplate() {
  return (
    <div className="bg-white p-6 font-[Georgia,serif]">
      <table className="text-[13px]">
        <tbody>
          <tr>
            <td className="pr-6 border-r-2 border-[#1E40AF] align-top">
              <div className="text-[#1E40AF] font-bold text-xl leading-tight">{person.name}</div>
              <div className="italic text-neutral-600">{person.title}</div>
              <div className="text-neutral-500 text-[12px] mt-1">{person.company}</div>
            </td>
            <td className="pl-6 align-top text-neutral-700 text-[12px] space-y-0.5">
              <div><b>D</b> {person.phone}</div>
              <div><b>M</b> {person.mobile}</div>
              <div><b>E</b> <a className="text-[#1E40AF]">{person.email}</a></div>
              <div><b>W</b> <a className="text-[#1E40AF]">{person.website}</a></div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

/* ------------- 6. Banner Bottom ------------- */
function BannerBottomTemplate() {
  return (
    <div className="bg-white font-sans">
      <div className="p-6">
        <p className="text-base font-bold text-neutral-900">{person.name}</p>
        <p className="text-sm text-neutral-500">{person.title} · {person.company}</p>
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-neutral-600">
          <span>{person.email}</span>
          <span>{person.mobile}</span>
          <span className="underline">{person.website}</span>
        </div>
      </div>
      <div className="bg-gradient-to-r from-[#5B2EFF] to-[#00E5A0] text-white px-6 py-3 flex items-center justify-between">
        <span className="text-xs font-medium tracking-wide">✨ New: AI signature deployment across your team</span>
        <span className="text-[11px] uppercase tracking-widest">Learn more →</span>
      </div>
    </div>
  );
}

/* ------------- 7. Compact Mono ------------- */
function CompactMonoTemplate() {
  return (
    <div className="bg-white p-6 font-[JetBrains_Mono,monospace] text-[12px] text-neutral-800">
      <p>-- </p>
      <p className="font-bold">{person.name.toUpperCase()}</p>
      <p className="text-neutral-500">{person.title} // {person.company}</p>
      <p className="mt-2">{person.email}</p>
      <p>{person.mobile}</p>
      <p>{person.website}</p>
    </div>
  );
}

/* ------------- 8. Executive Serif ------------- */
function ExecutiveSerifTemplate() {
  return (
    <div className="bg-white p-8 font-[Georgia,serif]">
      <p className="text-2xl text-neutral-900" style={{ fontVariant: "small-caps" }}>{person.name}</p>
      <div className="w-16 h-px bg-neutral-900 my-2" />
      <p className="italic text-neutral-600 text-sm">{person.title}</p>
      <p className="text-sm text-neutral-800 mt-1 mb-4">{person.company}</p>
      <div className="text-[12px] text-neutral-600 space-y-0.5">
        <p>{person.address}</p>
        <p>{person.phone} · {person.email}</p>
      </div>
    </div>
  );
}

/* ------------- 9. Green Sustainability ------------- */
function GreenTemplate() {
  return (
    <div className="bg-white p-6 font-sans">
      <div className="flex items-center gap-4">
        <div className="size-14 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold">FS</div>
        <div>
          <p className="font-bold text-neutral-900">{person.name}</p>
          <p className="text-sm text-emerald-700">{person.title}</p>
          <p className="text-xs text-neutral-500">{person.company}</p>
        </div>
      </div>
      <div className="mt-4 pt-3 border-t border-emerald-100 text-[12px] text-neutral-600 flex flex-wrap gap-x-4">
        <span>📧 {person.email}</span>
        <span>📱 {person.mobile}</span>
        <span>🌱 {person.website}</span>
      </div>
      <p className="mt-3 text-[10px] text-emerald-700 italic">🌍 Please consider the environment before printing this email.</p>
    </div>
  );
}

/* ------------- 10. Bold Modern ------------- */
function BoldModernTemplate() {
  return (
    <div className="bg-neutral-900 text-white p-8 font-sans">
      <p className="text-[10px] uppercase tracking-[0.3em] text-[#00E5A0] mb-2">Marketing</p>
      <p className="text-2xl font-bold leading-tight">{person.name}</p>
      <p className="text-sm text-neutral-400 mb-4">{person.title} at {person.company}</p>
      <div className="grid grid-cols-2 gap-2 text-[12px] text-neutral-300 max-w-md">
        <span>{person.email}</span>
        <span>{person.mobile}</span>
        <span className="col-span-2 text-[#00E5A0]">{person.website}</span>
      </div>
    </div>
  );
}

export const templates: TemplateMeta[] = [
  { id: "al-riyady", name: "Al Riyady Corporate", category: "Corporate", accent: "bg-[#C88A1E]", description: "Gold-accented executive layout with icon contact rows, brand logo, and legal disclaimer.", render: AlRiyadyTemplate },
  { id: "left-line", name: "Left Line", category: "Minimal", accent: "bg-[#5B2EFF]", description: "Clean vertical accent bar. Sign Vel signature default.", render: LeftLineTemplate },
  { id: "stacked", name: "Stacked Minimal", category: "Minimal", accent: "bg-neutral-400", description: "Ultra-quiet stacked lines, no icons, no chrome.", render: StackedMinimalTemplate },
  { id: "photo-card", name: "Portrait Card", category: "Creative", accent: "bg-gradient-to-br from-[#5B2EFF] to-[#00E5A0]", description: "Circular avatar with vertical rule. Great for client-facing roles.", render: PhotoCardTemplate },
  { id: "corp-blue", name: "Corporate Blue", category: "Corporate", accent: "bg-[#1E40AF]", description: "Two-column serif layout — legal, finance, and consulting.", render: CorporateBlueTemplate },
  { id: "banner", name: "Promo Banner", category: "Bold", accent: "bg-gradient-to-r from-[#5B2EFF] to-[#00E5A0]", description: "Bottom banner strip for marketing announcements.", render: BannerBottomTemplate },
  { id: "mono", name: "Compact Mono", category: "Minimal", accent: "bg-neutral-800", description: "Terminal-flavored monospace signature for engineers.", render: CompactMonoTemplate },
  { id: "exec-serif", name: "Executive Serif", category: "Executive", accent: "bg-neutral-900", description: "Small-caps serif — quiet, senior, timeless.", render: ExecutiveSerifTemplate },
  { id: "green", name: "Sustainability", category: "Creative", accent: "bg-emerald-600", description: "Warm emerald palette with eco footer note.", render: GreenTemplate },
  { id: "bold-dark", name: "Bold Modern", category: "Bold", accent: "bg-neutral-900", description: "High-contrast dark card with mint kicker — brand-forward.", render: BoldModernTemplate },
];
