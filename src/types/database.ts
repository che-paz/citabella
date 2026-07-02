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
  logo_url: string | null;
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

export type PaqueteServicioDetalle = {
  servicio_id: string;
  orden: number;
  nombre: string;
};

export type PaqueteConServicios = Paquete & {
  servicios: PaqueteServicioDetalle[];
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
  salon: Pick<
    Salon,
    "id" | "nombre" | "slug" | "moneda" | "timezone" | "logo_url"
  >;
};

export type CitaEstado =
  | "pendiente"
  | "pendiente_validacion"
  | "confirmada"
  | "cancelada"
  | "completada"
  | "no_show";

export type CitaCreadaPor = "admin" | "clienta" | "colaboradora";

export type Clienta = {
  id: string;
  salon_id: string;
  nombre: string;
  telefono: string | null;
  email: string | null;
  fecha_nacimiento: string | null;
  notas: string | null;
  created_at: string;
};

export type HorarioSalon = {
  id: string;
  salon_id: string;
  dia_semana: number;
  hora_inicio: string;
  hora_fin: string;
};

export type ExcepcionHorario = {
  id: string;
  salon_id: string;
  fecha: string;
  cerrado: boolean;
  hora_inicio: string | null;
  hora_fin: string | null;
};

export type Cita = {
  id: string;
  salon_id: string;
  clienta_id: string;
  servicio_id: string | null;
  paquete_id: string | null;
  colaboradora_id: string | null;
  inicio: string;
  fin: string;
  estado: CitaEstado;
  notas: string | null;
  creada_por: CitaCreadaPor;
  created_at: string;
  updated_at: string;
};

export type CitaConDetalle = Cita & {
  clienta: Pick<Clienta, "id" | "nombre" | "telefono">;
  colaboradora: Pick<Usuario, "id" | "nombre"> | null;
  servicio: Pick<Servicio, "id" | "nombre" | "duracion_minutos"> | null;
  paquete: Pick<Paquete, "id" | "nombre" | "duracion_minutos"> | null;
};

export const CITA_ESTADO_LABELS: Record<CitaEstado, string> = {
  pendiente: "Pendiente",
  pendiente_validacion: "Pendiente validación",
  confirmada: "Confirmada",
  cancelada: "Cancelada",
  completada: "Completada",
  no_show: "No show",
};

export const DIA_SEMANA_LABELS = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
] as const;

export type PagoMetodo = "transferencia" | "efectivo" | "fri";
export type PagoEstado = "pendiente" | "validado" | "rechazado";

export type Pago = {
  id: string;
  salon_id: string;
  cita_id: string;
  monto: number;
  metodo: PagoMetodo;
  comprobante_url: string | null;
  estado: PagoEstado;
  validado_por: string | null;
  validado_at: string | null;
  notas: string | null;
  created_at: string;
};

export type SalonPublico = Pick<
  Salon,
  | "id"
  | "nombre"
  | "slug"
  | "moneda"
  | "timezone"
  | "fri_link"
  | "politica_reembolso"
  | "logo_url"
>;

export type ReservaItem = {
  tipo: "servicio" | "paquete";
  id: string;
  nombre: string;
  precio: number;
  duracion_minutos: number;
  categoria?: string;
  servicios?: { nombre: string }[];
};
