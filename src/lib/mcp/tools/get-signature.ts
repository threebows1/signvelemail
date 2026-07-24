import { defineTool } from "@lovable.dev/mcp-js";
import type { ToolContext } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "@/lib/mcp/supabase-for-user";

export default defineTool({
  name: "get_signature",
  title: "Get a saved signature",
  description: "Fetch a single saved signature, including its full design data, by its id.",
  inputSchema: {
    id: z.string().uuid().describe("The signature uuid."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ id }, ctx: ToolContext) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated." }], isError: true };
    }
    const { data, error } = await supabaseForUser(ctx).from("signatures").select("*").eq("id", id).single();
    if (error || !data) {
      return { content: [{ type: "text", text: error?.message ?? "Signature not found." }], isError: true };
    }
    return {
      content: [{ type: "text", text: `Signature: ${data.name}` }],
      structuredContent: data,
    };
  },
});
