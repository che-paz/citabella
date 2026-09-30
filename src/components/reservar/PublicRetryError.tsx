"use client";

import { Button } from "@/components/ui/button";

export function PublicRetryError({ reset }: { reset: () => void }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center space-y-4">
      <h1 className="text-2xl font-bold">No pudimos cargar la página</h1>
      <p className="text-muted-foreground max-w-sm">
        Hubo un problema de conexión. Intenta de nuevo en un momento.
      </p>
      <Button variant="outline" onClick={() => reset()}>
        Intentar de nuevo
      </Button>
    </div>
  );
}
