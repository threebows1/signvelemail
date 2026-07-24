import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { templates } from "@/components/signatures/templates";

export default defineTool({
  name: "list_templates",
  title: "List signature templates",
  description: "List all available email-signature templates with their category, layout, and accent color.",
  inputSchema: {
    category: z.enum(["Corporate", "Creative", "Minimal", "Bold", "Executive", "Custom"]).optional().describe("Filter by template category."),
    layout: z.enum(["single", "two-column", "vertical"]).optional().describe("Filter by layout type."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ category, layout }) => {
    const list = templates
      .filter((t) => (category ? t.category === category : true))
      .filter((t) => (layout ? t.layout === layout : true))
      .map((t) => ({
        id: t.id,
        name: t.name,
        category: t.category,
        layout: t.layout,
        accent: t.accent,
        description: t.description,
      }));
    return {
      content: [
        {
          type: "text",
          text: `Found ${list.length} template(s).`,
        },
      ],
      structuredContent: { templates: list },
    };
  },
});
