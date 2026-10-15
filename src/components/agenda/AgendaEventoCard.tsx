"use client";

import { formatAgendaTime } from "@/lib/agenda/dates";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { BloqueoAgenda } from "@/types/database";
import { Bell } from "lucide-react";

type AgendaEventoCardProps = {
  evento: BloqueoAgenda;
  timezone: string;
  compact?: boolean;
  canEdit: boolean;
  isPending: boolean;
  onEdit: (evento: BloqueoAgenda) => void;
  onDelete: (eventoId: string) => void;
};

export function AgendaEventoCard({
  evento,
  timezone,
  compact = false,
  canEdit,
  isPending,
  onEdit,
  onDelete,
}: AgendaEventoCardProps) {
  const inicio = formatAgendaTime(evento.inicio, timezone);
  const fin = formatAgendaTime(evento.fin, timezone);
  const alcance = evento.colaboradora?.nombre ?? "Todo el salón";

  return (
    <Card className="overflow-hidden border-violet-300 bg-violet-50">
      <CardContent className={compact ? "space-y-2 p-2" : "space-y-3 p-3 sm:p-4"}>
        <div className="space-y-1">
          <p
            className={
              compact
                ? "flex items-center gap-1 text-sm font-medium leading-tight text-violet-950"
                : "flex items-center gap-1 font-medium leading-snug text-violet-950"
            }
            title={evento.titulo}
          >
            <span className="truncate">{evento.titulo}</span>
            {evento.recordatorio_minutos != null && (
              <Bell
                className="h-3.5 w-3.5 shrink-0"
                aria-label="Con recordatorio"
              />
            )}
          </p>
          <p className={compact ? "text-[11px] text-violet-800" : "text-xs text-violet-800"}>
            {inicio} – {fin}
          </p>
          <p className="truncate text-[11px] text-violet-700">{alcance}</p>
          {!compact && evento.notas && (
            <p className="text-xs text-violet-900/80">{evento.notas}</p>
          )}
        </div>

        {canEdit && (
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="border-violet-300 bg-white"
              disabled={isPending}
              onClick={() => onEdit(evento)}
            >
              Editar
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-violet-900"
              disabled={isPending}
              onClick={() => onDelete(evento.id)}
            >
              Borrar
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
