import Link from "next/link";
import { formatAgendaDate, formatAgendaTime } from "@/lib/agenda/dates";
import {
  CITA_ESTADO_LABELS,
  PAGO_ESTADO_LABELS,
  PAGO_METODO_LABELS,
  type CitaConDetalle,
  type CitaEstado,
} from "@/types/database";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

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

type HistorialCitasProps = {
  citas: CitaConDetalle[];
  timezone: string;
  showColaboradora?: boolean;
};

export function HistorialCitas({
  citas,
  timezone,
  showColaboradora = true,
}: HistorialCitasProps) {
  if (citas.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-muted-foreground">
          Esta clienta aún no tiene citas registradas.
        </CardContent>
      </Card>
    );
  }

  return (
    <ul className="divide-y rounded-lg border bg-card">
      {citas.map((cita) => {
        const servicioNombre =
          cita.servicio?.nombre ?? cita.paquete?.nombre ?? "Servicio";

        return (
          <li key={cita.id} className="px-4 py-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="space-y-1">
                <p className="font-medium">{servicioNombre}</p>
                <p className="text-sm text-muted-foreground">
                  {formatAgendaDate(cita.inicio, timezone)} ·{" "}
                  {formatAgendaTime(cita.inicio, timezone)} –{" "}
                  {formatAgendaTime(cita.fin, timezone)}
                </p>
                {showColaboradora && cita.colaboradora && (
                  <p className="text-sm text-muted-foreground">
                    Con {cita.colaboradora.nombre}
                  </p>
                )}
                {cita.pago && (
                  <p className="text-sm text-muted-foreground">
                    {PAGO_METODO_LABELS[cita.pago.metodo]} ·{" "}
                    {PAGO_ESTADO_LABELS[cita.pago.estado]}
                  </p>
                )}
              </div>
              <Badge variant={ESTADO_VARIANT[cita.estado]}>
                {CITA_ESTADO_LABELS[cita.estado]}
              </Badge>
            </div>
            {cita.notas && (
              <p className="mt-2 text-sm text-muted-foreground">{cita.notas}</p>
            )}
            <Link
              href="/agenda"
              className="mt-2 inline-block text-sm text-primary hover:underline"
            >
              Ver en agenda
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
