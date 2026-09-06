import Link from "next/link";
import { VitrinaPortfolioGallery } from "@/components/vitrina/VitrinaPortfolioGallery";
import { getWhatsAppHref } from "@/lib/vitrina/resolve-content";
import type { VitrinaResolved } from "@/lib/vitrina/types";

type Props = {
  content: VitrinaResolved;
};

const AGENDAR_STEPS = [
  "Elige el servicio",
  "Escoge día y hora",
  "Confirma tu anticipo según las instrucciones",
];

function AgendarButton({
  href,
  className,
}: {
  href: string;
  className?: string;
}) {
  return (
    <Link href={href} className={className ?? "vitrina-cta"}>
      Agendar cita
    </Link>
  );
}

export function VitrinaLanding({ content }: Props) {
  const wa = getWhatsAppHref(content.contact.whatsapp);
  const hasPortfolioPhotos = content.portfolioImages.length > 0;
  const portfolioPlaceholders = Array.from(
    { length: content.portfolioCount },
    (_, i) => i + 1
  );

  return (
    <div
      className={`vitrina-root vitrina-theme-${content.theme}${content.isDemo ? " vitrina-is-demo" : ""}`}
      data-slug={content.slug}
    >
      {content.isDemo ? (
        <p className="vitrina-demo-banner" role="note">
          Vista de ejemplo · fotos ilustrativas (no del salón). Así se ve
          terminada para clientas y para el taller.
        </p>
      ) : null}

      <header className="vitrina-hero">
        <div
          className={`vitrina-hero-bg${content.heroImageUrl ? " vitrina-hero-bg--photo" : ""}`}
          style={
            content.heroImageUrl
              ? { backgroundImage: `url(${content.heroImageUrl})` }
              : undefined
          }
          aria-hidden
        />
        <div className="vitrina-hero-inner">
          {content.logoSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={content.logoSrc}
              alt=""
              className="vitrina-logo"
              width={72}
              height={72}
            />
          ) : null}
          <h1 className="vitrina-brand">{content.salonName}</h1>
          <p className="vitrina-tagline">{content.tagline}</p>
          <AgendarButton href={content.bookingUrl} />
        </div>
      </header>

      <main>
        <section className="vitrina-section" aria-labelledby="vitrina-about">
          <h2 id="vitrina-about">Sobre el salón</h2>
          <p className="vitrina-prose">{content.about}</p>
        </section>

        <section className="vitrina-section" aria-labelledby="vitrina-services">
          <h2 id="vitrina-services">Servicios</h2>
          <p className="vitrina-section-lead">
            {content.servicesFromCatalog
              ? "Selección del catálogo. Precios y cupos al agendar."
              : content.isDemo
                ? "Ejemplos de servicios. En la versión real salen los tuyos."
                : "Consulta disponibilidad y precios al agendar."}
          </p>
          <ul className="vitrina-services">
            {content.services.map((s) => (
              <li key={s.name}>
                <span className="vitrina-service-name">{s.name}</span>
                {s.description ? (
                  <span className="vitrina-service-desc">{s.description}</span>
                ) : null}
              </li>
            ))}
          </ul>
        </section>

        <section className="vitrina-section" aria-labelledby="vitrina-portfolio">
          <h2 id="vitrina-portfolio">Trabajos</h2>
          <p className="vitrina-section-lead">
            {hasPortfolioPhotos
              ? content.isDemo
                ? "Galería de ejemplo. En producción van fotos reales del salón."
                : "Toca una foto para ampliarla."
              : "Galería placeholder — aquí irán fotos reales del salón."}
          </p>
          {hasPortfolioPhotos ? (
            <VitrinaPortfolioGallery images={content.portfolioImages} />
          ) : (
            <div className="vitrina-portfolio" role="list">
              {portfolioPlaceholders.map((item) => (
                <div
                  key={item}
                  className={`vitrina-portfolio-slot vitrina-portfolio-slot-${(item % 3) + 1}`}
                  role="listitem"
                >
                  <span>Foto {item}</span>
                </div>
              ))}
            </div>
          )}
          <div className="vitrina-cta-wrap">
            <AgendarButton href={content.bookingUrl} />
          </div>
        </section>

        <section className="vitrina-section" aria-labelledby="vitrina-how">
          <h2 id="vitrina-how">Cómo agendar</h2>
          <ol className="vitrina-steps">
            {AGENDAR_STEPS.map((step, i) => (
              <li key={step}>
                <span className="vitrina-step-num" aria-hidden>
                  {i + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
          <div className="vitrina-cta-wrap">
            <AgendarButton href={content.bookingUrl} />
          </div>
        </section>

        <section className="vitrina-section" aria-labelledby="vitrina-contact">
          <h2 id="vitrina-contact">Ubicación y contacto</h2>
          <dl className="vitrina-contact">
            <div>
              <dt>Zona</dt>
              <dd>{content.contact.zone}</dd>
            </div>
            <div>
              <dt>Horario</dt>
              <dd>{content.contact.hours}</dd>
            </div>
            {wa ? (
              <div>
                <dt>WhatsApp</dt>
                <dd>
                  <a href={wa} target="_blank" rel="noopener noreferrer">
                    Escribir por WhatsApp
                  </a>
                </dd>
              </div>
            ) : null}
          </dl>
          {content.contact.mapsEmbedUrl || content.contact.mapsUrl ? (
            <div className="vitrina-map-block">
              {content.contact.mapsEmbedUrl ? (
                <div className="vitrina-map-frame">
                  <iframe
                    title="Ubicación del salón"
                    src={content.contact.mapsEmbedUrl}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    allowFullScreen
                  />
                </div>
              ) : null}
              {content.contact.mapsUrl ? (
                <a
                  className="vitrina-map-link"
                  href={content.contact.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Abrir en Google Maps
                </a>
              ) : null}
            </div>
          ) : null}
        </section>
      </main>

      <footer className="vitrina-footer">
        <p>{content.salonName}</p>
        <p className="vitrina-footer-credit">
          Agenda con{" "}
          <a
            href="https://www.gotacheck.app"
            target="_blank"
            rel="noopener noreferrer"
          >
            Gota+Check
          </a>
        </p>
      </footer>
    </div>
  );
}
