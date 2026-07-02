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
            "shrink-0 rounded-xl object-contain",
            compact ? "h-9 w-9" : "h-12 w-12"
          )}
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src="/icons/logogotacheck.png"
          alt="Gota+Check"
          className={cn(
            "shrink-0 object-contain",
            compact ? "h-10 w-auto max-h-10" : "h-14 w-auto max-h-14"
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
