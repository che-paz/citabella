"use client";

import {
  createLeadAction,
  updateLeadAction,
} from "./actions";
import type { OnboardingLead } from "@/lib/leads";
import { suggestSlug } from "@/lib/leads";
import { useState } from "react";
import Link from "next/link";
import { useFormState, useFormStatus } from "react-dom";

function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-xl bg-[#a85a5a] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
    >
      {pending ? "Guardando…" : label}
    </button>
  );
}

const field =
  "mt-1.5 w-full rounded-lg border border-[#e0d4d0] px-3 py-2 text-base outline-none focus:border-[#a85a5a]";
const labelCls = "block text-sm font-medium";

export function LeadEditor({
  mode,
  lead,
}: {
  mode: "create" | "edit";
  lead?: OnboardingLead;
}) {
  const action = mode === "create" ? createLeadAction : updateLeadAction;
  const [state, formAction] = useFormState(action, null);
  const [salonNombre, setSalonNombre] = useState(lead?.salon_nombre ?? "");
  const [slug, setSlug] = useState(lead?.slug ?? "");

  return (
    <form
      action={formAction}
      className="space-y-4 rounded-xl border border-[#e0d4d0] bg-white p-5"
    >
      {mode === "edit" && lead ? (
        <input type="hidden" name="id" value={lead.id} />
      ) : null}

      <fieldset className="space-y-3">
        <legend className="font-display text-base font-semibold">Contacto</legend>
        <label className={labelCls}>
          Nombre persona
          <input
            name="contact_name"
            required
            defaultValue={lead?.contact_name ?? ""}
            className={field}
          />
        </label>
        <label className={labelCls}>
          Nombre salón
          <input
            name="salon_nombre"
            required
            value={salonNombre}
            onChange={(e) => {
              setSalonNombre(e.target.value);
              if (mode === "create" && !lead?.slug) {
                setSlug(suggestSlug(e.target.value));
              }
            }}
            className={field}
          />
        </label>
        <label className={labelCls}>
          WhatsApp
          <input
            name="whatsapp"
            required
            placeholder="502…"
            defaultValue={lead?.whatsapp ?? ""}
            className={field}
          />
        </label>
        <label className={labelCls}>
          Interés
          <select
            name="interes"
            defaultValue={lead?.interes ?? "agenda"}
            className={field}
          >
            <option value="agenda">Agenda</option>
            <option value="vitrina">Vitrina</option>
            <option value="ambas">Ambas</option>
            <option value="otro">Otro</option>
          </select>
        </label>
        <label className={labelCls}>
          Si otro, especificar
          <input
            name="interes_otro"
            defaultValue={lead?.interes_otro ?? ""}
            className={field}
          />
        </label>
        <label className={labelCls}>
          Notas
          <textarea
            name="notas"
            rows={2}
            defaultValue={lead?.notas ?? ""}
            className={field}
          />
        </label>
      </fieldset>

      <fieldset className="space-y-3 border-t border-[#e0d4d0] pt-4">
        <legend className="font-display text-base font-semibold">
          Datos de alta (app)
        </legend>
        <label className={labelCls}>
          Nombre admin (login)
          <input
            name="admin_nombre"
            defaultValue={lead?.admin_nombre ?? lead?.contact_name ?? ""}
            className={field}
          />
        </label>
        <label className={labelCls}>
          Email login
          <input
            type="email"
            name="email"
            defaultValue={lead?.email ?? ""}
            className={field}
          />
        </label>
        <label className={labelCls}>
          Slug URL
          <input
            name="slug"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="studio-ana"
            className={field}
          />
        </label>
        <label className={labelCls}>
          Plan
          <select
            name="plan_tipo"
            defaultValue={lead?.plan_tipo ?? "trial"}
            className={field}
          >
            <option value="trial">trial (30 días)</option>
            <option value="pago">pago</option>
            <option value="founder">founder</option>
          </select>
        </label>
        <label className={labelCls}>
          Intervalo slots (min)
          <select
            name="slot_step_minutes"
            defaultValue={String(lead?.slot_step_minutes ?? 15)}
            className={field}
          >
            <option value="15">15</option>
            <option value="30">30</option>
            <option value="60">60</option>
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="permite_reserva_otra_persona"
            defaultChecked={lead?.permite_reserva_otra_persona ?? false}
          />
          Permite reserva para otra persona
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="mark_listo"
            defaultChecked={lead?.status === "listo" || lead?.status === "enrolado"}
          />
          Marcar como <strong>listo</strong> para alta (requiere slug + email)
        </label>
      </fieldset>

      {state?.error ? (
        <p className="text-sm text-rose-deep">{state.error}</p>
      ) : null}

      <div className="flex flex-wrap items-center gap-3 pt-2">
        <Submit label={mode === "create" ? "Crear lead" : "Guardar"} />
        <Link href="/interna/leads" className="text-sm text-[#6f5f5a] underline">
          Cancelar
        </Link>
      </div>
    </form>
  );
}
