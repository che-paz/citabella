import { type AuthUser } from "@/types/database";
import { createClient } from "@/lib/supabase/server";

export async function getAuthUser(): Promise<AuthUser | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: usuario, error } = await supabase
    .from("usuarios")
    .select(
      `
      id,
      salon_id,
      email,
      nombre,
      rol,
      activo,
      created_at,
      salon:salones (
        id,
        nombre,
        slug,
        moneda
      )
    `
    )
    .eq("id", user.id)
    .eq("activo", true)
    .single();

  if (error || !usuario) return null;

  const salon = Array.isArray(usuario.salon) ? usuario.salon[0] : usuario.salon;
  if (!salon) return null;

  return {
    id: usuario.id,
    salon_id: usuario.salon_id,
    email: usuario.email,
    nombre: usuario.nombre,
    rol: usuario.rol,
    activo: usuario.activo,
    created_at: usuario.created_at,
    salon,
  };
}

export async function requireAuthUser(): Promise<AuthUser> {
  const user = await getAuthUser();
  if (!user) {
    throw new Error("No autenticado");
  }
  return user;
}

export async function requireAdminUser(): Promise<AuthUser> {
  const user = await requireAuthUser();
  if (user.rol !== "admin_salon") {
    throw new Error("Acceso denegado");
  }
  return user;
}
