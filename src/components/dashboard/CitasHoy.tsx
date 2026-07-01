import Link from "next/link";
import { formatAgendaTime } from "@/lib/agenda/dates";
import {
  CITA_ESTADO_LABELS,
  type CitaConDetalle,
  type CitaEstado,
} from "@/types/database";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";

const ESTADO_VARIANT: Record<
  CitaEstado,
  "default" | "secondary" | "outline" | "destructive"
> = {
  pendiente: "outline",
  pendiente_validacion: "secondary",
  confirmada: "default",
  cancelada: "destructive",
  completada: "secondary",
  no_show: "destructive",
};

type CitasHoyProps = {
  citas: CitaConDetalle[];
  timezone: string;
  isAdmin: boolean;
};

export function CitasHoy({ citas, timezone, isAdmin }: CitasHoyProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Calendar className="h-4 w-4" />
            Citas de hoy
          </CardTitle>
          <Badge variant="secondary">{citas.length}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        {citas.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {isAdmin
              ? "No hay citas programadas para hoy."
              : "No tienes citas asignadas hoy."}
          </p>
        ) : (
          <ul className="divide-y">
            {citas.map((cita) => {
              const servicioNombre =
                cita.servicio?.nombre ?? cita.paquete?.nombre ?? "Servicio";

              return (
                <li key={cita.id} className="flex gap-3 py-3 first:pt-0 last:pb-0">
                  <div className="w-14 shrink-0 text-sm font-medium tabular-nums">
                    {formatAgendaTime(cita.inicio, timezone)}
                  </div>
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={`/clientas/${cita.clienta.id}`}
                        className="font-medium hover:underline"
                      >
                        {cita.clienta.nombre}
                      </Link>
                      <Badge variant={ESTADO_VARIANT[cita.estado]}>
                        {CITA_ESTADO_LABELS[cita.estado]}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {servicioNombre}
                      {isAdmin && cita.colaboradora && (
                        <> · {cita.colaboradora.nombre}</>
                      )}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
