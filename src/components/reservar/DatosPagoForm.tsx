"use client";

import { useRef } from "react";
import { formatAgendaDate } from "@/lib/agenda/dates";
import { formatQuetzales } from "@/lib/utils/format";
import { PHONE_INPUT_HINT, PHONE_INPUT_PLACEHOLDER } from "@/lib/utils/phone";
import type { PagoMetodo, ReservaItem, SalonPublico } from "@/types/database";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Banknote, CreditCard, QrCode, Upload } from "lucide-react";

type DatosPagoFormProps = {
  salon: SalonPublico;
  item: ReservaItem;
  slotInicio: string;
  horaLocal: string;
  nombre: string;
  telefono: string;
  metodo: PagoMetodo;
  comprobanteName: string;
  submitting: boolean;
  error?: string;
  onNombreChange: (v: string) => void;
  onTelefonoChange: (v: string) => void;
  onMetodoChange: (v: PagoMetodo) => void;
  onComprobanteChange: (file: File | null) => void;
  onBack: () => void;
  onSubmit: () => void;
};

const METODOS: {
  value: PagoMetodo;
  label: string;
  description: string;
  icon: typeof CreditCard;
}[] = [
  {
    value: "transferencia",
    label: "Transferencia",
    description: "Sube tu comprobante de transferencia",
    icon: CreditCard,
  },
  {
    value: "fri",
    label: "Fri / QR",
    description: "Paga con Fri y sube el comprobante",
    icon: QrCode,
  },
  {
    value: "efectivo",
    label: "Efectivo en salón",
    description: "Pagarás al llegar a tu cita",
    icon: Banknote,
  },
];

export function DatosPagoForm({
  salon,
  item,
  slotInicio,
  horaLocal,
  nombre,
  telefono,
  metodo,
  comprobanteName,
  submitting,
  error,
  onNombreChange,
  onTelefonoChange,
  onMetodoChange,
  onComprobanteChange,
  onBack,
  onSubmit,
}: DatosPagoFormProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const needsComprobante = metodo === "transferencia" || metodo === "fri";

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Tus datos y pago</h2>
        <p className="text-sm text-muted-foreground">
          Completa tu información para confirmar la reserva.
        </p>
      </div>

      <div className="rounded-lg border bg-muted/30 p-4 space-y-1 text-sm">
        <p className="font-medium">{item.nombre}</p>
        <p className="text-muted-foreground">
          {formatAgendaDate(slotInicio, salon.timezone)} · {horaLocal}
        </p>
        <p className="font-semibold">{formatQuetzales(item.precio)}</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="nombre">Nombre completo</Label>
          <Input
            id="nombre"
            value={nombre}
            onChange={(e) => onNombreChange(e.target.value)}
            placeholder="Tu nombre"
            required
            autoComplete="name"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="telefono">Teléfono / WhatsApp</Label>
          <Input
            id="telefono"
            type="tel"
            value={telefono}
            onChange={(e) => onTelefonoChange(e.target.value)}
            placeholder={PHONE_INPUT_PLACEHOLDER}
            required
            autoComplete="tel"
            inputMode="numeric"
          />
          <p className="text-xs text-muted-foreground">
            {PHONE_INPUT_HINT} Te avisaremos por WhatsApp.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <Label>Método de pago</Label>
        {METODOS.map((m) => {
          const Icon = m.icon;
          const selected = metodo === m.value;
          return (
            <button
              key={m.value}
              type="button"
              onClick={() => onMetodoChange(m.value)}
              className={`w-full flex items-start gap-3 rounded-lg border p-4 text-left transition-colors ${
                selected
                  ? "border-primary bg-primary/5 ring-2 ring-primary"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <Icon className="h-5 w-5 mt-0.5 shrink-0 text-muted-foreground" />
              <div>
                <p className="font-medium">{m.label}</p>
                <p className="text-xs text-muted-foreground">{m.description}</p>
              </div>
            </button>
          );
        })}
      </div>

      {metodo === "fri" && salon.fri_link && (
        <div className="rounded-lg border border-dashed p-4 text-sm">
          <p className="font-medium mb-1">Instrucciones Fri</p>
          <a
            href={salon.fri_link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline break-all"
          >
            {salon.fri_link}
          </a>
        </div>
      )}

      {needsComprobante && (
        <div className="space-y-2">
          <Label>Comprobante de pago</Label>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/heic,image/heif,application/pdf,.heic,.heif"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0] ?? null;
              onComprobanteChange(file);
            }}
          />
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => fileRef.current?.click()}
          >
            <Upload className="h-4 w-4 mr-2" />
            {comprobanteName || "Subir comprobante"}
          </Button>
          <p className="text-xs text-muted-foreground">
            JPG, PNG, WebP o PDF · máx. 5 MB
          </p>
        </div>
      )}

      {error && (
        <p className="text-sm text-destructive text-center">{error}</p>
      )}

      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={onBack}
          disabled={submitting}
        >
          Atrás
        </Button>
        <Button
          type="button"
          className="reservar-cta flex-1"
          onClick={onSubmit}
          disabled={submitting || !nombre.trim() || telefono.length < 8}
        >
          {submitting ? "Confirmando…" : "Confirmar reserva"}
        </Button>
      </div>
    </div>
  );
}
