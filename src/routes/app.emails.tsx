import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Download, Mail, Plug } from "lucide-react";
import { templates, renderSignature } from "@/components/signatures/templates";
import { defaultData } from "@/lib/signature-store";
import { GmailLogo, OutlookLogo, AppleLogo, ThunderbirdLogo } from "@/components/email-client-logos";
import { toast } from "sonner";

export const Route = createFileRoute("/app/emails")({
  head: () => ({
    meta: [
      { title: "Emails — Sign Vel" },
      { name: "description", content: "Copy your signature into Gmail, Outlook or Apple Mail, and track integrations as they become available." },
      { property: "og:title", content: "Sign Vel Emails" },
      { property: "og:description", content: "Install email signatures in Gmail, Outlook and Apple Mail. Team rollout integrations coming soon." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: EmailsPage,
});

const integrations = [
  {
    name: "Google Workspace",
    body: "Push signatures to every mailbox in your domain automatically.",
    logo: <GmailLogo className="size-6" />,
  },
  {
    name: "Microsoft 365",
    body: "Server-side signature rules for Exchange Online mailboxes.",
    logo: <OutlookLogo className="size-6" />,
  },
  {
    name: "Apple Mail",
    body: "Signed installer profile for macOS and iOS devices.",
    logo: <AppleLogo className="size-6" />,
  },
  {
    name: "Thunderbird",
    body: "Config file import for Thunderbird desktop profiles.",
    logo: <ThunderbirdLogo className="size-6" />,
  },
];

function EmailsPage() {
  const [selected, setSelected] = useState(templates[0].id);
  const template = templates.find((t) => t.id === selected)!;

  return (
    <div className="p-8 md:p-12 max-w-6xl">
      <div className="mb-10">
        <span className="font-[JetBrains_Mono] text-[10px] uppercase tracking-[0.2em] text-primary font-medium block mb-2">
          (Delivery)
        </span>
        <h1 className="text-3xl font-[Inter_Tight] font-bold tracking-tight">Emails</h1>
        <p className="text-sm text-muted-foreground mt-2 max-w-xl">
          Install a signature in your own mail client today. Automated team rollout to Google Workspace and Microsoft
          365 is not connected yet.
        </p>
      </div>

      {/* Honest state: nothing is deployed automatically yet */}
      <div className="rounded-2xl border border-dashed border-primary/30 bg-primary/5 p-6 mb-10">
        <div className="flex items-start gap-3">
          <Plug className="size-5 text-primary mt-0.5 shrink-0" />
          <div>
            <h2 className="font-[Inter_Tight] font-bold tracking-tight">No mail provider connected</h2>
            <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
              Sign Vel can’t send test emails or deploy signatures to mailboxes until you connect a provider. Nothing is
              being deployed in the background, and no delivery data exists yet. Until then, export your signature and
              paste it into your mail client — that takes about a minute.
            </p>
            <div className="flex flex-wrap gap-2 mt-4">
              <Link to="/app/editor/$id" params={{ id: "new" }}>
                <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                  Build a signature
                </Button>
              </Link>
              <a href="mailto:support@signvel.com?subject=Integration%20waitlist">
                <Button size="sm" variant="outline">Ask to join the integration beta</Button>
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
        {integrations.map((i) => (
          <div key={i.name} className="bg-white ring-1 ring-black/5 rounded-2xl p-5 flex items-start gap-4">
            <div className="shrink-0">{i.logo}</div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-medium text-sm">{i.name}</p>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-[JetBrains_Mono] uppercase bg-secondary text-muted-foreground">
                  Coming soon
                </span>
              </div>
              <p className="text-[12px] text-muted-foreground mt-1">{i.body}</p>
              <Button size="sm" variant="outline" className="mt-3 h-7 text-xs" disabled>
                Connect integration
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Manual install — this genuinely works */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white ring-1 ring-black/5 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-5">
            <Mail className="size-4 text-primary" />
            <h2 className="font-[Inter_Tight] font-bold tracking-tight">Install it manually</h2>
          </div>

          <div className="space-y-1.5 mb-5">
            <label className="text-[10px] font-[JetBrains_Mono] text-muted-foreground uppercase">Preview template</label>
            <select
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
              className="w-full bg-stone-50 border border-border px-3 py-2 text-sm rounded focus:outline-none focus:ring-1 focus:ring-primary/40"
            >
              {templates.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>

          <ol className="space-y-3 text-sm text-muted-foreground list-decimal pl-5">
            <li>Open a signature in the editor and click <span className="text-foreground font-medium">Export</span>.</li>
            <li>Choose <span className="text-foreground font-medium">Copy signature</span> for Gmail, Apple Mail or Outlook on the web.</li>
            <li>Download the <span className="text-foreground font-medium">.htm</span> file for Outlook on Windows and drop it in your Signatures folder.</li>
            <li>Paste into your mail client’s signature settings and save.</li>
          </ol>

          <div className="flex flex-wrap gap-2 mt-5">
            <Link to="/app/editor/$id" params={{ id: "new" }}>
              <Button size="sm" variant="outline" className="text-xs">
                <Copy className="size-3.5 mr-1.5" /> Open editor to copy
              </Button>
            </Link>
            <Button
              size="sm"
              variant="outline"
              className="text-xs"
              onClick={() => toast.info("Exports live in the editor — open a signature and click Export.")}
            >
              <Download className="size-3.5 mr-1.5" /> Where are downloads?
            </Button>
          </div>
        </div>

        <div className="bg-white ring-1 ring-black/5 rounded-2xl overflow-hidden">
          <div className="px-5 py-3 border-b border-border bg-stone-50/60 flex items-center justify-between">
            <p className="text-[10px] font-[JetBrains_Mono] uppercase tracking-widest text-muted-foreground">Inbox preview</p>
            <span className="text-[10px] text-muted-foreground">{template.name}</span>
          </div>
          <div className="p-6 bg-stone-50/40">
            <div className="bg-white rounded-lg ring-1 ring-black/5 overflow-hidden">
              <div className="px-5 py-3 border-b border-border">
                <p className="text-xs text-muted-foreground">From: Alex Rivera &lt;alex@signvel.com&gt;</p>
                <p className="text-xs text-muted-foreground">
                  Subject: <span className="text-foreground">Signature preview from Sign Vel</span>
                </p>
              </div>
              <div className="px-6 py-5 text-sm text-neutral-700">
                <p>Hi there,</p>
                <p className="mt-2">Here’s a preview of how the signature looks at the end of a real message.</p>
                <p className="mt-2">Best,<br />Alex</p>
              </div>
              <div className="border-t border-border">
                <div style={{ transform: "scale(0.92)", transformOrigin: "top left", width: "108%" }}>
                  {renderSignature(template, defaultData)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
