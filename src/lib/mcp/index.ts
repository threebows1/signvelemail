import { auth, defineMcp } from "@lovable.dev/mcp-js";

import listTemplatesTool from "./tools/list-templates";
import getTemplateTool from "./tools/get-template";
import listSignaturesTool from "./tools/list-signatures";
import getSignatureTool from "./tools/get-signature";
import createSignatureTool from "./tools/create-signature";
import updateSignatureTool from "./tools/update-signature";
import deleteSignatureTool from "./tools/delete-signature";

const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "signvel-mcp",
  title: "Sign Vel MCP",
  version: "0.1.0",
  instructions:
    "Tools for managing Sign Vel email signatures. Use list_templates to browse templates, then create_signature with a template_id and design data to build a signature. You can also list, update, or delete saved signatures for the signed-in user.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [
    listTemplatesTool,
    getTemplateTool,
    listSignaturesTool,
    getSignatureTool,
    createSignatureTool,
    updateSignatureTool,
    deleteSignatureTool,
  ],
});
