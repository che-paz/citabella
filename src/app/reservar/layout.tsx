import "./reservar.css";

/** Public booking must never serve a stale “salón no encontrado”. */
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export default function ReservarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="reservar-root">{children}</div>;
}
