import { useEffect, useState } from "react";
import { FitPreview } from "@/components/signatures/FitPreview";
import { getTemplate, renderSignature } from "@/components/signatures/templates";
import { supabase } from "@/integrations/supabase/client";
import { defaultData, type SignatureData } from "@/lib/signature-store";

type Row = {
  id: string;
  name: string;
  template_id: string;
  status: string;
  updated_at: string;
  data: unknown;
};

function shortDate(v: string | null) {
  if (!v) return "—";
  return new Date(v).toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });
}

/** Read-only preview of every signature a customer has saved. Staff RLS allows this. */
export function CustomerSignatures({ userId }: { userId: string }) {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    setRows(null);
    setError(null);
    void supabase
      .from("signatures")
      .select("id, name, template_id, status, updated_at, data")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })
      .then(({ data, error: err }) => {
        if (!alive) return;
        if (err) setError(err.message);
        else setRows((data ?? []) as Row[]);
      });
    return () => {
      alive = false;
    };
  }, [userId]);

  if (error) return <p className="text-sm text-red-600">Couldn't load signatures: {error}</p>;
  if (!rows) return <p className="text-sm text-muted-foreground">Loading signatures…</p>;
  if (rows.length === 0)
    return <p className="text-sm text-muted-foreground">This customer hasn't created any signatures yet.</p>;

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {rows.map((row) => {
        const template = getTemplate(row.template_id) ?? getTemplate("left-line")!;
        const data: SignatureData = { ...defaultData, ...((row.data as SignatureData) ?? {}) };
        return (
          <div key={row.id} className="rounded-xl border border-border bg-white overflow-hidden">
            <div className="flex items-center justify-between gap-3 px-4 py-2.5 border-b border-border">
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{row.name}</p>
                <p className="text-[11px] text-muted-foreground">
                  {template.name} · updated {shortDate(row.updated_at)}
                </p>
              </div>
              <span className="text-[10px] uppercase tracking-[0.14em] font-medium px-2 py-1 rounded-full bg-secondary text-secondary-foreground shrink-0">
                {row.status}
              </span>
            </div>
            <div className="p-4 bg-[#fbfbfd]">
              <FitPreview max={0.8} shrinkWrap maxHeight={280}>
                <div style={{ width: "125%" }}>{renderSignature(template, data)}</div>
              </FitPreview>
            </div>
          </div>
        );
      })}
    </div>
  );
}
