"use client";

import { useEffect, useState } from "react";
import { useFormState } from "react-dom";
import { useRouter } from "next/navigation";
import {
  createCitaAction,
  rescheduleCitaAction,
  type AgendaActionState,
} from "@/lib/agenda/actions";
import {
  formatAgendaTime,
  getSalonDateKey,
  maxBookingDateKey,
  todayDateKey,
} from "@/lib/agenda/dates";
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

function durationFromRange(inicioIso: string, finIso: string): number {
  const mins = Math.round(
    (new Date(finIso).getTime() - new Date(inicioIso).getTime()) / 60_000
  );
  return Math.max(5, mins);
}

function catalogDuration(
  tipo: "servicio" | "paquete",
  servicioId: string,
  paqueteId: string,
  servicios: Servicio[],
  paquetes: Paquete[]
): number {
  if (tipo === "servicio") {
    return servicios.find((s) => s.id === servicioId)?.duracion_minutos ?? 60;
  }
  return paquetes.find((p) => p.id === paqueteId)?.duracion_minutos ?? 60;
}

function buildInitialState(
  editingCita: CitaConDetalle | undefined,
  clientas: Clienta[],
  servicios: Servicio[],
  paquetes: Paquete[],
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
      horaInicio: formatAgendaTime(editingCita.inicio, timezone),
      duracionMinutos: durationFromRange(editingCita.inicio, editingCita.fin),
    };
  }

  const servicioId = servicios[0]?.id ?? "";
  return {
    tipo: "servicio" as const,
    servicioId,
    paqueteId: "",
    clientaId: clientas[0]?.id ?? "",
    colaboradoraId: isAdmin ? colaboradoras[0]?.id ?? "" : currentUserId,
    fecha: defaultDate,
    horaInicio: "09:00",
    duracionMinutos: catalogDuration(
      "servicio",
      servicioId,
      "",
      servicios,
      paquetes
    ),
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
    paquetes,
    colaboradoras,
    defaultDate,
    isAdmin,
    currentUserId,
    timezone
  );

  const minDate = todayDateKey(timezone);
  const maxDate = maxBookingDateKey(timezone, 3);

  const [tipo, setTipo] = useState<"servicio" | "paquete">(initial.tipo);
  const [servicioId, setServicioId] = useState(initial.servicioId);
  const [paqueteId, setPaqueteId] = useState(initial.paqueteId);
  const [clientaId, setClientaId] = useState(initial.clientaId);
  const [colaboradoraId, setColaboradoraId] = useState(initial.colaboradoraId);
  const [fecha, setFecha] = useState(initial.fecha);
  const [horaInicio, setHoraInicio] = useState(initial.horaInicio);
  const [duracionMinutos, setDuracionMinutos] = useState(initial.duracionMinutos);
  const [durationTouched, setDurationTouched] = useState(Boolean(editingCita));

  const catalogMins = catalogDuration(
    tipo,
    servicioId,
    paqueteId,
    servicios,
    paquetes
  );

  useEffect(() => {
    if (!durationTouched) {
      setDuracionMinutos(catalogMins);
    }
  }, [catalogMins, durationTouched]);

  useEffect(() => {
    if (state.success) {
      onOpenChange(false);
      router.refresh();
    }
  }, [state.success, onOpenChange, router]);

  const canSubmit = Boolean(
    clientaId &&
      horaInicio &&
      duracionMinutos >= 5 &&
      (tipo === "servicio" ? servicioId : paqueteId)
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar / reagendar cita" : "Nueva cita"}
          </DialogTitle>
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
                onValueChange={(v) => {
                  const next = v as "servicio" | "paquete";
                  setTipo(next);
                  setDurationTouched(false);
                }}
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
                  onValueChange={(id) => {
                    setServicioId(id);
                    setDurationTouched(false);
                  }}
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
                  onValueChange={(id) => {
                    setPaqueteId(id);
                    setDurationTouched(false);
                  }}
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
                min={minDate}
                max={maxDate}
                onChange={(e) => setFecha(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="hora_inicio">Hora de inicio</Label>
                <Input
                  id="hora_inicio"
                  name="hora_inicio"
                  type="time"
                  value={horaInicio}
                  onChange={(e) => setHoraInicio(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="duracion_minutos">Duración (min)</Label>
                <Input
                  id="duracion_minutos"
                  name="duracion_minutos"
                  type="number"
                  min={5}
                  max={480}
                  step={1}
                  value={duracionMinutos}
                  onChange={(e) => {
                    setDurationTouched(true);
                    setDuracionMinutos(Number(e.target.value) || 5);
                  }}
                  required
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Puedes poner cualquier hora (ej. 10:40) y acortar la duración para
              emergencias. No debe cruzarse con otra cita ni con la pausa.
              {duracionMinutos !== catalogMins && (
                <>
                  {" "}
                  Catálogo: {formatDuration(catalogMins)}; esta cita:{" "}
                  {formatDuration(duracionMinutos)}.
                </>
              )}
            </p>

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
              {isEditing ? "Guardar cambios" : "Crear cita"}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
