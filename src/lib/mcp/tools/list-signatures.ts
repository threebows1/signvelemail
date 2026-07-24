import { defineTool } from "@lovable.dev/mcp-js";
import type { ToolContext } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "@/lib/mcp/supabase-for-user";

export default defineTool({
  name: "list_signatures",
  title: "List saved signatures",
  description: "List all email signatures saved by the signed-in user.",
  inputSchema: {
    status: z.enum(["Draft", "Active"]).optional().describe("Filter by status."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ status }, ctx: ToolContext) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated." }], isError: true };
    }
    let query = supabaseForUser(ctx).from("signatures").select("id, name, template_id, status, created_at, updated_at");
    if (status) query = query.eq("status", status);
    const { data, error } = await query.order("updated_at", { ascending: false });
    if (error) {
      return { content: [{ type: "text", text: error.message }], isError: true };
    }
    return {
      content: [{ type: "text", text: `Found ${data?.length ?? 0} signature(s).` }],
      structuredContent: { signatures: data ?? [] },
    };
  },
});
