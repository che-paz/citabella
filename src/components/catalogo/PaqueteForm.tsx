"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useFormState, useFormStatus } from "react-dom";
import {
  createPaqueteAction,
  updatePaqueteAction,
} from "@/lib/catalogo/actions";
import { formatQuetzales, formatDuration } from "@/lib/utils/format";
import type { PaqueteConServicios, Servicio } from "@/types/database";
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

type PaqueteFormProps = {
  paquete?: PaqueteConServicios;
  serviciosActivos: Servicio[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
};


export function PaqueteForm({
  paquete,
  serviciosActivos,
  open,
  onOpenChange,
}: PaqueteFormProps) {
  const router = useRouter();
  const isEdit = !!paquete;
  const action = isEdit ? updatePaqueteAction : createPaqueteAction;
  const [state, formAction] = useFormState(action, {});

  const selectedIds = new Set(
    paquete?.servicios.map((s) => s.servicio_id) ?? []
  );

  const sumPrecio = serviciosActivos
    .filter((s) => selectedIds.has(s.id))
    .reduce((acc, s) => acc + s.precio, 0);

  const sumDuracion = serviciosActivos
    .filter((s) => selectedIds.has(s.id))
    .reduce((acc, s) => acc + s.duracion_minutos, 0);

  useEffect(() => {
    if (state.success) {
      router.refresh();
      onOpenChange(false);
    }
  }, [state.success, onOpenChange, router]);

  if (!open) return null;

  if (serviciosActivos.length === 0 && !isEdit) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nuevo paquete</DialogTitle>
            <DialogDescription>
              Necesitas al menos un servicio activo para crear un paquete.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar paquete" : "Nuevo paquete"}</DialogTitle>
          <DialogDescription>
            Selecciona los servicios incluidos y define precio y duración total.
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          {isEdit && <input type="hidden" name="id" value={paquete.id} />}

          <div className="space-y-2">
            <Label htmlFor="paquete-nombre">Nombre</Label>
            <Input
              id="paquete-nombre"
              name="nombre"
              defaultValue={paquete?.nombre ?? ""}
              placeholder="Ej. Paquete novia completo"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Servicios incluidos</Label>
            <div className="max-h-48 space-y-2 overflow-y-auto rounded-md border p-3">
              {serviciosActivos.map((servicio) => (
                <label
                  key={servicio.id}
                  className="flex cursor-pointer items-start gap-3 rounded-md p-2 hover:bg-muted/50"
                >
                  <input
                    type="checkbox"
                    name="servicio_ids"
                    value={servicio.id}
                    defaultChecked={selectedIds.has(servicio.id)}
                    className="mt-1 h-4 w-4 rounded border-input"
                  />
                  <span className="flex-1 text-sm">
                    <span className="font-medium">{servicio.nombre}</span>
                    <span className="mt-0.5 block text-muted-foreground">
                      {formatQuetzales(servicio.precio)} ·{" "}
                      {formatDuration(servicio.duracion_minutos)}
                    </span>
                  </span>
                </label>
              ))}
            </div>
            {isEdit && selectedIds.size > 0 && (
              <p className="text-xs text-muted-foreground">
                Suma de servicios seleccionados: {formatQuetzales(sumPrecio)} ·{" "}
                {formatDuration(sumDuracion)}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="paquete-precio">Precio final (Q)</Label>
              <Input
                id="paquete-precio"
                name="precio"
                type="number"
                step="0.01"
                min="0.01"
                defaultValue={paquete?.precio ?? ""}
                placeholder="500.00"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="paquete-duracion">Duración total (min)</Label>
              <Input
                id="paquete-duracion"
                name="duracion_minutos"
                type="number"
                min="5"
                max="960"
                defaultValue={paquete?.duracion_minutos ?? ""}
                placeholder="120"
                required
              />
            </div>
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
      {pending ? "Guardando..." : isEdit ? "Guardar cambios" : "Crear paquete"}
    </Button>
  );
}
