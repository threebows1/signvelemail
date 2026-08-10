import { useEffect, useRef, useState } from "react";
import { X, Copy, Check, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  GmailLogo,
  OutlookLogo,
  YahooLogo,
  AppleLogo,
  ThunderbirdLogo,
  IosMailLogo,
} from "@/components/email-client-logos";

type Client =
  | "gmail"
  | "outlook-win"
  | "outlook-mac"
  | "outlook-web"
  | "apple-mail"
  | "apple-mail-ios"
  | "yahoo"
  | "thunderbird";

const CLIENTS: { id: Client; label: string; Logo: any; group: string }[] = [
  { id: "gmail", label: "Gmail (Web)", Logo: GmailLogo, group: "Web" },
  { id: "outlook-web", label: "Outlook Web", Logo: OutlookLogo, group: "Web" },
  { id: "yahoo", label: "Yahoo Mail", Logo: YahooLogo, group: "Web" },
  { id: "outlook-win", label: "Outlook — Windows", Logo: OutlookLogo, group: "Desktop" },
  { id: "outlook-mac", label: "Outlook — macOS", Logo: OutlookLogo, group: "Desktop" },
  { id: "apple-mail", label: "Apple Mail — macOS", Logo: AppleLogo, group: "Desktop" },
  { id: "thunderbird", label: "Thunderbird", Logo: ThunderbirdLogo, group: "Desktop" },
  { id: "apple-mail-ios", label: "iOS / iPadOS Mail", Logo: IosMailLogo, group: "Mobile" },
];

const INSTRUCTIONS: Record<Client, string[]> = {
  gmail: [
    "Click Copy signature to place the formatted signature on your clipboard.",
    "Open Gmail → Settings (⚙) → See all settings → General.",
    "Scroll to Signature → Create new (or select existing).",
    "Paste (Cmd/Ctrl+V) into the signature editor.",
    "Set defaults for New emails and Replies, then Save Changes at the bottom.",
  ],
  "outlook-web": [
    "Click Copy signature.",
    "Open Outlook on the web → Settings → Mail → Compose and reply.",
    "Paste into the Email signature editor.",
    "Choose whether to include it on new messages and replies.",
    "Save.",
  ],
  yahoo: [
    "Click Copy signature.",
    "Yahoo Mail → Settings → More Settings → Writing email.",
    "Enable Signature, paste, and save.",
  ],
  "outlook-win": [
    "Click Download .htm file — this creates an Outlook-ready signature file.",
    "Press Win+R, paste %appdata%\\Microsoft\\Signatures and press Enter.",
    "Move the downloaded .htm file into that folder (name it whatever you like).",
    "Open Outlook → File → Options → Mail → Signatures.",
    "Select the file name from the list, choose it for New messages / Replies, and click OK.",
    "Tip: for the New Outlook, use Copy signature instead and paste into Settings → Accounts → Signatures.",
  ],
  "outlook-mac": [
    "Click Copy signature.",
    "Open Outlook for Mac → Outlook menu → Settings → Signatures.",
    "Click + to add, name it, then paste (Cmd+V) into the editor.",
    "Assign the signature to your account under Choose default signature.",
    "Close the window — changes save automatically.",
  ],
  "apple-mail": [
    "Click Copy signature.",
    "Open Mail → Mail menu → Settings → Signatures.",
    "Select your account, click +, then paste (Cmd+V) into the right pane.",
    "Uncheck Always match my default message font so styling is preserved.",
    "Choose the signature under Choose Signature for that account.",
  ],
  thunderbird: [
    "Click Download .htm file.",
    "Thunderbird → Account Settings → your account.",
    "Check Attach the signature from a file (HTML), then browse to the .htm file.",
    "Save.",
  ],
  "apple-mail-ios": [
    "Because iOS Mail can't render pasted HTML from a laptop reliably, first email this signature to yourself using the Send test option.",
    "On your iPhone/iPad, open the email, press-and-hold to Select All → Copy.",
    "Settings → Mail → Signature → paste.",
    "Shake the device → Undo if it flattens formatting, then paste again — this preserves rich text.",
  ],
};

export function ExportDialog({
  open,
  onClose,
  previewRef,
  signatureName,
}: {
  open: boolean;
  onClose: () => void;
  previewRef: React.RefObject<HTMLElement | null>;
  signatureName: string;
}) {
  const [client, setClient] = useState<Client>("gmail");
  const [copied, setCopied] = useState<null | "rich" | "html">(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const copyRich = async () => {
    const node = previewRef.current;
    if (!node) return;
    try {
      const html = inlineStyles(node);
      const plain = node.innerText;
      if ("ClipboardItem" in window && navigator.clipboard?.write) {
        await navigator.clipboard.write([
          new ClipboardItem({
            "text/html": new Blob([html], { type: "text/html" }),
            "text/plain": new Blob([plain], { type: "text/plain" }),
          }),
        ]);
      } else {
        // fallback: select + execCommand
        const sel = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(node);
        sel?.removeAllRanges();
        sel?.addRange(range);
        document.execCommand("copy");
        sel?.removeAllRanges();
      }
      setCopied("rich");
      setTimeout(() => setCopied(null), 1800);
    } catch (e) {
      console.error(e);
    }
  };

  const copyHtml = async () => {
    const node = previewRef.current;
    if (!node) return;
    const html = inlineStyles(node);
    await navigator.clipboard.writeText(html);
    setCopied("html");
    setTimeout(() => setCopied(null), 1800);
  };

  const downloadHtm = () => {
    const node = previewRef.current;
    if (!node) return;
    const html = wrapForOutlook(inlineStyles(node));
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${signatureName.replace(/\s+/g, "_")}.htm`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadPng = async () => {
    const node = previewRef.current;
    if (!node) return;
    // print-to-image via SVG foreignObject — no extra deps
    const rect = node.getBoundingClientRect();
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${rect.width}" height="${rect.height}">
      <foreignObject width="100%" height="100%">${new XMLSerializer().serializeToString(node)}</foreignObject>
    </svg>`;
    const url = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${signatureName.replace(/\s+/g, "_")}.svg`;
    a.click();
  };

  const grouped = CLIENTS.reduce<Record<string, typeof CLIENTS>>((acc, c) => {
    (acc[c.group] ||= []).push(c);
    return acc;
  }, {});

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={onClose}>
      <div
        ref={dialogRef}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div>
            <h2 className="font-[Inter_Tight] font-bold text-lg tracking-tight">Export & Install</h2>
            <p className="text-xs text-muted-foreground">Deploy your signature to any email client.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-secondary rounded-lg" aria-label="Close">
            <X className="size-4" />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          <aside className="w-56 border-r border-border bg-stone-50/50 overflow-y-auto p-3">
            {Object.entries(grouped).map(([group, items]) => (
              <div key={group} className="mb-4">
                <p className="text-[10px] font-[JetBrains_Mono] uppercase tracking-widest text-muted-foreground px-2 mb-1">{group}</p>
                {items.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setClient(c.id)}
                    className={`w-full flex items-center gap-2 text-left px-2 py-1.5 rounded-md text-sm transition-colors ${
                      client === c.id ? "bg-primary/10 text-primary font-medium" : "text-foreground hover:bg-secondary"
                    }`}
                  >
                    <c.Logo size={18} />
                    {c.label}
                  </button>
                ))}
              </div>
            ))}
          </aside>

          <div className="flex-1 overflow-y-auto p-6">
            <div className="flex flex-wrap gap-2 mb-6">
              <Button onClick={copyRich} size="sm" className="gap-2">
                {copied === "rich" ? <Check className="size-4" /> : <Copy className="size-4" />}
                {copied === "rich" ? "Copied!" : "Copy signature"}
              </Button>
              <Button onClick={copyHtml} size="sm" variant="outline" className="gap-2">
                {copied === "html" ? <Check className="size-4" /> : <Copy className="size-4" />}
                {copied === "html" ? "Copied!" : "Copy HTML source"}
              </Button>
              <Button onClick={downloadHtm} size="sm" variant="outline" className="gap-2">
                <Download className="size-4" /> Download .htm (Outlook)
              </Button>
              <Button onClick={downloadPng} size="sm" variant="outline" className="gap-2">
                <Download className="size-4" /> Download image
              </Button>
            </div>

            <div className="rounded-lg border border-border overflow-hidden">
              <div className="px-4 py-3 bg-stone-50 border-b border-border">
                <p className="font-medium text-sm">Install in {CLIENTS.find((c) => c.id === client)?.label}</p>
              </div>
              <ol className="p-5 space-y-3 text-sm list-decimal list-inside">
                {INSTRUCTIONS[client].map((step, i) => (
                  <li key={i} className="leading-relaxed">
                    <span className="text-foreground/90">{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            <p className="mt-4 text-[11px] text-muted-foreground">
              Rich-text copy pastes with formatting intact into every client above. For classic Outlook on Windows, use the .htm file so images and layout survive.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Accumulated CSS `zoom` for an element (used for typography scaling in previews). */
function zoomOf(el: HTMLElement): number {
  let z = 1;
  let cur: HTMLElement | null = el;
  while (cur) {
    const v = parseFloat(window.getComputedStyle(cur).zoom as string);
    if (!Number.isNaN(v) && v > 0) z *= v;
    cur = cur.parentElement;
  }
  return z;
}

/** Bake a zoom factor into px lengths so email clients (which ignore zoom) match the preview. */
function scalePx(css: string, factor: number): string {
  if (!factor || Math.abs(factor - 1) < 0.001) return css;
  return css.replace(/(-?[\d.]+)px/g, (_m, n) => `${(parseFloat(n) * factor).toFixed(2)}px`);
}

/** Inline all computed styles so pasted HTML renders identically in email clients. */
function inlineStyles(node: HTMLElement): string {
  const clone = node.cloneNode(true) as HTMLElement;
  const src = flatten(node);
  const dst = flatten(clone);
  const KEEP = [
    "color", "background", "background-color", "background-image",
    "font-family", "font-size", "font-weight", "font-style", "font-variant",
    "text-align", "text-decoration", "text-transform", "letter-spacing", "line-height", "white-space",
    "border", "border-top", "border-right", "border-bottom", "border-left",
    "border-color", "border-width", "border-style", "border-radius",
    "padding", "padding-top", "padding-right", "padding-bottom", "padding-left",
    "margin", "margin-top", "margin-right", "margin-bottom", "margin-left",
    "display", "flex", "flex-direction", "align-items", "justify-content", "gap",
    "width", "height", "min-width", "max-width", "min-height", "max-height",
    "vertical-align", "overflow",
  ];
  for (let i = 0; i < src.length; i++) {
    const s = window.getComputedStyle(src[i]);
    let css = "";
    for (const prop of KEEP) {
      const v = s.getPropertyValue(prop);
      if (v && v !== "none" && v !== "normal" && v !== "auto") css += `${prop}:${v};`;
    }
    (dst[i] as HTMLElement).setAttribute("style", scalePx(css, zoomOf(src[i])));
    (dst[i] as HTMLElement).removeAttribute("class");
  }
  return clone.outerHTML;
}

function flatten(node: HTMLElement): HTMLElement[] {
  const out: HTMLElement[] = [node];
  node.querySelectorAll<HTMLElement>("*").forEach((el) => out.push(el));
  return out;
}

function wrapForOutlook(inner: string) {
  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml"><head><meta http-equiv="Content-Type" content="text/html; charset=utf-8"/><title>Signature</title></head><body>${inner}</body></html>`;
}
