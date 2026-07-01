import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreditCard } from "lucide-react";

type PagosPendientesProps = {
  count: number;
};

export function PagosPendientes({ count }: PagosPendientesProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <CreditCard className="h-4 w-4" />
          Pagos por validar
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-3">
          <span className="text-3xl font-bold tabular-nums">{count}</span>
          {count > 0 && (
            <Badge variant="secondary">Requiere atención</Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          {count === 0
            ? "No hay comprobantes pendientes."
            : `${count} pago(s) esperando validación.`}
        </p>
        {count > 0 && (
          <Button asChild size="sm" variant="outline">
            <Link href="/pagos">Ir a validar</Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
