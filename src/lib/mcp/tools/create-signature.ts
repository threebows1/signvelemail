import { defineTool } from "@lovable.dev/mcp-js";
import type { ToolContext } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "@/lib/mcp/supabase-for-user";
import { defaultData } from "@/lib/signature-store";

export default defineTool({
  name: "create_signature",
  title: "Create a signature",
  description: "Create a new email signature for the signed-in user. Provide the template id and design data; any missing fields use the default design.",
  inputSchema: {
    name: z.string().min(1).max(120).describe("Signature name."),
    template_id: z.string().min(1).describe("Template id from list_templates."),
    status: z.enum(["Draft", "Active"]).default("Draft").describe("Initial status."),
    data: z.record(z.any()).optional().describe("Partial signature design data (colors, contact info, social links, etc.)."),
  },
  annotations: { readOnlyHint: false, idempotentHint: false, openWorldHint: false },
  handler: async ({ name, template_id, status, data }, ctx: ToolContext) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated." }], isError: true };
    }
    const payload = {
      name,
      template_id,
      status,
      data: { ...defaultData, ...(data ?? {}) },
    };
    const { data: row, error } = await supabaseForUser(ctx).from("signatures").insert(payload).select().single();
    if (error) {
      return { content: [{ type: "text", text: error.message }], isError: true };
    }
    return {
      content: [{ type: "text", text: `Created signature "${row.name}" (${row.id}).` }],
      structuredContent: row,
    };
  },
});
