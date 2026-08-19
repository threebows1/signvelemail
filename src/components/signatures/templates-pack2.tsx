import type { SignatureData, SocialKey } from "@/lib/signature-store";
import { derivePhones } from "@/lib/signature-store";
import { socialGlyphMap, socialBrandColor } from "@/components/signatures/social-icons";
import type { TemplateMeta } from "@/components/signatures/templates";

/* ---------- local helpers (self-contained pack) ---------- */
const DEFAULT_ORDER: SocialKey[] = [
  "facebook", "instagram", "linkedin", "tiktok", "youtube", "pinterest",
  "twitter", "whatsapp", "telegram", "snapchat", "threads", "medium",
  "behance", "dribbble", "calendly", "discord", "twitch", "spotify",
  "slack", "bluesky", "mastodon", "website",
];

function socialItems(d: SignatureData, limit = 6) {
  if (!d.showSocials) return [];
  const order = (d.socialOrder && d.socialOrder.length ? d.socialOrder : DEFAULT_ORDER) as SocialKey[];
  const seen = new Set(order as string[]);
  const full = [...order, ...DEFAULT_ORDER.filter((k) => !seen.has(k))];
  return full
    .map((k) => ({ key: k, url: (d.socials as any)[k], Icon: socialGlyphMap[k] }))
    .filter((s) => s.url && s.Icon)
    .slice(0, limit);
}

type ChipProps = {
  d: SignatureData;
  variant?: "solid" | "outline" | "plain" | "square" | "knockout";
  color?: string;
  bg?: string;
  size?: number;
  limit?: number;
};

const SocialRow = ({ d, variant = "solid", color, bg, size, limit = 6 }: ChipProps) => {
  const items = socialItems(d, limit);
  if (!items.length) return null;
  const s = size ?? Math.min(30, d.socialIconSize ?? 28);
  const accent = color || d.socialIconColor || d.primaryColor;
  const glyph = Math.round(s * 0.55);
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {items.map(({ Icon, key }, i) => {
        const brand = socialBrandColor[key] || accent;
        const isBrand = (d.socialIconStyle ?? "solid") === "color";
        const fill =
          variant === "solid" ? (isBrand ? brand : accent)
          : variant === "square" ? (isBrand ? brand : accent)
          : variant === "knockout" ? "#ffffff"
          : "transparent";
        const fg =
          variant === "solid" || variant === "square" ? "#ffffff"
          : variant === "knockout" ? (bg || accent)
          : isBrand ? brand : accent;
        return (
          <span
            key={i}
            style={{
              width: s,
              height: s,
              background: fill,
              color: fg,
              fill: fg,
              border: variant === "outline" ? `1px solid ${accent}33` : "none",
              borderRadius: variant === "square" ? 6 : variant === "plain" ? 0 : 9999,
            }}
            className="inline-flex items-center justify-center shrink-0"
          >
            <Icon style={{ width: glyph, height: glyph, color: fg, fill: fg }} />
          </span>
        );
      })}
    </div>
  );
};

const Photo = ({ d, size = 56, square = false }: { d: SignatureData; size?: number; square?: boolean }) => {
  const radius = square || d.cropPhotoCircle === false ? 8 : 9999;
  if (d.photoUrl) {
    return (
      <img
        src={d.photoUrl}
        alt={d.name}
        style={{ width: size, height: size, borderRadius: radius }}
        className="object-cover shrink-0"
      />
    );
  }
  const initials = d.name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
  return (
    <div
      style={{ width: size, height: size, background: d.primaryColor, color: "#fff", borderRadius: radius, fontSize: size * 0.34 }}
      className="flex items-center justify-center font-bold shrink-0"
    >
      {initials}
    </div>
  );
};

const firstPhone = (d: SignatureData) => derivePhones(d)[0]?.value || "";
const secondPhone = (d: SignatureData) => derivePhones(d)[1]?.value || "";

const QR = ({ color = "#111" }: { color?: string }) => (
  <svg width="64" height="64" viewBox="0 0 29 29" shapeRendering="crispEdges" aria-hidden="true">
    <rect width="29" height="29" fill="#fff" />
    {[[0, 0], [22, 0], [0, 22]].map(([x, y], i) => (
      <g key={i} fill={color}>
        <rect x={x} y={y} width="7" height="7" />
        <rect x={x + 1} y={y + 1} width="5" height="5" fill="#fff" />
        <rect x={x + 2} y={y + 2} width="3" height="3" />
      </g>
    ))}
    {Array.from({ length: 90 }).map((_, i) => {
      const x = (i * 7) % 21 + 4;
      const y = (i * 5) % 21 + 4;
      return <rect key={i} x={x} y={y} width="1" height="1" fill={color} />;
    })}
  </svg>
);

const Note = ({ d }: { d: SignatureData }) =>
  d.showDisclaimer && d.disclaimer ? (
    <p className="text-[10px] leading-relaxed mt-3" style={{ color: d.mutedColor }}>{d.disclaimer}</p>
  ) : null;

/* ============ 01 Split Rule ============ */
function SplitRule(d: SignatureData) {
  const accent = d.themeColor || d.primaryColor;
  return (
    <div className="bg-white p-7" style={{ fontFamily: d.fontFamily, color: d.textColor }}>
      <div className="inline-flex items-stretch gap-6 rounded-xl border border-black/10 px-6 py-5">
        <div className="pr-6" style={{ borderRight: `1px solid ${d.mutedColor}33` }}>
          <p data-sig-name="" className="text-[19px] font-bold leading-[1.05]" style={{ fontFamily: "Georgia, serif" }}>
            {d.name.split(" ")[0]}<br />{d.name.split(" ").slice(1).join(" ")}
          </p>
          <p className="mt-2 text-[9.5px] uppercase tracking-[0.18em] font-medium" style={{ color: accent }}>{d.title}</p>
        </div>
        <div className="text-[12.5px] space-y-1">
          <p className="font-semibold">{d.company}</p>
          <p style={{ color: d.mutedColor }}>{d.email}</p>
          <p style={{ color: d.mutedColor }}>{firstPhone(d)}</p>
          <p data-sig-website="" style={{ color: d.linkColor || accent }}>{d.website}</p>
        </div>
      </div>
    </div>
  );
}

/* ============ 02 Ledger ============ */
function Ledger(d: SignatureData) {
  const accent = d.themeColor || d.primaryColor;
  const rows: [string, string][] = [
    ["Direct", firstPhone(d)],
    ["Email", d.email],
    ["Office", d.address],
  ];
  return (
    <div className="bg-white p-7" style={{ fontFamily: d.fontFamily, color: d.textColor }}>
      <div className="border border-black/10 rounded-lg p-6">
        <p data-sig-name="" className="text-[17px] font-bold" style={{ color: accent }}>{d.name}</p>
        <p className="text-[12.5px] mt-1">{d.title} | {d.company}</p>
        <div data-sig-rule="" className="my-3" style={{ height: 1, background: `${d.mutedColor}44` }} />
        <table className="text-[12.5px]">
          <tbody>
            {rows.filter(([, v]) => v).map(([k, v]) => (
              <tr key={k}>
                <td className="pr-6 py-[2px] align-top" style={{ color: d.mutedColor }}>{k}</td>
                <td className="py-[2px]" style={{ color: k === "Email" ? d.linkColor || accent : d.textColor }}>{v}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <Note d={d} />
      </div>
    </div>
  );
}

/* ============ 03 Card & Code ============ */
function CardCode(d: SignatureData) {
  const accent = d.themeColor || d.primaryColor;
  return (
    <div className="bg-white p-7" style={{ fontFamily: d.fontFamily, color: d.textColor }}>
      <div className="flex items-start justify-between gap-8 border border-black/10 rounded-lg px-6 py-5">
        <div>
          <p data-sig-name="" className="text-[18px] font-bold" style={{ fontFamily: "Georgia, serif" }}>{d.name}</p>
          <p className="text-[12.5px] mt-1" style={{ color: d.mutedColor }}>{d.title}</p>
          <p className="text-[12.5px] mt-2">{d.email}</p>
          <p className="text-[12.5px] mt-2 font-medium" style={{ color: d.linkColor || accent }}>Save contact →</p>
        </div>
        <div className="text-center">
          <QR color={d.textColor} />
          <p className="text-[8.5px] tracking-[0.18em] mt-1" style={{ color: d.mutedColor }}>VCARD</p>
        </div>
      </div>
    </div>
  );
}

/* ============ 04 Dark Mode ============ */
function DarkMode(d: SignatureData) {
  const accent = d.accentColor || "#00E5A0";
  return (
    <div className="p-7" style={{ fontFamily: d.fontFamily, background: "#0a0a0a" }}>
      <div className="rounded-lg px-7 py-6" style={{ background: "#111" }}>
        <div className="flex items-baseline gap-3">
          <p data-sig-name="" className="text-[20px] font-bold text-white" style={{ fontFamily: "Georgia, serif" }}>{d.name}</p>
          <span className="text-[9.5px] uppercase tracking-[0.2em] font-medium" style={{ color: accent }}>{d.title}</span>
        </div>
        <div data-sig-rule="" className="my-3" style={{ height: 2, background: accent }} />
        <p className="text-[12.5px]" style={{ color: "#d4d4d4" }}>{d.company}{d.address ? ` · ${d.address}` : ""}</p>
        <p className="text-[12.5px] mt-1" style={{ color: "#d4d4d4" }}>{d.email}{firstPhone(d) ? ` · ${firstPhone(d)}` : ""}</p>
        <div className="mt-4"><SocialRow d={d} variant="plain" color={accent} /></div>
      </div>
    </div>
  );
}

/* ============ 05 Out of Office ============ */
function OutOfOffice(d: SignatureData) {
  return (
    <div className="p-7" style={{ fontFamily: d.fontFamily, background: "#fffbeb", color: d.textColor }}>
      <div className="rounded-lg overflow-hidden border border-black/10 bg-white">
        <div className="px-5 py-3 text-[10.5px] tracking-[0.12em] uppercase" style={{ background: "#fef3c7", color: "#78350f", fontFamily: "ui-monospace, monospace" }}>
          Away until 24 Aug &nbsp; Cover: {d.email}
        </div>
        <div className="px-5 py-4">
          <p data-sig-name="" className="text-[16px] font-bold">{d.name}</p>
          <p className="text-[12.5px]" style={{ color: d.mutedColor }}>{d.title} · {d.company}</p>
          <p className="text-[12.5px] mt-1" style={{ color: d.mutedColor }}>{d.email}{firstPhone(d) ? ` · ${firstPhone(d)}` : ""}</p>
        </div>
      </div>
    </div>
  );
}

/* ============ 06 Working Details ============ */
function WorkingDetails(d: SignatureData) {
  const accent = d.themeColor || d.primaryColor;
  return (
    <div className="bg-white p-7" style={{ fontFamily: d.fontFamily, color: d.textColor }}>
      <div className="border border-black/10 rounded-lg px-6 py-5">
        <p className="text-[16px] font-bold">
          <span data-sig-name="">{d.name}</span>
        </p>
        <p className="text-[12.5px] mt-1" style={{ color: d.mutedColor }}>{d.title} · {d.company}</p>
        <div data-sig-rule="" className="my-3" style={{ height: 1, background: `${d.mutedColor}33` }} />
        <table className="text-[12.5px]">
          <tbody>
            <tr>
              <td className="pr-6 py-[2px]" style={{ color: d.mutedColor }}>Hours</td>
              <td>Sun–Thu, 09:00–15:00</td>
            </tr>
            <tr>
              <td className="pr-6 py-[2px]" style={{ color: d.mutedColor }}>Email</td>
              <td style={{ color: d.linkColor || accent }}>{d.email}</td>
            </tr>
          </tbody>
        </table>
        <Note d={d} />
      </div>
    </div>
  );
}

/* ============ 07 Tinted Panel ============ */
function TintedPanel(d: SignatureData) {
  const accent = d.themeColor || d.primaryColor;
  return (
    <div className="bg-white p-7" style={{ fontFamily: d.fontFamily, color: d.textColor }}>
      <div className="border border-black/10 rounded-lg px-6 py-5">
        <div className="flex items-center gap-4">
          <Photo d={d} size={58} />
          <div>
            <p data-sig-name="" className="text-[17px] font-bold">{d.name}</p>
            <p className="text-[12.5px]" style={{ color: d.mutedColor }}>{d.company}</p>
            {d.department && <p className="text-[12.5px]" style={{ color: d.mutedColor }}>{d.department}</p>}
          </div>
        </div>
        <div className="mt-4 rounded-md px-4 py-3 text-[12.5px]" style={{ background: `${accent}12` }}>
          <table>
            <tbody>
              {([["email:", d.email], ["phone:", firstPhone(d)], ["web:", d.website]] as [string, string][])
                .filter(([, v]) => v)
                .map(([k, v]) => (
                  <tr key={k}>
                    <td className="pr-4 py-[2px] font-semibold align-top">{k}</td>
                    <td className="py-[2px]" {...(k === "web:" ? { "data-sig-website": "" } : {})}>{v}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4"><SocialRow d={d} variant="square" color="#1e293b" /></div>
      </div>
    </div>
  );
}

/* ============ 08 Two-Tone Block ============ */
function TwoToneBlock(d: SignatureData) {
  const accent = d.themeColor || d.primaryColor;
  return (
    <div className="bg-white p-7" style={{ fontFamily: d.fontFamily, color: d.textColor }}>
      <p data-sig-name="" className="text-[21px] font-bold uppercase tracking-tight" style={{ color: accent, fontFamily: "Georgia, serif" }}>{d.name}</p>
      <p className="text-[13px] font-bold uppercase tracking-tight">{d.title}</p>
      <div className="flex gap-3 mt-3">
        <Photo d={d} size={52} />
        {d.logoUrl && <img src={d.logoUrl} alt={d.company} className="h-[52px] object-contain" />}
      </div>
      <div className="mt-3 px-5 py-4" style={{ background: accent }}>
        <SocialRow d={d} variant="knockout" bg={accent} />
      </div>
      <div className="px-5 py-4 text-[12.5px]" style={{ background: `${accent}99`, color: "#fff" }}>
        <p><span className="font-semibold">email:</span> {d.email}</p>
        {d.tagline && <p className="font-bold mt-1">{d.tagline}</p>}
      </div>
    </div>
  );
}

/* ============ 09 Script Logotype ============ */
function ScriptLogotype(d: SignatureData) {
  const accent = d.themeColor || d.primaryColor;
  return (
    <div className="bg-white p-7" style={{ fontFamily: d.fontFamily, color: d.textColor }}>
      <div className="border border-black/10 rounded-lg px-6 py-5">
        <div className="flex items-end gap-3">
          <p className="text-[22px] italic" style={{ fontFamily: "Georgia, serif" }}>{d.company}</p>
          <div className="flex-1 mb-2" style={{ borderBottom: `1px dotted ${d.mutedColor}` }} />
        </div>
        <div className="flex gap-8 mt-4">
          <div className="flex-1">
            <p data-sig-name="" className="text-[15px] font-bold" style={{ color: accent }}>{d.name}</p>
            <p className="text-[12.5px]" style={{ color: d.mutedColor }}>{d.title}</p>
            <p className="text-[11.5px] mt-3" style={{ color: d.mutedColor }}>Follow us:</p>
            <div className="mt-1"><SocialRow d={d} variant="solid" color={accent} limit={4} /></div>
          </div>
          <div className="pl-8 text-[12.5px]" style={{ borderLeft: `1px solid ${d.mutedColor}33` }}>
            {d.address && (
              <p className="flex gap-3"><span style={{ color: accent }}>A</span><span>{d.address}</span></p>
            )}
            <p className="flex gap-3 mt-1"><span style={{ color: accent }}>E</span><span>{d.email}</span></p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============ 10 Promo & CTA ============ */
function PromoCTA(d: SignatureData) {
  const accent = d.themeColor || d.primaryColor;
  return (
    <div className="bg-white p-7" style={{ fontFamily: d.fontFamily, color: d.textColor }}>
      <div className="flex gap-5">
        <div className="flex flex-col gap-3 pt-1">
          {socialItems(d, 3).map(({ Icon, key }, i) => (
            <Icon key={i} style={{ width: 16, height: 16, color: d.socialIconColor || d.textColor, fill: d.socialIconColor || d.textColor }} />
          ))}
        </div>
        <div className="flex-1">
          <p data-sig-name="" className="text-[18px] font-bold">{d.name}</p>
          <p className="text-[13px] font-bold" style={{ color: accent }}>{d.title}</p>
          <table className="text-[12.5px] mt-2">
            <tbody>
              <tr><td className="pr-4" style={{ color: d.mutedColor }}>email</td><td>{d.email}</td></tr>
              <tr><td className="pr-4" style={{ color: d.mutedColor }}>phone</td><td>{firstPhone(d)}</td></tr>
            </tbody>
          </table>
          {d.ctaLabel && (
            <div className="mt-4">
              <span className="inline-block rounded-full border px-5 py-2 text-[12.5px] font-semibold" style={{ borderColor: d.textColor }}>
                {d.ctaLabel} →
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ============ 11 Signoff & Notice ============ */
function SignoffNotice(d: SignatureData) {
  const accent = d.themeColor || d.primaryColor;
  return (
    <div className="bg-white p-7" style={{ fontFamily: d.fontFamily, color: d.textColor }}>
      <p className="text-[17px] italic font-semibold" style={{ color: accent, fontFamily: "Georgia, serif" }}>Best regards,</p>
      <div className="flex items-start gap-4 mt-3">
        <Photo d={d} size={62} />
        <div className="flex-1">
          <p data-sig-name="" className="text-[18px] font-bold" style={{ fontFamily: "Georgia, serif" }}>{d.name}</p>
          <p className="text-[12.5px]" style={{ color: d.mutedColor }}>{d.title} · {d.company}</p>
          <div data-sig-rule="" className="my-2" style={{ height: 1, background: `${d.mutedColor}33` }} />
          <table className="text-[12.5px]">
            <tbody>
              <tr><td className="pr-3 font-semibold">email:</td><td>{d.email}</td></tr>
              {firstPhone(d) && <tr><td className="pr-3 font-semibold">phone:</td><td>{firstPhone(d)}</td></tr>}
            </tbody>
          </table>
          <div className="mt-3 flex gap-2 flex-wrap">
            {socialItems(d, 3).map(({ key }, i) => (
              <span
                key={i}
                className="px-4 py-1.5 rounded-md text-[12px] font-semibold capitalize"
                style={{ background: socialBrandColor[key] || accent, color: "#fff" }}
              >
                {key}
              </span>
            ))}
          </div>
          <Note d={d} />
        </div>
      </div>
    </div>
  );
}

/* ============ 12 Three Bands ============ */
function ThreeBands(d: SignatureData) {
  const accent = d.themeColor || d.primaryColor;
  return (
    <div className="bg-white p-7" style={{ fontFamily: d.fontFamily }}>
      <div className="rounded-lg overflow-hidden">
        <div className="px-6 py-4" style={{ background: accent }}>
          <p data-sig-name="" className="text-[19px] font-bold uppercase text-white" style={{ fontFamily: "Georgia, serif" }}>{d.name}</p>
          <p className="text-[12.5px]" style={{ color: "#ffffffcc" }}>{d.title}</p>
        </div>
        <div className="px-6 py-4 text-[12.5px]" style={{ background: `${accent}1f`, color: d.textColor }}>
          <p><span className="inline-block w-5" style={{ color: d.mutedColor }}>e</span>{d.email}</p>
          {firstPhone(d) && <p className="mt-1"><span className="inline-block w-5" style={{ color: d.mutedColor }}>p</span>{firstPhone(d)}</p>}
          <p className="mt-1" data-sig-website=""><span className="inline-block w-5" style={{ color: d.mutedColor }}>w</span>{d.website}</p>
        </div>
        <div className="px-6 py-3 flex items-center justify-between" style={{ background: `${accent}99` }}>
          <SocialRow d={d} variant="knockout" bg={accent} size={26} />
          <span className="text-[10px] tracking-[0.18em] uppercase text-white">{d.website}</span>
        </div>
      </div>
    </div>
  );
}

/* ============ 13 Panel Duo ============ */
function PanelDuo(d: SignatureData) {
  const accent = d.themeColor || d.primaryColor;
  return (
    <div className="bg-white p-7" style={{ fontFamily: d.fontFamily, color: d.textColor }}>
      <p data-sig-name="" className="text-[19px] font-bold" style={{ fontFamily: "Georgia, serif" }}>{d.name}</p>
      <p className="text-[13px] font-bold" style={{ color: accent }}>{d.title} · {d.company}</p>
      <div className="grid grid-cols-2 gap-4 mt-4">
        <div className="rounded-lg px-4 py-3 text-[12.5px]" style={{ background: `${accent}12` }}>
          <p className="text-[9.5px] uppercase tracking-[0.16em] mb-1" style={{ color: accent }}>Reach me</p>
          <p>{d.email}</p>
          {firstPhone(d) && <p>{firstPhone(d)}</p>}
          {d.address && <p>{d.address}</p>}
        </div>
        <div className="rounded-lg px-4 py-3" style={{ background: accent }}>
          <p className="text-[9.5px] uppercase tracking-[0.16em] mb-2" style={{ color: "#ffffffcc" }}>Follow</p>
          <SocialRow d={d} variant="knockout" bg={accent} size={26} limit={4} />
          {d.ctaLabel && (
            <span className="inline-block mt-3 rounded-md bg-white px-4 py-1.5 text-[12px] font-semibold" style={{ color: accent }}>
              {d.ctaLabel}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

/* ============ 14 Side Promo ============ */
function SidePromo(d: SignatureData) {
  const accent = d.themeColor || d.primaryColor;
  return (
    <div className="bg-white p-7" style={{ fontFamily: d.fontFamily, color: d.textColor }}>
      <div className="flex gap-4 items-stretch">
        <div className="flex-1 border border-black/10 rounded-lg px-5 py-4">
          <p data-sig-name="" className="text-[18px] font-bold" style={{ fontFamily: "Georgia, serif" }}>{d.name}</p>
          <p className="text-[12.5px] mt-0.5" style={{ color: d.mutedColor }}>{d.title} · {d.company}</p>
          <div data-sig-rule="" className="my-3" style={{ height: 1, background: `${d.mutedColor}33` }} />
          {firstPhone(d) && <p className="text-[12.5px]">{firstPhone(d)}</p>}
          <p className="text-[12.5px]" style={{ color: d.linkColor || accent }}>{d.email}</p>
          <div className="mt-3"><SocialRow d={d} variant="plain" limit={3} size={18} /></div>
        </div>
        <div className="w-[180px] rounded-lg flex items-center justify-center text-center" style={{ background: `${accent}0f`, border: `1px dashed ${accent}55` }}>
          {d.logoUrl ? (
            <img src={d.logoUrl} alt={d.company} className="max-w-[80%] object-contain" />
          ) : (
            <span className="text-[12.5px] font-medium" style={{ color: d.mutedColor }}>Promo</span>
          )}
        </div>
      </div>
    </div>
  );
}

/* ============ 15 Outline Panel ============ */
function OutlinePanel(d: SignatureData) {
  const accent = d.themeColor || d.primaryColor;
  return (
    <div className="bg-white p-7" style={{ fontFamily: d.fontFamily, color: d.textColor }}>
      <div className="rounded-xl px-6 py-5" style={{ border: `2px solid ${accent}` }}>
        <div className="flex items-start justify-between gap-6">
          <p data-sig-name="" className="text-[19px] font-bold" style={{ fontFamily: "Georgia, serif" }}>{d.name}</p>
          <span className="rounded-md px-3 py-1 text-[9.5px] uppercase tracking-[0.16em] font-medium" style={{ border: `1px solid ${accent}55`, color: accent }}>
            {d.department || d.title}
          </span>
        </div>
        <table className="text-[12.5px] mt-3">
          <tbody>
            {firstPhone(d) && (
              <tr><td className="pr-6 py-[2px]" style={{ color: d.mutedColor }}>Mobile</td><td style={{ color: d.linkColor || accent }}>{firstPhone(d)}</td></tr>
            )}
            <tr><td className="pr-6 py-[2px]" style={{ color: d.mutedColor }}>Email</td><td>{d.email}</td></tr>
          </tbody>
        </table>
        <div data-sig-rule="" className="my-3" style={{ height: 1, background: `${d.mutedColor}33` }} />
        <div className="flex items-center justify-between">
          <SocialRow d={d} variant="outline" limit={3} size={26} />
          <span className="text-[10px] tracking-[0.16em]" style={{ color: d.mutedColor, fontFamily: "ui-monospace, monospace" }}>SUN–THU · 07:00–16:00</span>
        </div>
      </div>
    </div>
  );
}

/* ============ 16 Colour Wordmark ============ */
function ColourWordmark(d: SignatureData) {
  const accent = d.themeColor || d.primaryColor;
  return (
    <div className="bg-white p-7" style={{ fontFamily: d.fontFamily, color: d.textColor }}>
      <p className="text-[30px] font-black uppercase leading-[0.95] tracking-tight" style={{ color: accent }}>{d.company}</p>
      {d.tagline && (
        <p className="text-[11px] uppercase tracking-[0.2em] mt-2" style={{ color: d.mutedColor, fontFamily: "ui-monospace, monospace" }}>{d.tagline}</p>
      )}
      <div data-sig-rule="" className="my-3" style={{ height: 1, background: `${d.mutedColor}33` }} />
      <div className="flex items-start justify-between gap-6">
        <div>
          <p data-sig-name="" className="text-[16px] font-bold">{d.name}</p>
          <p className="text-[12.5px]" style={{ color: d.mutedColor }}>{d.title}</p>
        </div>
        <div className="text-right text-[12.5px]">
          {firstPhone(d) && <p>{firstPhone(d)}</p>}
          <p data-sig-website="" className="font-bold" style={{ color: accent }}>{d.website}</p>
        </div>
      </div>
      <div className="mt-4 px-5 py-3 rounded-md" style={{ background: "#111" }}>
        <SocialRow d={d} variant="solid" color={accent} size={28} limit={4} />
      </div>
    </div>
  );
}

/* ============ 17 Wallet Pass ============ */
function WalletPass(d: SignatureData) {
  const accent = d.themeColor || d.primaryColor;
  return (
    <div className="bg-white p-7" style={{ fontFamily: d.fontFamily, color: d.textColor }}>
      <div className="rounded-lg overflow-hidden border border-black/10">
        <div className="px-5 py-3 flex items-center justify-between" style={{ background: "#111" }}>
          <span className="text-[13px] font-bold tracking-[0.12em] uppercase text-white" style={{ fontFamily: "Georgia, serif" }}>{d.company}</span>
          <span className="text-[9.5px] tracking-[0.2em] uppercase" style={{ color: "#a3a3a3", fontFamily: "ui-monospace, monospace" }}>Digital card</span>
        </div>
        <div className="px-5 py-4 flex items-start justify-between gap-6">
          <div>
            <p data-sig-name="" className="text-[17px] font-bold">{d.name}</p>
            <p className="text-[12.5px]" style={{ color: d.mutedColor }}>{d.title}</p>
            <p className="text-[12.5px] mt-2">{d.email}</p>
            {firstPhone(d) && <p className="text-[12.5px]">{firstPhone(d)}</p>}
          </div>
          <QR color={d.textColor} />
        </div>
        <div className="px-5 py-3 flex items-center justify-between border-t border-black/10" style={{ background: "#fafafa" }}>
          <span className="text-[12px]" style={{ color: d.mutedColor }}>Scan or tap to save</span>
          <span className="px-4 py-1.5 text-[11px] uppercase tracking-[0.12em] font-semibold text-white rounded" style={{ background: accent }}>
            Add to wallet
          </span>
        </div>
      </div>
    </div>
  );
}

/* ============ 18 Now Hiring ============ */
function NowHiring(d: SignatureData) {
  const accent = d.accentColor || "#10b981";
  return (
    <div className="bg-white p-7" style={{ fontFamily: d.fontFamily, color: d.textColor }}>
      <div className="border border-black/10 rounded-lg px-6 py-5">
        <p data-sig-name="" className="text-[18px] font-bold">{d.name}</p>
        <p className="text-[12.5px] mt-0.5" style={{ color: d.mutedColor }}>{d.title} · {d.company}</p>
        <p className="text-[12.5px]" style={{ color: d.mutedColor }}>{d.email}{firstPhone(d) ? ` · ${firstPhone(d)}` : ""}</p>
        <div className="mt-4 rounded-md px-4 py-3" style={{ background: `${accent}14` }}>
          <p className="text-[10px] uppercase tracking-[0.18em] font-semibold flex items-center gap-2" style={{ color: accent, fontFamily: "ui-monospace, monospace" }}>
            <span style={{ width: 7, height: 7, borderRadius: 9999, background: accent, display: "inline-block" }} />
            We are hiring
          </p>
          <div className="flex flex-wrap gap-2 mt-2">
            <span className="rounded-full bg-white border border-black/10 px-3 py-1 text-[12px]">Senior Designer</span>
            <span className="rounded-full bg-white border border-black/10 px-3 py-1 text-[12px]">Motion Lead</span>
            <span className="rounded-full px-3 py-1 text-[12px] font-semibold text-white" style={{ background: accent }}>See all roles →</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============ 19 Feedback ============ */
function Feedback(d: SignatureData) {
  const accent = d.accentColor || "#10b981";
  return (
    <div className="bg-white p-7" style={{ fontFamily: d.fontFamily, color: d.textColor }}>
      <div className="border border-black/10 rounded-lg px-6 py-5">
        <p data-sig-name="" className="text-[18px] font-bold">{d.name}</p>
        <p className="text-[12.5px] mt-0.5" style={{ color: d.mutedColor }}>{d.title} · {d.company}</p>
        <p className="text-[12.5px]" style={{ color: d.mutedColor }}>{d.email}</p>
        <div className="mt-4 rounded-md border border-black/10 px-4 py-3">
          <p className="text-[12.5px] font-medium">How did we do today?</p>
          <div className="flex gap-2 mt-2">
            {["😞", "😐", "🙂", "😀"].map((e, i) => (
              <span
                key={i}
                className="w-9 h-9 rounded-md border flex items-center justify-center text-[16px]"
                style={{ borderColor: i === 2 ? accent : "#e5e5e5", borderWidth: i === 2 ? 2 : 1 }}
              >
                {e}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============ 20 Multi-Entity ============ */
function MultiEntity(d: SignatureData) {
  const accent = d.themeColor || d.primaryColor;
  const second = d.accentColor || "#0f766e";
  return (
    <div className="bg-white p-7" style={{ fontFamily: d.fontFamily, color: d.textColor }}>
      <div className="border border-black/10 rounded-lg px-6 py-5">
        <div className="flex items-center gap-6">
          <div>
            <p className="text-[16px] font-bold tracking-[0.08em] uppercase" style={{ fontFamily: "Georgia, serif" }}>{d.company}</p>
            <p className="text-[9.5px] tracking-[0.18em] uppercase" style={{ color: d.mutedColor, fontFamily: "ui-monospace, monospace" }}>Group</p>
          </div>
          <div style={{ width: 1, height: 34, background: `${d.mutedColor}44` }} />
          <div>
            <p className="text-[16px] font-bold" style={{ color: second }}>{d.department || "Division"}</p>
            <p className="text-[9.5px] tracking-[0.16em] uppercase" style={{ color: d.mutedColor, fontFamily: "ui-monospace, monospace" }}>
              A {d.company} company
            </p>
          </div>
        </div>
        <div data-sig-rule="" className="my-3" style={{ height: 1, background: `${d.mutedColor}33` }} />
        <div className="flex items-start justify-between gap-6">
          <div>
            <p data-sig-name="" className="text-[17px] font-bold">{d.name}</p>
            <p className="text-[12.5px]" style={{ color: d.mutedColor }}>{d.title}</p>
          </div>
          <div className="text-right">
            <span className="rounded px-2 py-1 text-[9.5px] tracking-[0.16em] uppercase" style={{ background: `${accent}12`, color: d.mutedColor, fontFamily: "ui-monospace, monospace" }}>
              {"EMEA"}
            </span>
            <p className="text-[12.5px] mt-2">{d.email}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============ 21 Portfolio Strip ============ */
function PortfolioStrip(d: SignatureData) {
  const accent = d.themeColor || d.primaryColor;
  return (
    <div className="bg-white p-7" style={{ fontFamily: d.fontFamily, color: d.textColor }}>
      <div className="border border-black/10 rounded-lg px-6 py-5">
        <div className="flex items-start justify-between gap-6">
          <div>
            <p data-sig-name="" className="text-[18px] font-bold" style={{ fontFamily: "Georgia, serif" }}>{d.name}</p>
            <p className="text-[12.5px]" style={{ color: d.mutedColor }}>{d.title} · {d.company}</p>
          </div>
          <span className="text-[12.5px] font-medium" style={{ color: d.linkColor || accent }}>Full portfolio →</span>
        </div>
        <div className="grid grid-cols-3 gap-3 mt-4">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-[72px] rounded-md flex items-center justify-center text-[12px]"
              style={{ background: "#f1f1f1", color: d.mutedColor }}
            >
              Work
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between mt-4">
          <span className="text-[12.5px]" style={{ color: d.mutedColor }}>{d.email}</span>
          <SocialRow d={d} variant="outline" limit={2} size={26} />
        </div>
      </div>
    </div>
  );
}

export const pack2Templates: TemplateMeta[] = [
  { id: "split-rule", name: "Split Rule", category: "Corporate", layout: "two-column", accent: "bg-neutral-900", description: "Identity left, reachability right. The most reliable structure in Outlook desktop.", render: SplitRule },
  { id: "ledger", name: "Ledger", category: "Executive", layout: "single", accent: "bg-[#1E3A8A]", description: "Label column maps to directory fields. Renders identically in every client.", render: Ledger },
  { id: "card-code", name: "Card & Code", category: "Minimal", layout: "two-column", accent: "bg-neutral-800", description: "Scannable contact card with vCard QR. Useful at events.", render: CardCode },
  { id: "dark-mode", name: "Dark Mode", category: "Bold", layout: "vertical", accent: "bg-black", description: "Solid fills only, no transparency. Survives clients that invert light signatures.", render: DarkMode },
  { id: "out-of-office", name: "Out of Office", category: "Minimal", layout: "vertical", accent: "bg-amber-400", description: "A conditional away bar that names the cover contact.", render: OutOfOffice },
  { id: "working-details", name: "Working Details", category: "Corporate", layout: "single", accent: "bg-neutral-600", description: "Pronouns and working hours as directory fields.", render: WorkingDetails },
  { id: "tinted-panel", name: "Tinted Panel", category: "Corporate", layout: "vertical", accent: "bg-indigo-500", description: "Contact details in a soft panel with labels. Formal register.", render: TintedPanel },
  { id: "two-tone-block", name: "Two-Tone Block", category: "Bold", layout: "vertical", accent: "bg-emerald-800", description: "Two shades of one colour, icons knocked out in white.", render: TwoToneBlock },
  { id: "script-logotype", name: "Script Logotype", category: "Creative", layout: "two-column", accent: "bg-[#5B2EFF]", description: "Company set as a logotype with a dotted leader. Works with no logo asset.", render: ScriptLogotype },
  { id: "promo-cta", name: "Promo & CTA", category: "Bold", layout: "two-column", accent: "bg-orange-600", description: "Icon rail, contact table and outlined CTA for high-volume outbound.", render: PromoCTA },
  { id: "signoff-notice", name: "Signoff & Notice", category: "Executive", layout: "vertical", accent: "bg-[#5B2EFF]", description: "Sign-off, photo, filled platform buttons and a compliance notice.", render: SignoffNotice },
  { id: "three-bands", name: "Three Bands", category: "Creative", layout: "vertical", accent: "bg-emerald-800", description: "Three tones of one hue, one job each: who, how, where else.", render: ThreeBands },
  { id: "panel-duo", name: "Panel Duo", category: "Creative", layout: "two-column", accent: "bg-fuchsia-900", description: "Contact and channels in two panels, tinted and solid.", render: PanelDuo },
  { id: "side-promo", name: "Side Promo", category: "Corporate", layout: "two-column", accent: "bg-neutral-400", description: "Promo sits beside the block, not under it. Keeps replies short.", render: SidePromo },
  { id: "outline-panel", name: "Outline Panel", category: "Minimal", layout: "vertical", accent: "bg-[#5B2EFF]", description: "Outlined rather than filled. Same structure at a fraction of the ink.", render: OutlinePanel },
  { id: "colour-wordmark", name: "Colour Wordmark", category: "Bold", layout: "vertical", accent: "bg-orange-600", description: "Company name as the biggest thing in the signature.", render: ColourWordmark },
  { id: "wallet-pass", name: "Wallet Pass", category: "Executive", layout: "vertical", accent: "bg-neutral-900", description: "Signature doubling as a wallet card with QR.", render: WalletPass },
  { id: "now-hiring", name: "Now Hiring", category: "Creative", layout: "vertical", accent: "bg-emerald-500", description: "Open roles as chips rather than a banner image.", render: NowHiring },
  { id: "feedback", name: "Feedback", category: "Creative", layout: "vertical", accent: "bg-emerald-600", description: "A one-tap survey inside the signature — each face is a tracked link.", render: Feedback },
  { id: "multi-entity", name: "Multi-Entity", category: "Corporate", layout: "vertical", accent: "bg-teal-700", description: "Parent and subsidiary side by side with a region tag.", render: MultiEntity },
  { id: "portfolio-strip", name: "Portfolio Strip", category: "Creative", layout: "vertical", accent: "bg-neutral-500", description: "Three thumbnails as the pitch. For photographers and studios.", render: PortfolioStrip },
];
