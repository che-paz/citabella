"use client";

import { useFormState, useFormStatus } from "react-dom";
import { provisionLeadAction } from "./actions";
import type { OnboardingLead } from "@/lib/leads";
import { STATUS_LABEL } from "@/lib/leads";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-xl bg-[#2a2220] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
    >
      {pending ? "Dando de alta…" : "Autorizar y dar de alta"}
    </button>
  );
}

export function ProvisionPanel({ lead }: { lead: OnboardingLead }) {
  const [state, action] = useFormState(provisionLeadAction, null);
  const canProvision = Boolean(lead.slug && lead.email && lead.admin_nombre);

  return (
    <div className="rounded-xl border border-[#e0d4d0] bg-white p-5">
      <p className="text-sm">
        Estado:{" "}
        <strong className="text-[#a85a5a]">{STATUS_LABEL[lead.status]}</strong>
      </p>

      {lead.status === "enrolado" && lead.temp_password ? (
        <div className="mt-4 rounded-lg bg-[#fbf6f4] p-4 text-sm">
          <p className="font-semibold">Credenciales (uso interno)</p>
          <p className="mt-2">
            Email: <code>{lead.email}</code>
          </p>
          <p>
            Contraseña temporal: <code>{lead.temp_password}</code>
          </p>
          {lead.slug ? (
            <p className="mt-1 text-[#6f5f5a]">
              Reserva: /reservar/{lead.slug}
            </p>
          ) : null}
          <p className="mt-2 text-xs text-[#6f5f5a]">
            Pedile que cambie la contraseña en /ajustes.
          </p>
        </div>
      ) : null}

      {lead.error_message ? (
        <p className="mt-3 text-sm text-rose-deep">{lead.error_message}</p>
      ) : null}

      {state?.ok ? (
        <p className="mt-3 text-sm text-green-800">{state.ok}</p>
      ) : null}
      {state?.error ? (
        <p className="mt-3 text-sm text-rose-deep">{state.error}</p>
      ) : null}

      {lead.status !== "enrolado" ? (
        <form action={action} className="mt-4 space-y-3">
          <input type="hidden" name="id" value={lead.id} />
          {!canProvision ? (
            <p className="text-sm text-[#6f5f5a]">
              Guardá slug, email y nombre admin abajo antes de dar de alta.
            </p>
          ) : (
            <>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="allow_existing" />
                Permitir existente (reset password / actualizar slug)
              </label>
              <Submit />
            </>
          )}
        </form>
      ) : null}
    </div>
  );
}
