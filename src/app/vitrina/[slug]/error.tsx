"use client";

import { PublicRetryError } from "@/components/reservar/PublicRetryError";

export default function VitrinaError({ reset }: { reset: () => void }) {
  return <PublicRetryError reset={reset} />;
}
