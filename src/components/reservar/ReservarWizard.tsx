"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { todayDateKey } from "@/lib/agenda/dates";
import { createReservaAction } from "@/lib/reservar/actions";
import type { PagoMetodo, ReservaItem, SalonPublico } from "@/types/database";
import { CatalogoPicker } from "./CatalogoPicker";
import { DatosPagoForm } from "./DatosPagoForm";
import { SlotPicker } from "./SlotPicker";

type Step = "catalogo" | "horario" | "datos";

type ReservarWizardProps = {
  salon: SalonPublico;
  catalogo: ReservaItem[];
};

export function ReservarWizard({ salon, catalogo }: ReservarWizardProps) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("catalogo");
  const [selected, setSelected] = useState<ReservaItem | null>(null);
  const [fecha, setFecha] = useState(() => todayDateKey(salon.timezone));
  const [slotInicio, setSlotInicio] = useState("");
  const [horaLocal, setHoraLocal] = useState("");
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [paraOtraPersona, setParaOtraPersona] = useState(false);
  const [beneficiarioNombre, setBeneficiarioNombre] = useState("");
  const [metodo, setMetodo] = useState<PagoMetodo>("transferencia");
  const [comprobante, setComprobante] = useState<File | null>(null);
  const [error, setError] = useState<string | undefined>();
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function handleSlotChange(inicio: string, hora: string) {
    setSlotInicio(inicio);
    setHoraLocal(hora);
  }

  function handleSelectItem(item: ReservaItem) {
    setSelected(item);
    setSlotInicio("");
    setHoraLocal("");
  }

  function handleContinueFromCatalogo() {
    if (!selected) return;
    setSlotInicio("");
    setHoraLocal("");
    setStep("horario");
  }

  function handleSubmit() {
    if (!selected || !slotInicio) return;

    setError(undefined);
    const formData = new FormData();
    formData.set("slug", salon.slug);
    if (selected.tipo === "servicio") {
      formData.set("servicio_id", selected.id);
    } else {
      formData.set("paquete_id", selected.id);
    }
    formData.set("slot_inicio", slotInicio);
    formData.set("nombre", nombre.trim());
    formData.set("telefono", telefono.trim());
    formData.set("metodo", metodo);
    if (paraOtraPersona && salon.permite_reserva_otra_persona) {
      formData.set("para_otra_persona", "true");
      formData.set("beneficiario_nombre", beneficiarioNombre.trim());
    }
    if (comprobante) {
      formData.set("comprobante", comprobante);
    }

    startTransition(async () => {
      const result = await createReservaAction({}, formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      if (result.citaId) {
        router.push(
          `/reservar/${salon.slug}/confirmacion?cita=${result.citaId}`
        );
      }
    });
  }

  const stepLabels: Record<Step, string> = {
    catalogo: "Servicio",
    horario: "Horario",
    datos: "Confirmar",
  };

  const steps: Step[] = ["catalogo", "horario", "datos"];
  const stepIndex = steps.indexOf(step);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-center gap-2">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium ${
                i <= stepIndex
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {i + 1}
            </div>
            <span
              className={`text-xs hidden sm:inline ${
                i === stepIndex ? "font-medium" : "text-muted-foreground"
              }`}
            >
              {stepLabels[s]}
            </span>
            {i < steps.length - 1 && (
              <div className="h-px w-6 bg-border hidden sm:block" />
            )}
          </div>
        ))}
      </div>

      <form ref={formRef} onSubmit={(e) => e.preventDefault()}>
        {step === "catalogo" && (
          <CatalogoPicker
            items={catalogo}
            selected={selected}
            onSelect={handleSelectItem}
            onContinue={handleContinueFromCatalogo}
            politicaReembolso={salon.politica_reembolso}
          />
        )}

        {step === "horario" && selected && (
          <SlotPicker
            slug={salon.slug}
            timezone={salon.timezone}
            item={selected}
            fecha={fecha}
            slotInicio={slotInicio}
            onFechaChange={setFecha}
            onSlotChange={handleSlotChange}
            onBack={() => setStep("catalogo")}
            onContinue={() => setStep("datos")}
          />
        )}

        {step === "datos" && selected && (
          <DatosPagoForm
            salon={salon}
            item={selected}
            slotInicio={slotInicio}
            horaLocal={horaLocal}
            nombre={nombre}
            telefono={telefono}
            paraOtraPersona={paraOtraPersona}
            beneficiarioNombre={beneficiarioNombre}
            metodo={metodo}
            comprobanteName={comprobante?.name ?? ""}
            submitting={pending}
            error={error}
            onNombreChange={setNombre}
            onTelefonoChange={setTelefono}
            onParaOtraPersonaChange={(v) => {
              setParaOtraPersona(v);
              if (!v) setBeneficiarioNombre("");
            }}
            onBeneficiarioNombreChange={setBeneficiarioNombre}
            onMetodoChange={(m) => {
              setMetodo(m);
              if (m === "efectivo") setComprobante(null);
            }}
            onComprobanteChange={setComprobante}
            onBack={() => setStep("horario")}
            onSubmit={handleSubmit}
          />
        )}
      </form>
    </div>
  );
}
