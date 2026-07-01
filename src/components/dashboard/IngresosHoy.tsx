import { formatQuetzales } from "@/lib/utils/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

type IngresosHoyProps = {
  total: number;
};

export function IngresosHoy({ total }: IngresosHoyProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <TrendingUp className="h-4 w-4" />
          Ingresos de hoy
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-bold tabular-nums">
          {formatQuetzales(total)}
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Suma de pagos validados hoy.
        </p>
      </CardContent>
    </Card>
  );
}
