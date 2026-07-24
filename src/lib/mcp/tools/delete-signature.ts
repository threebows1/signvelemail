import { defineTool } from "@lovable.dev/mcp-js";
import type { ToolContext } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "@/lib/mcp/supabase-for-user";

export default defineTool({
  name: "delete_signature",
  title: "Delete a signature",
  description: "Permanently delete a saved email signature by its id.",
  inputSchema: {
    id: z.string().uuid().describe("The signature uuid to delete."),
  },
  annotations: { readOnlyHint: false, idempotentHint: false, destructiveHint: true, openWorldHint: false },
  handler: async ({ id }, ctx: ToolContext) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated." }], isError: true };
    }
    const { error } = await supabaseForUser(ctx).from("signatures").delete().eq("id", id);
    if (error) {
      return { content: [{ type: "text", text: error.message }], isError: true };
    }
    return {
      content: [{ type: "text", text: `Deleted signature ${id}.` }],
    };
  },
});
