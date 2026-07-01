import { z } from "zod";

const PG_UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** PostgreSQL UUID format (no exige RFC 4122; compatible con seeds de dev). */
export function pgUuidSchema(message = "ID inválido") {
  return z.string().regex(PG_UUID_REGEX, message);
}

export function optionalPgUuidSchema(message = "ID inválido") {
  return z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? null : v),
    pgUuidSchema(message).nullable().optional()
  );
}
