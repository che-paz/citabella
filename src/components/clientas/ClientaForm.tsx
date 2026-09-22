"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useFormState } from "react-dom";
import { CheckCircle2 } from "lucide-react";
import { saveClientaAction } from "@/lib/clientas/actions";
import { PHONE_INPUT_HINT, PHONE_INPUT_PLACEHOLDER } from "@/lib/utils/phone";
import type { Clienta } from "@/types/database";
import { Button } from "@/components/ui/button";
import {
  FormSubmitButton,
  useSubmitGate,
} from "@/components/ui/form-submit-button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type ClientaFormProps = {
  clienta?: Clienta;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ClientaForm({ clienta, open, onOpenChange }: ClientaFormProps) {
  const router = useRouter();
  const isEdit = !!clienta;
  const [state, formAction] = useFormState(saveClientaAction, {});
  const { locked, formProps } = useSubmitGate(state);

  useEffect(() => {
    if (!state.success) return;
    const t = window.setTimeout(() => {
      router.refresh();
      onOpenChange(false);
    }, 700);
    return () => window.clearTimeout(t);
  }, [state.success, onOpenChange, router]);

  if (!open) return null;

  const busy = locked || Boolean(state.success);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Editar clienta" : "Nueva clienta"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Actualiza los datos de contacto."
              : "Registra una nueva clienta. Puedes repetir el mismo WhatsApp (ej. mamá e hijos)."}
          </DialogDescription>
        </DialogHeader>

        <form
          action={formAction}
          className="space-y-4"
          key={clienta?.id ?? "new"}
          {...formProps}
        >
          {isEdit && <input type="hidden" name="id" value={clienta.id} />}

          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre</Label>
            <Input
              id="nombre"
              name="nombre"
              defaultValue={clienta?.nombre ?? ""}
              placeholder="Ej. María López"
              required
              disabled={busy}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="telefono">Teléfono / WhatsApp</Label>
            <Input
              id="telefono"
              name="telefono"
              type="tel"
              defaultValue={clienta?.telefono ?? ""}
              placeholder={PHONE_INPUT_PLACEHOLDER}
              inputMode="numeric"
              required
              disabled={busy}
            />
            <p className="text-xs text-muted-foreground">{PHONE_INPUT_HINT}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email (opcional)</Label>
            <Input
              id="email"
              name="email"
              type="email"
              defaultValue={clienta?.email ?? ""}
              placeholder="maria@ejemplo.com"
              disabled={busy}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notas">Notas (opcional)</Label>
            <Textarea
              id="notas"
              name="notas"
              defaultValue={clienta?.notas ?? ""}
              placeholder="Preferencias, alergias, etc."
              rows={3}
              disabled={busy}
            />
          </div>

          {state.error && (
            <p className="text-sm text-destructive">{state.error}</p>
          )}
          {state.success && (
            <p
              className="flex items-center gap-2 text-sm text-green-700"
              role="status"
            >
              <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden />
              {isEdit ? "Clienta actualizada" : "Clienta guardada"}
            </p>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={busy && !state.error}
            >
              Cancelar
            </Button>
            <FormSubmitButton
              idleLabel={isEdit ? "Guardar cambios" : "Crear clienta"}
              pendingLabel="Guardando…"
              successLabel="Listo"
              success={Boolean(state.success)}
            />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
