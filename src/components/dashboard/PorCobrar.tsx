import { formatQuetzales } from "@/lib/utils/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet } from "lucide-react";

type PorCobrarProps = {
  total: number;
};

export function PorCobrar({ total }: PorCobrarProps) {
  return (
    <Card className="border-amber-200/80 bg-amber-50/50 dark:border-amber-900/50 dark:bg-amber-950/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Wallet className="h-4 w-4 text-amber-700 dark:text-amber-400" />
          Por cobrar
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-bold tabular-nums text-amber-900 dark:text-amber-100">
          {formatQuetzales(total)}
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Citas confirmadas con pago asegurado. Se suma a ingresos al completar
          y cobrar.
        </p>
      </CardContent>
    </Card>
  );
}
