"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useFormState, useFormStatus } from "react-dom";
import {
  createServicioAction,
  updateServicioAction,
} from "@/lib/catalogo/actions";
import { SERVICE_CATEGORIES, type Servicio } from "@/types/database";
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
import { cn } from "@/lib/utils";

type ServicioFormProps = {
  servicio?: Servicio;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ServicioForm({ servicio, open, onOpenChange }: ServicioFormProps) {
  const router = useRouter();
  const isEdit = !!servicio;
  const action = isEdit ? updateServicioAction : createServicioAction;
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
          <DialogTitle>{isEdit ? "Editar servicio" : "Nuevo servicio"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Actualiza los datos del servicio."
              : "Agrega un servicio al catálogo de tu salón."}
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          {isEdit && <input type="hidden" name="id" value={servicio.id} />}

          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre</Label>
            <Input
              id="nombre"
              name="nombre"
              defaultValue={servicio?.nombre ?? ""}
              placeholder="Ej. Maquillaje social"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="categoria">Categoría</Label>
            <select
              id="categoria"
              name="categoria"
              defaultValue={servicio?.categoria ?? "maquillaje_social"}
              className={cn(
                "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm",
                "ring-offset-background focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              )}
              required
            >
              {SERVICE_CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="precio">Precio (Q)</Label>
              <Input
                id="precio"
                name="precio"
                type="number"
                step="0.01"
                min="0.01"
                defaultValue={servicio?.precio ?? ""}
                placeholder="150.00"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="duracion_minutos">Duración (min)</Label>
              <Input
                id="duracion_minutos"
                name="duracion_minutos"
                type="number"
                min="5"
                max="480"
                defaultValue={servicio?.duracion_minutos ?? ""}
                placeholder="60"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción (opcional)</Label>
            <Textarea
              id="descripcion"
              name="descripcion"
              defaultValue={servicio?.descripcion ?? ""}
              placeholder="Detalles del servicio..."
              rows={3}
            />
          </div>

          {state.error && (
            <p className="text-sm text-destructive" role="alert">
              {state.error}
            </p>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
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

function SubmitButton({ isEdit }: { isEdit: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Guardando..." : isEdit ? "Guardar cambios" : "Crear servicio"}
    </Button>
  );
}
