import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ReservarNotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center space-y-4">
      <h1 className="text-2xl font-bold">Salón no encontrado</h1>
      <p className="text-muted-foreground max-w-sm">
        El enlace de reserva no es válido o el salón no está disponible.
      </p>
      <Button asChild variant="outline">
        <Link href="/">Ir al inicio</Link>
      </Button>
    </div>
  );
}
