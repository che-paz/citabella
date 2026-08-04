import Image from "next/image";
import { Reveal } from "@/components/Reveal";
import { getAppUrl, getWhatsAppUrl } from "@/lib/site";

const packages = [
  {
    sku: "A",
    name: "Agenda",
    summary: "Tu agenda digital bajo Gota+Check.",
    detail:
      "Citas ordenadas, link de reserva para tus clientas y panel para ti y tu equipo. Sin pelear con el chat.",
  },
  {
    sku: "B",
    name: "Vitrina",
    summary: "Agenda + tu dominio + una página simple.",
    detail:
      "Todo lo de Agenda, más un dominio propio y una landing con plantilla que puedes rellenar: servicios, fotos y botón para agendar.",
  },
  {
    sku: "C",
    name: "Presencia",
    summary: "Vitrina + sesión de fotos.",
    detail:
      "Todo lo de Vitrina, más una sesión de fotos para tu página. Diseño asistido opcional, con cupo limitado.",
  },
] as const;

function CtaGroup({
  whatsappUrl,
  appUrl,
  primaryClassName,
}: {
  whatsappUrl: string;
  appUrl: string | null;
  primaryClassName?: string;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={
          primaryClassName ??
          "inline-flex items-center justify-center rounded-xl bg-rose-deep px-6 py-3.5 text-center text-base font-semibold text-white transition duration-200 hover:-translate-y-0.5 hover:bg-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-deep"
        }
      >
        Solicitar acceso por WhatsApp
      </a>
      {appUrl ? (
        <a
          href={appUrl}
          className="inline-flex items-center justify-center rounded-xl px-6 py-3.5 text-center text-base font-medium text-ink underline-offset-4 transition duration-200 hover:text-rose-deep hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose"
        >
          Ya tengo cuenta
        </a>
      ) : null}
    </div>
  );
}

export default function HomePage() {
  const whatsappUrl = getWhatsAppUrl();
  const appUrlRaw = getAppUrl();
  const appUrl = appUrlRaw.length > 0 ? appUrlRaw : null;

  return (
    <div className="atmosphere grain min-h-screen">
      <main className="relative z-10">
        {/* Hero — one composition */}
        <section className="relative flex min-h-[100svh] flex-col justify-center overflow-hidden px-6 pb-16 pt-10 sm:px-10 lg:px-16">
          <div className="mx-auto grid w-full max-w-6xl items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
            <div className="order-2 lg:order-1">
              <p className="animate-fade-up font-display text-5xl font-extrabold tracking-tight text-ink sm:text-6xl md:text-7xl lg:text-[5.25rem]">
                Gota+Check
              </p>
              <h1 className="animate-fade-up mt-5 max-w-xl font-display text-2xl font-semibold leading-snug tracking-tight text-ink sm:text-3xl md:text-[2rem] [animation-delay:120ms]">
                Tu agenda de salón, sin el caos del WhatsApp.
              </h1>
              <p className="animate-fade-up mt-4 max-w-md text-lg leading-relaxed text-muted [animation-delay:220ms]">
                Para salones, maquillistas y barberías en Guatemala y
                Centroamérica que quieren orden, menos no-shows y una presencia
                clara.
              </p>
              <div className="animate-fade-up mt-8 [animation-delay:320ms]">
                <CtaGroup whatsappUrl={whatsappUrl} appUrl={appUrl} />
              </div>
            </div>

            <div className="animate-fade-in order-1 flex justify-center lg:order-2 [animation-delay:180ms]">
              <div className="relative">
                <div
                  aria-hidden
                  className="absolute -inset-10 rounded-full bg-rose-soft/40 blur-3xl"
                />
                <Image
                  src="/logo.png"
                  alt="Logo Gota+Check"
                  width={420}
                  height={420}
                  priority
                  className="relative h-auto w-[min(72vw,22rem)] drop-shadow-sm sm:w-[min(60vw,26rem)]"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Dolor */}
        <section className="px-6 py-20 sm:px-10 lg:px-16">
          <div className="mx-auto max-w-3xl">
            <Reveal>
              <h2 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
                ¿Te suena familiar?
              </h2>
              <p className="mt-4 text-lg leading-relaxed text-muted">
                Las citas viven en chats y en papel. Confirmás a mano. Las
                clientas no encuentran un lugar claro para reservar. Y sin página
                web, tu salón se ve menos de lo que es.
              </p>
            </Reveal>
          </div>
        </section>

        {/* Promesa */}
        <section className="px-6 py-20 sm:px-10 lg:px-16">
          <div className="mx-auto max-w-3xl">
            <Reveal>
              <h2 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
                Una agenda clara. Un link para reservar. Tu marca al frente.
              </h2>
              <p className="mt-4 text-lg leading-relaxed text-muted">
                Gota+Check ordena tu día a día y les da a tus clientas una forma
                simple de pedir cita. Si quieres más, también te ayudamos con
                dominio y una vitrina web — sin tienda ni complicaciones.
              </p>
            </Reveal>
          </div>
        </section>

        {/* Paquetes */}
        <section className="px-6 py-20 sm:px-10 lg:px-16">
          <div className="mx-auto max-w-5xl">
            <Reveal>
              <h2 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
                Tres formas de empezar
              </h2>
              <p className="mt-3 max-w-2xl text-lg text-muted">
                Elegí el paquete que encaje con tu salón. Los precios los
                conversamos al solicitar acceso.
              </p>
            </Reveal>

            <div className="mt-12 grid gap-10 md:grid-cols-3 md:gap-8">
              {packages.map((pkg, index) => (
                <Reveal key={pkg.sku} delayMs={index * 90}>
                  <article className="h-full border-t border-rose-soft/70 pt-6">
                    <p className="font-display text-sm font-semibold uppercase tracking-[0.18em] text-rose-deep">
                      {pkg.sku}
                    </p>
                    <h3 className="mt-3 font-display text-2xl font-bold text-ink">
                      {pkg.name}
                    </h3>
                    <p className="mt-2 text-base font-medium text-ink">
                      {pkg.summary}
                    </p>
                    <p className="mt-3 text-base leading-relaxed text-muted">
                      {pkg.detail}
                    </p>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Prueba social */}
        <section className="px-6 py-20 sm:px-10 lg:px-16">
          <div className="mx-auto max-w-3xl">
            <Reveal>
              <h2 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
                Ya lo usan salones en Guatemala
              </h2>
              <p className="mt-4 text-lg leading-relaxed text-muted">
                Founders como Salón Tutis y Galaxy Barbería Infantil ya trabajan
                con la agenda en el día a día. Estamos abriendo acceso de forma
                acompañada — escríbenos y te contamos cómo entrar.
              </p>
            </Reveal>
          </div>
        </section>

        {/* CTA final */}
        <section className="px-6 py-20 sm:px-10 lg:px-16">
          <div className="mx-auto max-w-3xl">
            <Reveal>
              <h2 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
                ¿Listas para ordenar la agenda?
              </h2>
              <p className="mt-4 text-lg text-muted">
                Cuéntanos de tu salón por WhatsApp. Te guiamos paso a paso.
              </p>
              <div className="mt-8">
                <CtaGroup whatsappUrl={whatsappUrl} appUrl={appUrl} />
              </div>
            </Reveal>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-sand px-6 py-10 sm:px-10 lg:px-16">
        <div className="mx-auto flex max-w-5xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-display text-lg font-bold text-ink">Gota+Check</p>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-muted transition hover:text-rose-deep"
          >
            WhatsApp
          </a>
          <p className="text-xs text-muted/80">Hecho por VajaLabs</p>
        </div>
      </footer>
    </div>
  );
}
