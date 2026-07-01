"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarPlus,
  ChevronLeft,
  ChevronRight,
  Clock,
  Settings,
} from "lucide-react";
import { cancelCitaAction, updateCitaEstadoAction } from "@/lib/agenda/actions";
import {
  addDaysToDateKey,
  formatAgendaTime,
  formatDateKeyLabel,
  getSalonDateKey,
  getWeekDateKeys,
  getWeekStartDateKey,
} from "@/lib/agenda/dates";
import { CitaForm } from "@/components/agenda/CitaForm";
import { HorariosConfig } from "@/components/agenda/HorariosConfig";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  CITA_ESTADO_LABELS,
  type CitaConDetalle,
  type Clienta,
  type ExcepcionHorario,
  type HorarioSalon,
  type Paquete,
  type Servicio,
  type Usuario,
} from "@/types/database";
import { cn } from "@/lib/utils";

type ViewMode = "day" | "week";

type AgendaViewProps = {
  citas: CitaConDetalle[];
  clientas: Clienta[];
  servicios: Servicio[];
  paquetes: Paquete[];
  colaboradoras: Usuario[];
  horarios: HorarioSalon[];
  excepciones: ExcepcionHorario[];
  timezone: string;
  isAdmin: boolean;
  currentUserId: string;
  initialDate: string;
  initialView: ViewMode;
};

const estadoVariant: Record<
  string,
  "default" | "secondary" | "outline" | "destructive"
> = {
  confirmada: "default",
  pendiente: "secondary",
  pendiente_validacion: "secondary",
  cancelada: "outline",
  completada: "outline",
  no_show: "destructive",
};

export function AgendaView({
  citas,
  clientas,
  servicios,
  paquetes,
  colaboradoras,
  horarios,
  excepciones,
  timezone,
  isAdmin,
  currentUserId,
  initialDate,
  initialView,
}: AgendaViewProps) {
  const router = useRouter();
  const [view, setView] = useState<ViewMode>(initialView);
  const [dateKey, setDateKey] = useState(initialDate);
  const [citaFormOpen, setCitaFormOpen] = useState(false);
  const [horariosOpen, setHorariosOpen] = useState(false);
  const [editingCita, setEditingCita] = useState<CitaConDetalle | undefined>();
  const [actionError, setActionError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const weekStart = getWeekStartDateKey(dateKey);
  const weekDays = getWeekDateKeys(weekStart);
  const visibleDateKeys = view === "day" ? [dateKey] : weekDays;

  function navigate(delta: number) {
    const next =
      view === "day"
        ? addDaysToDateKey(dateKey, delta)
        : addDaysToDateKey(weekStart, delta * 7);
    setDateKey(next);
    router.push(`/agenda?date=${next}&view=${view}`);
  }

  function switchView(next: ViewMode) {
    setView(next);
    router.push(`/agenda?date=${dateKey}&view=${next}`);
  }

  function citasForDate(dayKey: string) {
    return citas
      .filter((c) => getSalonDateKey(new Date(c.inicio), timezone) === dayKey)
      .sort(
        (a, b) => new Date(a.inicio).getTime() - new Date(b.inicio).getTime()
      );
  }

  function openCreate() {
    setEditingCita(undefined);
    setCitaFormOpen(true);
  }

  function openEdit(cita: CitaConDetalle) {
    setEditingCita(cita);
    setCitaFormOpen(true);
  }

  function handleCitaFormOpenChange(open: boolean) {
    setCitaFormOpen(open);
    if (!open) setEditingCita(undefined);
  }

  function handleCancel(citaId: string) {
    setActionError(null);
    startTransition(async () => {
      const result = await cancelCitaAction(citaId);
      if (result.error) setActionError(result.error);
      else router.refresh();
    });
  }

  function handleEstado(citaId: string, estado: CitaConDetalle["estado"]) {
    setActionError(null);
    startTransition(async () => {
      const result = await updateCitaEstadoAction(citaId, estado);
      if (result.error) setActionError(result.error);
      else router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-1">
          <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => navigate(1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              const today = getSalonDateKey(new Date(), timezone);
              setDateKey(today);
              router.push(`/agenda?date=${today}&view=${view}`);
            }}
          >
            Hoy
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          <div className="flex rounded-lg border p-0.5">
            <Button
              variant={view === "day" ? "default" : "ghost"}
              size="sm"
              onClick={() => switchView("day")}
            >
              Día
            </Button>
            <Button
              variant={view === "week" ? "default" : "ghost"}
              size="sm"
              onClick={() => switchView("week")}
            >
              Semana
            </Button>
          </div>
          {isAdmin && (
            <Button variant="outline" size="sm" onClick={() => setHorariosOpen(true)}>
              <Settings className="mr-1 h-4 w-4" />
              Horarios
            </Button>
          )}
          <Button size="sm" onClick={openCreate}>
            <CalendarPlus className="mr-1 h-4 w-4" />
            Nueva cita
          </Button>
        </div>
      </div>

      <p className="text-sm font-medium text-muted-foreground">
        {view === "day"
          ? formatDateKeyLabel(dateKey, timezone)
          : `${formatDateKeyLabel(weekStart, timezone)} – ${formatDateKeyLabel(weekDays[6], timezone)}`}
      </p>

      {actionError && (
        <p className="text-sm text-destructive">{actionError}</p>
      )}

      <div
        className={cn(
          "grid gap-3",
          view === "week" && "md:grid-cols-7"
        )}
      >
        {visibleDateKeys.map((dayKey) => {
          const dayCitas = citasForDate(dayKey);
          const isToday = dayKey === getSalonDateKey(new Date(), timezone);

          return (
            <div key={dayKey} className="min-w-0 space-y-2">
              {view === "week" && (
                <div
                  className={cn(
                    "rounded-md px-2 py-1 text-center text-xs font-medium",
                    isToday ? "bg-primary text-primary-foreground" : "bg-muted"
                  )}
                >
                  {formatDateKeyLabel(dayKey, timezone)}
                </div>
              )}

              {dayCitas.length === 0 ? (
                <Card>
                  <CardContent className="py-6 text-center text-sm text-muted-foreground">
                    Sin citas
                  </CardContent>
                </Card>
              ) : (
                dayCitas.map((cita) => (
                  <Card key={cita.id} className="overflow-hidden">
                    <CardContent className="space-y-2 p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate font-medium">{cita.clienta.nombre}</p>
                          <p className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {formatAgendaTime(cita.inicio, timezone)} –{" "}
                            {formatAgendaTime(cita.fin, timezone)}
                          </p>
                        </div>
                        <Badge variant={estadoVariant[cita.estado] ?? "outline"}>
                          {CITA_ESTADO_LABELS[cita.estado]}
                        </Badge>
                      </div>

                      <p className="text-sm">
                        {cita.servicio?.nombre ?? cita.paquete?.nombre}
                      </p>

                      {cita.colaboradora && (
                        <p className="text-xs text-muted-foreground">
                          {cita.colaboradora.nombre}
                        </p>
                      )}

                      {!["cancelada", "completada", "no_show"].includes(
                        cita.estado
                      ) && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEdit(cita)}
                            disabled={isPending}
                          >
                            Reagendar
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCancel(cita.id)}
                            disabled={isPending}
                          >
                            Cancelar
                          </Button>
                          {cita.estado === "pendiente_validacion" && isAdmin && (
                            <Button variant="secondary" size="sm" asChild>
                              <Link href="/pagos">Validar pago</Link>
                            </Button>
                          )}
                          {cita.estado === "pendiente" && (
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() =>
                                handleEstado(cita.id, "confirmada")
                              }
                              disabled={isPending}
                            >
                              Confirmar
                            </Button>
                          )}
                          {cita.estado === "confirmada" && (
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() =>
                                handleEstado(cita.id, "completada")
                              }
                              disabled={isPending}
                            >
                              Completar
                            </Button>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          );
        })}
      </div>

      {citaFormOpen && (
        <CitaForm
          key={editingCita?.id ?? `new-${dateKey}`}
          open={citaFormOpen}
          onOpenChange={handleCitaFormOpenChange}
          clientas={clientas}
          servicios={servicios}
          paquetes={paquetes}
          colaboradoras={colaboradoras}
          timezone={timezone}
          defaultDate={dateKey}
          isAdmin={isAdmin}
          currentUserId={currentUserId}
          editingCita={editingCita}
        />
      )}

      {isAdmin && horariosOpen && (
        <HorariosConfig
          key="horarios"
          open={horariosOpen}
          onOpenChange={setHorariosOpen}
          horarios={horarios}
          excepciones={excepciones}
        />
      )}
    </div>
  );
}
