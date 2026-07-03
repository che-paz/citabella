"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useFormState, useFormStatus } from "react-dom";
import {
  createClientaAction,
  updateClientaAction,
} from "@/lib/clientas/actions";
import type { Clienta } from "@/types/database";
import { Button } from "@/components/ui/button";
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

function SubmitButton({ isEdit }: { isEdit: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Guardando…" : isEdit ? "Guardar cambios" : "Crear clienta"}
    </Button>
  );
}

export function ClientaForm({ clienta, open, onOpenChange }: ClientaFormProps) {
  const router = useRouter();
  const isEdit = !!clienta;
  const action = isEdit ? updateClientaAction : createClientaAction;
  const [state, formAction] = useFormState(action, {});

  useEffect(() => {
    if (state.success) {
      router.refresh();
      onOpenChange(false);
    }
  }, [state.success, onOpenChange, router]);

  if (!open) return null;

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
              : "Registra una nueva clienta en tu salón."}
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          {isEdit && <input type="hidden" name="id" value={clienta.id} />}

          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre</Label>
            <Input
              id="nombre"
              name="nombre"
              defaultValue={clienta?.nombre ?? ""}
              placeholder="Ej. María López"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="telefono">Teléfono / WhatsApp</Label>
            <Input
              id="telefono"
              name="telefono"
              type="tel"
              defaultValue={clienta?.telefono ?? ""}
              placeholder="55501234"
              inputMode="numeric"
              required
            />
            <p className="text-xs text-muted-foreground">
              8 dígitos de Guatemala (ej. 55501234).
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email (opcional)</Label>
            <Input
              id="email"
              name="email"
              type="email"
              defaultValue={clienta?.email ?? ""}
              placeholder="maria@ejemplo.com"
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
            />
          </div>

          {state.error && (
            <p className="text-sm text-destructive">{state.error}</p>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <SubmitButton isEdit={isEdit} />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
