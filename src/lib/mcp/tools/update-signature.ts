import { defineTool } from "@lovable.dev/mcp-js";
import type { ToolContext } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "@/lib/mcp/supabase-for-user";

export default defineTool({
  name: "update_signature",
  title: "Update a signature",
  description: "Update an existing email signature's name, template, status, or design data. Only provided fields are changed.",
  inputSchema: {
    id: z.string().uuid().describe("The signature uuid."),
    name: z.string().min(1).max(120).optional().describe("New signature name."),
    template_id: z.string().min(1).optional().describe("New template id."),
    status: z.enum(["Draft", "Active"]).optional().describe("New status."),
    data: z.record(z.any()).optional().describe("Design data fields to merge into the existing signature."),
  },
  annotations: { readOnlyHint: false, idempotentHint: false, openWorldHint: false },
  handler: async ({ id, name, template_id, status, data }, ctx: ToolContext) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated." }], isError: true };
    }
    const update: Record<string, unknown> = {};
    if (name !== undefined) update.name = name;
    if (template_id !== undefined) update.template_id = template_id;
    if (status !== undefined) update.status = status;
    if (data !== undefined) {
      const { data: existing } = await supabaseForUser(ctx).from("signatures").select("data").eq("id", id).single();
      update.data = { ...(existing?.data ?? {}), ...data };
    }
    if (Object.keys(update).length === 0) {
      return { content: [{ type: "text", text: "No fields provided to update." }], isError: true };
    }
    const { data: row, error } = await supabaseForUser(ctx).from("signatures").update(update).eq("id", id).select().single();
    if (error) {
      return { content: [{ type: "text", text: error.message }], isError: true };
    }
    return {
      content: [{ type: "text", text: `Updated signature "${row.name}" (${row.id}).` }],
      structuredContent: row,
    };
  },
});
