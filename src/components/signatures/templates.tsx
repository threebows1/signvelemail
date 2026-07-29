import { Mail, Phone, Smartphone, MapPin, Link as LinkIcon } from "lucide-react";
import type { ReactNode } from "react";
import type { SignatureData, SocialKey } from "@/lib/signature-store";
import { socialGlyphMap, socialBrandColor } from "@/components/signatures/social-icons";

export type TemplateLayout = "single" | "two-column" | "vertical";

export type TemplateMeta = {
  id: string;
  name: string;
  category: "Corporate" | "Creative" | "Minimal" | "Bold" | "Executive" | "Custom";
  layout: TemplateLayout;
  accent: string;
  description: string;
  render: (d: SignatureData) => ReactNode;
};

/* ---------- helpers ---------- */
const Initials = ({ name, bg, fg = "#fff", size = 56 }: { name: string; bg: string; fg?: string; size?: number }) => {
  const initials = name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
  return (
    <div
      style={{ width: size, height: size, background: bg, color: fg, fontFamily: "inherit" }}
      className="rounded-full flex items-center justify-center font-bold shrink-0"
    >
      {initials}
    </div>
  );
};

const Avatar = ({ d, size = 56 }: { d: SignatureData; size?: number }) => {
  if (d.photoUrl) {
    return <img src={d.photoUrl} alt={d.name} style={{ width: size, height: size }} className="rounded-full object-cover shrink-0" />;
  }
  return <Initials name={d.name} bg={d.primaryColor} size={size} />;
};

const Socials = ({ d, color, ring = false, size }: { d: SignatureData; color: string; ring?: boolean; size?: number }) => {
  if (!d.showSocials) return null;
  const style = d.socialIconStyle ?? (ring ? "outline" : "solid");
  const finalSize = size ?? d.socialIconSize ?? 26;
  const finalColor = d.socialIconColor || color;
  const defaultOrder: SocialKey[] = [
    "facebook", "instagram", "linkedin", "tiktok", "youtube", "pinterest",
    "twitter", "whatsapp", "telegram", "snapchat", "threads", "medium",
    "behance", "dribbble", "calendly", "discord", "twitch", "spotify",
    "slack", "bluesky", "mastodon", "website",
  ];
  const order = (d.socialOrder && d.socialOrder.length ? d.socialOrder : defaultOrder) as SocialKey[];
  const seen = new Set(order as string[]);
  const fullOrder = [...order, ...defaultOrder.filter((k) => !seen.has(k))];
  const items = fullOrder
    .map((k) => ({ url: (d.socials as any)[k], Icon: socialGlyphMap[k], key: k }))
    .filter((s) => s.url && s.Icon);

  const glyphSize = Math.round(finalSize * 0.62);

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {items.map(({ Icon, key }, i) => {
        const isColor = style === "color";
        const isPlain = style === "plain";
        const isOutline = style === "outline";
        const brand = socialBrandColor[key] || finalColor;
        const glyphColor = isColor ? brand : isPlain || isOutline ? finalColor : "#fff";
        return (
          <span
            key={i}
            style={{
              width: finalSize,
              height: finalSize,
              background: isColor || isPlain || isOutline ? "transparent" : finalColor,
              color: glyphColor,
              fill: glyphColor,
              border: isOutline ? `1px solid ${finalColor}` : "none",
              borderRadius: isColor || isPlain ? 0 : "9999px",
            }}
            className="inline-flex items-center justify-center overflow-hidden"
          >
            <Icon style={{ width: glyphSize, height: glyphSize, color: glyphColor, fill: glyphColor }} />
          </span>
        );
      })}
    </div>
  );
};

const Disclaimer = ({ d }: { d: SignatureData }) =>
  d.showDisclaimer && d.disclaimer ? (
    <p className="mt-3 text-[10.5px] leading-relaxed" style={{ color: d.mutedColor }}>
      {d.disclaimer}
    </p>
  ) : null;

const IconRow = ({ Icon, text, color, ring = false, d }: { Icon: any; text: string; color: string; ring?: boolean; d?: SignatureData }) => {
  const style = d?.iconStyle ?? (ring ? "outline" : "solid");
  const iconColor = d?.iconColor || color;
  const size = d?.iconSize ?? 24;
  const isPlain = style === "plain";
  const isOutline = style === "outline";
  const isNone = style === "none";
  return (
    <div className="flex items-center gap-3" style={{ fontSize: d?.fontSize ? `${d.fontSize}px` : "13px", lineHeight: d?.lineHeight ?? 1.3 }}>
      {!isNone && (
        <span
          style={{
            width: size,
            height: size,
            background: isPlain || isOutline ? "transparent" : iconColor,
            color: isPlain || isOutline ? iconColor : "#fff",
            border: isOutline ? `1px solid ${iconColor}` : "none",
            borderRadius: isPlain ? 0 : "9999px",
          }}
          className="inline-flex items-center justify-center shrink-0"
        >
          <Icon style={{ width: size * 0.55, height: size * 0.55 }} />
        </span>
      )}
      <span>{text}</span>
    </div>
  );
};

/* ============ 1. Sign Vel Corporate (flagship reference) ============ */
function SignVelCorporate(d: SignatureData) {
  const accent = d.themeColor || d.primaryColor;
  const lineColor = d.dividingLineColor || accent;
  const lineSize = d.dividingLineSize ?? 2;
  const titleSize = d.separateTitleFontSize && d.titleFontSize ? d.titleFontSize : (d.fontSize ? d.fontSize + 4 : 17);
  const bodySize = d.fontSize ?? 13;
  const gap = d.spacing === "compact" ? 4 : d.spacing === "medium" ? 8 : 16;
  return (
    <div className="bg-white p-8" style={{ fontFamily: d.fontFamily, color: d.textColor, lineHeight: d.lineHeight ?? 1.3 }}>
      <div className="mb-2">
        <p style={{ fontSize: titleSize, color: d.titleColor || d.textColor }} className="font-bold leading-tight">{d.name}</p>
        <p style={{ fontSize: bodySize, color: d.mutedColor }} className="leading-snug">{d.title}</p>
        <p style={{ fontSize: bodySize, color: d.mutedColor }} className="leading-snug">{d.company}</p>
      </div>
      {d.showDividingLines !== false && <div className="my-3" style={{ height: lineSize, background: lineColor }} />}
      <div className="flex items-start my-4" style={{ gap: gap * 2 }}>
        {d.logoUrl ? (
          <img src={d.logoUrl} alt={d.company} className="shrink-0 object-contain" style={{ width: d.logoWidth ?? 150 }} />
        ) : (
          <div className="shrink-0" style={{ width: d.logoWidth ?? 170 }}>
            <svg width="100%" viewBox="0 0 88 37" aria-hidden="true">
              <defs>
                <linearGradient id="signvel-tmpl-grad" x1="0" x2="1">
                  <stop offset="0" stopColor={accent} />
                  <stop offset="1" stopColor={d.accentColor || "#00E5A0"} />
                </linearGradient>
              </defs>
              <path
                d="M8 22c7-16 12-21 16-19 5 2 3 18 7 19s8-13 13-13 4 13 15 9"
                fill="none"
                stroke="url(#signvel-tmpl-grad)"
                strokeWidth={6}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="76" cy="27" r="5" fill={accent} />
            </svg>
            <div style={{ color: d.textColor, fontWeight: 800, letterSpacing: "-0.01em", fontSize: 20, marginTop: 4 }}>
              Sign<span style={{ color: d.accentColor || "#00E5A0" }}>Vel</span>
            </div>
          </div>
        )}
        <div className="flex-1" style={{ display: "flex", flexDirection: "column", gap }}>
          <IconRow Icon={Mail} text={d.email} color={accent} d={d} />
          {(d.phones && d.phones.length > 0 ? d.phones : [{ type: "mobile", value: d.mobile }, { type: "main", value: d.phone }]).map((p, i) =>
            p.value ? <IconRow key={i} Icon={p.type === "mobile" ? Smartphone : Phone} text={p.value} color={accent} d={d} /> : null,
          )}
          <IconRow Icon={MapPin} text={d.address} color={accent} d={d} />
          {!d.separateWebsite && <IconRow Icon={LinkIcon} text={d.website} color={accent} d={d} />}
        </div>
      </div>
      {d.separateWebsite && (
        <div className="mb-3"><IconRow Icon={LinkIcon} text={d.website} color={accent} d={d} /></div>
      )}
      {d.showDividingLines !== false && <div className="mt-4 mb-3" style={{ height: lineSize, background: lineColor }} />}
      <Socials d={d} color={accent} />
      <Disclaimer d={d} />
    </div>
  );
}

/* ============ 2. Left Line ============ */
function LeftLine(d: SignatureData) {
  return (
    <div className="bg-white p-8" style={{ fontFamily: d.fontFamily, color: d.textColor }}>
      <div className="flex items-start gap-6" style={{ borderLeft: `2px solid ${d.primaryColor}`, paddingLeft: 24 }}>
        <Avatar d={d} size={64} />
        <div>
          <h3 className="text-xl font-bold tracking-tight">{d.name}</h3>
          <p className="text-sm italic mb-4" style={{ color: d.mutedColor }}>{d.title} · {d.company}</p>
          <div className="space-y-1 text-[12px]" style={{ color: d.mutedColor }}>
            <p>T: {d.phone}</p>
            <p>E: {d.email}</p>
            <p className="font-bold" style={{ color: d.textColor }}>W: {d.website}</p>
          </div>
          <div className="mt-3"><Socials d={d} color={d.primaryColor} size={22} /></div>
        </div>
      </div>
    </div>
  );
}

/* ============ 3. Stacked Minimal ============ */
function StackedMinimal(d: SignatureData) {
  return (
    <div className="bg-white p-8 max-w-md" style={{ fontFamily: d.fontFamily, color: d.textColor }}>
      <p className="text-[15px] font-semibold">{d.name}</p>
      <p className="text-[13px] mb-3" style={{ color: d.mutedColor }}>{d.title}, {d.company}</p>
      <div className="text-[12px] space-y-0.5">
        <p><span style={{ color: d.mutedColor }}>e</span> {d.email}</p>
        <p><span style={{ color: d.mutedColor }}>m</span> {d.mobile}</p>
        <p><span style={{ color: d.mutedColor }}>w</span> <span className="underline">{d.website}</span></p>
      </div>
    </div>
  );
}

/* ============ 4. Portrait Card ============ */
function PhotoCard(d: SignatureData) {
  return (
    <div className="bg-white p-6" style={{ fontFamily: d.fontFamily, color: d.textColor }}>
      <div className="flex items-center gap-5">
        <Avatar d={d} size={80} />
        <div style={{ borderLeft: `1px solid ${d.mutedColor}33`, paddingLeft: 20 }}>
          <p className="text-lg font-bold">{d.name}</p>
          <p className="text-sm font-medium" style={{ color: d.primaryColor }}>{d.title}</p>
          <p className="text-xs mb-2" style={{ color: d.mutedColor }}>{d.company}</p>
          <div className="text-[11px] space-x-3" style={{ color: d.mutedColor }}>
            <span>{d.mobile}</span>·<span>{d.email}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============ 5. Corporate Blue ============ */
function CorporateBlue(d: SignatureData) {
  return (
    <div className="bg-white p-6" style={{ fontFamily: "Georgia, serif", color: d.textColor }}>
      <table className="text-[13px]">
        <tbody>
          <tr>
            <td className="pr-6 align-top" style={{ borderRight: `2px solid ${d.primaryColor}` }}>
              <div className="font-bold text-xl leading-tight" style={{ color: d.primaryColor }}>{d.name}</div>
              <div className="italic" style={{ color: d.mutedColor }}>{d.title}</div>
              <div className="text-[12px] mt-1" style={{ color: d.mutedColor }}>{d.company}</div>
            </td>
            <td className="pl-6 align-top text-[12px]" style={{ color: d.textColor }}>
              <div><b>D</b> {d.phone}</div>
              <div><b>M</b> {d.mobile}</div>
              <div><b>E</b> <span style={{ color: d.primaryColor }}>{d.email}</span></div>
              <div><b>W</b> <span style={{ color: d.primaryColor }}>{d.website}</span></div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

/* ============ 6. Promo Banner ============ */
function BannerBottom(d: SignatureData) {
  return (
    <div className="bg-white" style={{ fontFamily: d.fontFamily, color: d.textColor }}>
      <div className="p-6">
        <p className="text-base font-bold">{d.name}</p>
        <p className="text-sm" style={{ color: d.mutedColor }}>{d.title} · {d.company}</p>
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[12px]" style={{ color: d.mutedColor }}>
          <span>{d.email}</span>
          <span>{d.mobile}</span>
          <span className="underline">{d.website}</span>
        </div>
      </div>
      <div className="text-white px-6 py-3 flex items-center justify-between" style={{ background: `linear-gradient(90deg, ${d.primaryColor}, ${d.accentColor})` }}>
        <span className="text-xs font-medium tracking-wide">{d.tagline || d.ctaLabel}</span>
        <span className="text-[11px] uppercase tracking-widest">{d.ctaUrl ? "Learn more →" : ""}</span>
      </div>
    </div>
  );
}

/* ============ 7. Compact Mono ============ */
function CompactMono(d: SignatureData) {
  return (
    <div className="bg-white p-6 text-[12px]" style={{ fontFamily: "JetBrains Mono, ui-monospace, monospace", color: d.textColor }}>
      <p>-- </p>
      <p className="font-bold">{d.name.toUpperCase()}</p>
      <p style={{ color: d.mutedColor }}>{d.title} // {d.company}</p>
      <p className="mt-2">{d.email}</p>
      <p>{d.mobile}</p>
      <p>{d.website}</p>
    </div>
  );
}

/* ============ 8. Executive Serif ============ */
function ExecutiveSerif(d: SignatureData) {
  return (
    <div className="bg-white p-8" style={{ fontFamily: "Georgia, serif", color: d.textColor }}>
      <p className="text-2xl" style={{ fontVariant: "small-caps" }}>{d.name}</p>
      <div className="w-16 h-px my-2" style={{ background: d.textColor }} />
      <p className="italic text-sm" style={{ color: d.mutedColor }}>{d.title}</p>
      <p className="text-sm mt-1 mb-4">{d.company}</p>
      <div className="text-[12px] space-y-0.5" style={{ color: d.mutedColor }}>
        <p>{d.address}</p>
        <p>{d.phone} · {d.email}</p>
      </div>
    </div>
  );
}

/* ============ 9. Green Sustainability ============ */
function Green(d: SignatureData) {
  return (
    <div className="bg-white p-6" style={{ fontFamily: d.fontFamily, color: d.textColor }}>
      <div className="flex items-center gap-4">
        <Avatar d={{ ...d, primaryColor: "#059669" }} size={56} />
        <div>
          <p className="font-bold">{d.name}</p>
          <p className="text-sm" style={{ color: "#047857" }}>{d.title}</p>
          <p className="text-xs" style={{ color: d.mutedColor }}>{d.company}</p>
        </div>
      </div>
      <div className="mt-4 pt-3 text-[12px] flex flex-wrap gap-x-4" style={{ color: d.mutedColor, borderTop: "1px solid #A7F3D0" }}>
        <span>📧 {d.email}</span>
        <span>📱 {d.mobile}</span>
        <span>🌱 {d.website}</span>
      </div>
      <p className="mt-3 text-[10px] italic" style={{ color: "#047857" }}>🌍 Please consider the environment before printing this email.</p>
    </div>
  );
}

/* ============ 10. Bold Modern ============ */
function BoldModern(d: SignatureData) {
  return (
    <div className="p-8" style={{ background: "#111111", color: "#fff", fontFamily: d.fontFamily }}>
      <p className="text-[10px] uppercase tracking-[0.3em] mb-2" style={{ color: d.accentColor }}>{d.department || "Team"}</p>
      <p className="text-2xl font-bold leading-tight">{d.name}</p>
      <p className="text-sm mb-4" style={{ color: "#a1a1aa" }}>{d.title} at {d.company}</p>
      <div className="grid grid-cols-2 gap-2 text-[12px] max-w-md" style={{ color: "#d4d4d8" }}>
        <span>{d.email}</span>
        <span>{d.mobile}</span>
        <span className="col-span-2" style={{ color: d.accentColor }}>{d.website}</span>
      </div>
    </div>
  );
}

/* ============ 11. Split Card ============ */
function SplitCard(d: SignatureData) {
  return (
    <div className="bg-white flex overflow-hidden rounded-lg ring-1 ring-black/5 max-w-xl" style={{ fontFamily: d.fontFamily, color: d.textColor }}>
      <div style={{ background: d.primaryColor }} className="p-6 flex flex-col items-center justify-center text-white w-40">
        <Avatar d={{ ...d, primaryColor: "#ffffff33" }} size={70} />
        <p className="mt-3 text-sm font-bold text-center">{d.name}</p>
        <p className="text-[10px] uppercase tracking-widest text-white/70 mt-1">{d.title}</p>
      </div>
      <div className="p-6 flex-1">
        <p className="font-bold text-lg mb-1">{d.company}</p>
        <p className="text-xs mb-4" style={{ color: d.mutedColor }}>{d.tagline}</p>
        <div className="space-y-1 text-[12px]" style={{ color: d.textColor }}>
          <p><span style={{ color: d.mutedColor }}>P</span> {d.phone}</p>
          <p><span style={{ color: d.mutedColor }}>E</span> {d.email}</p>
          <p><span style={{ color: d.mutedColor }}>W</span> {d.website}</p>
        </div>
        <div className="mt-4"><Socials d={d} color={d.primaryColor} size={22} /></div>
      </div>
    </div>
  );
}

/* ============ 12. Vertical Ribbon ============ */
function VerticalRibbon(d: SignatureData) {
  return (
    <div className="bg-white p-6 relative pl-10" style={{ fontFamily: d.fontFamily, color: d.textColor }}>
      <div className="absolute left-0 top-0 bottom-0 w-6" style={{ background: `linear-gradient(180deg, ${d.primaryColor}, ${d.accentColor})` }} />
      <p className="text-xl font-bold">{d.name}</p>
      <p className="text-sm" style={{ color: d.mutedColor }}>{d.title} · {d.company}</p>
      <div className="mt-3 text-[12px] grid grid-cols-2 gap-x-6 gap-y-1" style={{ color: d.textColor }}>
        <span>📞 {d.phone}</span>
        <span>✉️ {d.email}</span>
        <span>📱 {d.mobile}</span>
        <span>🔗 {d.website}</span>
      </div>
    </div>
  );
}

/* ============ 13. Gradient Header ============ */
function GradientHeader(d: SignatureData) {
  return (
    <div className="bg-white overflow-hidden rounded-lg ring-1 ring-black/5" style={{ fontFamily: d.fontFamily, color: d.textColor }}>
      <div className="p-5 text-white" style={{ background: `linear-gradient(135deg, ${d.primaryColor}, ${d.accentColor})` }}>
        <p className="text-lg font-bold">{d.name}</p>
        <p className="text-xs opacity-90">{d.title} — {d.company}</p>
      </div>
      <div className="p-5 grid grid-cols-2 gap-2 text-[12px]" style={{ color: d.textColor }}>
        <span>📧 {d.email}</span>
        <span>📞 {d.phone}</span>
        <span>📱 {d.mobile}</span>
        <span>🌐 {d.website}</span>
      </div>
    </div>
  );
}

/* ============ 14. Business Card ============ */
function BusinessCard(d: SignatureData) {
  return (
    <div className="bg-white p-6 rounded-xl ring-1 ring-black/10 max-w-sm shadow-sm" style={{ fontFamily: d.fontFamily, color: d.textColor }}>
      <div className="flex items-center justify-between mb-4">
        <p className="text-lg font-bold">{d.name}</p>
        <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded" style={{ background: `${d.primaryColor}22`, color: d.primaryColor }}>
          {d.department || "Team"}
        </span>
      </div>
      <p className="text-sm mb-4" style={{ color: d.mutedColor }}>{d.title}, {d.company}</p>
      <div className="pt-4 space-y-1 text-[12px]" style={{ borderTop: `1px dashed ${d.mutedColor}55` }}>
        <p>{d.email}</p>
        <p>{d.mobile}</p>
        <p>{d.address}</p>
      </div>
    </div>
  );
}

/* ============ 15. Elegant Script ============ */
function ElegantScript(d: SignatureData) {
  return (
    <div className="bg-white p-8" style={{ fontFamily: "Georgia, serif", color: d.textColor }}>
      <p className="text-3xl italic" style={{ fontFamily: "Brush Script MT, cursive", color: d.primaryColor }}>{d.name}</p>
      <p className="text-sm tracking-[0.3em] uppercase mt-2" style={{ color: d.mutedColor }}>{d.title}</p>
      <div className="my-3 w-24 h-px" style={{ background: d.primaryColor }} />
      <p className="text-sm">{d.company}</p>
      <div className="mt-3 text-[12px] space-y-0.5" style={{ color: d.mutedColor }}>
        <p>{d.email} · {d.phone}</p>
        <p>{d.address}</p>
      </div>
    </div>
  );
}

/* ============ 16. Icon Grid ============ */
function IconGrid(d: SignatureData) {
  return (
    <div className="bg-white p-6" style={{ fontFamily: d.fontFamily, color: d.textColor }}>
      <div className="flex items-center gap-4 mb-4">
        <Avatar d={d} size={60} />
        <div>
          <p className="font-bold text-lg">{d.name}</p>
          <p className="text-sm" style={{ color: d.mutedColor }}>{d.title} · {d.company}</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <IconRow Icon={Mail} text={d.email} color={d.primaryColor} />
        <IconRow Icon={Phone} text={d.phone} color={d.primaryColor} />
        <IconRow Icon={Smartphone} text={d.mobile} color={d.primaryColor} />
        <IconRow Icon={LinkIcon} text={d.website} color={d.primaryColor} />
      </div>
      <div className="mt-4"><Socials d={d} color={d.primaryColor} size={24} /></div>
    </div>
  );
}

/* ============ 17. Big Photo ============ */
function BigPhoto(d: SignatureData) {
  return (
    <div className="bg-white flex items-stretch max-w-xl ring-1 ring-black/5 rounded-lg overflow-hidden" style={{ fontFamily: d.fontFamily, color: d.textColor }}>
      <div className="w-32 shrink-0" style={{ background: d.primaryColor }}>
        {d.photoUrl ? (
          <img src={d.photoUrl} alt={d.name} className="w-full h-full object-cover" />
        ) : (
          <div className="h-full flex items-center justify-center text-white font-bold text-3xl">
            {d.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
          </div>
        )}
      </div>
      <div className="p-5 flex-1">
        <p className="text-xl font-bold">{d.name}</p>
        <p className="text-sm mb-3" style={{ color: d.primaryColor }}>{d.title}</p>
        <p className="text-xs mb-3" style={{ color: d.mutedColor }}>{d.company}</p>
        <div className="text-[12px] space-y-0.5">
          <p>📧 {d.email}</p>
          <p>📞 {d.phone}</p>
          <p>🌐 {d.website}</p>
        </div>
      </div>
    </div>
  );
}

/* ============ 18. Underline Accent ============ */
function UnderlineAccent(d: SignatureData) {
  return (
    <div className="bg-white p-6" style={{ fontFamily: d.fontFamily, color: d.textColor }}>
      <p className="text-lg font-bold inline-block pb-1" style={{ borderBottom: `3px solid ${d.primaryColor}` }}>{d.name}</p>
      <p className="text-sm mt-1" style={{ color: d.mutedColor }}>{d.title}</p>
      <p className="text-sm font-medium">{d.company}</p>
      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-[12px]" style={{ color: d.textColor }}>
        <span><b style={{ color: d.primaryColor }}>E.</b> {d.email}</span>
        <span><b style={{ color: d.primaryColor }}>M.</b> {d.mobile}</span>
        <span><b style={{ color: d.primaryColor }}>W.</b> {d.website}</span>
      </div>
    </div>
  );
}

/* ============ 19. Full Contact Grid ============ */
function FullGrid(d: SignatureData) {
  return (
    <div className="bg-white p-6" style={{ fontFamily: d.fontFamily, color: d.textColor }}>
      <p className="text-xl font-bold">{d.name}{d.pronouns && <span className="text-xs font-normal ml-2" style={{ color: d.mutedColor }}>({d.pronouns})</span>}</p>
      <p className="text-sm mb-4" style={{ color: d.primaryColor }}>{d.title}, {d.company}</p>
      <table className="text-[12px]" style={{ color: d.textColor }}>
        <tbody>
          <tr><td className="pr-4 py-0.5" style={{ color: d.mutedColor }}>Email</td><td>{d.email}</td></tr>
          <tr><td className="pr-4 py-0.5" style={{ color: d.mutedColor }}>Mobile</td><td>{d.mobile}</td></tr>
          <tr><td className="pr-4 py-0.5" style={{ color: d.mutedColor }}>Office</td><td>{d.phone}</td></tr>
          <tr><td className="pr-4 py-0.5" style={{ color: d.mutedColor }}>Address</td><td>{d.address}</td></tr>
          <tr><td className="pr-4 py-0.5" style={{ color: d.mutedColor }}>Web</td><td className="underline">{d.website}</td></tr>
        </tbody>
      </table>
    </div>
  );
}

/* ============ 20. Newsletter CTA ============ */
function NewsletterCTA(d: SignatureData) {
  return (
    <div className="bg-white p-6" style={{ fontFamily: d.fontFamily, color: d.textColor }}>
      <p className="font-bold">{d.name}</p>
      <p className="text-sm" style={{ color: d.mutedColor }}>{d.title} · {d.company}</p>
      <div className="mt-3 text-[12px] space-y-0.5">
        <p>{d.email} · {d.phone}</p>
      </div>
      {d.ctaLabel && (
        <a
          href={d.ctaUrl}
          className="inline-block mt-4 px-4 py-2 rounded-md text-white text-xs font-semibold"
          style={{ background: d.primaryColor }}
        >
          {d.ctaLabel} →
        </a>
      )}
    </div>
  );
}

/* ============ 21. Two-Tone Header ============ */
function TwoTone(d: SignatureData) {
  return (
    <div className="max-w-xl ring-1 ring-black/5 rounded-lg overflow-hidden" style={{ fontFamily: d.fontFamily, color: d.textColor }}>
      <div className="flex">
        <div className="p-6 flex-1" style={{ background: d.primaryColor, color: "#fff" }}>
          <p className="text-xl font-bold">{d.name}</p>
          <p className="text-xs opacity-90">{d.title}</p>
        </div>
        <div className="p-6 flex-1 bg-white">
          <p className="text-[10px] uppercase tracking-widest mb-2" style={{ color: d.mutedColor }}>{d.company}</p>
          <div className="text-[12px] space-y-0.5">
            <p>{d.email}</p>
            <p>{d.mobile}</p>
            <p>{d.website}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============ 22. Minimal Divider ============ */
function MinimalDivider(d: SignatureData) {
  return (
    <div className="bg-white p-6" style={{ fontFamily: d.fontFamily, color: d.textColor }}>
      <div className="flex items-center gap-3">
        <p className="text-lg font-semibold">{d.name}</p>
        <span style={{ background: d.primaryColor, width: 20, height: 2 }} />
        <p className="text-sm" style={{ color: d.mutedColor }}>{d.title}</p>
      </div>
      <div className="mt-2 text-[12px] flex flex-wrap gap-x-4" style={{ color: d.mutedColor }}>
        <span>{d.company}</span>
        <span>{d.email}</span>
        <span>{d.mobile}</span>
      </div>
    </div>
  );
}

/* ============ 23. Legal Formal ============ */
function LegalFormal(d: SignatureData) {
  return (
    <div className="bg-white p-6" style={{ fontFamily: "Times New Roman, serif", color: d.textColor }}>
      <p className="font-bold text-base">{d.name}, Esq.</p>
      <p className="italic text-sm" style={{ color: d.mutedColor }}>{d.title}</p>
      <p className="text-sm mt-1">{d.company}</p>
      <div className="mt-3 text-[12px]" style={{ color: d.textColor }}>
        <p>{d.address}</p>
        <p>Direct: {d.phone} · Cell: {d.mobile}</p>
        <p>{d.email}</p>
      </div>
      <p className="mt-3 text-[10px] italic" style={{ color: d.mutedColor }}>
        PRIVILEGED &amp; CONFIDENTIAL — This communication is intended solely for the named addressee.
      </p>
    </div>
  );
}

/* ============ 24. Circle Icons Row ============ */
function CircleIcons(d: SignatureData) {
  return (
    <div className="bg-white p-6" style={{ fontFamily: d.fontFamily, color: d.textColor }}>
      <p className="font-bold text-lg">{d.name}</p>
      <p className="text-sm mb-4" style={{ color: d.mutedColor }}>{d.title} at {d.company}</p>
      <div className="flex flex-wrap gap-3">
        {[
          { Icon: Mail, text: d.email },
          { Icon: Smartphone, text: d.mobile },
          { Icon: LinkIcon, text: d.website },
        ].map(({ Icon, text }, i) => (
          <div key={i} className="flex items-center gap-2 text-[12px]">
            <span style={{ background: d.primaryColor }} className="size-7 rounded-full flex items-center justify-center text-white">
              <Icon className="size-3.5" />
            </span>
            <span>{text}</span>
          </div>
        ))}
      </div>
      <div className="mt-4"><Socials d={d} color={d.primaryColor} size={26} /></div>
    </div>
  );
}

/* ============ 25. Quote Callout ============ */
function QuoteCallout(d: SignatureData) {
  return (
    <div className="bg-white p-6" style={{ fontFamily: d.fontFamily, color: d.textColor }}>
      <p className="font-bold">{d.name}</p>
      <p className="text-sm" style={{ color: d.mutedColor }}>{d.title}, {d.company}</p>
      <div className="text-[12px] mt-2" style={{ color: d.textColor }}>
        <p>{d.email} · {d.mobile}</p>
      </div>
      {d.quote && (
        <blockquote className="mt-4 pl-4 italic text-sm" style={{ borderLeft: `3px solid ${d.primaryColor}`, color: d.mutedColor }}>
          "{d.quote}"
        </blockquote>
      )}
    </div>
  );
}

/* ============ 26. Modern Tech ============ */
function ModernTech(d: SignatureData) {
  return (
    <div className="bg-white p-6 rounded-xl" style={{ fontFamily: "SF Pro Text, -apple-system, sans-serif", color: d.textColor }}>
      <div className="flex items-center gap-4">
        <Avatar d={d} size={52} />
        <div>
          <p className="font-semibold">{d.name} <span className="text-xs font-normal" style={{ color: d.mutedColor }}>· {d.pronouns}</span></p>
          <p className="text-xs" style={{ color: d.mutedColor }}>{d.title} · {d.company}</p>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
        {[d.email, d.mobile, d.website].map((v, i) => (
          <span key={i} className="px-2 py-1 rounded-md" style={{ background: `${d.primaryColor}12`, color: d.primaryColor }}>{v}</span>
        ))}
      </div>
    </div>
  );
}

/* ============ 27. Framed Border ============ */
function FramedBorder(d: SignatureData) {
  return (
    <div className="bg-white p-1" style={{ background: `linear-gradient(135deg, ${d.primaryColor}, ${d.accentColor})`, fontFamily: d.fontFamily, color: d.textColor }}>
      <div className="bg-white p-6">
        <p className="text-lg font-bold">{d.name}</p>
        <p className="text-sm" style={{ color: d.mutedColor }}>{d.title} · {d.company}</p>
        <div className="mt-3 text-[12px] space-y-0.5">
          <p>✉️ {d.email}</p>
          <p>📱 {d.mobile}</p>
          <p>🌐 {d.website}</p>
        </div>
      </div>
    </div>
  );
}

/* ============ 28. Sales Pitch ============ */
function SalesPitch(d: SignatureData) {
  return (
    <div className="bg-white p-6" style={{ fontFamily: d.fontFamily, color: d.textColor }}>
      <p className="text-[10px] uppercase tracking-[0.3em] font-bold" style={{ color: d.primaryColor }}>{d.company}</p>
      <p className="text-2xl font-black leading-tight mt-1">{d.name}</p>
      <p className="text-sm" style={{ color: d.mutedColor }}>{d.title}</p>
      <p className="mt-3 text-sm font-medium max-w-md" style={{ color: d.textColor }}>{d.tagline}</p>
      <div className="mt-4 flex gap-3">
        {d.ctaLabel && (
          <a href={d.ctaUrl} className="inline-block px-4 py-2 rounded-full text-white text-xs font-bold" style={{ background: d.primaryColor }}>
            {d.ctaLabel} →
          </a>
        )}
        <a href={`mailto:${d.email}`} className="inline-block px-4 py-2 rounded-full text-xs font-bold border" style={{ borderColor: d.primaryColor, color: d.primaryColor }}>
          Reply
        </a>
      </div>
    </div>
  );
}

/* ============ 29. Ivy League ============ */
function IvyLeague(d: SignatureData) {
  return (
    <div className="bg-white p-8" style={{ fontFamily: "Baskerville, Georgia, serif", color: d.textColor }}>
      <p className="text-center text-[10px] uppercase tracking-[0.4em]" style={{ color: d.mutedColor }}>{d.company}</p>
      <div className="mx-auto my-2 w-24 h-px" style={{ background: d.textColor }} />
      <p className="text-center text-xl font-semibold">{d.name}</p>
      <p className="text-center text-sm italic mt-1" style={{ color: d.mutedColor }}>{d.title}</p>
      <div className="text-center mt-4 text-[12px] space-y-0.5" style={{ color: d.textColor }}>
        <p>{d.address}</p>
        <p>{d.phone} — {d.email}</p>
      </div>
    </div>
  );
}

/* ============ 30. Neon Card ============ */
function NeonCard(d: SignatureData) {
  return (
    <div className="p-6 rounded-xl" style={{ background: "#0A0A0F", color: "#fff", fontFamily: d.fontFamily, boxShadow: `0 0 0 1px ${d.accentColor}44` }}>
      <div className="flex items-center gap-3 mb-4">
        <span className="size-2 rounded-full animate-pulse" style={{ background: d.accentColor }} />
        <span className="text-[10px] uppercase tracking-[0.3em]" style={{ color: d.accentColor }}>Available</span>
      </div>
      <p className="text-xl font-bold">{d.name}</p>
      <p className="text-sm" style={{ color: "#a1a1aa" }}>{d.title} · {d.company}</p>
      <div className="mt-4 text-[12px] space-y-0.5">
        <p style={{ color: "#d4d4d8" }}>{d.email}</p>
        <p style={{ color: "#d4d4d8" }}>{d.mobile}</p>
        <p style={{ color: d.accentColor }}>{d.website}</p>
      </div>
    </div>
  );
}

export const templates: TemplateMeta[] = [
  { id: "al-riyady", name: "SignVel Corporate", category: "Corporate", layout: "two-column", accent: "bg-[#5B2EFF]", description: "Flagship SignVel layout with gradient logo, icon rows, and disclaimer.", render: SignVelCorporate },
  { id: "left-line", name: "Left Line", category: "Minimal", layout: "single", accent: "bg-[#5B2EFF]", description: "Clean vertical accent bar. Sign Vel default.", render: LeftLine },
  { id: "stacked", name: "Stacked Minimal", category: "Minimal", layout: "single", accent: "bg-neutral-400", description: "Ultra-quiet stacked lines, no chrome.", render: StackedMinimal },
  { id: "photo-card", name: "Portrait Card", category: "Creative", layout: "two-column", accent: "bg-gradient-to-br from-[#5B2EFF] to-[#00E5A0]", description: "Circular avatar with vertical rule.", render: PhotoCard },
  { id: "corp-blue", name: "Corporate Blue", category: "Corporate", layout: "two-column", accent: "bg-[#1E40AF]", description: "Two-column serif for professional services.", render: CorporateBlue },
  { id: "banner", name: "Promo Banner", category: "Bold", layout: "vertical", accent: "bg-gradient-to-r from-[#5B2EFF] to-[#00E5A0]", description: "Bottom banner strip for announcements.", render: BannerBottom },
  { id: "mono", name: "Compact Mono", category: "Minimal", layout: "single", accent: "bg-neutral-800", description: "Terminal monospace for engineers.", render: CompactMono },
  { id: "exec-serif", name: "Executive Serif", category: "Executive", layout: "single", accent: "bg-neutral-900", description: "Small-caps serif — quiet, senior, timeless.", render: ExecutiveSerif },
  { id: "green", name: "Sustainability", category: "Creative", layout: "single", accent: "bg-emerald-600", description: "Warm emerald palette with eco footer.", render: Green },
  { id: "bold-dark", name: "Bold Modern", category: "Bold", layout: "two-column", accent: "bg-neutral-900", description: "High-contrast dark card with mint kicker.", render: BoldModern },
  { id: "split-card", name: "Split Card", category: "Creative", layout: "two-column", accent: "bg-[#5B2EFF]", description: "Colored avatar column beside details.", render: SplitCard },
  { id: "vertical-ribbon", name: "Vertical Ribbon", category: "Bold", layout: "two-column", accent: "bg-gradient-to-b from-[#5B2EFF] to-[#00E5A0]", description: "Gradient vertical ribbon accent.", render: VerticalRibbon },
  { id: "gradient-header", name: "Gradient Header", category: "Creative", layout: "vertical", accent: "bg-gradient-to-r from-[#5B2EFF] to-[#00E5A0]", description: "Colorful header block above details.", render: GradientHeader },
  { id: "business-card", name: "Business Card", category: "Corporate", layout: "vertical", accent: "bg-neutral-800", description: "Feels like a printed business card.", render: BusinessCard },
  { id: "elegant-script", name: "Elegant Script", category: "Executive", layout: "vertical", accent: "bg-neutral-900", description: "Handwritten name for lifestyle brands.", render: ElegantScript },
  { id: "icon-grid", name: "Icon Grid", category: "Corporate", layout: "two-column", accent: "bg-[#5B2EFF]", description: "Balanced icon grid with avatar header.", render: IconGrid },
  { id: "big-photo", name: "Big Photo", category: "Creative", layout: "vertical", accent: "bg-[#5B2EFF]", description: "Prominent square photo strip.", render: BigPhoto },
  { id: "underline-accent", name: "Underline Accent", category: "Minimal", layout: "single", accent: "bg-[#5B2EFF]", description: "Name underlined with brand color.", render: UnderlineAccent },
  { id: "full-grid", name: "Full Contact Grid", category: "Corporate", layout: "two-column", accent: "bg-neutral-800", description: "Data table with all contact fields.", render: FullGrid },
  { id: "newsletter-cta", name: "Newsletter CTA", category: "Bold", layout: "vertical", accent: "bg-[#5B2EFF]", description: "Highlighted call-to-action button.", render: NewsletterCTA },
  { id: "two-tone", name: "Two-Tone Header", category: "Bold", layout: "vertical", accent: "bg-[#5B2EFF]", description: "Split colored/white header blocks.", render: TwoTone },
  { id: "minimal-divider", name: "Minimal Divider", category: "Minimal", layout: "single", accent: "bg-neutral-500", description: "Inline divider between name and title.", render: MinimalDivider },
  { id: "legal-formal", name: "Legal Formal", category: "Executive", layout: "single", accent: "bg-neutral-900", description: "Formal serif with privileged notice.", render: LegalFormal },
  { id: "circle-icons", name: "Circle Icons", category: "Corporate", layout: "single", accent: "bg-[#5B2EFF]", description: "Chip-style contact rows with icons.", render: CircleIcons },
  { id: "quote-callout", name: "Quote Callout", category: "Creative", layout: "vertical", accent: "bg-[#5B2EFF]", description: "Includes a signature quote block.", render: QuoteCallout },
  { id: "modern-tech", name: "Modern Tech", category: "Minimal", layout: "single", accent: "bg-[#5B2EFF]", description: "SF-style pill contact chips.", render: ModernTech },
  { id: "framed-border", name: "Framed Border", category: "Creative", layout: "vertical", accent: "bg-gradient-to-br from-[#5B2EFF] to-[#00E5A0]", description: "Gradient frame around content card.", render: FramedBorder },
  { id: "sales-pitch", name: "Sales Pitch", category: "Bold", layout: "vertical", accent: "bg-[#5B2EFF]", description: "Big kicker + CTA buttons for outbound.", render: SalesPitch },
  { id: "ivy-league", name: "Ivy League", category: "Executive", layout: "vertical", accent: "bg-neutral-900", description: "Symmetric center-aligned formal card.", render: IvyLeague },
  { id: "neon-card", name: "Neon Card", category: "Bold", layout: "vertical", accent: "bg-black", description: "Dark card with neon-accent status dot.", render: NeonCard },
  { id: "custom-blank", name: "Custom / Blank", category: "Custom", layout: "single", accent: "bg-gradient-to-br from-[#5B2EFF] to-[#00E5A0]", description: "Start from a blank canvas and design freely in the editor.", render: LeftLine },
];

export function getTemplate(id: string): TemplateMeta | undefined {
  return templates.find((t) => t.id === id);
}

/* ============================================================
   Typography-aware render wrapper.
   Templates author at a 13px base; this scopes user typography
   (font family, body size, title size, line-height, spacing)
   across every template — including ones with hard-coded sizes.
   ============================================================ */
const BASE_FONT_SIZE = 13;
const DEFAULT_FONT = "Rubik, Arial, sans-serif";

export function renderSignature(template: TemplateMeta, d: SignatureData) {
  const base = d.fontSize ?? BASE_FONT_SIZE;
  const scale = Math.max(0.6, Math.min(2, base / BASE_FONT_SIZE));
  const fontOverridden = !!d.fontFamily && d.fontFamily !== DEFAULT_FONT;

  // Normalize so templates keep authoring at the 13px base; the wrapper scales.
  const normalized: SignatureData = {
    ...d,
    fontSize: BASE_FONT_SIZE,
    titleFontSize: d.titleFontSize ? d.titleFontSize / scale : undefined,
  };

  return (
    <div
      data-sig-scope=""
      data-sig-font={fontOverridden ? "" : undefined}
      data-sig-line=""
      style={{
        fontFamily: d.fontFamily || DEFAULT_FONT,
        fontSize: `${BASE_FONT_SIZE}px`,
        lineHeight: d.lineHeight ?? 1.3,
        zoom: scale,
      }}
    >
      {template.render(normalized)}
    </div>
  );
}
