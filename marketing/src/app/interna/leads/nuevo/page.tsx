import { redirect } from "next/navigation";
import { isInternalAuthenticated } from "@/lib/internal-auth";
import { LeadEditor } from "../../LeadEditor";

export default function NuevoLeadPage() {
  if (!isInternalAuthenticated()) redirect("/interna");

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">Nuevo lead</h1>
      <p className="mt-1 text-sm text-[#6f5f5a]">
        Contacto del taller + datos para el alta cuando estén listos.
      </p>
      <div className="mt-6">
        <LeadEditor mode="create" />
      </div>
    </div>
  );
}
