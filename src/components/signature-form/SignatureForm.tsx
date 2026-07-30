import { useMemo, useRef, useState } from "react";
import { FIELDS, INITIAL_STATE, type FieldConfig, type FieldKey, type SignatureFormState } from "./fields";

const C = {
  ink: "#14131A",
  secondary: "#6B6878",
  tertiary: "#8B8899",
  placeholder: "#A8A5B4",
  border: "#E7E5EE",
  inputBorder: "#E4E1EE",
  inputFill: "#FBFAFE",
  accent: "#5B2EF0",
  accentHover: "#4A1FD6",
  accentTint: "#F5F2FF",
  ringTrack: "#EDEAF7",
};

const M = { fontFamily: "Manrope, system-ui, sans-serif" };
const MONO = { fontFamily: "'JetBrains Mono', ui-monospace, monospace" };

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  return (parts[0][0] + (parts[1]?.[0] ?? "")).toUpperCase();
}

function SectionHeading({ label, counter }: { label: string; counter?: string }) {
  return (
    <div className="flex items-center gap-3 mb-3">
      <span
        style={{ ...M, fontSize: 10, fontWeight: 600, letterSpacing: "0.16em", color: C.ink }}
        className="uppercase whitespace-nowrap"
      >
        {label}
      </span>
      <span className="flex-1 h-px" style={{ background: C.border }} />
      {counter && (
        <span style={{ ...MONO, fontSize: 10, fontWeight: 500, color: C.placeholder }}>{counter}</span>
      )}
    </div>
  );
}

function FloatingInput({
  field,
  value,
  onChange,
}: {
  field: FieldConfig;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label
      className="block cursor-text transition-colors focus-within:!border-[#5B2EF0]"
      style={{
        border: `1px solid ${C.inputBorder}`,
        background: C.inputFill,
        borderRadius: 10,
        padding: "9px 12px 7px",
      }}
    >
      <span
        className="block uppercase"
        style={{ ...M, fontSize: 9.5, fontWeight: 600, letterSpacing: "0.12em", color: C.tertiary }}
      >
        {field.label}
      </span>
      <input
        value={value}
        placeholder={field.placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-transparent border-0 outline-none p-0 placeholder:text-[#A8A5B4]"
        style={{ ...M, fontSize: 13.5, fontWeight: 600, color: C.ink }}
      />
    </label>
  );
}

function UploadTile({
  kind,
  value,
  onFile,
  name,
  company,
}: {
  kind: "photo" | "logo";
  value: string;
  onFile: (dataUrl: string) => void;
  name: string;
  company: string;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);

  function read(file?: File | null) {
    if (!file) return;
    const r = new FileReader();
    r.onload = () => onFile(String(r.result));
    r.readAsDataURL(file);
  }

  const isPhoto = kind === "photo";
  const radius = isPhoto ? 99 : 10;

  return (
    <button
      type="button"
      onClick={() => ref.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        read(e.dataTransfer.files?.[0]);
      }}
      className="flex flex-col items-start gap-[10px] text-left transition-colors"
      style={{
        border: `1px dashed ${over ? C.accent : "#D6D2E4"}`,
        background: over ? C.accentTint : C.inputFill,
        borderRadius: 12,
        padding: 14,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = C.accent;
        e.currentTarget.style.background = C.accentTint;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "#D6D2E4";
        e.currentTarget.style.background = C.inputFill;
      }}
    >
      <input
        ref={ref}
        type="file"
        accept="image/png,image/jpeg"
        className="hidden"
        onChange={(e) => read(e.target.files?.[0])}
      />
      {value ? (
        <img
          src={value}
          alt={isPhoto ? "Profile photo" : "Company logo"}
          className="size-[46px] object-cover"
          style={{ borderRadius: radius }}
        />
      ) : isPhoto && name ? (
        <span
          className="size-[46px] rounded-full flex items-center justify-center text-white"
          style={{ ...M, fontSize: 15, fontWeight: 700, background: "linear-gradient(140deg,#5B2EF0,#B69BFF)" }}
        >
          {initials(name)}
        </span>
      ) : !isPhoto && company ? (
        <span
          className="size-[46px] flex items-center justify-center text-white"
          style={{ ...M, fontSize: 15, fontWeight: 700, background: C.ink, borderRadius: 10 }}
        >
          {initials(company)}
        </span>
      ) : (
        <span
          className="size-[46px] flex items-center justify-center"
          style={{ border: `1px dashed #CFCADF`, borderRadius: radius, color: C.placeholder, fontSize: 18 }}
        >
          +
        </span>
      )}
      <span className="block">
        <span className="block" style={{ ...M, fontSize: 12, fontWeight: 700, color: C.ink }}>
          {isPhoto ? "Profile photo" : "Company logo"}
        </span>
        <span className="block" style={{ ...M, fontSize: 10.5, color: C.tertiary }}>
          Drop or click · PNG, JPG · 2 MB
        </span>
      </span>
    </button>
  );
}

export function SignatureForm() {
  const [state, setState] = useState<SignatureFormState>(INITIAL_STATE);
  const [fetched, setFetched] = useState(false);

  const set = (k: keyof SignatureFormState) => (v: string) => setState((p) => ({ ...p, [k]: v }));

  const bySection = (s: FieldConfig["section"]) => FIELDS.filter((f) => f.section === s);

  const count = (s: FieldConfig["section"]) =>
    bySection(s).filter((f) => state[f.key as FieldKey].trim() !== "").length;

  const filled = useMemo(() => {
    const text = FIELDS.filter((f) => state[f.key].trim() !== "").length;
    return text + (state.photoUrl ? 1 : 0) + (state.logoUrl ? 1 : 0);
  }, [state]);

  const pct = Math.round((filled / 15) * 100);

  function fetchBranding() {
    setFetched(true);
    if (!state.logoUrl) {
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="92" height="92"><rect width="92" height="92" rx="18" fill="#14131A"/><text x="46" y="58" font-family="Manrope,sans-serif" font-size="34" font-weight="800" fill="#fff" text-anchor="middle">${initials(state.company || "Sign Vel")}</text></svg>`;
      setState((p) => ({ ...p, logoUrl: `data:image/svg+xml;utf8,${encodeURIComponent(svg)}` }));
    }
  }

  const websiteField = FIELDS.find((f) => f.section === "website")!;

  return (
    <div className="w-[474px] h-full flex flex-col bg-white sigform" style={M}>
      <style>{`
        .sigform ::-webkit-scrollbar { width: 8px; }
        .sigform ::-webkit-scrollbar-track { background: transparent; }
        .sigform ::-webkit-scrollbar-thumb { background: rgba(20,19,26,.16); border-radius: 99px; }
      `}</style>

      <header
        className="sticky top-0 z-10 flex items-center justify-between gap-4 backdrop-blur"
        style={{
          background: "rgba(255,255,255,0.92)",
          borderBottom: `1px solid ${C.border}`,
          padding: "20px 28px 14px",
        }}
      >
        <div className="min-w-0">
          <h2 style={{ fontWeight: 800, fontSize: 17, color: C.ink, letterSpacing: "-0.01em" }}>
            Your signature
          </h2>
          <p className="whitespace-nowrap" style={{ fontWeight: 500, fontSize: 11.5, color: C.secondary }}>
            Saved automatically · {filled} of 15 fields
          </p>
        </div>
        <div
          className="size-[44px] rounded-full flex items-center justify-center shrink-0"
          style={{ background: `conic-gradient(${C.accent} ${filled / 15}turn, ${C.ringTrack} 0)` }}
        >
          <span
            className="size-[34px] rounded-full bg-white flex items-center justify-center"
            style={{ fontWeight: 700, fontSize: 10, color: C.accent }}
          >
            {pct}%
          </span>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto flex flex-col gap-[30px]" style={{ padding: "24px 28px 40px" }}>
        <section>
          <SectionHeading label="Media" />
          <div className="grid grid-cols-2 gap-3">
            <UploadTile
              kind="photo"
              value={state.photoUrl}
              onFile={set("photoUrl")}
              name={state.fullName}
              company={state.company}
            />
            <UploadTile
              kind="logo"
              value={state.logoUrl}
              onFile={set("logoUrl")}
              name={state.fullName}
              company={state.company}
            />
          </div>
        </section>

        {(
          [
            ["Identity", "identity", 4],
            ["Contact", "contact", 5],
            ["Links", "links", 1],
          ] as const
        ).map(([label, section, total]) => {
          const fields = bySection(section);
          const rows: FieldConfig[][] = [];
          for (let i = 0; i < fields.length; i++) {
            const f = fields[i];
            const next = fields[i + 1];
            if (f.half && next?.half) {
              rows.push([f, next]);
              i++;
            } else rows.push([f]);
          }
          return (
            <section key={section}>
              <SectionHeading label={label} counter={`${count(section)}/${total}`} />
              <div className="flex flex-col gap-[10px]">
                {rows.map((row, i) => (
                  <div key={i} className={row.length === 2 ? "grid grid-cols-2 gap-[10px]" : ""}>
                    {row.map((f) => (
                      <FloatingInput key={f.key} field={f} value={state[f.key]} onChange={set(f.key)} />
                    ))}
                  </div>
                ))}
              </div>
            </section>
          );
        })}

        <section>
          <div className="flex items-stretch gap-[10px]">
            <div className="flex-1">
              <FloatingInput field={websiteField} value={state.website} onChange={set("website")} />
            </div>
            <button
              type="button"
              onClick={fetchBranding}
              className="h-[47px] px-4 flex items-center gap-2 text-white whitespace-nowrap transition-colors"
              style={{ background: C.accent, borderRadius: 10, fontWeight: 700, fontSize: 12 }}
              onMouseEnter={(e) => (e.currentTarget.style.background = C.accentHover)}
              onMouseLeave={(e) => (e.currentTarget.style.background = C.accent)}
            >
              <span className="size-[6px] rounded-full" style={{ background: "#B69BFF" }} />
              {fetched ? "Branding found" : "Fetch branding"}
            </button>
          </div>
          <p className="mt-2" style={{ fontSize: 11, color: C.tertiary }}>
            {fetched
              ? `Pulled logo and brand colour from ${state.website || "your site"} — you can override both.`
              : "We read your site once to suggest a logo and accent colour."}
          </p>
        </section>
      </div>
    </div>
  );
}

export default SignatureForm;
