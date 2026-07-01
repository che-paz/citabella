"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, Pencil, Search, User } from "lucide-react";
import { ClientaForm } from "@/components/clientas/ClientaForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { Clienta } from "@/types/database";

type ClientasListProps = {
  clientas: Clienta[];
  isAdmin: boolean;
  initialQuery: string;
};

export function ClientasList({
  clientas,
  isAdmin,
  initialQuery,
}: ClientasListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(initialQuery);
  const [formOpen, setFormOpen] = useState(false);
  const [editingClienta, setEditingClienta] = useState<Clienta | undefined>();

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    const trimmed = query.trim();
    if (trimmed) {
      params.set("q", trimmed);
    } else {
      params.delete("q");
    }
    router.push(`/clientas?${params.toString()}`);
  }

  function openCreate() {
    setEditingClienta(undefined);
    setFormOpen(true);
  }

  function openEdit(clienta: Clienta) {
    setEditingClienta(clienta);
    setFormOpen(true);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <form onSubmit={handleSearch} className="relative flex-1 sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nombre o teléfono…"
            className="pl-9"
          />
        </form>
        {isAdmin && (
          <Button onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Nueva clienta
          </Button>
        )}
      </div>

      {clientas.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            {initialQuery
              ? "No se encontraron clientas con esa búsqueda."
              : "Aún no hay clientas registradas."}
          </CardContent>
        </Card>
      ) : (
        <ul className="divide-y rounded-lg border bg-card">
          {clientas.map((clienta) => (
            <li
              key={clienta.id}
              className="flex items-center gap-3 px-4 py-3"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted">
                <User className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="min-w-0 flex-1">
                <Link
                  href={`/clientas/${clienta.id}`}
                  className="font-medium hover:underline"
                >
                  {clienta.nombre}
                </Link>
                <p className="text-sm text-muted-foreground">
                  {clienta.telefono ?? "Sin teléfono"}
                  {clienta.email && ` · ${clienta.email}`}
                </p>
              </div>
              {isAdmin && (
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Editar ${clienta.nombre}`}
                  onClick={() => openEdit(clienta)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}

      <ClientaForm
        clienta={editingClienta}
        open={formOpen}
        onOpenChange={setFormOpen}
      />
    </div>
  );
}
