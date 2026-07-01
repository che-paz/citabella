export function formatQuetzales(amount: number): string {
  return new Intl.NumberFormat("es-GT", {
    style: "currency",
    currency: "GTQ",
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;
  if (remaining === 0) return `${hours} h`;
  return `${hours} h ${remaining} min`;
}

export function getCategoryLabel(value: string): string {
  const labels: Record<string, string> = {
    maquillaje_social: "Maquillaje social",
    novias: "Maquillaje novias",
    peinado: "Peinado",
    cejas: "Cejas",
    unas: "Uñas",
    otro: "Otro",
  };
  return labels[value] ?? value;
}
