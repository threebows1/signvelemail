import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { setCustomerPassword, sendCustomerPasswordReset } from "@/lib/admin-password.functions";

/** Admin-only password controls for a customer account. */
export function SetPasswordButton({ userId, disabled }: { userId: string; disabled?: boolean }) {
  const setPassword = useServerFn(setCustomerPassword);
  const sendReset = useServerFn(sendCustomerPasswordReset);
  const [open, setOpen] = useState(false);
  const [password, setPasswordValue] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const { email } = await setPassword({ data: { userId, password } });
      toast.success(`Password updated${email ? ` for ${email}` : ""}`);
      setPasswordValue("");
      setOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update the password");
    } finally {
      setBusy(false);
    }
  }

  async function emailReset() {
    setBusy(true);
    try {
      const { email } = await sendReset({
        data: { userId, redirectTo: `${window.location.origin}/reset-password` },
      });
      toast.success(`Reset link sent to ${email}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not send the reset link");
    } finally {
      setBusy(false);
    }
  }

  if (!open) {
    return (
      <>
        <Button type="button" size="sm" variant="outline" disabled={disabled} onClick={() => setOpen(true)}>
          Set password
        </Button>
        <Button type="button" size="sm" variant="outline" disabled={disabled || busy} onClick={() => void emailReset()}>
          {busy ? "Sending…" : "Email reset link"}
        </Button>
      </>
    );
  }

  return (
    <form onSubmit={submit} className="flex w-full flex-wrap items-center gap-2">
      <input
        type="text"
        autoFocus
        required
        minLength={8}
        value={password}
        onChange={(e) => setPasswordValue(e.target.value)}
        placeholder="New password (min 8 characters)"
        className="min-w-[240px] flex-1 rounded border border-border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary/40"
      />
      <Button
        type="button"
        size="sm"
        variant="ghost"
        onClick={() => setPasswordValue(Math.random().toString(36).slice(2, 8) + Math.random().toString(36).slice(2, 6).toUpperCase())}
      >
        Generate
      </Button>
      <Button type="submit" size="sm" disabled={busy} className="bg-primary text-primary-foreground hover:bg-primary/90">
        {busy ? "Saving…" : "Save password"}
      </Button>
      <Button
        type="button"
        size="sm"
        variant="outline"
        disabled={busy}
        onClick={() => {
          setOpen(false);
          setPasswordValue("");
        }}
      >
        Cancel
      </Button>
    </form>
  );
}
