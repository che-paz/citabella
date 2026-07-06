import { getAuthUser } from "@/lib/auth/get-user";
import { getSalonSettings } from "@/lib/ajustes/queries";
import { AjustesPanel } from "@/components/ajustes/AjustesPanel";
import { getVapidPublicKey } from "@/lib/push/vapid";

export default async function AjustesPage() {
  const user = await getAuthUser();
  if (!user) return null;

  const salon =
    user.rol === "admin_salon"
      ? await getSalonSettings(user.salon_id)
      : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Ajustes</h1>
        <p className="text-muted-foreground">
          {user.rol === "admin_salon"
            ? "Personaliza tu salón y tu cuenta."
            : "Actualiza tu nombre y contraseña."}
        </p>
      </div>

      <AjustesPanel
        user={user}
        salon={salon}
        vapidPublicKey={getVapidPublicKey()}
      />
    </div>
  );
}
