import Link from "next/link";
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
  const portfolioSlots = Array.from(
    { length: content.portfolioCount },
    (_, i) => i + 1
  );

  return (
    <div
      className={`vitrina-root vitrina-theme-${content.theme}`}
      data-slug={content.slug}
    >
      <header className="vitrina-hero">
        <div className="vitrina-hero-bg" aria-hidden />
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
              : "Lista de ejemplo hasta cargar el catálogo o el editor."}
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
            Galería placeholder — aquí irán fotos reales del salón.
          </p>
          <div className="vitrina-portfolio" role="list">
            {portfolioSlots.map((n) => (
              <div
                key={n}
                className={`vitrina-portfolio-slot vitrina-portfolio-slot-${(n % 3) + 1}`}
                role="listitem"
              >
                <span>Foto {n}</span>
              </div>
            ))}
          </div>
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
            {content.contact.mapsUrl ? (
              <div>
                <dt>Mapa</dt>
                <dd>
                  <a
                    href={content.contact.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Ver en Google Maps
                  </a>
                </dd>
              </div>
            ) : null}
          </dl>
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
