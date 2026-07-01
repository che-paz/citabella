import { getAuthUser } from "@/lib/auth/get-user";
import { formatDateKeyLabel, todayDateKey } from "@/lib/agenda/dates";
import {
  getCitasHoy,
  getIngresosHoy,
  getPagosPendientesCount,
} from "@/lib/dashboard/queries";
import { AccionesRapidas } from "@/components/dashboard/AccionesRapidas";
import { CitasHoy } from "@/components/dashboard/CitasHoy";
import { IngresosHoy } from "@/components/dashboard/IngresosHoy";
import { LinkReserva } from "@/components/dashboard/LinkReserva";
import { PagosPendientes } from "@/components/dashboard/PagosPendientes";
import { getPublicBookingUrl } from "@/lib/utils/site-url";

export default async function DashboardPage() {
  const user = await getAuthUser();
  if (!user) return null;

  const timezone = user.salon.timezone ?? "America/Guatemala";
  const isAdmin = user.rol === "admin_salon";
  const dateKey = todayDateKey(timezone);

  const [citas, pagosPendientes, ingresosHoy] = await Promise.all([
    getCitasHoy(user.salon_id, timezone),
    isAdmin ? getPagosPendientesCount(user.salon_id) : Promise.resolve(0),
    isAdmin ? getIngresosHoy(user.salon_id, timezone) : Promise.resolve(0),
  ]);

  const reservaUrl = getPublicBookingUrl(user.salon.slug);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {user.salon.nombre}
        </h1>
        <p className="text-muted-foreground">
          {formatDateKeyLabel(dateKey, timezone)}
          {!isAdmin && " · Tus citas del día"}
        </p>
      </div>

      <AccionesRapidas
        isAdmin={isAdmin}
        pagosPendientes={pagosPendientes}
      />

      <LinkReserva url={reservaUrl} />

      {isAdmin && (
        <div className="grid gap-4 sm:grid-cols-2">
          <PagosPendientes count={pagosPendientes} />
          <IngresosHoy total={ingresosHoy} />
        </div>
      )}

      <CitasHoy citas={citas} timezone={timezone} isAdmin={isAdmin} />
    </div>
  );
}
