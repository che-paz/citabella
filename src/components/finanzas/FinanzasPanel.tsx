"use client";

import { useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useFormState, useFormStatus } from "react-dom";
import { Trash2 } from "lucide-react";
import {
  createGastoAction,
  deleteGastoAction,
} from "@/lib/finanzas/actions";
import type { ResumenFinanciero } from "@/lib/finanzas/queries";
import {
  GASTO_CATEGORIAS,
  type MovimientoContable,
} from "@/types/database";
import { formatQuetzales } from "@/lib/utils/format";
import { getSalonDateKey } from "@/lib/availability/timezone";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type FinanzasPanelProps = {
  resumen: ResumenFinanciero;
  movimientos: MovimientoContable[];
  timezone: string;
  porCobrar: number;
};

function SubmitGasto() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto">
      {pending ? "Guardando…" : "Registrar gasto"}
    </Button>
  );
}

function categoriaLabel(value: string) {
  return GASTO_CATEGORIAS.find((c) => c.value === value)?.label ?? value;
}

export function FinanzasPanel({
  resumen,
  movimientos,
  timezone,
  porCobrar,
}: FinanzasPanelProps) {
  const router = useRouter();
  const [state, formAction] = useFormState(createGastoAction, {});
  const [pending, startTransition] = useTransition();
  const today = getSalonDateKey(new Date(), timezone);
  const gastos = movimientos.filter((m) => m.tipo === "egreso");

  useEffect(() => {
    if (state.success) router.refresh();
  }, [state.success, router]);

  return (
    <div className="space-y-6">
      <Card className="border-amber-200/80 bg-amber-50/50 dark:border-amber-900/50 dark:bg-amber-950/20">
        <CardHeader className="pb-2">
          <CardDescription>Por cobrar (no disponible para gastar)</CardDescription>
          <CardTitle className="text-2xl tabular-nums text-amber-900 dark:text-amber-100">
            {formatQuetzales(porCobrar)}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-muted-foreground">
          Anticipos de citas confirmadas. Pasa a ingreso al marcar completada y
          cobrada.
        </CardContent>
      </Card>

      <div className="grid gap-3 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Ingresos del mes</CardDescription>
            <CardTitle className="text-2xl tabular-nums">
              {formatQuetzales(resumen.totalIngresos)}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            Pagos cobrados: {formatQuetzales(resumen.ingresosPagos)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Gastos del mes</CardDescription>
            <CardTitle className="text-2xl tabular-nums text-destructive">
              {formatQuetzales(resumen.totalGastos)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card
          className={cn(
            resumen.balance >= 0 ? "border-primary/30 bg-primary/5" : "border-destructive/30"
          )}
        >
          <CardHeader className="pb-2">
            <CardDescription>Balance ({resumen.mesLabel})</CardDescription>
            <CardTitle className="text-2xl tabular-nums">
              {formatQuetzales(resumen.balance)}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Registrar gasto</CardTitle>
          <CardDescription>
            Controla renta, insumos y otros egresos del salón.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="categoria">Categoría</Label>
              <select
                id="categoria"
                name="categoria"
                defaultValue="insumos"
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm"
              >
                {GASTO_CATEGORIAS.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="monto">Monto (Q)</Label>
              <Input
                id="monto"
                name="monto"
                type="number"
                min="0.01"
                step="0.01"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fecha">Fecha</Label>
              <Input
                id="fecha"
                name="fecha"
                type="date"
                defaultValue={today}
                required
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="descripcion">Descripción (opcional)</Label>
              <Textarea
                id="descripcion"
                name="descripcion"
                rows={2}
                placeholder="Ej. Compra de productos para uñas"
              />
            </div>
            {state.error && (
              <p className="text-sm text-destructive sm:col-span-2">{state.error}</p>
            )}
            <div className="sm:col-span-2">
              <SubmitGasto />
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Gastos recientes</CardTitle>
        </CardHeader>
        <CardContent>
          {gastos.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Aún no hay gastos registrados este mes.
            </p>
          ) : (
            <ul className="divide-y">
              {gastos.map((g) => (
                <li
                  key={g.id}
                  className="flex items-start justify-between gap-3 py-3 first:pt-0 last:pb-0"
                >
                  <div className="min-w-0">
                    <p className="font-medium">
                      {categoriaLabel(g.categoria)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {g.fecha}
                      {g.descripcion ? ` · ${g.descripcion}` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold tabular-nums text-destructive">
                      -{formatQuetzales(g.monto)}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={pending}
                      aria-label="Eliminar gasto"
                      onClick={() => {
                        startTransition(async () => {
                          await deleteGastoAction(g.id);
                          router.refresh();
                        });
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
