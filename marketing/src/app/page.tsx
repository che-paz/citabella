import Image from "next/image";
import { Reveal } from "@/components/Reveal";
import { getAppUrl, getWhatsAppUrl } from "@/lib/site";

const packages = [
  {
    sku: "A",
    name: "Agenda",
    badge: "Con periodo de prueba",
    summary: "Tu agenda digital bajo Gota+Check.",
    detail:
      "Citas ordenadas, link de reserva para tus clientas y panel para ti y tu equipo. Sin pelear con el chat.",
    includes: [
      "Link de reserva para clientas",
      "Panel de agenda y pagos por comprobante",
      "Alta acompañada",
    ],
  },
  {
    sku: "V",
    name: "Vitrina",
    badge: "Dominio 1er año incluido",
    summary: "Agenda + tu dominio + página hecha por el estudio.",
    detail:
      "Montamos tu presencia web con la info y fotos que nos pases. Sin editor complicado ni tienda online.",
    includes: [
      "Todo lo de Agenda",
      "Dominio propio el primer año",
      "Landing con CTA para agendar",
      "Renovación de dominio acompañada",
    ],
  },
] as const;

const founders = [
  {
    name: "Salón Tutis",
    href: "https://www.estudiotutis.com",
    note: "Agenda y vitrina en vivo",
  },
  {
    name: "Galaxy Barbería Infantil",
    href: "https://www.galaxybarberiagt.com",
    note: "Agenda y vitrina en vivo",
  },
] as const;

function CtaGroup({
  whatsappUrl,
  appUrl,
  primaryClassName,
  primaryLabel = "Solicitar acceso por WhatsApp",
}: {
  whatsappUrl: string;
  appUrl: string | null;
  primaryClassName?: string;
  primaryLabel?: string;
}) {
  return (
    <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={
          primaryClassName ??
          "inline-flex w-full items-center justify-center rounded-xl bg-rose-deep px-5 py-3.5 text-center text-[0.95rem] font-semibold leading-snug text-white transition duration-200 hover:-translate-y-0.5 hover:bg-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-deep sm:w-auto sm:px-6 sm:text-base"
        }
      >
        {primaryLabel}
      </a>
      {appUrl ? (
        <a
          href={appUrl}
          className="inline-flex w-full items-center justify-center rounded-xl px-5 py-3 text-center text-base font-medium text-ink underline-offset-4 transition duration-200 hover:text-rose-deep hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose sm:w-auto sm:px-6 sm:py-3.5"
        >
          Ya tengo cuenta
        </a>
      ) : null}
    </div>
  );
}

export default function HomePage() {
  const whatsappUrl = getWhatsAppUrl();
  const pricesWhatsAppUrl = getWhatsAppUrl(
    "Hola, quiero consultar los precios de Gota+Check (Agenda / Vitrina)."
  );
  const appUrlRaw = getAppUrl();
  const appUrl = appUrlRaw.length > 0 ? appUrlRaw : null;

  return (
    <div className="atmosphere grain min-h-screen overflow-x-clip">
      <main className="relative z-10">
        {/* Hero — one composition */}
        <section className="relative flex min-h-[100svh] flex-col justify-center overflow-x-clip px-5 pb-12 pt-8 sm:px-10 sm:pb-16 sm:pt-10 lg:px-16">
          <div className="mx-auto grid w-full max-w-6xl items-center gap-8 sm:gap-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-12 xl:gap-16">
            <div className="order-2 min-w-0 lg:order-1">
              <h1 className="animate-fade-up font-display text-[2.125rem] font-extrabold leading-[1.05] tracking-tight text-ink sm:text-5xl lg:text-[clamp(2.75rem,4.6vw,4.25rem)]">
                Gota+Check
              </h1>
              <p className="animate-fade-up mt-4 max-w-xl font-display text-xl font-semibold leading-snug tracking-tight text-ink sm:mt-5 sm:text-3xl lg:text-[1.75rem] xl:text-[2rem] [animation-delay:120ms]">
                Tu agenda de salón, sin el caos del WhatsApp.
              </p>
              <p className="animate-fade-up mt-3 max-w-md text-base leading-relaxed text-muted sm:mt-4 sm:text-lg [animation-delay:220ms]">
                Para salones, maquillistas y barberías en Guatemala y
                Centroamérica. Agenda clara, link para reservar y, si quieres,
                tu página con dominio propio.
              </p>
              <div className="animate-fade-up mt-7 sm:mt-8 [animation-delay:320ms]">
                <CtaGroup whatsappUrl={whatsappUrl} appUrl={appUrl} />
              </div>
            </div>

            <div className="animate-fade-in order-1 flex justify-center lg:order-2 lg:justify-end [animation-delay:180ms]">
              <div className="relative w-36 max-w-full overflow-hidden sm:w-52 lg:w-full lg:max-w-[22rem]">
                <div
                  aria-hidden
                  className="pointer-events-none absolute -inset-6 rounded-full bg-rose-soft/40 blur-3xl sm:-inset-8"
                />
                <Image
                  src="/logo.png"
                  alt="Logo Gota+Check"
                  width={420}
                  height={420}
                  priority
                  className="relative h-auto w-full drop-shadow-sm"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Dolor */}
        <section className="px-5 py-14 sm:px-10 sm:py-20 lg:px-16">
          <div className="mx-auto max-w-3xl">
            <Reveal>
              <h2 className="font-display text-[1.75rem] font-bold leading-tight tracking-tight text-ink sm:text-4xl">
                ¿Te suena familiar?
              </h2>
              <p className="mt-3 text-base leading-relaxed text-muted sm:mt-4 sm:text-lg">
                Las citas viven en chats y en papel. Confirmás a mano. Las
                clientas no encuentran un lugar claro para reservar. Y sin página
                web, tu salón se ve menos de lo que es.
              </p>
            </Reveal>
          </div>
        </section>

        {/* Promesa */}
        <section className="px-5 py-14 sm:px-10 sm:py-20 lg:px-16">
          <div className="mx-auto max-w-3xl">
            <Reveal>
              <h2 className="font-display text-[1.75rem] font-bold leading-tight tracking-tight text-ink sm:text-4xl">
                Una agenda clara. Un link para reservar. Tu marca al frente.
              </h2>
              <p className="mt-3 text-base leading-relaxed text-muted sm:mt-4 sm:text-lg">
                Gota+Check ordena tu día a día y les da a tus clientas una forma
                simple de pedir cita. Si quieres presencia web, el estudio te
                monta la vitrina con tu dominio — sin tienda ni complicaciones.
              </p>
            </Reveal>
          </div>
        </section>

        {/* Paquetes — sin precios públicos */}
        <section className="px-5 py-14 sm:px-10 sm:py-20 lg:px-16">
          <div className="mx-auto max-w-5xl">
            <Reveal>
              <h2 className="font-display text-[1.75rem] font-bold leading-tight tracking-tight text-ink sm:text-4xl">
                Dos formas de empezar
              </h2>
              <p className="mt-3 max-w-2xl text-base text-muted sm:text-lg">
                Alta acompañada — no es self-serve masivo. Los precios te los
                contamos por WhatsApp.
              </p>
            </Reveal>

            <div className="mt-10 grid gap-10 sm:mt-12 md:grid-cols-2 md:gap-14">
              {packages.map((pkg, index) => (
                <Reveal key={pkg.sku} delayMs={index * 90}>
                  <article className="h-full min-w-0 border-t border-rose-soft/70 pt-5 sm:pt-6">
                    <p className="font-display text-xs font-semibold uppercase leading-snug tracking-[0.12em] text-rose-deep sm:text-sm sm:tracking-[0.18em]">
                      {pkg.badge}
                    </p>
                    <h3 className="mt-2 font-display text-xl font-bold text-ink sm:mt-3 sm:text-2xl">
                      {pkg.name}
                    </h3>
                    <p className="mt-3 text-base font-medium text-ink sm:mt-4">
                      {pkg.summary}
                    </p>
                    <p className="mt-2 text-base leading-relaxed text-muted sm:mt-3">
                      {pkg.detail}
                    </p>
                    <ul className="mt-4 space-y-2 text-base text-muted sm:mt-5">
                      {pkg.includes.map((item) => (
                        <li key={item} className="flex gap-2.5">
                          <span
                            aria-hidden
                            className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-rose-deep"
                          />
                          <span className="min-w-0 leading-relaxed">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </article>
                </Reveal>
              ))}
            </div>

            <Reveal delayMs={120}>
              <div className="mt-10 max-w-xl sm:mt-12">
                <p className="text-base leading-relaxed text-muted">
                  Vitrina con cupo mensual cuando nos pases la info completa. No
                  incluye sesión de fotos ni editor para editar sola — nosotros
                  montamos la página contigo.
                </p>
                <a
                  href={pricesWhatsAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-flex w-full items-center justify-center rounded-xl border border-rose-deep/40 bg-white/70 px-5 py-3.5 text-center text-[0.95rem] font-semibold text-rose-deep transition duration-200 hover:-translate-y-0.5 hover:border-rose-deep hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-deep sm:w-auto sm:px-6 sm:text-base"
                >
                  Consultar precios por WhatsApp
                </a>
              </div>
            </Reveal>
          </div>
        </section>

        {/* Prueba social */}
        <section className="px-5 py-14 sm:px-10 sm:py-20 lg:px-16">
          <div className="mx-auto max-w-3xl">
            <Reveal>
              <h2 className="font-display text-[1.75rem] font-bold leading-tight tracking-tight text-ink sm:text-4xl">
                Ya lo usan salones en Guatemala
              </h2>
              <p className="mt-3 text-base leading-relaxed text-muted sm:mt-4 sm:text-lg">
                Founders con agenda y vitrina en dominio propio. Míralos y
                escríbenos si quieres entrar en la oleada acompañada.
              </p>
              <ul className="mt-6 space-y-5 sm:mt-8">
                {founders.map((f) => (
                  <li key={f.href} className="min-w-0">
                    <a
                      href={f.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group inline-flex max-w-full flex-wrap items-baseline gap-x-2 font-display text-lg font-semibold text-ink transition hover:text-rose-deep sm:text-xl"
                    >
                      <span className="min-w-0 break-words">{f.name}</span>
                      <span className="shrink-0 text-rose-deep transition group-hover:translate-x-0.5">
                        →
                      </span>
                    </a>
                    <p className="mt-1 text-sm text-muted">{f.note}</p>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </section>

        {/* CTA final */}
        <section className="px-5 py-14 sm:px-10 sm:py-20 lg:px-16">
          <div className="mx-auto max-w-3xl">
            <Reveal>
              <h2 className="font-display text-[1.75rem] font-bold leading-tight tracking-tight text-ink sm:text-4xl">
                ¿Listas para ordenar la agenda?
              </h2>
              <p className="mt-3 text-base text-muted sm:mt-4 sm:text-lg">
                Cuéntanos de tu salón por WhatsApp. Te explicamos opciones,
                precios y cómo empezar.
              </p>
              <div className="mt-7 sm:mt-8">
                <CtaGroup
                  whatsappUrl={whatsappUrl}
                  appUrl={appUrl}
                  primaryLabel="Escribir por WhatsApp"
                />
              </div>
            </Reveal>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-sand px-5 py-8 sm:px-10 sm:py-10 lg:px-16">
        <div className="mx-auto flex max-w-5xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <p className="font-display text-lg font-bold text-ink">Gota+Check</p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <a
              href="/ayuda"
              className="text-sm font-medium text-muted transition hover:text-rose-deep"
            >
              Ayuda
            </a>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-muted transition hover:text-rose-deep"
            >
              WhatsApp
            </a>
          </div>
          <p className="text-xs text-muted/80">Hecho por VajaLabs</p>
        </div>
      </footer>
    </div>
  );
}
