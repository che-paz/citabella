import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PagosPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Pagos</h1>
        <p className="text-muted-foreground">
          Control de pagos y comprobantes — disponible en un sprint futuro.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Próximamente</CardTitle>
        </CardHeader>
        <CardContent>
          <Badge variant="outline">Sprint futuro</Badge>
        </CardContent>
      </Card>
    </div>
  );
}
