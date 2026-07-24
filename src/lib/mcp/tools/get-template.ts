import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { getTemplate } from "@/components/signatures/templates";

export default defineTool({
  name: "get_template",
  title: "Get signature template details",
  description: "Get details about a specific email-signature template by its id.",
  inputSchema: {
    id: z.string().min(1).describe("The template id (e.g. left-line, al-riyady)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ id }) => {
    const t = getTemplate(id);
    if (!t) {
      return {
        content: [{ type: "text", text: `Template "${id}" not found.` }],
        isError: true,
      };
    }
    return {
      content: [
        {
          type: "text",
          text: `Template: ${t.name} (${t.category}, ${t.layout} layout).`,
        },
      ],
      structuredContent: {
        id: t.id,
        name: t.name,
        category: t.category,
        layout: t.layout,
        accent: t.accent,
        description: t.description,
      },
    };
  },
});
