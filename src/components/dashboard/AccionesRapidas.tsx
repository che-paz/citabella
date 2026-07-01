import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, CalendarPlus, CreditCard } from "lucide-react";

type AccionesRapidasProps = {
  isAdmin: boolean;
  pagosPendientes: number;
};

export function AccionesRapidas({
  isAdmin,
  pagosPendientes,
}: AccionesRapidasProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Acciones rápidas</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        <Button asChild variant="default" size="sm">
          <Link href="/agenda">
            <Calendar className="mr-2 h-4 w-4" />
            Ver agenda
          </Link>
        </Button>
        <Button asChild variant="outline" size="sm">
          <Link href="/agenda">
            <CalendarPlus className="mr-2 h-4 w-4" />
            Nueva cita
          </Link>
        </Button>
        {isAdmin && (
          <Button asChild variant="outline" size="sm">
            <Link href="/pagos">
              <CreditCard className="mr-2 h-4 w-4" />
              Validar pagos
              {pagosPendientes > 0 && (
                <span className="ml-1.5 rounded-full bg-destructive px-1.5 py-0.5 text-xs text-destructive-foreground">
                  {pagosPendientes}
                </span>
              )}
            </Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
