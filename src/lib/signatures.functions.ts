import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { defaultData, type SavedSignature, type SignatureData } from "@/lib/signature-store";

const signatureRowSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  template_id: z.string().min(1),
  status: z.enum(["Active", "Draft"]),
  data: z.record(z.any()).transform((v) => v as SignatureData),
});

function rowToSaved(row: any): SavedSignature {
  return {
    id: row.id,
    name: row.name,
    templateId: row.template_id,
    status: row.status,
    updatedAt: new Date(row.updated_at).getTime(),
    data: { ...defaultData, ...row.data } as SignatureData,
  };
}

export const listSignatures = createServerFn({ method: "GET" })
  .inputValidator(() => z.object({}).parse({}))
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("signatures")
      .select("id, name, template_id, status, data, updated_at")
      .eq("user_id", context.userId)
      .order("updated_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []).map(rowToSaved);
  });

export const getSignature = createServerFn({ method: "GET" })
  .inputValidator((data) => z.object({ id: z.string() }).parse(data))
  .middleware([requireSupabaseAuth])
  .handler(async ({ context, data }) => {
    const { data: rows, error } = await context.supabase
      .from("signatures")
      .select("id, name, template_id, status, data, updated_at")
      .eq("id", data.id)
      .eq("user_id", context.userId)
      .limit(1);
    if (error) throw new Error(error.message);
    if (!rows || rows.length === 0) return null;
    return rowToSaved(rows[0]);
  });

export const createSignature = createServerFn({ method: "POST" })
  .inputValidator((data) => signatureRowSchema.parse(data))
  .middleware([requireSupabaseAuth])
  .handler(async ({ context, data }) => {
    const { data: row, error } = await context.supabase
      .from("signatures")
      .insert({
        id: data.id,
        name: data.name,
        template_id: data.template_id,
        status: data.status,
        data: data.data,
        user_id: context.userId,
      })
      .select("id, name, template_id, status, data, updated_at")
      .single();
    if (error) throw new Error(error.message);
    return rowToSaved(row);
  });

export const updateSignature = createServerFn({ method: "POST" })
  .inputValidator((data) => signatureRowSchema.parse(data))
  .middleware([requireSupabaseAuth])
  .handler(async ({ context, data }) => {
    const { data: row, error } = await context.supabase
      .from("signatures")
      .update({
        name: data.name,
        template_id: data.template_id,
        status: data.status,
        data: data.data,
        updated_at: new Date().toISOString(),
      })
      .eq("id", data.id)
      .eq("user_id", context.userId)
      .select("id, name, template_id, status, data, updated_at")
      .single();
    if (error) throw new Error(error.message);
    return rowToSaved(row);
  });

export const deleteSignatureFn = createServerFn({ method: "POST" })
  .inputValidator((data) => z.object({ id: z.string() }).parse(data))
  .middleware([requireSupabaseAuth])
  .handler(async ({ context, data }) => {
    const { error } = await context.supabase
      .from("signatures")
      .delete()
      .eq("id", data.id)
      .eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return { success: true };
  });
