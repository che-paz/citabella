"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import { ClientaForm } from "@/components/clientas/ClientaForm";
import { Button } from "@/components/ui/button";
import type { Clienta } from "@/types/database";

type ClientaDetalleProps = {
  clienta: Clienta;
  isAdmin: boolean;
};

export function ClientaDetalle({ clienta, isAdmin }: ClientaDetalleProps) {
  const [formOpen, setFormOpen] = useState(false);

  return (
    <>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{clienta.nombre}</h1>
          <p className="mt-1 text-muted-foreground">
            {clienta.telefono ?? "Sin teléfono"}
            {clienta.email && ` · ${clienta.email}`}
          </p>
          {clienta.notas && (
            <p className="mt-3 text-sm text-muted-foreground">{clienta.notas}</p>
          )}
        </div>
        {isAdmin && (
          <Button variant="outline" size="sm" onClick={() => setFormOpen(true)}>
            <Pencil className="mr-2 h-4 w-4" />
            Editar
          </Button>
        )}
      </div>

      <ClientaForm
        clienta={clienta}
        open={formOpen}
        onOpenChange={setFormOpen}
      />
    </>
  );
}
