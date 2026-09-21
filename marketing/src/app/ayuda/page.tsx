import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter, SiteHeader } from "@/components/ayuda/SiteChrome";
import { getWhatsAppUrl } from "@/lib/site";
import { GUIDES } from "@/lib/ayuda";

export const metadata: Metadata = {
  title: "Ayuda — Gota+Check",
  description:
    "Guías cortas para entrar, configurar horarios, catálogo, link de reserva y validar pagos.",
};

export default function AyudaIndexPage() {
  const whatsappUrl = getWhatsAppUrl();

  return (
    <div className="atmosphere grain min-h-screen overflow-x-clip">
      <SiteHeader current="ayuda" />
      <main className="relative z-10 px-5 py-10 sm:px-10 sm:py-14 lg:px-16">
        <div className="mx-auto max-w-3xl">
          <p className="text-sm font-medium text-rose-deep">Ayuda</p>
          <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
            Guías rápidas
          </h1>
          <p className="mt-3 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
            Pasos cortos para poner tu agenda en marcha. Texto primero; las
            capturas se van sumando. Si algo no cuadra, escribinos.
          </p>

          <ol className="mt-10 space-y-3">
            {GUIDES.map((guide, index) => (
              <li key={guide.slug}>
                <Link
                  href={`/ayuda/${guide.slug}`}
                  className="group flex gap-4 rounded-2xl border border-sand bg-white/50 px-4 py-4 transition duration-200 hover:-translate-y-0.5 hover:border-rose-soft hover:bg-white/80 sm:px-5 sm:py-5"
                >
                  <span
                    className="font-display text-2xl font-bold tabular-nums text-rose-soft/90 group-hover:text-rose"
                    aria-hidden
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-display text-lg font-semibold tracking-tight text-ink sm:text-xl">
                      {guide.title}
                    </span>
                    <span className="mt-1 block text-sm leading-relaxed text-muted">
                      {guide.summary}
                    </span>
                    <span className="mt-2 block text-xs text-muted/80">
                      ~{guide.minutes} min · {guide.where}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ol>

          <p className="mt-10 text-sm leading-relaxed text-muted">
            ¿No encontrás lo que buscás?{" "}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-rose-deep underline-offset-4 hover:underline"
            >
              WhatsApp de soporte
            </a>
            .
          </p>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
