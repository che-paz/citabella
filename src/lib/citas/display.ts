/** Display name for agenda/pagos: who attends, else contact clienta. */
export function getCitaAsistenteNombre(cita: {
  beneficiario_nombre?: string | null;
  clienta: { nombre: string };
}): string {
  const beneficiario = cita.beneficiario_nombre?.trim();
  return beneficiario || cita.clienta.nombre;
}

export function getCitaContactoLabel(cita: {
  beneficiario_nombre?: string | null;
  clienta: { nombre: string };
}): string | null {
  const beneficiario = cita.beneficiario_nombre?.trim();
  if (!beneficiario) return null;
  return `Contacto: ${cita.clienta.nombre}`;
}
