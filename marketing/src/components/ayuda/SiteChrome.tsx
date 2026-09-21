import Link from "next/link";
import { getAppUrl, getWhatsAppUrl } from "@/lib/site";

export function SiteHeader({ current }: { current?: "home" | "ayuda" }) {
  const appUrl = getAppUrl();

  return (
    <header className="relative z-10 border-b border-sand/80 px-5 py-4 sm:px-10 lg:px-16">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-4">
        <Link
          href="/"
          className="font-display text-lg font-bold tracking-tight text-ink transition hover:text-rose-deep"
        >
          Gota+Check
        </Link>
        <nav className="flex items-center gap-4 text-sm font-medium">
          <Link
            href="/ayuda"
            className={
              current === "ayuda"
                ? "text-ink"
                : "text-muted transition hover:text-rose-deep"
            }
            aria-current={current === "ayuda" ? "page" : undefined}
          >
            Ayuda
          </Link>
          {appUrl ? (
            <a
              href={appUrl}
              className="text-muted transition hover:text-rose-deep"
            >
              Entrar
            </a>
          ) : null}
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  const whatsappUrl = getWhatsAppUrl();

  return (
    <footer className="relative z-10 border-t border-sand px-5 py-8 sm:px-10 sm:py-10 lg:px-16">
      <div className="mx-auto flex max-w-3xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <Link href="/" className="font-display text-lg font-bold text-ink">
          Gota+Check
        </Link>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-medium">
          <Link
            href="/ayuda"
            className="text-muted transition hover:text-rose-deep"
          >
            Ayuda
          </Link>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted transition hover:text-rose-deep"
          >
            WhatsApp
          </a>
        </div>
        <p className="text-xs text-muted/80">Hecho por VajaLabs</p>
      </div>
    </footer>
  );
}
