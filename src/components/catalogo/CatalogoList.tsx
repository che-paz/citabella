"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Ban, RotateCcw } from "lucide-react";
import {
  deactivatePaqueteAction,
  deactivateServicioAction,
  reactivatePaqueteAction,
  reactivateServicioAction,
} from "@/lib/catalogo/actions";
import {
  formatQuetzales,
  formatDuration,
} from "@/lib/utils/format";
import {
  SERVICE_CATEGORIES,
  type PaqueteConServicios,
  type Servicio,
} from "@/types/database";
import { ServicioForm } from "@/components/catalogo/ServicioForm";
import { PaqueteForm } from "@/components/catalogo/PaqueteForm";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type Tab = "servicios" | "paquetes";

type CatalogoListProps = {
  servicios: Servicio[];
  paquetes: PaqueteConServicios[];
  isAdmin: boolean;
};

export function CatalogoList({ servicios, paquetes, isAdmin }: CatalogoListProps) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("servicios");
  const [showInactive, setShowInactive] = useState(false);
  const [servicioFormOpen, setServicioFormOpen] = useState(false);
  const [paqueteFormOpen, setPaqueteFormOpen] = useState(false);
  const [editingServicio, setEditingServicio] = useState<Servicio | undefined>();
  const [editingPaquete, setEditingPaquete] = useState<PaqueteConServicios | undefined>();
  const [actionError, setActionError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const serviciosActivos = servicios.filter((s) => s.activo);
  const visibleServicios = servicios.filter((s) => showInactive || s.activo);
  const visiblePaquetes = paquetes.filter((p) => showInactive || p.activo);

  const groupedServicios = SERVICE_CATEGORIES.map((cat) => ({
    category: cat,
    items: visibleServicios.filter((s) => s.categoria === cat.value),
  })).filter((g) => g.items.length > 0);

  const uncategorized = visibleServicios.filter(
    (s) => !SERVICE_CATEGORIES.some((c) => c.value === s.categoria)
  );

  function openCreateServicio() {
    setEditingServicio(undefined);
    setServicioFormOpen(true);
  }

  function openEditServicio(servicio: Servicio) {
    setEditingServicio(servicio);
    setServicioFormOpen(true);
  }

  function openCreatePaquete() {
    setEditingPaquete(undefined);
    setPaqueteFormOpen(true);
  }

  function openEditPaquete(paquete: PaqueteConServicios) {
    setEditingPaquete(paquete);
    setPaqueteFormOpen(true);
  }

  function handleServicioFormClose(open: boolean) {
    setServicioFormOpen(open);
    if (!open) setEditingServicio(undefined);
  }

  function handlePaqueteFormClose(open: boolean) {
    setPaqueteFormOpen(open);
    if (!open) setEditingPaquete(undefined);
  }

  function handleDeactivateServicio(servicio: Servicio) {
    if (!confirm(`¿Desactivar "${servicio.nombre}"? No aparecerá en reservas.`)) {
      return;
    }
    setActionError(null);
    startTransition(async () => {
      const result = await deactivateServicioAction(servicio.id);
      if (result.error) setActionError(result.error);
      else router.refresh();
    });
  }

  function handleDeactivatePaquete(paquete: PaqueteConServicios) {
    if (!confirm(`¿Desactivar "${paquete.nombre}"? No aparecerá en reservas.`)) {
      return;
    }
    setActionError(null);
    startTransition(async () => {
      const result = await deactivatePaqueteAction(paquete.id);
      if (result.error) setActionError(result.error);
      else router.refresh();
    });
  }

  function handleReactivateServicio(servicio: Servicio) {
    if (!confirm(`¿Reactivar "${servicio.nombre}"? Volverá a aparecer en reservas.`)) {
      return;
    }
    setActionError(null);
    startTransition(async () => {
      const result = await reactivateServicioAction(servicio.id);
      if (result.error) setActionError(result.error);
      else router.refresh();
    });
  }

  function handleReactivatePaquete(paquete: PaqueteConServicios) {
    if (!confirm(`¿Reactivar "${paquete.nombre}"? Volverá a aparecer en reservas.`)) {
      return;
    }
    setActionError(null);
    startTransition(async () => {
      const result = await reactivatePaqueteAction(paquete.id);
      if (result.error) setActionError(result.error);
      else router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex rounded-lg border p-1">
          <button
            type="button"
            onClick={() => setTab("servicios")}
            className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors sm:flex-none ${
              tab === "servicios"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Servicios ({serviciosActivos.length})
          </button>
          <button
            type="button"
            onClick={() => setTab("paquetes")}
            className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors sm:flex-none ${
              tab === "paquetes"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Paquetes ({paquetes.filter((p) => p.activo).length})
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
            <input
              type="checkbox"
              checked={showInactive}
              onChange={(e) => setShowInactive(e.target.checked)}
              className="h-4 w-4 rounded border-input"
            />
            Ver inactivos
          </label>
          {isAdmin && tab === "servicios" && (
            <Button size="sm" onClick={openCreateServicio}>
              <Plus className="mr-1 h-4 w-4" />
              Nuevo servicio
            </Button>
          )}
          {isAdmin && tab === "paquetes" && (
            <Button size="sm" onClick={openCreatePaquete}>
              <Plus className="mr-1 h-4 w-4" />
              Nuevo paquete
            </Button>
          )}
        </div>
      </div>

      {actionError && (
        <p className="text-sm text-destructive" role="alert">
          {actionError}
        </p>
      )}

      {tab === "servicios" && (
        <div className="space-y-6">
          {visibleServicios.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                {showInactive
                  ? "No hay servicios registrados."
                  : "No hay servicios activos. Crea uno o activa los inactivos."}
              </CardContent>
            </Card>
          ) : (
            <>
              {groupedServicios.map(({ category, items }) => (
                <section key={category.value}>
                  <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    {category.label}
                  </h2>
                  <div className="space-y-2">
                    {items.map((servicio) => (
                      <ServicioCard
                        key={servicio.id}
                        servicio={servicio}
                        isAdmin={isAdmin}
                        isPending={isPending}
                        onEdit={() => openEditServicio(servicio)}
                        onDeactivate={() => handleDeactivateServicio(servicio)}
                        onReactivate={() => handleReactivateServicio(servicio)}
                      />
                    ))}
                  </div>
                </section>
              ))}
              {uncategorized.length > 0 && (
                <section>
                  <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    Sin categoría
                  </h2>
                  <div className="space-y-2">
                    {uncategorized.map((servicio) => (
                      <ServicioCard
                        key={servicio.id}
                        servicio={servicio}
                        isAdmin={isAdmin}
                        isPending={isPending}
                        onEdit={() => openEditServicio(servicio)}
                        onDeactivate={() => handleDeactivateServicio(servicio)}
                        onReactivate={() => handleReactivateServicio(servicio)}
                      />
                    ))}
                  </div>
                </section>
              )}
            </>
          )}
        </div>
      )}

      {tab === "paquetes" && (
        <div className="space-y-2">
          {visiblePaquetes.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                {showInactive
                  ? "No hay paquetes registrados."
                  : "No hay paquetes activos."}
              </CardContent>
            </Card>
          ) : (
            visiblePaquetes.map((paquete) => (
              <Card key={paquete.id} className={!paquete.activo ? "opacity-60" : ""}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <CardTitle className="text-base">{paquete.nombre}</CardTitle>
                      <CardDescription>
                        {formatQuetzales(paquete.precio)} ·{" "}
                        {formatDuration(paquete.duracion_minutos)}
                      </CardDescription>
                    </div>
                    {!paquete.activo && (
                      <Badge variant="secondary">Inactivo</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {paquete.servicios.length > 0 && (
                    <p className="text-sm text-muted-foreground">
                      Incluye:{" "}
                      {paquete.servicios
                        .sort((a, b) => a.orden - b.orden)
                        .map((s) => s.nombre)
                        .join(", ")}
                    </p>
                  )}
                  {isAdmin && paquete.activo && (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditPaquete(paquete)}
                        disabled={isPending}
                      >
                        <Pencil className="mr-1 h-3.5 w-3.5" />
                        Editar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeactivatePaquete(paquete)}
                        disabled={isPending}
                      >
                        <Ban className="mr-1 h-3.5 w-3.5" />
                        Desactivar
                      </Button>
                    </div>
                  )}
                  {isAdmin && !paquete.activo && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleReactivatePaquete(paquete)}
                      disabled={isPending}
                    >
                      <RotateCcw className="mr-1 h-3.5 w-3.5" />
                      Reactivar
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {isAdmin && servicioFormOpen && (
        <ServicioForm
          key={editingServicio?.id ?? "new"}
          servicio={editingServicio}
          open
          onOpenChange={handleServicioFormClose}
        />
      )}
      {isAdmin && paqueteFormOpen && (
        <PaqueteForm
          key={editingPaquete?.id ?? "new"}
          paquete={editingPaquete}
          serviciosActivos={serviciosActivos}
          open
          onOpenChange={handlePaqueteFormClose}
        />
      )}
    </div>
  );
}

function ServicioCard({
  servicio,
  isAdmin,
  isPending,
  onEdit,
  onDeactivate,
  onReactivate,
}: {
  servicio: Servicio;
  isAdmin: boolean;
  isPending: boolean;
  onEdit: () => void;
  onDeactivate: () => void;
  onReactivate: () => void;
}) {
  return (
    <Card className={!servicio.activo ? "opacity-60" : ""}>
      <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-medium">{servicio.nombre}</p>
            {!servicio.activo && <Badge variant="secondary">Inactivo</Badge>}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {formatQuetzales(servicio.precio)} ·{" "}
            {formatDuration(servicio.duracion_minutos)}
          </p>
          {servicio.descripcion && (
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
              {servicio.descripcion}
            </p>
          )}
        </div>
        {isAdmin && servicio.activo && (
          <div className="flex shrink-0 gap-2">
            <Button variant="outline" size="sm" onClick={onEdit} disabled={isPending}>
              <Pencil className="mr-1 h-3.5 w-3.5" />
              Editar
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onDeactivate}
              disabled={isPending}
            >
              <Ban className="mr-1 h-3.5 w-3.5" />
              Desactivar
            </Button>
          </div>
        )}
        {isAdmin && !servicio.activo && (
          <Button
            variant="outline"
            size="sm"
            onClick={onReactivate}
            disabled={isPending}
          >
            <RotateCcw className="mr-1 h-3.5 w-3.5" />
            Reactivar
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
