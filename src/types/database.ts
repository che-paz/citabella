export type PlanTipo = "founder" | "trial" | "pago";
export type UsuarioRol = "admin_salon" | "colaboradora" | "platform_admin";

export type Salon = {
  id: string;
  nombre: string;
  slug: string;
  plan_tipo: PlanTipo;
  plan_inicio: string;
  plan_fin: string | null;
  moneda: string;
  timezone: string;
  fri_link: string | null;
  politica_reembolso: string;
  activo: boolean;
  created_at: string;
  updated_at: string;
};

export type Usuario = {
  id: string;
  salon_id: string;
  email: string;
  nombre: string;
  rol: UsuarioRol;
  activo: boolean;
  created_at: string;
};

export type Servicio = {
  id: string;
  salon_id: string;
  nombre: string;
  categoria: string;
  precio: number;
  duracion_minutos: number;
  activo: boolean;
  descripcion: string | null;
  created_at: string;
};

export type Paquete = {
  id: string;
  salon_id: string;
  nombre: string;
  precio: number;
  duracion_minutos: number;
  activo: boolean;
  created_at: string;
};

export type PaqueteServicio = {
  paquete_id: string;
  servicio_id: string;
  orden: number;
};

export type PlanSuscripcion = {
  id: string;
  tipo: PlanTipo;
  nombre: string;
  max_colaboradoras: number | null;
  max_citas_mes: number | null;
  precio_mensual: number | null;
};

export const SERVICE_CATEGORIES = [
  { value: "maquillaje_social", label: "Maquillaje social" },
  { value: "novias", label: "Maquillaje novias" },
  { value: "peinado", label: "Peinado" },
  { value: "cejas", label: "Cejas" },
  { value: "unas", label: "Uñas" },
  { value: "otro", label: "Otro" },
] as const;

export type ServiceCategory = (typeof SERVICE_CATEGORIES)[number]["value"];

export type AuthUser = Usuario & {
  salon: Pick<Salon, "id" | "nombre" | "slug" | "moneda">;
};
