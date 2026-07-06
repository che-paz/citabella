import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth/get-user";
import {
  getMovimientos,
  getResumenFinanciero,
} from "@/lib/finanzas/queries";
import { getPorCobrarTotal } from "@/lib/dashboard/queries";
import { FinanzasPanel } from "@/components/finanzas/FinanzasPanel";

export default async function FinanzasPage() {
  const user = await getAuthUser();
  if (!user) return null;

  if (user.rol !== "admin_salon") {
    redirect("/");
  }

  const timezone = user.salon.timezone ?? "America/Guatemala";

  const [resumen, movimientos, porCobrar] = await Promise.all([
    getResumenFinanciero(user.salon_id, timezone),
    getMovimientos(user.salon_id),
    getPorCobrarTotal(user.salon_id),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Finanzas</h1>
        <p className="text-muted-foreground">
          Ingresos de citas validadas y control de gastos del salón.
        </p>
      </div>

      <FinanzasPanel
        resumen={resumen}
        movimientos={movimientos}
        timezone={timezone}
        porCobrar={porCobrar}
      />
    </div>
  );
}
