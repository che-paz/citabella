/** Piloto founders — hora exacta hasta que `slot_step_minutes` exista en DB. */
const ON_THE_HOUR_SLUGS = new Set([
  "salon-tutis",
  "galaxy-barberia-infantil",
]);

export function resolveSlotStepMinutes(salon: {
  slug: string;
  slot_step_minutes?: number | null;
}): number {
  if (
    typeof salon.slot_step_minutes === "number" &&
    salon.slot_step_minutes > 0
  ) {
    return salon.slot_step_minutes;
  }
  if (ON_THE_HOUR_SLUGS.has(salon.slug)) {
    return 60;
  }
  return 60;
}
