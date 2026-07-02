import Image from "next/image";
import { Sparkles } from "lucide-react";
import { getSalonLogoPublicUrl } from "@/lib/storage/logos";
import { cn } from "@/lib/utils";

type SalonBrandProps = {
  nombre: string;
  logoUrl?: string | null;
  compact?: boolean;
  className?: string;
};

export function SalonBrand({
  nombre,
  logoUrl,
  compact = false,
  className,
}: SalonBrandProps) {
  const src = getSalonLogoPublicUrl(logoUrl);

  return (
    <div className={cn("flex min-w-0 items-center gap-2.5", className)}>
      {src ? (
        <div
          className={cn(
            "relative shrink-0 overflow-hidden rounded-lg border bg-white",
            compact ? "h-8 w-8" : "h-10 w-10"
          )}
        >
          <Image
            src={src}
            alt={`Logo de ${nombre}`}
            fill
            className="object-cover"
            sizes={compact ? "32px" : "40px"}
            unoptimized
          />
        </div>
      ) : (
        <div
          className={cn(
            "flex shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary",
            compact ? "h-8 w-8" : "h-10 w-10"
          )}
        >
          <Sparkles className={compact ? "h-4 w-4" : "h-5 w-5"} />
        </div>
      )}
      <span
        className={cn(
          "truncate font-semibold tracking-tight",
          compact ? "text-base" : "text-lg"
        )}
      >
        {nombre}
      </span>
    </div>
  );
}
