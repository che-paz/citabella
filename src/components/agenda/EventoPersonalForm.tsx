"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useFormState } from "react-dom";
import { saveEventoPersonalAction } from "@/lib/agenda/bloqueos";
import { formatAgendaTimeHHmm, getSalonDateKey } from "@/lib/agenda/dates";
import type { AgendaActionState } from "@/lib/agenda/actions";
import type { BloqueoAgenda, Usuario } from "@/types/database";
import {
  FormSubmitButton,
  useSubmitGate,
} from "@/components/ui/form-submit-button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type EventoPersonalFormProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  colaboradoras: Usuario[];
  timezone: string;
  defaultDate: string;
  isAdmin: boolean;
  editing?: BloqueoAgenda;
};

const initialState: AgendaActionState = {};
const SALON_WIDE = "salon";

export function EventoPersonalForm({
  open,
  onOpenChange,
  colaboradoras,
  timezone,
  defaultDate,
  isAdmin,
  editing,
}: EventoPersonalFormProps) {
  const router = useRouter();
  const [state, formAction] = useFormState(saveEventoPersonalAction, initialState);
  const { locked, formProps } = useSubmitGate(state);
  const [colaboradoraId, setColaboradoraId] = useState(
    editing?.colaboradora_id ?? SALON_WIDE
  );

  useEffect(() => {
    if (!state.success) return;
    const timer = window.setTimeout(() => {
      onOpenChange(false);
      router.refresh();
    }, 700);
    return () => window.clearTimeout(timer);
  }, [state.success, onOpenChange, router]);

  const fechaValue = editing
    ? getSalonDateKey(new Date(editing.inicio), timezone)
    : defaultDate;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {editing ? "Editar evento personal" : "Evento personal"}
          </DialogTitle>
        </DialogHeader>

        <form action={formAction} className="space-y-4" {...formProps}>
          {editing && <input type="hidden" name="id" value={editing.id} />}

          <div className="space-y-1">
            <Label htmlFor="evento-titulo">Título</Label>
            <Input
              id="evento-titulo"
              name="titulo"
              required
              maxLength={120}
              defaultValue={editing?.titulo ?? ""}
              placeholder="Reunión, dentista, trámite…"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="evento-fecha">Fecha</Label>
            <Input
              id="evento-fecha"
              name="fecha"
              type="date"
              required
              defaultValue={fechaValue}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="evento-inicio">Hora de inicio</Label>
              <Input
                id="evento-inicio"
                name="hora_inicio"
                type="time"
                required
                defaultValue={
                  editing
                    ? formatAgendaTimeHHmm(editing.inicio, timezone)
                    : "10:00"
                }
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="evento-fin">Hora de fin</Label>
              <Input
                id="evento-fin"
                name="hora_fin"
                type="time"
                required
                defaultValue={
                  editing ? formatAgendaTimeHHmm(editing.fin, timezone) : "11:00"
                }
              />
            </div>
          </div>

          {isAdmin ? (
            <div className="space-y-1">
              <Label>¿De quién es el evento?</Label>
              <Select value={colaboradoraId} onValueChange={setColaboradoraId}>
                <SelectTrigger>
                  <SelectValue placeholder="Todo el salón" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={SALON_WIDE}>Todo el salón</SelectItem>
                  {colaboradoras.map((persona) => (
                    <SelectItem key={persona.id} value={persona.id}>
                      {persona.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <input
                type="hidden"
                name="colaboradora_id"
                value={colaboradoraId === SALON_WIDE ? "" : colaboradoraId}
              />
            </div>
          ) : null}

          <div className="space-y-1">
            <Label htmlFor="evento-recordatorio">Recordarme</Label>
            <select
              id="evento-recordatorio"
              name="recordatorio_minutos"
              defaultValue={
                editing
                  ? editing.recordatorio_minutos == null
                    ? ""
                    : String(editing.recordatorio_minutos)
                  : "30"
              }
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="">Sin aviso</option>
              <option value="15">15 min antes</option>
              <option value="30">30 min antes</option>
              <option value="60">1 hora antes</option>
              <option value="1440">1 día antes</option>
            </select>
          </div>

          <div className="space-y-1">
            <Label htmlFor="evento-notas">Notas (opcional)</Label>
            <Textarea
              id="evento-notas"
              name="notas"
              rows={3}
              maxLength={2000}
              defaultValue={editing?.notas ?? ""}
              placeholder="Detalle que solo ve el salón"
            />
          </div>

          {state.error && (
            <p className="text-sm text-destructive">{state.error}</p>
          )}

          <FormSubmitButton
            className="w-full"
            idleLabel={editing ? "Guardar cambios" : "Guardar evento"}
            success={state.success}
            successLabel="Guardado"
            disabled={locked}
          />
        </form>
      </DialogContent>
    </Dialog>
  );
}
