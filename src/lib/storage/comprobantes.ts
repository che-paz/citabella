import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

const BUCKET = "comprobantes";
const MAX_BYTES = 5 * 1024 * 1024;

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
  "application/pdf",
]);

const EXT_TO_MIME: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  heic: "image/heic",
  heif: "image/heif",
  pdf: "application/pdf",
};

function resolveContentType(file: File): string | null {
  const type = file.type?.toLowerCase() ?? "";
  if (type && ALLOWED_TYPES.has(type)) return type;

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  const fromExt = EXT_TO_MIME[ext];
  if (fromExt) return fromExt;

  return null;
}

export function buildComprobantePath(
  salonId: string,
  citaId: string,
  filename: string
): string {
  const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
  return `${salonId}/${citaId}/${Date.now()}-${safeName}`;
}

export async function uploadComprobante(params: {
  salonId: string;
  citaId: string;
  file: File;
}): Promise<{ path?: string; error?: string }> {
  const contentType = resolveContentType(params.file);
  if (!contentType) {
    return {
      error: "Formato no permitido. Usa JPG, PNG, WebP, HEIC o PDF.",
    };
  }

  if (params.file.size > MAX_BYTES) {
    return { error: "El archivo no puede superar 5 MB." };
  }

  const path = buildComprobantePath(
    params.salonId,
    params.citaId,
    params.file.name
  );

  const buffer = Buffer.from(await params.file.arrayBuffer());

  // Prefer service role (bypasses Storage RLS; safe — path validated server-side)
  const admin = createAdminClient();
  const storageClient = admin ?? (await createClient());

  const { error } = await storageClient.storage.from(BUCKET).upload(path, buffer, {
    contentType,
    upsert: false,
  });

  if (error) {
    console.error("[comprobantes] upload failed:", error.message);
    return { error: "No se pudo subir el comprobante" };
  }

  return { path };
}

export async function deleteComprobante(path: string): Promise<void> {
  const admin = createAdminClient();
  const storageClient = admin ?? (await createClient());
  await storageClient.storage.from(BUCKET).remove([path]);
}
