import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MobileActionBar } from "@/components/ui/mobile-action-bar";
import { cn } from "@/lib/utils";
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
      <CardContent>
        <MobileActionBar>
          <Button asChild className="w-full justify-center sm:w-auto">
            <Link href="/agenda">
              <Calendar className="mr-2 h-4 w-4" />
              Ver agenda
            </Link>
          </Button>
          <Button asChild variant="outline" className="w-full justify-center sm:w-auto">
            <Link href="/agenda">
              <CalendarPlus className="mr-2 h-4 w-4" />
              Nueva cita
            </Link>
          </Button>
          {isAdmin && (
            <Button
              asChild
              variant="outline"
              className={cn(
                "w-full justify-center sm:w-auto",
                !isAdmin ? "" : "col-span-2 sm:col-span-1"
              )}
            >
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
        </MobileActionBar>
      </CardContent>
    </Card>
  );
}
