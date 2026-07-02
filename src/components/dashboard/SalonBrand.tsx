import { getSalonLogoPublicUrl } from "@/lib/storage/logos";
import { cn } from "@/lib/utils";

type SalonBrandProps = {
  nombre: string;
  logoUrl?: string | null;
  logoSrc?: string | null;
  compact?: boolean;
  className?: string;
};

export function SalonBrand({
  nombre,
  logoUrl,
  logoSrc,
  compact = false,
  className,
}: SalonBrandProps) {
  const src = logoSrc ?? getSalonLogoPublicUrl(logoUrl);

  return (
    <div className={cn("flex min-w-0 items-center gap-2.5", className)}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={`Logo de ${nombre}`}
          className={cn(
            "shrink-0 rounded-lg border border-border/60 bg-white object-cover",
            compact ? "h-8 w-8" : "h-11 w-11"
          )}
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src="/icons/icon-192.png"
          alt="CitaBella"
          className={cn(
            "shrink-0 rounded-xl object-cover",
            compact ? "h-8 w-8" : "h-11 w-11"
          )}
        />
      )}
      <span
        className={cn(
          "truncate font-semibold tracking-tight text-foreground",
          compact ? "text-base" : "text-xl"
        )}
      >
        {nombre}
      </span>
    </div>
  );
}
