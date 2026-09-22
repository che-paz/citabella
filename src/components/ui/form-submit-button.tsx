"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type FormSubmitButtonProps = Omit<ButtonProps, "type" | "children"> & {
  idleLabel: string;
  pendingLabel?: string;
  successLabel?: string;
  /** Show success copy and keep button disabled (e.g. while dialog closes). */
  success?: boolean;
};

/**
 * Submit control for server-action forms: disables while pending, shows status text.
 * Must render inside the <form> that owns the action (useFormStatus).
 */
export function FormSubmitButton({
  idleLabel,
  pendingLabel = "Guardando…",
  successLabel = "Listo",
  success = false,
  disabled,
  className,
  ...props
}: FormSubmitButtonProps) {
  const { pending } = useFormStatus();
  const busy = pending || success;

  return (
    <Button
      type="submit"
      disabled={disabled || busy}
      aria-busy={busy}
      className={cn(className)}
      {...props}
    >
      {busy && !success ? (
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
      ) : null}
      {success ? successLabel : pending ? pendingLabel : idleLabel}
    </Button>
  );
}

type ActionFeedback = {
  error?: string;
  success?: boolean;
};

/**
 * Instant lock on first submit click (covers the gap before useFormStatus pending).
 * Unlocks on error so the user can retry.
 * By default stays locked on success (dialogs that close). Pass unlockOnSuccess for multi-submit forms.
 */
export function useSubmitGate(
  state: ActionFeedback,
  options?: { unlockOnSuccess?: boolean }
) {
  const [locked, setLocked] = useState(false);
  const unlockOnSuccess = options?.unlockOnSuccess ?? false;

  useEffect(() => {
    if (state.error) setLocked(false);
  }, [state.error]);

  useEffect(() => {
    if (!state.success) return;
    setLocked(true);
    if (!unlockOnSuccess) return;
    const t = window.setTimeout(() => setLocked(false), 900);
    return () => window.clearTimeout(t);
  }, [state.success, unlockOnSuccess]);

  return {
    locked,
    reset: () => setLocked(false),
    formProps: {
      onSubmit: (event: FormEvent<HTMLFormElement>) => {
        if (locked) {
          event.preventDefault();
          return;
        }
        setLocked(true);
      },
    },
  };
}
