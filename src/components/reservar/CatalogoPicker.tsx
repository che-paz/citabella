"use client";

import { formatDuration, formatQuetzales, getCategoryLabel } from "@/lib/utils/format";
import type { ReservaItem } from "@/types/database";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Clock, Package } from "lucide-react";

type CatalogoPickerProps = {
  items: ReservaItem[];
  selected: ReservaItem | null;
  onSelect: (item: ReservaItem) => void;
  onContinue: () => void;
  politicaReembolso: string;
};

export function CatalogoPicker({
  items,
  selected,
  onSelect,
  onContinue,
  politicaReembolso,
}: CatalogoPickerProps) {
  const servicios = items.filter((i) => i.tipo === "servicio");
  const paquetes = items.filter((i) => i.tipo === "paquete");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Elige tu servicio</h2>
        <p className="text-sm text-muted-foreground">
          Selecciona el servicio o paquete que deseas reservar.
        </p>
      </div>

      {servicios.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">Servicios</h3>
          {servicios.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              selected={selected?.id === item.id}
              onSelect={() => onSelect(item)}
            />
          ))}
        </div>
      )}

      {paquetes.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">Paquetes</h3>
          {paquetes.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              selected={selected?.id === item.id}
              onSelect={() => onSelect(item)}
            />
          ))}
        </div>
      )}

      {items.length === 0 && (
        <p className="text-center text-muted-foreground py-8">
          No hay servicios disponibles en este momento.
        </p>
      )}

      {politicaReembolso && (
        <Card className="border-dashed">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Política de reembolso</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {politicaReembolso}
            </p>
          </CardContent>
        </Card>
      )}

      <Button
        className="w-full"
        size="lg"
        disabled={!selected}
        onClick={onContinue}
      >
        Continuar
      </Button>
    </div>
  );
}

function ItemCard({
  item,
  selected,
  onSelect,
}: {
  item: ReservaItem;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full text-left rounded-lg border p-4 transition-colors ${
        selected
          ? "border-primary bg-primary/5 ring-2 ring-primary"
          : "border-border hover:border-primary/50"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2">
            {item.tipo === "paquete" ? (
              <Package className="h-4 w-4 shrink-0 text-muted-foreground" />
            ) : null}
            <span className="font-medium">{item.nombre}</span>
          </div>
          {item.categoria && (
            <Badge variant="secondary" className="text-xs">
              {getCategoryLabel(item.categoria)}
            </Badge>
          )}
          {item.servicios && item.servicios.length > 0 && (
            <p className="text-xs text-muted-foreground">
              Incluye: {item.servicios.map((s) => s.nombre).join(", ")}
            </p>
          )}
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            {formatDuration(item.duracion_minutos)}
          </div>
        </div>
        <span className="font-semibold shrink-0">
          {formatQuetzales(item.precio)}
        </span>
      </div>
    </button>
  );
}
