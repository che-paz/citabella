"use client";

import Link from "next/link";
import { Clock } from "lucide-react";
import { formatAgendaTime } from "@/lib/agenda/dates";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  CITA_ESTADO_LABELS,
  PAGO_METODO_LABELS,
  type CitaConDetalle,
} from "@/types/database";
import { getCitaAsistenteNombre, getCitaContactoLabel } from "@/lib/citas/display";
import { cn } from "@/lib/utils";

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

type AgendaCitaCardProps = {
  cita: CitaConDetalle;
  timezone: string;
  isAdmin: boolean;
  isPending: boolean;
  compact?: boolean;
  onEdit: (cita: CitaConDetalle) => void;
  onCancel: (citaId: string) => void;
  onEstado: (citaId: string, estado: CitaConDetalle["estado"]) => void;
  onReactivar: (citaId: string) => void;
};

export function AgendaCitaCard({
  cita,
  timezone,
  isAdmin,
  isPending,
  compact = false,
  onEdit,
  onCancel,
  onEstado,
  onReactivar,
}: AgendaCitaCardProps) {
  const isTerminal = ["cancelada", "completada", "no_show"].includes(
    cita.estado
  );
  const asistenteNombre = getCitaAsistenteNombre(cita);
  const contactoLabel = getCitaContactoLabel(cita);

  return (
    <Card className="overflow-hidden">
      <CardContent
        className={compact ? "space-y-2 p-2" : "space-y-3 p-3 sm:p-4"}
      >
        <div className="space-y-1.5">
          <p
            className={
              compact
                ? "truncate text-sm font-medium leading-tight"
                : "font-medium leading-snug"
            }
            title={asistenteNombre}
          >
            {asistenteNombre}
          </p>
          {contactoLabel && (
            <p
              className={
                compact
                  ? "truncate text-[11px] text-muted-foreground"
                  : "text-xs text-muted-foreground"
              }
            >
              {contactoLabel}
            </p>
          )}

          <Badge
            variant={estadoVariant[cita.estado] ?? "outline"}
            className={compact ? "w-fit text-[10px]" : "w-fit"}
          >
            {CITA_ESTADO_LABELS[cita.estado]}
          </Badge>

          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3 shrink-0" aria-hidden />
            <span className={compact ? "truncate" : undefined}>
              {formatAgendaTime(cita.inicio, timezone)} –{" "}
              {formatAgendaTime(cita.fin, timezone)}
            </span>
          </p>
        </div>

        <div className={compact ? "space-y-0.5 text-xs" : "space-y-1 text-sm"}>
          <p className={compact ? "line-clamp-2 leading-snug" : undefined}>
            {cita.servicio?.nombre ?? cita.paquete?.nombre}
          </p>
          {cita.colaboradora && (
            <p className="truncate text-xs text-muted-foreground">
              {cita.colaboradora.nombre}
            </p>
          )}
          {cita.pago && (
            <p className="truncate text-xs text-muted-foreground">
              {PAGO_METODO_LABELS[cita.pago.metodo]}
            </p>
          )}
        </div>

        {!isTerminal && (
          <div
            className={cn(
              "grid grid-cols-1 gap-1.5 pt-0.5",
              !compact && "sm:grid-cols-2"
            )}
          >
            <Button
              variant="outline"
              size="sm"
              className={
                compact
                  ? "h-8 w-full px-2 text-xs"
                  : "w-full"
              }
              onClick={() => onEdit(cita)}
              disabled={isPending}
            >
              Reagendar / editar
            </Button>
            <Button
              variant="outline"
              size="sm"
              className={
                compact
                  ? "h-8 w-full px-2 text-xs"
                  : "w-full"
              }
              onClick={() => onCancel(cita.id)}
              disabled={isPending}
            >
              Cancelar
            </Button>
            {cita.estado === "pendiente_validacion" && isAdmin && (
              <Button
                variant="secondary"
                size="sm"
                className={cn(
                  compact ? "h-8 w-full px-2 text-xs" : "w-full sm:col-span-2"
                )}
                asChild
              >
                <Link href="/pagos">{compact ? "Validar" : "Validar pago"}</Link>
              </Button>
            )}
            {cita.estado === "pendiente" && (
              <Button
                variant="secondary"
                size="sm"
                className={cn(
                  compact ? "h-8 w-full px-2 text-xs" : "w-full sm:col-span-2"
                )}
                onClick={() => onEstado(cita.id, "confirmada")}
                disabled={isPending}
              >
                Confirmar
              </Button>
            )}
            {cita.estado === "confirmada" && (
              <Button
                variant="secondary"
                size="sm"
                className={cn(
                  compact ? "h-8 w-full px-2 text-xs" : "w-full sm:col-span-2"
                )}
                title="Completar y cobrar"
                onClick={() => onEstado(cita.id, "completada")}
                disabled={isPending}
              >
                {compact ? "Completar" : "Completar y cobrar"}
              </Button>
            )}
          </div>
        )}

        {(cita.estado === "completada" || cita.estado === "cancelada") &&
          isAdmin && (
            <Button
              variant="outline"
              size="sm"
              className={compact ? "h-8 w-full px-2 text-xs" : "w-full"}
              onClick={() => onReactivar(cita.id)}
              disabled={isPending}
            >
              Reactivar
            </Button>
          )}
      </CardContent>
    </Card>
  );
}
