import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AgendaPage() {
  return (
    <PlaceholderPage
      title="Agenda"
      description="Calendario y reservas — disponible en el próximo sprint."
    />
  );
}

function PlaceholderPage({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        <p className="text-muted-foreground">{description}</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Próximamente</CardTitle>
        </CardHeader>
        <CardContent>
          <Badge variant="outline">Sprint 02</Badge>
        </CardContent>
      </Card>
    </div>
  );
}
