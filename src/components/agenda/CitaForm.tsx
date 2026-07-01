"use client";

import { useEffect, useState, useTransition } from "react";
import { useFormState } from "react-dom";
import { useRouter } from "next/navigation";
import {
  createCitaAction,
  getAvailableSlotsAction,
  rescheduleCitaAction,
  type AgendaActionState,
} from "@/lib/agenda/actions";
import { formatAgendaTime, getSalonDateKey } from "@/lib/agenda/dates";
import { formatDuration } from "@/lib/utils/format";
import type {
  CitaConDetalle,
  Clienta,
  Paquete,
  Servicio,
  Usuario,
} from "@/types/database";
import { Button } from "@/components/ui/button";
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

type CitaFormProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientas: Clienta[];
  servicios: Servicio[];
  paquetes: Paquete[];
  colaboradoras: Usuario[];
  timezone: string;
  defaultDate: string;
  isAdmin: boolean;
  currentUserId: string;
  editingCita?: CitaConDetalle;
};

const initialState: AgendaActionState = {};

function buildInitialState(
  editingCita: CitaConDetalle | undefined,
  clientas: Clienta[],
  servicios: Servicio[],
  colaboradoras: Usuario[],
  defaultDate: string,
  isAdmin: boolean,
  currentUserId: string,
  timezone: string
) {
  if (editingCita) {
    const isServicio = Boolean(editingCita.servicio_id);
    return {
      tipo: isServicio ? ("servicio" as const) : ("paquete" as const),
      servicioId: editingCita.servicio_id ?? "",
      paqueteId: editingCita.paquete_id ?? "",
      clientaId: editingCita.clienta_id,
      colaboradoraId: editingCita.colaboradora_id ?? "",
      fecha: getSalonDateKey(new Date(editingCita.inicio), timezone),
      slotInicio: editingCita.inicio,
    };
  }

  return {
    tipo: "servicio" as const,
    servicioId: servicios[0]?.id ?? "",
    paqueteId: "",
    clientaId: clientas[0]?.id ?? "",
    colaboradoraId: isAdmin ? colaboradoras[0]?.id ?? "" : currentUserId,
    fecha: defaultDate,
    slotInicio: "",
  };
}

export function CitaForm({
  open,
  onOpenChange,
  clientas,
  servicios,
  paquetes,
  colaboradoras,
  timezone,
  defaultDate,
  isAdmin,
  currentUserId,
  editingCita,
}: CitaFormProps) {
  const router = useRouter();
  const isEditing = Boolean(editingCita);
  const action = isEditing ? rescheduleCitaAction : createCitaAction;
  const [state, formAction] = useFormState(action, initialState);

  const initial = buildInitialState(
    editingCita,
    clientas,
    servicios,
    colaboradoras,
    defaultDate,
    isAdmin,
    currentUserId,
    timezone
  );

  const [tipo, setTipo] = useState<"servicio" | "paquete">(initial.tipo);
  const [servicioId, setServicioId] = useState(initial.servicioId);
  const [paqueteId, setPaqueteId] = useState(initial.paqueteId);
  const [clientaId, setClientaId] = useState(initial.clientaId);
  const [colaboradoraId, setColaboradoraId] = useState(initial.colaboradoraId);
  const [fecha, setFecha] = useState(initial.fecha);
  const [slotInicio, setSlotInicio] = useState(initial.slotInicio);
  const [slots, setSlots] = useState<{ inicio: string; fin: string }[]>([]);
  const [loadingSlots, setLoadingSlots] = useTransition();

  const duracion =
    tipo === "servicio"
      ? servicios.find((s) => s.id === servicioId)?.duracion_minutos
      : paquetes.find((p) => p.id === paqueteId)?.duracion_minutos;

  const horaInicio = slotInicio
    ? formatAgendaTime(slotInicio, timezone)
    : "";

  useEffect(() => {
    if (!duracion || !fecha) {
      setSlots([]);
      setSlotInicio("");
      return;
    }

    setLoadingSlots(async () => {
      const result = await getAvailableSlotsAction({
        fecha,
        duracionMinutos: duracion,
        colaboradoraId: colaboradoraId || undefined,
        excludeCitaId: editingCita?.id,
      });
      setSlots(result.slots);
      setSlotInicio((current) => {
        if (result.slots.length === 0) return "";
        if (current && result.slots.some((s) => s.inicio === current)) {
          return current;
        }
        return result.slots[0].inicio;
      });
    });
  }, [
    duracion,
    fecha,
    colaboradoraId,
    editingCita?.id,
    setLoadingSlots,
  ]);

  useEffect(() => {
    if (state.success) {
      onOpenChange(false);
      router.refresh();
    }
  }, [state.success, onOpenChange, router]);

  const canSubmit = Boolean(clientaId && horaInicio && duracion);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Reagendar cita" : "Nueva cita"}</DialogTitle>
        </DialogHeader>

        {clientas.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No hay clientas registradas. Ejecuta el seed de agenda en Supabase.
          </p>
        ) : (
          <form action={formAction} className="space-y-4">
            {isEditing && (
              <input type="hidden" name="cita_id" value={editingCita?.id} />
            )}

            <div className="space-y-1">
              <Label>Clienta</Label>
              <Select
                value={clientaId || undefined}
                onValueChange={setClientaId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona clienta" />
                </SelectTrigger>
                <SelectContent>
                  {clientas.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <input type="hidden" name="clienta_id" value={clientaId} />
            </div>

            <div className="space-y-1">
              <Label>Tipo</Label>
              <Select
                value={tipo}
                onValueChange={(v) => setTipo(v as "servicio" | "paquete")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="servicio">Servicio</SelectItem>
                  <SelectItem value="paquete">Paquete</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {tipo === "servicio" ? (
              <div className="space-y-1">
                <Label>Servicio</Label>
                <Select
                  value={servicioId || undefined}
                  onValueChange={setServicioId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona servicio" />
                  </SelectTrigger>
                  <SelectContent>
                    {servicios.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.nombre} ({formatDuration(s.duracion_minutos)})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <input type="hidden" name="servicio_id" value={servicioId} />
              </div>
            ) : (
              <div className="space-y-1">
                <Label>Paquete</Label>
                <Select
                  value={paqueteId || undefined}
                  onValueChange={setPaqueteId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona paquete" />
                  </SelectTrigger>
                  <SelectContent>
                    {paquetes.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.nombre} ({formatDuration(p.duracion_minutos)})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <input type="hidden" name="paquete_id" value={paqueteId} />
              </div>
            )}

            {isAdmin && (
              <div className="space-y-1">
                <Label>Colaboradora</Label>
                <Select
                  value={colaboradoraId || undefined}
                  onValueChange={setColaboradoraId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona colaboradora" />
                  </SelectTrigger>
                  <SelectContent>
                    {colaboradoras.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <input
                  type="hidden"
                  name="colaboradora_id"
                  value={colaboradoraId}
                />
              </div>
            )}

            <div className="space-y-1">
              <Label htmlFor="fecha">Fecha</Label>
              <Input
                id="fecha"
                name="fecha"
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1">
              <Label>Horario disponible</Label>
              {loadingSlots ? (
                <p className="text-sm text-muted-foreground">Calculando slots…</p>
              ) : slots.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No hay horarios disponibles para esta fecha.
                </p>
              ) : slotInicio ? (
                <Select
                  value={slotInicio}
                  onValueChange={setSlotInicio}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona hora" />
                  </SelectTrigger>
                  <SelectContent>
                    {slots.map((slot) => (
                      <SelectItem key={slot.inicio} value={slot.inicio}>
                        {formatAgendaTime(slot.inicio, timezone)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : null}
              <input type="hidden" name="hora_inicio" value={horaInicio} />
            </div>

            <div className="space-y-1">
              <Label htmlFor="notas">Notas</Label>
              <Textarea
                id="notas"
                name="notas"
                defaultValue={editingCita?.notas ?? ""}
                rows={2}
              />
            </div>

            {!isEditing && (
              <input type="hidden" name="estado" value="confirmada" />
            )}

            {state.error && (
              <p className="text-sm text-destructive">{state.error}</p>
            )}

            <Button type="submit" disabled={!canSubmit} className="w-full">
              {isEditing ? "Reagendar" : "Crear cita"}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
