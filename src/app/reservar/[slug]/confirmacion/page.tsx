import Link from "next/link";
import { notFound } from "next/navigation";
import { formatAgendaDate, formatAgendaTime } from "@/lib/agenda/dates";
import { getConfirmacionReserva } from "@/lib/reservar/queries";
import { formatQuetzales } from "@/lib/utils/format";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";

const METODO_LABELS: Record<string, string> = {
  transferencia: "Transferencia",
  efectivo: "Efectivo en salón",
  fri: "Fri / QR",
};

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ cita?: string }>;
};

export default async function ConfirmacionPage({
  params,
  searchParams,
}: PageProps) {
  const { slug } = await params;
  const { cita: citaId } = await searchParams;

  if (!citaId) {
    notFound();
  }

  const reserva = await getConfirmacionReserva(slug, citaId);

  if (!reserva) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="mx-auto max-w-lg px-4 py-6">
          <h1 className="text-2xl font-bold tracking-tight">
            {reserva.salonNombre}
          </h1>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 py-8 space-y-6">
        <div className="flex flex-col items-center text-center space-y-3">
          <CheckCircle2 className="h-12 w-12 text-primary" />
          <h2 className="text-xl font-semibold">¡Reserva recibida!</h2>
          <p className="text-sm text-muted-foreground max-w-sm">
            Tu cita está pendiente de validación. Te confirmaremos cuando
            revisemos tu pago.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Detalles de tu cita</CardTitle>
            <CardDescription>
              Guarda esta información para tu referencia
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Servicio</span>
              <span className="font-medium">{reserva.itemNombre}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Fecha</span>
              <span className="font-medium">
                {formatAgendaDate(reserva.inicio, reserva.timezone)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Hora</span>
              <span className="font-medium">
                {formatAgendaTime(reserva.inicio, reserva.timezone)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Monto</span>
              <span className="font-medium">
                {formatQuetzales(reserva.precio)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Pago</span>
              <span className="font-medium">
                {METODO_LABELS[reserva.metodo] ?? reserva.metodo}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Estado</span>
              <span className="font-medium text-amber-600">
                Pendiente de validación
              </span>
            </div>
          </CardContent>
        </Card>

        <Button asChild className="w-full" size="lg">
          <Link href={`/reservar/${slug}`}>Reservar otra cita</Link>
        </Button>
      </main>
    </div>
  );
}
