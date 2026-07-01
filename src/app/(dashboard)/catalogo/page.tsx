import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function CatalogoPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Catálogo</h1>
        <p className="text-muted-foreground">
          Administra los servicios y paquetes de tu salón.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Sprint 1.1 en progreso</CardTitle>
          <CardDescription>
            El CRUD de servicios y paquetes se implementará en la siguiente fase
            de este sprint.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Badge variant="secondary">Fase 0 completada</Badge>
        </CardContent>
      </Card>
    </div>
  );
}
