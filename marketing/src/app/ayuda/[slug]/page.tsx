import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { GuideScreenshot } from "@/components/ayuda/GuideScreenshot";
import { SiteFooter, SiteHeader } from "@/components/ayuda/SiteChrome";
import { getAppUrl, getWhatsAppUrl } from "@/lib/site";
import { getAllGuideSlugs, getGuide, GUIDES } from "@/lib/ayuda";

type PageProps = {
  params: { slug: string };
};

export function generateStaticParams() {
  return getAllGuideSlugs().map((slug) => ({ slug }));
}

export function generateMetadata({ params }: PageProps): Metadata {
  const guide = getGuide(params.slug);
  if (!guide) return { title: "Ayuda — Gota+Check" };
  return {
    title: `${guide.title} — Ayuda Gota+Check`,
    description: guide.summary,
  };
}

export default function AyudaGuidePage({ params }: PageProps) {
  const guide = getGuide(params.slug);
  if (!guide) notFound();

  const whatsappUrl = getWhatsAppUrl();
  const appUrl = getAppUrl();
  const index = GUIDES.findIndex((g) => g.slug === guide.slug);
  const prev = index > 0 ? GUIDES[index - 1] : null;
  const next = index < GUIDES.length - 1 ? GUIDES[index + 1] : null;

  return (
    <div className="atmosphere grain min-h-screen overflow-x-clip">
      <SiteHeader current="ayuda" />
      <main className="relative z-10 px-5 py-10 sm:px-10 sm:py-14 lg:px-16">
        <article className="mx-auto max-w-3xl">
          <p className="text-sm font-medium text-muted">
            <Link href="/ayuda" className="hover:text-rose-deep">
              Ayuda
            </Link>
            <span aria-hidden className="mx-2 text-sand">
              /
            </span>
            <span className="text-ink">{guide.title}</span>
          </p>

          <h1 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
            {guide.title}
          </h1>
          <p className="mt-3 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
            {guide.summary}
          </p>
          <p className="mt-2 text-sm text-muted/80">
            ~{guide.minutes} min · {guide.where}
          </p>

          <ol className="mt-10 space-y-10">
            {guide.steps.map((step, i) => (
              <li key={step.title} className="scroll-mt-8">
                <h2 className="font-display text-xl font-semibold tracking-tight text-ink sm:text-2xl">
                  <span className="text-rose">{i + 1}.</span> {step.title}
                </h2>
                <p className="mt-2 text-base leading-relaxed text-muted">
                  {step.body}
                </p>
                {step.screenshot ? (
                  <div className="mt-4">
                    <GuideScreenshot
                      slug={guide.slug}
                      filename={step.screenshot}
                      alt={step.screenshotAlt ?? step.title}
                    />
                  </div>
                ) : null}
              </li>
            ))}
          </ol>

          {guide.tip ? (
            <aside className="mt-10 rounded-2xl border border-sand bg-white/50 px-4 py-4 sm:px-5">
              <p className="text-sm font-semibold text-ink">Tip</p>
              <p className="mt-1 text-sm leading-relaxed text-muted">
                {guide.tip}
              </p>
            </aside>
          ) : null}

          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            {appUrl ? (
              <a
                href={appUrl}
                className="inline-flex items-center justify-center rounded-xl bg-rose-deep px-5 py-3 text-sm font-semibold text-white transition hover:bg-ink"
              >
                Ir al panel
              </a>
            ) : null}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-medium text-ink underline-offset-4 hover:text-rose-deep hover:underline"
            >
              ¿Dudas? WhatsApp
            </a>
          </div>

          <nav
            className="mt-14 flex flex-col gap-4 border-t border-sand pt-8 sm:flex-row sm:justify-between"
            aria-label="Guías anterior y siguiente"
          >
            {prev ? (
              <Link
                href={`/ayuda/${prev.slug}`}
                className="text-sm text-muted transition hover:text-rose-deep"
              >
                ← {prev.title}
              </Link>
            ) : (
              <span />
            )}
            {next ? (
              <Link
                href={`/ayuda/${next.slug}`}
                className="text-sm text-muted transition hover:text-rose-deep sm:text-right"
              >
                {next.title} →
              </Link>
            ) : (
              <Link
                href="/ayuda"
                className="text-sm text-muted transition hover:text-rose-deep sm:text-right"
              >
                Todas las guías →
              </Link>
            )}
          </nav>
        </article>
      </main>
      <SiteFooter />
    </div>
  );
}
