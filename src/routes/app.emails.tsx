import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Clock, Send, AlertCircle, Mail, Users, Zap } from "lucide-react";
import { templates } from "@/components/signatures/templates";
import { defaultData } from "@/lib/signature-store";

export const Route = createFileRoute("/app/emails")({
  head: () => ({
    meta: [
      { title: "Emails — Sign Vel" },
      { name: "description", content: "Send test emails, deploy signatures across your team, and monitor rollout status." },
      { property: "og:title", content: "Sign Vel Emails" },
      { property: "og:description", content: "Test, deploy, and monitor email signatures across Gmail, Outlook, and Apple Mail." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: EmailsPage,
});

const rollouts = [
  { name: "Marketing team", target: "24 mailboxes", provider: "Google Workspace", status: "Live", updated: "2 min ago" },
  { name: "Sales — EMEA", target: "58 mailboxes", provider: "Microsoft 365", status: "Live", updated: "1 hour ago" },
  { name: "Support desk", target: "12 mailboxes", provider: "Google Workspace", status: "Pending", updated: "Queued" },
  { name: "Executive team", target: "6 mailboxes", provider: "Microsoft 365", status: "Failed", updated: "Retry available" },
];

const activity = [
  { who: "alex@signvel.com", event: "Test email delivered", time: "just now", tone: "ok" },
  { who: "sara@signvel.com", event: "Signature updated to 'SignVel Corporate'", time: "12 min ago", tone: "info" },
  { who: "team@signvel.com", event: "58 mailboxes synced with new template", time: "1 hr ago", tone: "ok" },
  { who: "ali@signvel.com", event: "Deploy failed — OAuth token expired", time: "3 hr ago", tone: "err" },
];

function EmailsPage() {
  const [selected, setSelected] = useState(templates[0].id);
  const [to, setTo] = useState("me@company.com");
  const [sent, setSent] = useState(false);
  const template = templates.find((t) => t.id === selected)!;

  return (
    <div className="p-8 md:p-12 max-w-7xl">
      <div className="flex items-start justify-between mb-10">
        <div>
          <span className="font-[JetBrains_Mono] text-[10px] uppercase tracking-[0.2em] text-primary font-medium block mb-2">
            (Delivery)
          </span>
          <h1 className="text-3xl font-[Inter_Tight] font-bold tracking-tight">Emails</h1>
          <p className="text-sm text-muted-foreground mt-2 max-w-xl">
            Send test emails, deploy signatures to your entire org, and watch delivery status in real time.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">
        <Stat icon={<Send className="size-4" />} label="Sent this month" value="4,218" tone="primary" />
        <Stat icon={<Users className="size-4" />} label="Active mailboxes" value="238" />
        <Stat icon={<Zap className="size-4" />} label="Deploys today" value="12" />
        <Stat icon={<AlertCircle className="size-4" />} label="Failures" value="1" tone="warn" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
        {/* Test send */}
        <div className="bg-white ring-1 ring-black/5 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-5">
            <Mail className="size-4 text-primary" />
            <h2 className="font-[Inter_Tight] font-bold tracking-tight">Send a test email</h2>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-[JetBrains_Mono] text-muted-foreground uppercase">Template</label>
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

            <div className="space-y-1.5">
              <label className="text-[10px] font-[JetBrains_Mono] text-muted-foreground uppercase">Send to</label>
              <input
                type="email"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="w-full bg-stone-50 border border-border px-3 py-2 text-sm rounded focus:outline-none focus:ring-1 focus:ring-primary/40"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-[JetBrains_Mono] text-muted-foreground uppercase">Subject</label>
              <input
                type="text"
                defaultValue="Signature preview from Sign Vel"
                className="w-full bg-stone-50 border border-border px-3 py-2 text-sm rounded focus:outline-none focus:ring-1 focus:ring-primary/40"
              />
            </div>

            <Button
              onClick={() => {
                setSent(true);
                setTimeout(() => setSent(false), 2500);
              }}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {sent ? "✓ Test email queued" : "Send test email"}
            </Button>
          </div>
        </div>

        {/* Preview */}
        <div className="bg-white ring-1 ring-black/5 rounded-2xl overflow-hidden">
          <div className="px-5 py-3 border-b border-border bg-stone-50/60 flex items-center justify-between">
            <p className="text-[10px] font-[JetBrains_Mono] uppercase tracking-widest text-muted-foreground">Inbox preview</p>
            <span className="text-[10px] text-muted-foreground">{template.name}</span>
          </div>
          <div className="p-6 bg-stone-50/40">
            <div className="bg-white rounded-lg ring-1 ring-black/5 overflow-hidden">
              <div className="px-5 py-3 border-b border-border">
                <p className="text-xs text-muted-foreground">From: Farrukh Shahzad &lt;farrukh@alriyady.ae&gt;</p>
                <p className="text-xs text-muted-foreground">Subject: <span className="text-foreground">Signature preview from Sign Vel</span></p>
              </div>
              <div className="px-6 py-5 text-sm text-neutral-700">
                <p>Hi there,</p>
                <p className="mt-2">Here's a preview of my new signature — let me know what you think.</p>
                <p className="mt-2">Best,<br />Farrukh</p>
              </div>
              <div className="border-t border-border">
                <div style={{ transform: "scale(0.92)", transformOrigin: "top left", width: "108%" }}>
                  {template.render(defaultData)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Rollouts */}
      <div className="bg-white ring-1 ring-black/5 rounded-2xl overflow-hidden mb-10">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <h2 className="font-[Inter_Tight] font-bold tracking-tight">Team rollouts</h2>
          <Button size="sm" variant="outline" className="text-xs h-8">New rollout →</Button>
        </div>
        <div className="divide-y divide-border">
          {rollouts.map((r) => (
            <div key={r.name} className="px-6 py-4 flex items-center justify-between hover:bg-secondary/30 transition-colors">
              <div className="flex items-center gap-4">
                <StatusIcon status={r.status} />
                <div>
                  <p className="font-medium text-sm">{r.name}</p>
                  <p className="text-[11px] text-muted-foreground">{r.target} · {r.provider}</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <span className="text-xs text-muted-foreground">{r.updated}</span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded font-[JetBrains_Mono] uppercase ${
                    r.status === "Live"
                      ? "bg-primary/10 text-primary"
                      : r.status === "Pending"
                      ? "bg-muted text-muted-foreground"
                      : "bg-red-50 text-red-600"
                  }`}
                >
                  {r.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Activity */}
      <div className="bg-white ring-1 ring-black/5 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="font-[Inter_Tight] font-bold tracking-tight">Recent activity</h2>
        </div>
        <div className="divide-y divide-border">
          {activity.map((a, i) => (
            <div key={i} className="px-6 py-3.5 flex items-center gap-4 text-sm">
              <span
                className={`size-2 rounded-full ${
                  a.tone === "ok" ? "bg-primary" : a.tone === "err" ? "bg-red-500" : "bg-neutral-300"
                }`}
              />
              <span className="font-[JetBrains_Mono] text-[11px] text-muted-foreground w-56 truncate">{a.who}</span>
              <span className="flex-1">{a.event}</span>
              <span className="text-xs text-muted-foreground">{a.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Stat({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: string; tone?: "primary" | "warn" }) {
  return (
    <div className="bg-white ring-1 ring-black/5 p-5 rounded-xl">
      <div className={`flex items-center gap-2 mb-3 ${tone === "primary" ? "text-primary" : tone === "warn" ? "text-red-500" : "text-muted-foreground"}`}>
        {icon}
        <p className="text-[10px] font-[JetBrains_Mono] uppercase tracking-widest">{label}</p>
      </div>
      <p className="text-2xl font-[Inter_Tight] font-bold tracking-tight">{value}</p>
    </div>
  );
}

function StatusIcon({ status }: { status: string }) {
  if (status === "Live") return <CheckCircle2 className="size-5 text-primary" />;
  if (status === "Pending") return <Clock className="size-5 text-muted-foreground" />;
  return <AlertCircle className="size-5 text-red-500" />;
}
