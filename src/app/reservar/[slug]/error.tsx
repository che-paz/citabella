"use client";

import { PublicRetryError } from "@/components/reservar/PublicRetryError";

export default function ReservarError({ reset }: { reset: () => void }) {
  return <PublicRetryError reset={reset} />;
}
