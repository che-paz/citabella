import { cn } from "@/lib/utils";

type MobileActionBarProps = {
  children: React.ReactNode;
  className?: string;
};

/** Full-width action buttons on mobile; inline on sm+. */
export function MobileActionBar({ children, className }: MobileActionBarProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center",
        className
      )}
    >
      {children}
    </div>
  );
}
