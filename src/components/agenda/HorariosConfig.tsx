"use client";

import { useState } from "react";
import { useFormState } from "react-dom";
import { useRouter } from "next/navigation";
import { CheckCircle2, Trash2 } from "lucide-react";
import {
  createExcepcionAction,
  deleteExcepcionAction,
  saveHorariosAction,
  type AgendaActionState,
} from "@/lib/agenda/actions";
import { DIA_SEMANA_LABELS, type ExcepcionHorario, type HorarioSalon, type PausaDiaria } from "@/types/database";
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

type HorarioRow = {
  dia_semana: number;
  hora_inicio: string;
  hora_fin: string;
  activo: boolean;
};

type HorariosConfigProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  horarios: HorarioSalon[];
  excepciones: ExcepcionHorario[];
  pausaDiaria: PausaDiaria;
};

const initialState: AgendaActionState = {};

function SaveHorariosMessage({
  state,
}: {
  state: { error?: string; message?: string } | null;
}) {
  if (!state) return null;
  if (state.error) {
    return <p className="text-sm text-destructive">{state.error}</p>;
  }
  if (state.message) {
    return (
      <p
        className="flex items-start gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800"
        role="status"
      >
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
        <span>{state.message}</span>
      </p>
    );
  }
  return null;
}

function buildInitialRows(horarios: HorarioSalon[]): HorarioRow[] {
  return DIA_SEMANA_LABELS.map((_, dia) => {
    const existing = horarios.find((h) => h.dia_semana === dia);
    return {
      dia_semana: dia,
      hora_inicio: existing?.hora_inicio.slice(0, 5) ?? "09:00",
      hora_fin: existing?.hora_fin.slice(0, 5) ?? "18:00",
      activo: Boolean(existing),
    };
  });
}

export function HorariosConfig({
  open,
  onOpenChange,
  horarios,
  excepciones,
  pausaDiaria,
}: HorariosConfigProps) {
  const router = useRouter();
  const [rows, setRows] = useState<HorarioRow[]>(() => buildInitialRows(horarios));
  const [pausaActiva, setPausaActiva] = useState(pausaDiaria.activa);
  const [pausaInicio, setPausaInicio] = useState(
    pausaDiaria.hora_inicio?.slice(0, 5) ?? "12:00"
  );
  const [pausaFin, setPausaFin] = useState(
    pausaDiaria.hora_fin?.slice(0, 5) ?? "13:00"
  );
  const [savingHorarios, setSavingHorarios] = useState(false);
  const [horarioSaveState, setHorarioSaveState] = useState<AgendaActionState | null>(
    null
  );
  const [excepcionState, createExcepcion] = useFormState(
    createExcepcionAction,
    initialState
  );
  const [excepcionTipo, setExcepcionTipo] = useState<"cerrado" | "especial">("cerrado");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function updateRow(dia: number, patch: Partial<HorarioRow>) {
    setRows((prev) =>
      prev.map((r) => (r.dia_semana === dia ? { ...r, ...patch } : r))
    );
  }

  async function handleSaveHorarios() {
    setSavingHorarios(true);
    setHorarioSaveState(null);

    const formData = new FormData();
    formData.set("horarios", JSON.stringify(rows));
    formData.set(
      "pausa",
      JSON.stringify({
        activa: pausaActiva,
        hora_inicio: pausaActiva ? pausaInicio : undefined,
        hora_fin: pausaActiva ? pausaFin : undefined,
      })
    );

    const result = await saveHorariosAction({}, formData);
    setSavingHorarios(false);
    setHorarioSaveState(result);

    if (result.success) {
      router.refresh();
    }
  }

  async function handleDeleteExcepcion(id: string) {
    setDeletingId(id);
    await deleteExcepcionAction(id);
    setDeletingId(null);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Horarios del salón</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <section className="space-y-3">
            <h3 className="text-sm font-medium">Días de atención</h3>
            {rows.map((row) => (
              <div
                key={row.dia_semana}
                className="flex flex-wrap items-center gap-2 rounded-lg border p-3"
              >
                <label className="flex min-w-[7rem] items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={row.activo}
                    onChange={(e) =>
                      updateRow(row.dia_semana, { activo: e.target.checked })
                    }
                    className="h-4 w-4 rounded border"
                  />
                  {DIA_SEMANA_LABELS[row.dia_semana]}
                </label>
                {row.activo && (
                  <>
                    <Input
                      type="time"
                      value={row.hora_inicio}
                      onChange={(e) =>
                        updateRow(row.dia_semana, { hora_inicio: e.target.value })
                      }
                      className="w-[7rem]"
                    />
                    <span className="text-muted-foreground">—</span>
                    <Input
                      type="time"
                      value={row.hora_fin}
                      onChange={(e) =>
                        updateRow(row.dia_semana, { hora_fin: e.target.value })
                      }
                      className="w-[7rem]"
                    />
                  </>
                )}
              </div>
            ))}
            <div className="space-y-3 rounded-lg border p-3">
              <label className="flex items-center gap-2 text-sm font-medium">
                <input
                  type="checkbox"
                  checked={pausaActiva}
                  onChange={(e) => setPausaActiva(e.target.checked)}
                  className="h-4 w-4 rounded border"
                />
                Pausa diaria (almuerzo)
              </label>
              {pausaActiva && (
                <div className="flex flex-wrap items-center gap-2 pl-6">
                  <Input
                    type="time"
                    value={pausaInicio}
                    onChange={(e) => setPausaInicio(e.target.value)}
                    className="w-[7rem]"
                    aria-label="Inicio pausa"
                  />
                  <span className="text-muted-foreground">—</span>
                  <Input
                    type="time"
                    value={pausaFin}
                    onChange={(e) => setPausaFin(e.target.value)}
                    className="w-[7rem]"
                    aria-label="Fin pausa"
                  />
                </div>
              )}
              <p className="text-xs text-muted-foreground pl-6">
                Bloquea reservas en ese rango todos los días que atiendes.
              </p>
            </div>
            <SaveHorariosMessage state={horarioSaveState} />
            <Button
              onClick={handleSaveHorarios}
              className="w-full sm:w-auto"
              disabled={savingHorarios}
            >
              {savingHorarios ? "Guardando…" : "Guardar horarios"}
            </Button>
          </section>

          <section className="space-y-3">
            <h3 className="text-sm font-medium">Excepciones (feriados / cierres)</h3>
            <form action={createExcepcion} className="space-y-3 rounded-lg border p-3">
              <div className="space-y-1">
                <Label htmlFor="fecha">Fecha</Label>
                <Input id="fecha" name="fecha" type="date" required />
              </div>
              <div className="space-y-1">
                <Label>Tipo</Label>
                <Select
                  value={excepcionTipo}
                  onValueChange={(v) =>
                    setExcepcionTipo(v as "cerrado" | "especial")
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cerrado">Día cerrado</SelectItem>
                    <SelectItem value="especial">Horario especial</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <input
                type="hidden"
                name="cerrado"
                value={excepcionTipo === "cerrado" ? "true" : "false"}
              />
              {excepcionTipo === "especial" && (
                <div className="flex items-center gap-2">
                  <Input name="hora_inicio" type="time" required />
                  <span className="text-muted-foreground">—</span>
                  <Input name="hora_fin" type="time" required />
                </div>
              )}
              {excepcionState.error && (
                <p className="text-sm text-destructive">{excepcionState.error}</p>
              )}
              <Button
                type="submit"
                variant="secondary"
                className="w-full sm:w-auto"
              >
                Agregar excepción
              </Button>
            </form>

            {excepciones.length > 0 && (
              <ul className="space-y-2">
                {excepciones.map((exc) => (
                  <li
                    key={exc.id}
                    className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm"
                  >
                    <span>
                      {exc.fecha} —{" "}
                      {exc.cerrado
                        ? "Cerrado"
                        : `${exc.hora_inicio?.slice(0, 5)} – ${exc.hora_fin?.slice(0, 5)}`}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteExcepcion(exc.id)}
                      disabled={deletingId === exc.id}
                      aria-label="Eliminar excepción"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}
