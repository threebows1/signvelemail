import { createFileRoute } from "@tanstack/react-router";
import { SignatureForm } from "@/components/signature-form/SignatureForm";

export const Route = createFileRoute("/app/signature-form")({
  head: () => ({
    meta: [
      { title: "Signature details form — Sign Vel" },
      { name: "description", content: "Fill in your profile, contact details, media and links to build an email signature." },
      { property: "og:title", content: "Signature details form — Sign Vel" },
      { property: "og:description", content: "Profile, contact, media and link fields for your email signature." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <div className="h-screen flex bg-[#F5F4FB]">
      <SignatureForm />
    </div>
  ),
});
