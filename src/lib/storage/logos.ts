import { createAdminClient } from "@/lib/supabase/admin";

const BUCKET = "logos-salon";
const MAX_BYTES = 2 * 1024 * 1024;

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

const EXT_TO_MIME: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

function resolveContentType(file: File): string | null {
  const type = file.type?.toLowerCase() ?? "";
  if (type && ALLOWED_TYPES.has(type)) return type;

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  return EXT_TO_MIME[ext] ?? null;
}

export function buildSalonLogoPath(salonId: string, ext: string): string {
  return `${salonId}/logo.${ext}`;
}

export function getSalonLogoPublicUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return null;
  return `${base}/storage/v1/object/public/${BUCKET}/${path}`;
}

export async function uploadSalonLogo(params: {
  salonId: string;
  file: File;
}): Promise<{ path?: string; error?: string }> {
  const contentType = resolveContentType(params.file);
  if (!contentType) {
    return { error: "Formato no permitido. Usa JPG, PNG o WebP." };
  }

  if (params.file.size > MAX_BYTES) {
    return { error: "El logo no puede superar 2 MB." };
  }

  const ext =
    contentType === "image/png"
      ? "png"
      : contentType === "image/webp"
        ? "webp"
        : "jpg";

  const path = buildSalonLogoPath(params.salonId, ext);
  const buffer = Buffer.from(await params.file.arrayBuffer());

  const admin = createAdminClient();
  if (!admin) {
    return { error: "Configuración del servidor incompleta" };
  }

  const { error } = await admin.storage.from(BUCKET).upload(path, buffer, {
    contentType,
    upsert: true,
  });

  if (error) {
    return { error: "No se pudo subir el logo" };
  }

  return { path };
}

export async function removeSalonLogo(path: string): Promise<void> {
  const admin = createAdminClient();
  if (!admin) return;
  await admin.storage.from(BUCKET).remove([path]);
}
