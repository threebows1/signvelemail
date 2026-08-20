import { createFileRoute, Outlet, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getSignature, type SavedSignature } from "@/lib/signature-store";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/app/editor/$id")({
  component: EditorWrapper,
});

function EditorWrapper() {
  const { id } = useParams({ from: "/app/editor/$id" });
  const [sig, setSig] = useState<SavedSignature | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSignature(id).then((s) => {
      if (s) setSig(s);
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-[#FDFCFB]">
        <Loader2 className="animate-spin text-[#F38121]" size={32} />
      </div>
    );
  }

  if (!sig) {
    return (
      <div className="h-full flex items-center justify-center bg-[#FDFCFB]">
        <p className="text-[#9E958F]">Signature not found</p>
      </div>
    );
  }

  return <Outlet />;
}
