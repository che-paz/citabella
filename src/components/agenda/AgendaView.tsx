"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarClock,
  CalendarPlus,
  ChevronLeft,
  ChevronRight,
  Settings,
} from "lucide-react";
import {
  cancelCitaAction,
  fetchAgendaCitasAction,
  reactivarCitaAction,
  updateCitaEstadoAction,
} from "@/lib/agenda/actions";
import { deleteEventoPersonalAction } from "@/lib/agenda/bloqueos";
import {
  addDaysToDateKey,
  addMonthsToDateKey,
  formatDateKeyLabel,
  formatMonthYearLabel,
  getMonthGridDateKeys,
  getMonthStartDateKey,
  getSalonDateKey,
  getWeekDateKeys,
  getWeekStartDateKey,
} from "@/lib/agenda/dates";
import { listFullDateKeys } from "@/lib/availability/engine";
import { CitaForm } from "@/components/agenda/CitaForm";
import { AgendaCitaCard } from "@/components/agenda/AgendaCitaCard";
import { AgendaEventoCard } from "@/components/agenda/AgendaEventoCard";
import { EventoPersonalForm } from "@/components/agenda/EventoPersonalForm";
import { HorariosConfig } from "@/components/agenda/HorariosConfig";
import {
  buildMonthSummariesFromCitas,
  MonthCalendar,
  type MonthDaySummary,
} from "@/components/ui/month-calendar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MobileActionBar } from "@/components/ui/mobile-action-bar";
import {
  type BloqueoAgenda,
  type CitaConDetalle,
  type Clienta,
  type ExcepcionHorario,
  type HorarioSalon,
  type PausaDiaria,
  type Paquete,
  type Servicio,
  type Usuario,
} from "@/types/database";
import { cn } from "@/lib/utils";

type ViewMode = "day" | "week" | "month";

type AgendaViewProps = {
  citas: CitaConDetalle[];
  bloqueos: BloqueoAgenda[];
  bloqueosError?: boolean;
  clientas: Clienta[];
  servicios: Servicio[];
  paquetes: Paquete[];
  colaboradoras: Usuario[];
  horarios: HorarioSalon[];
  excepciones: ExcepcionHorario[];
  pausaDiaria: PausaDiaria;
  slotStepMinutes: number;
  timezone: string;
  isAdmin: boolean;
  currentUserId: string;
  initialDate: string;
  initialView: ViewMode;
};

export function AgendaView({
  citas: initialCitas,
  bloqueos: initialBloqueos,
  bloqueosError = false,
  clientas,
  servicios,
  paquetes,
  colaboradoras,
  horarios,
  excepciones,
  pausaDiaria,
  slotStepMinutes,
  timezone,
  isAdmin,
  currentUserId,
  initialDate,
  initialView,
}: AgendaViewProps) {
  const router = useRouter();
  const [view, setView] = useState<ViewMode>(initialView);
  const [dateKey, setDateKey] = useState(initialDate);
  const [citas, setCitas] = useState(initialCitas);
  const [bloqueos, setBloqueos] = useState(initialBloqueos);
  const [citaFormOpen, setCitaFormOpen] = useState(false);
  const [eventoFormOpen, setEventoFormOpen] = useState(false);
  const [horariosOpen, setHorariosOpen] = useState(false);
  const [editingCita, setEditingCita] = useState<CitaConDetalle | undefined>();
  const [editingEvento, setEditingEvento] = useState<BloqueoAgenda | undefined>();
  const [actionError, setActionError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [citasLoading, setCitasLoading] = useState(false);

  const weekStart = getWeekStartDateKey(dateKey);
  const weekDays = getWeekDateKeys(weekStart);
  const visibleDateKeys = view === "week" ? weekDays : [dateKey];

  const markedDates = useMemo(() => {
    const summaries = buildMonthSummariesFromCitas(citas, timezone);
    for (const evento of bloqueos) {
      const key = getSalonDateKey(new Date(evento.inicio), timezone);
      const existing = summaries.get(key) ?? { count: 0, labels: [] };
      const eventLabels = existing.eventLabels ?? [];
      if (!eventLabels.includes(evento.titulo)) eventLabels.push(evento.titulo);
      existing.eventLabels = eventLabels;
      summaries.set(key, existing);
    }

    if (view === "month") {
      const pausa =
        pausaDiaria.activa && pausaDiaria.hora_inicio && pausaDiaria.hora_fin
          ? {
              activa: true,
              hora_inicio: pausaDiaria.hora_inicio.slice(0, 5),
              hora_fin: pausaDiaria.hora_fin.slice(0, 5),
            }
          : null;
      const fullKeys = listFullDateKeys(
        getMonthGridDateKeys(getMonthStartDateKey(dateKey)),
        {
          timezone,
          duracionMinutos: slotStepMinutes,
          horarios,
          excepciones,
          pausaDiaria: pausa,
          citas: citas.map((cita) => ({
            id: cita.id,
            inicio: new Date(cita.inicio),
            fin: new Date(cita.fin),
            colaboradora_id: cita.colaboradora_id,
            estado: cita.estado,
          })),
          bloqueos: bloqueos.map((evento) => ({
            id: evento.id,
            inicio: new Date(evento.inicio),
            fin: new Date(evento.fin),
            colaboradora_id: evento.colaboradora_id,
          })),
          slotStepMinutes,
          now: new Date(),
        }
      );
      for (const key of fullKeys) {
        const existing: MonthDaySummary = summaries.get(key) ?? {
          count: 0,
          labels: [],
        };
        existing.full = true;
        summaries.set(key, existing);
      }
    }

    return summaries;
  }, [
    bloqueos,
    citas,
    dateKey,
    excepciones,
    horarios,
    pausaDiaria,
    slotStepMinutes,
    timezone,
    view,
  ]);

  function syncUrl(nextDate: string, nextView: ViewMode) {
    const url = `/agenda?date=${nextDate}&view=${nextView}`;
    window.history.replaceState(null, "", url);
  }

  function loadCitas(nextDate: string, nextView: ViewMode) {
    setCitasLoading(true);
    startTransition(async () => {
      const result = await fetchAgendaCitasAction({
        dateKey: nextDate,
        view: nextView,
      });
      setCitasLoading(false);
      if (result.error) {
        setActionError(result.error);
        return;
      }
      if (result.citas) setCitas(result.citas);
      if (result.bloqueos) setBloqueos(result.bloqueos);
    });
  }

  useEffect(() => {
    setCitas(initialCitas);
  }, [initialCitas]);

  useEffect(() => {
    setBloqueos(initialBloqueos);
  }, [initialBloqueos]);

  function navigate(delta: number) {
    const next =
      view === "day"
        ? addDaysToDateKey(dateKey, delta)
        : view === "week"
          ? addDaysToDateKey(weekStart, delta * 7)
          : addMonthsToDateKey(dateKey, delta);
    setDateKey(next);
    syncUrl(next, view);
    loadCitas(next, view);
  }

  function selectDate(next: string) {
    const monthChanged =
      view === "month" &&
      getMonthStartDateKey(next) !== getMonthStartDateKey(dateKey);
    setDateKey(next);
    syncUrl(next, view);
    if (monthChanged) {
      loadCitas(next, view);
    }
  }

  function switchView(next: ViewMode) {
    setView(next);
    syncUrl(dateKey, next);
    loadCitas(dateKey, next);
  }

  function goToToday() {
    const today = getSalonDateKey(new Date(), timezone);
    setDateKey(today);
    syncUrl(today, view);
    loadCitas(today, view);
  }

  function citasForDate(dayKey: string) {
    return citas
      .filter((c) => getSalonDateKey(new Date(c.inicio), timezone) === dayKey)
      .sort(
        (a, b) => new Date(a.inicio).getTime() - new Date(b.inicio).getTime()
      );
  }

  function itemsForDate(dayKey: string) {
    const citaItems = citasForDate(dayKey).map((cita) => ({
      kind: "cita" as const,
      inicio: cita.inicio,
      cita,
    }));
    const eventoItems = bloqueos
      .filter((evento) => getSalonDateKey(new Date(evento.inicio), timezone) === dayKey)
      .map((evento) => ({
        kind: "evento" as const,
        inicio: evento.inicio,
        evento,
      }));
    return [...citaItems, ...eventoItems].sort(
      (a, b) => new Date(a.inicio).getTime() - new Date(b.inicio).getTime()
    );
  }

  function openCreate() {
    setEditingCita(undefined);
    setCitaFormOpen(true);
  }

  function openEvento() {
    setEditingEvento(undefined);
    setEventoFormOpen(true);
  }

  function openEdit(cita: CitaConDetalle) {
    setEditingCita(cita);
    setCitaFormOpen(true);
  }

  function openEditEvento(evento: BloqueoAgenda) {
    setEditingEvento(evento);
    setEventoFormOpen(true);
  }

  function handleCitaFormOpenChange(open: boolean) {
    setCitaFormOpen(open);
    if (!open) setEditingCita(undefined);
  }

  function handleEventoFormOpenChange(open: boolean) {
    setEventoFormOpen(open);
    if (!open) setEditingEvento(undefined);
  }

  function handleDeleteEvento(eventoId: string) {
    if (!window.confirm("¿Borrar este evento personal?")) return;
    setActionError(null);
    startTransition(async () => {
      const result = await deleteEventoPersonalAction(eventoId);
      if (result.error) setActionError(result.error);
      else {
        router.refresh();
        loadCitas(dateKey, view);
      }
    });
  }

  function handleCancel(citaId: string) {
    setActionError(null);
    startTransition(async () => {
      const result = await cancelCitaAction(citaId);
      if (result.error) setActionError(result.error);
      else {
        router.refresh();
        loadCitas(dateKey, view);
      }
    });
  }

  function handleEstado(citaId: string, estado: CitaConDetalle["estado"]) {
    setActionError(null);
    startTransition(async () => {
      const result = await updateCitaEstadoAction(citaId, estado);
      if (result.error) setActionError(result.error);
      else {
        router.refresh();
        loadCitas(dateKey, view);
      }
    });
  }

  function handleReactivar(citaId: string) {
    setActionError(null);
    startTransition(async () => {
      const result = await reactivarCitaAction(citaId);
      if (result.error) setActionError(result.error);
      else {
        router.refresh();
        loadCitas(dateKey, view);
      }
    });
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1">
            {view !== "month" && (
              <>
                <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={() => navigate(1)}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </>
            )}
            <Button variant="ghost" size="sm" onClick={goToToday}>
              Hoy
            </Button>
          </div>
          <div className="flex rounded-lg border p-0.5">
            <Button
              variant={view === "day" ? "default" : "ghost"}
              size="sm"
              className="px-3"
              onClick={() => switchView("day")}
            >
              Día
            </Button>
            <Button
              variant={view === "week" ? "default" : "ghost"}
              size="sm"
              className="px-3"
              onClick={() => switchView("week")}
            >
              Semana
            </Button>
            <Button
              variant={view === "month" ? "default" : "ghost"}
              size="sm"
              className="px-3"
              onClick={() => switchView("month")}
            >
              Mes
            </Button>
          </div>
        </div>

        <MobileActionBar className="sm:justify-end">
          {isAdmin && (
            <Button
              variant="outline"
              className="w-full justify-center sm:w-auto"
              onClick={() => setHorariosOpen(true)}
            >
              <Settings className="mr-2 h-4 w-4" />
              Horarios
            </Button>
          )}
          <Button
            variant="outline"
            className="w-full justify-center sm:w-auto"
            onClick={openEvento}
          >
            <CalendarClock className="mr-2 h-4 w-4" />
            Evento personal
          </Button>
          <Button
            className="w-full justify-center sm:w-auto"
            onClick={openCreate}
          >
            <CalendarPlus className="mr-2 h-4 w-4" />
            Nueva cita
          </Button>
        </MobileActionBar>
      </div>

      <p className="text-sm font-medium text-muted-foreground">
        {view === "day"
          ? formatDateKeyLabel(dateKey, timezone)
          : view === "week"
            ? `${formatDateKeyLabel(weekStart, timezone)} – ${formatDateKeyLabel(weekDays[6], timezone)}`
            : formatMonthYearLabel(dateKey, timezone)}
        {citasLoading && " · Cargando…"}
      </p>

      {view === "month" && (
        <MonthCalendar
          timezone={timezone}
          selectedDateKey={dateKey}
          onSelectDate={selectDate}
          daySummaries={markedDates}
        />
      )}

      {view === "month" && (
        <p className="text-sm font-medium capitalize">
          {formatDateKeyLabel(dateKey, timezone)}
        </p>
      )}

      {bloqueosError && (
        <p className="text-sm text-destructive">
          No se pudieron cargar los eventos personales.
        </p>
      )}

      {actionError && (
        <p className="text-sm text-destructive">{actionError}</p>
      )}

      <div
        className={cn(
          "gap-3",
          view === "week"
            ? "flex overflow-x-auto pb-2 lg:grid lg:grid-cols-7 lg:overflow-visible"
            : "grid"
        )}
      >
        {visibleDateKeys.map((dayKey) => {
          const dayItems = itemsForDate(dayKey);
          const isToday = dayKey === getSalonDateKey(new Date(), timezone);

          return (
            <div
              key={dayKey}
              className={cn(
                "min-w-0 space-y-2",
                view === "week" && "w-[11.5rem] shrink-0 lg:w-auto"
              )}
            >
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

              {dayItems.length === 0 ? (
                <Card>
                  <CardContent className="py-6 text-center text-sm text-muted-foreground">
                    Sin citas
                  </CardContent>
                </Card>
              ) : (
                dayItems.map((item) =>
                  item.kind === "cita" ? (
                    <AgendaCitaCard
                      key={item.cita.id}
                      cita={item.cita}
                      timezone={timezone}
                      isAdmin={isAdmin}
                      isPending={isPending}
                      compact={view === "week"}
                      onEdit={openEdit}
                      onCancel={handleCancel}
                      onEstado={handleEstado}
                      onReactivar={handleReactivar}
                    />
                  ) : (
                    <AgendaEventoCard
                      key={item.evento.id}
                      evento={item.evento}
                      timezone={timezone}
                      compact={view === "week"}
                      canEdit={
                        isAdmin || item.evento.colaboradora_id === currentUserId
                      }
                      isPending={isPending}
                      onEdit={openEditEvento}
                      onDelete={handleDeleteEvento}
                    />
                  )
                )
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

      {eventoFormOpen && (
        <EventoPersonalForm
          key={editingEvento?.id ?? `evento-${dateKey}`}
          open={eventoFormOpen}
          onOpenChange={handleEventoFormOpenChange}
          colaboradoras={colaboradoras}
          timezone={timezone}
          defaultDate={dateKey}
          isAdmin={isAdmin}
          editing={editingEvento}
        />
      )}

      {isAdmin && horariosOpen && (
        <HorariosConfig
          key="horarios"
          open={horariosOpen}
          onOpenChange={setHorariosOpen}
          horarios={horarios}
          excepciones={excepciones}
          pausaDiaria={pausaDiaria}
        />
      )}
    </div>
  );
}
