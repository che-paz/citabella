import type { Metadata } from "next";
import Image from "next/image";
import type { ReactNode } from "react";
import { Reveal } from "@/components/Reveal";
import { PhoneFrame } from "@/components/landing/PhoneFrame";
import { getAppUrl, getWhatsAppUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Gota+Check — Vista previa del rediseño",
  robots: { index: false, follow: false },
};

const PRICES_PREFILL =
  "Hola, quiero consultar los precios de Gota+Check (Agenda / Vitrina).";
const DEMO_PREFILL = "Hola, quiero ver una demo de Gota+Check para mi salón.";

const audiences = [
  "Salones de belleza",
  "Barberías",
  "Maquillistas",
  "Cejas y pestañas",
  "Uñas",
  "Barbería infantil",
] as const;

const steps = [
  {
    n: "1",
    title: "Compartes tu link",
    body: "Lo pegas en tu WhatsApp, Instagram o Facebook. Tus clientes no descargan nada ni crean cuenta.",
    img: "/nuevo/panel-link.png",
    alt: "Panel con el link de reserva listo para copiar",
  },
  {
    n: "2",
    title: "Tu cliente elige servicio y hora",
    body: "Ve tu catálogo con precios y solo los horarios libres. Reserva en menos de un minuto, desde el celular.",
    img: "/nuevo/reservar-galaxy.jpg",
    alt: "Página de reserva de Galaxy Barbería Infantil",
  },
  {
    n: "3",
    title: "Validas el pago y confirmas",
    body: "Revisas el comprobante, apruebas con un toque y le avisas por WhatsApp con el mensaje ya escrito.",
    img: "/nuevo/panel-pagos.png",
    alt: "Pantalla de pagos por validar con botón de confirmar por WhatsApp",
  },
] as const;

const features: { title: string; body: string; icon: ReactNode }[] = [
  {
    title: "Agenda día, semana y mes",
    body: "Todo tu salón en una vista. Sin cruces: el sistema bloquea horarios ocupados.",
    icon: <IconCalendar />,
  },
  {
    title: "Link de reserva 24/7",
    body: "Tus clientes reservan aunque estés atendiendo o fuera de horario.",
    icon: <IconLink />,
  },
  {
    title: "Anticipos por comprobante",
    body: "Transferencia o efectivo. Tú decides qué se confirma.",
    icon: <IconCard />,
  },
  {
    title: "Aviso en tu celular",
    body: "Te llega una notificación cada vez que entra una reserva.",
    icon: <IconBell />,
  },
  {
    title: "Horarios y almuerzo",
    body: "Define tus días, horas y pausa. El link solo muestra lo disponible.",
    icon: <IconClock />,
  },
  {
    title: "Clientes y equipo",
    body: "Fichas de clientes y acceso para tu equipo, cada quien con su agenda.",
    icon: <IconUsers />,
  },
];

const testimonials = [
  {
    salon: "Tutis Esencia y Estilo",
    kind: "Salón de belleza",
    logo: "/nuevo/logo-tutis.png",
    quote:
      "Antes todo era por chat y se me cruzaban las citas. Ahora mando el link y las clientas reservan solas.",
    accent: "coral" as const,
  },
  {
    salon: "Galaxy Barbería Infantil",
    kind: "Barbería",
    logo: "/nuevo/logo-galaxy.png",
    quote:
      "Las mamás reservan para sus hijos desde el celular y yo veo el día completo de un vistazo.",
    accent: "violet" as const,
  },
];

const faqs = [
  {
    q: "¿Mis clientes tienen que descargar una app?",
    a: "No. Reservan desde un link que abre en el navegador del celular. Sin cuenta ni contraseña.",
  },
  {
    q: "¿Funciona en iPhone y Android?",
    a: "Sí. Tú usas el panel desde el celular o la compu, y puedes agregarlo a tu pantalla de inicio como una app.",
  },
  {
    q: "¿Cómo cobro anticipos?",
    a: "Tu cliente sube el comprobante de transferencia o elige efectivo. Tú lo validas y la cita queda confirmada.",
  },
  {
    q: "¿Necesito saber de tecnología?",
    a: "No. El alta es acompañada: te ayudamos a cargar servicios, horarios y a compartir tu link.",
  },
  {
    q: "¿Puedo tener mi propia página web?",
    a: "Sí, con Vitrina: el estudio monta tu página con tu dominio y un botón para agendar.",
  },
  {
    q: "¿Cuánto cuesta?",
    a: "Depende de si eliges Agenda o Vitrina. Escríbenos por WhatsApp y te contamos precios y cómo empezar.",
  },
];

export default function LandingPreviewPage() {
  const demoUrl = getWhatsAppUrl(DEMO_PREFILL);
  const pricesUrl = getWhatsAppUrl(PRICES_PREFILL);
  const appUrlRaw = getAppUrl();
  const appUrl = appUrlRaw.length > 0 ? appUrlRaw : null;

  return (
    <div className="min-h-screen overflow-x-clip bg-white text-lp-ink">
      <div className="bg-lp-ink px-4 py-1.5 text-center text-xs font-medium text-white/80">
        Vista previa del rediseño · no indexada
      </div>

      <header className="sticky top-0 z-30 border-b border-lp-line/80 bg-white/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3 sm:px-8">
          <a href="#inicio" className="flex items-center gap-2.5">
            <Image
              src="/logo.png"
              alt=""
              width={36}
              height={36}
              className="h-9 w-9"
            />
            <span className="font-display text-lg font-bold tracking-tight">
              Gota+Check
            </span>
          </a>
          <nav className="hidden items-center gap-7 text-sm font-semibold text-lp-muted md:flex">
            <a href="#como-funciona" className="transition hover:text-lp-ink">
              Cómo funciona
            </a>
            <a href="#vitrina" className="transition hover:text-lp-ink">
              Vitrina
            </a>
            <a href="#opiniones" className="transition hover:text-lp-ink">
              Opiniones
            </a>
            <a href="#preguntas" className="transition hover:text-lp-ink">
              Preguntas
            </a>
          </nav>
          <div className="flex items-center gap-2">
            {appUrl ? (
              <a
                href={appUrl}
                className="hidden rounded-full px-4 py-2 text-sm font-semibold text-lp-ink transition hover:bg-lp-blush sm:inline-flex"
              >
                Entrar
              </a>
            ) : null}
            <WhatsAppButton href={demoUrl} size="sm">
              Pedir demo
            </WhatsAppButton>
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section id="inicio" className="relative overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-40 -top-40 h-[34rem] w-[34rem] rounded-full bg-lp-coral/15 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -left-48 top-72 h-[28rem] w-[28rem] rounded-full bg-lp-violet/10 blur-3xl"
          />
          <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-5 pb-16 pt-10 sm:px-8 sm:pt-14 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-8 lg:pb-24 lg:pt-20">
            <div className="min-w-0">
              <p className="animate-fade-up inline-flex items-center gap-2 rounded-full bg-lp-blush px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-lp-coral-deep sm:text-[0.8rem]">
                <span className="h-1.5 w-1.5 rounded-full bg-lp-coral" />
                Salones · Barberías · Maquillistas
              </p>
              <h1 className="animate-fade-up mt-5 text-[2.35rem] font-bold leading-[1.08] tracking-tight sm:text-5xl lg:text-[3.6rem] [animation-delay:80ms]">
                Tus clientes reservan solos.{" "}
                <span className="text-lp-coral">Tú solo atiendes.</span>
              </h1>
              <p className="animate-fade-up mt-5 max-w-xl text-lg leading-relaxed text-lp-muted [animation-delay:160ms]">
                Agenda digital con link de reserva, anticipos por comprobante y
                confirmación por WhatsApp. Sin el caos del chat, desde tu
                celular.
              </p>
              <div className="animate-fade-up mt-8 flex flex-col gap-3 sm:flex-row sm:items-center [animation-delay:240ms]">
                <WhatsAppButton href={demoUrl}>
                  Quiero verlo en mi salón
                </WhatsAppButton>
                <a
                  href="#como-funciona"
                  className="inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 text-base font-semibold text-lp-ink ring-1 ring-lp-line transition hover:bg-lp-blush"
                >
                  Ver cómo funciona
                  <span aria-hidden>↓</span>
                </a>
              </div>
              <ul className="animate-fade-up mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium text-lp-muted [animation-delay:320ms]">
                <li className="flex items-center gap-2">
                  <IconCheck /> Sin app que descargar
                </li>
                <li className="flex items-center gap-2">
                  <IconCheck /> Alta acompañada
                </li>
                <li className="flex items-center gap-2">
                  <IconCheck /> Hecho en Guatemala
                </li>
              </ul>
            </div>

            <div className="animate-fade-in relative mx-auto w-full max-w-[26rem] [animation-delay:200ms] lg:max-w-none">
              <div className="relative mx-auto flex h-[25rem] max-w-[24rem] items-center justify-center sm:h-[34rem] sm:max-w-[30rem]">
                <PhoneFrame
                  src="/nuevo/panel-inicio.png"
                  alt="Panel de Gota+Check con acciones rápidas y pagos por validar"
                  className="absolute left-0 top-8 w-[50%] -rotate-6 sm:top-12"
                  priority
                />
                <PhoneFrame
                  src="/nuevo/reservar-tutis.jpg"
                  alt="Página de reserva de Tutis Esencia y Estilo con su catálogo"
                  className="absolute right-0 top-0 z-10 w-[54%] rotate-3"
                  priority
                />
                <FloatCard className="-left-2 bottom-0 z-20 sm:-left-6 sm:bottom-6">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-lp-coral text-white">
                    <IconBell />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-bold">
                      Nueva reserva
                    </span>
                    <span className="block text-xs text-lp-muted">
                      Maquillaje social · 3:00 PM
                    </span>
                  </span>
                </FloatCard>
                <FloatCard className="-right-2 top-[42%] z-20 sm:-right-8">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-lp-wa text-white">
                    <IconCheck />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-bold">
                      Pago validado
                    </span>
                    <span className="block text-xs text-lp-muted">
                      Cita confirmada
                    </span>
                  </span>
                </FloatCard>
              </div>
            </div>
          </div>
        </section>

        {/* Para quién */}
        <section className="border-y border-lp-line bg-lp-blush/60">
          <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-5 py-8 sm:px-8 lg:flex-row lg:justify-between">
            <p className="text-center text-sm font-semibold text-lp-muted lg:text-left">
              Pensado para negocios que viven de citas
            </p>
            <ul className="flex flex-wrap justify-center gap-2">
              {audiences.map((a, i) => (
                <li
                  key={a}
                  className={`rounded-full px-3.5 py-1.5 text-sm font-semibold ${
                    i % 2 === 0
                      ? "bg-white text-lp-coral-deep ring-1 ring-lp-coral/20"
                      : "bg-white text-lp-violet ring-1 ring-lp-violet/20"
                  }`}
                >
                  {a}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Cómo funciona */}
        <section id="como-funciona" className="scroll-mt-20 px-5 py-20 sm:px-8 lg:py-28">
          <div className="mx-auto max-w-6xl">
            <SectionHeading
              eyebrow="Cómo funciona"
              title="Así de fácil, en 3 pasos"
              body="Tú compartes un link. Tus clientes hacen el resto."
            />
            <div className="mt-14 space-y-20 lg:mt-20 lg:space-y-28">
              {steps.map((step, index) => (
                <Reveal key={step.n}>
                  <div
                    className={`grid items-center gap-10 lg:grid-cols-2 lg:gap-16 ${
                      index % 2 === 1 ? "lg:[&>*:first-child]:order-2" : ""
                    }`}
                  >
                    <div className="min-w-0">
                      <span
                        className={`grid h-12 w-12 place-items-center rounded-2xl text-xl font-bold text-white ${
                          index === 1 ? "bg-lp-violet" : "bg-lp-coral"
                        }`}
                      >
                        {step.n}
                      </span>
                      <h3 className="mt-5 text-2xl font-bold tracking-tight sm:text-3xl">
                        {step.title}
                      </h3>
                      <p className="mt-3 max-w-md text-lg leading-relaxed text-lp-muted">
                        {step.body}
                      </p>
                    </div>
                    <div className="relative flex justify-center">
                      <div
                        aria-hidden
                        className={`absolute inset-x-6 bottom-6 top-12 rounded-[2.5rem] ${
                          index === 1 ? "bg-lp-violet-soft" : "bg-lp-blush"
                        }`}
                      />
                      <PhoneFrame
                        src={step.img}
                        alt={step.alt}
                        className="relative w-[62%] max-w-[17.5rem]"
                      />
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Funciones */}
        <section className="border-y border-lp-line bg-gradient-to-b from-lp-blush/70 to-white px-5 py-20 sm:px-8 lg:py-28">
          <div className="mx-auto max-w-6xl">
            <SectionHeading
              eyebrow="Todo en un lugar"
              title="Lo que tu salón necesita para dejar de perder citas"
            />
            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((f, i) => (
                <Reveal key={f.title} delayMs={(i % 3) * 80}>
                  <article className="h-full rounded-3xl bg-white p-6 shadow-[0_16px_32px_-24px_rgba(29,23,24,0.3)] ring-1 ring-lp-line transition hover:-translate-y-0.5">
                    <span
                      className={`grid h-11 w-11 place-items-center rounded-2xl ${
                        i % 2 === 0
                          ? "bg-lp-blush text-lp-coral-deep"
                          : "bg-lp-violet-soft text-lp-violet"
                      }`}
                    >
                      {f.icon}
                    </span>
                    <h3 className="mt-5 text-lg font-bold">{f.title}</h3>
                    <p className="mt-2 leading-relaxed text-lp-muted">
                      {f.body}
                    </p>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Vitrina */}
        <section id="vitrina" className="scroll-mt-20 overflow-hidden px-5 py-20 sm:px-8 lg:py-28">
          <div className="mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-2">
            <Reveal>
              <p className="text-sm font-bold uppercase tracking-wider text-lp-violet">
                Vitrina
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                Tu salón con página propia y botón para agendar
              </h2>
              <p className="mt-4 max-w-lg text-lg leading-relaxed text-lp-muted">
                Montamos tu página con tu dominio, tus fotos y tus colores.
                Tus clientes te encuentran en Google y reservan directo en tu
                agenda.
              </p>
              <ul className="mt-6 space-y-3 text-base font-medium">
                <li className="flex items-start gap-3">
                  <IconCheck className="mt-0.5 text-lp-violet" /> Dominio
                  propio incluido el primer año
                </li>
                <li className="flex items-start gap-3">
                  <IconCheck className="mt-0.5 text-lp-violet" /> Diseño hecho
                  por el estudio, sin editor complicado
                </li>
                <li className="flex items-start gap-3">
                  <IconCheck className="mt-0.5 text-lp-violet" /> Conectada a
                  tu link de reserva
                </li>
              </ul>
              <div className="mt-8 flex flex-wrap gap-3 text-sm font-semibold">
                <a
                  href="https://www.estudiotutis.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full bg-lp-blush px-4 py-2 text-lp-coral-deep transition hover:bg-lp-coral hover:text-white"
                >
                  estudiotutis.com ↗
                </a>
                <a
                  href="https://www.galaxybarberiagt.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full bg-lp-violet-soft px-4 py-2 text-lp-violet transition hover:bg-lp-violet hover:text-white"
                >
                  galaxybarberiagt.com ↗
                </a>
              </div>
            </Reveal>
            <Reveal delayMs={120}>
              <div className="relative mx-auto flex h-[26rem] max-w-[26rem] justify-center sm:h-[34rem] sm:max-w-[30rem]">
                <div
                  aria-hidden
                  className="absolute inset-x-4 bottom-4 top-16 rounded-[3rem] bg-gradient-to-br from-lp-blush via-white to-lp-violet-soft"
                />
                <PhoneFrame
                  src="/nuevo/vitrina-tutis.jpg"
                  alt="Vitrina de Tutis Esencia y Estilo en estudiotutis.com"
                  className="absolute left-0 top-12 w-[50%] -rotate-3"
                />
                <PhoneFrame
                  src="/nuevo/vitrina-galaxy.jpg"
                  alt="Vitrina de Galaxy Barbería Infantil en galaxybarberiagt.com"
                  className="absolute right-0 top-0 z-10 w-[50%] rotate-3"
                />
              </div>
            </Reveal>
          </div>
        </section>

        {/* Opiniones */}
        <section id="opiniones" className="scroll-mt-20 bg-lp-blush/60 px-5 py-20 sm:px-8 lg:py-28">
          <div className="mx-auto max-w-6xl">
            <SectionHeading
              eyebrow="Opiniones"
              title="Lo que dicen los salones que ya lo usan"
            />
            <div className="mt-12 grid gap-6 md:grid-cols-2">
              {testimonials.map((t, i) => (
                <Reveal key={t.salon} delayMs={i * 100}>
                  <figure className="relative flex h-full flex-col rounded-3xl bg-white p-7 shadow-[0_20px_40px_-24px_rgba(29,23,24,0.25)] ring-1 ring-lp-line sm:p-9">
                    <div className="flex gap-1 text-amber-400" aria-label="5 estrellas">
                      {Array.from({ length: 5 }).map((_, k) => (
                        <IconStar key={k} />
                      ))}
                    </div>
                    <blockquote className="mt-5 flex-1 text-lg font-medium leading-relaxed sm:text-xl">
                      “{t.quote}”
                    </blockquote>
                    <figcaption className="mt-7 flex items-center gap-3">
                      <span
                        className={`relative h-12 w-12 overflow-hidden rounded-full ring-2 ${
                          t.accent === "coral"
                            ? "ring-lp-coral/40"
                            : "ring-lp-violet/40"
                        }`}
                      >
                        <Image
                          src={t.logo}
                          alt=""
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                      </span>
                      <span>
                        <span className="block font-bold">{t.salon}</span>
                        <span
                          className={`block text-sm font-semibold ${
                            t.accent === "coral"
                              ? "text-lp-coral-deep"
                              : "text-lp-violet"
                          }`}
                        >
                          {t.kind}
                        </span>
                      </span>
                    </figcaption>
                  </figure>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Planes sin precios */}
        <section className="px-5 py-20 sm:px-8 lg:py-28">
          <div className="mx-auto max-w-5xl">
            <SectionHeading
              eyebrow="Planes"
              title="Dos formas de empezar"
              body="Te contamos precios y te acompañamos en el alta por WhatsApp."
            />
            <div className="mt-12 grid gap-6 md:grid-cols-2">
              <PlanCard
                badge="Con periodo de prueba"
                name="Agenda"
                summary="Tu agenda digital con link de reserva."
                items={[
                  "Link de reserva para tus clientes",
                  "Agenda, clientes y equipo",
                  "Anticipos por comprobante",
                  "Alta acompañada",
                ]}
                tone="coral"
              />
              <PlanCard
                badge="Dominio 1er año incluido"
                name="Vitrina"
                summary="Agenda + tu página web con dominio propio."
                items={[
                  "Todo lo de Agenda",
                  "Página hecha por el estudio",
                  "Dominio propio el primer año",
                  "Botón para agendar conectado",
                ]}
                tone="violet"
              />
            </div>
            <div className="mt-10 flex justify-center">
              <WhatsAppButton href={pricesUrl}>
                Consultar precios por WhatsApp
              </WhatsAppButton>
            </div>
          </div>
        </section>

        {/* Preguntas */}
        <section id="preguntas" className="scroll-mt-20 border-t border-lp-line px-5 py-20 sm:px-8 lg:py-28">
          <div className="mx-auto max-w-3xl">
            <SectionHeading eyebrow="Preguntas" title="Preguntas frecuentes" />
            <div className="mt-10 divide-y divide-lp-line rounded-3xl ring-1 ring-lp-line">
              {faqs.map((f) => (
                <details key={f.q} className="group px-6 py-5 sm:px-8">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-bold sm:text-lg [&::-webkit-details-marker]:hidden">
                    {f.q}
                    <span
                      aria-hidden
                      className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-lp-blush text-lp-coral-deep transition group-open:rotate-45"
                    >
                      +
                    </span>
                  </summary>
                  <p className="mt-3 leading-relaxed text-lp-muted">{f.a}</p>
                </details>
              ))}
            </div>
            <p className="mt-6 text-center text-sm text-lp-muted">
              ¿Ya usas Gota+Check?{" "}
              <a href="/ayuda" className="font-semibold text-lp-coral-deep underline-offset-4 hover:underline">
                Mira las guías de uso
              </a>
            </p>
          </div>
        </section>

        {/* CTA final */}
        <section className="px-5 pb-20 sm:px-8 lg:pb-28">
          <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-lp-coral via-[#e0566f] to-lp-violet px-7 py-14 text-center text-white sm:px-12 sm:py-20">
            <div
              aria-hidden
              className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/10 blur-2xl"
            />
            <h2 className="relative mx-auto max-w-2xl text-3xl font-bold tracking-tight sm:text-5xl">
              Ordena tu agenda desde hoy
            </h2>
            <p className="relative mx-auto mt-4 max-w-xl text-lg text-white/85">
              Cuéntanos de tu salón o barbería. Te mostramos cómo se vería con
              tus servicios.
            </p>
            <div className="relative mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <a
                href={demoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-7 py-4 text-base font-bold text-lp-ink shadow-lg transition hover:-translate-y-0.5"
              >
                <IconWhatsApp className="text-lp-wa-deep" />
                Escribir por WhatsApp
              </a>
              {appUrl ? (
                <a
                  href={appUrl}
                  className="inline-flex items-center justify-center rounded-full px-6 py-4 text-base font-semibold text-white ring-1 ring-white/50 transition hover:bg-white/10"
                >
                  Ya tengo cuenta
                </a>
              ) : null}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-lp-line px-5 py-10 sm:px-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2.5">
            <Image src="/logo.png" alt="" width={28} height={28} className="h-7 w-7" />
            <span className="font-display font-bold">Gota+Check</span>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium text-lp-muted">
            <a href="/ayuda" className="transition hover:text-lp-ink">
              Ayuda
            </a>
            <a
              href={getWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="transition hover:text-lp-ink"
            >
              WhatsApp
            </a>
            {appUrl ? (
              <a href={appUrl} className="transition hover:text-lp-ink">
                Entrar
              </a>
            ) : null}
          </div>
          <p className="text-xs text-lp-muted/80">Hecho por VajaLabs</p>
        </div>
      </footer>
    </div>
  );
}

function SectionHeading({
  eyebrow,
  title,
  body,
}: {
  eyebrow: string;
  title: string;
  body?: string;
}) {
  return (
    <Reveal className="mx-auto max-w-2xl text-center">
      <p className="text-sm font-bold uppercase tracking-wider text-lp-coral-deep">
        {eyebrow}
      </p>
      <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
        {title}
      </h2>
      {body ? (
        <p className="mt-4 text-lg leading-relaxed text-lp-muted">{body}</p>
      ) : null}
    </Reveal>
  );
}

function WhatsAppButton({
  href,
  children,
  size = "md",
}: {
  href: string;
  children: ReactNode;
  size?: "sm" | "md";
}) {
  const sizing =
    size === "sm"
      ? "gap-1.5 px-4 py-2 text-sm"
      : "gap-2 px-7 py-4 text-base w-full sm:w-auto";
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center justify-center rounded-full bg-lp-wa font-bold text-white shadow-[0_10px_24px_-10px_rgba(18,140,75,0.7)] transition hover:-translate-y-0.5 hover:bg-lp-wa-deep focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lp-wa-deep ${sizing}`}
    >
      <IconWhatsApp />
      {children}
    </a>
  );
}

function FloatCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`absolute flex max-w-[15rem] items-center gap-3 rounded-2xl bg-white/95 p-3 pr-4 shadow-[0_18px_40px_-16px_rgba(29,23,24,0.4)] ring-1 ring-lp-line backdrop-blur ${className}`}
    >
      {children}
    </div>
  );
}

function PlanCard({
  badge,
  name,
  summary,
  items,
  tone,
}: {
  badge: string;
  name: string;
  summary: string;
  items: string[];
  tone: "coral" | "violet";
}) {
  const accent =
    tone === "coral"
      ? { badge: "bg-lp-blush text-lp-coral-deep", dot: "text-lp-coral", top: "bg-lp-coral" }
      : { badge: "bg-lp-violet-soft text-lp-violet", dot: "text-lp-violet", top: "bg-lp-violet" };
  return (
    <Reveal>
      <article className="relative h-full overflow-hidden rounded-3xl bg-white p-8 ring-1 ring-lp-line">
        <span aria-hidden className={`absolute inset-x-0 top-0 h-1.5 ${accent.top}`} />
        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${accent.badge}`}>
          {badge}
        </span>
        <h3 className="mt-4 text-2xl font-bold">{name}</h3>
        <p className="mt-2 text-lp-muted">{summary}</p>
        <ul className="mt-6 space-y-3">
          {items.map((item) => (
            <li key={item} className="flex items-start gap-3 font-medium">
              <IconCheck className={`mt-0.5 ${accent.dot}`} />
              {item}
            </li>
          ))}
        </ul>
      </article>
    </Reveal>
  );
}

function Svg({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={`h-5 w-5 shrink-0 ${className}`}
    >
      {children}
    </svg>
  );
}

function IconCheck({ className = "text-lp-wa-deep" }: { className?: string }) {
  return (
    <Svg className={className}>
      <path d="M20 6 9 17l-5-5" />
    </Svg>
  );
}

function IconCalendar() {
  return (
    <Svg>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </Svg>
  );
}

function IconLink() {
  return (
    <Svg>
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </Svg>
  );
}

function IconCard() {
  return (
    <Svg>
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="M2 10h20" />
    </Svg>
  );
}

function IconBell() {
  return (
    <Svg>
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </Svg>
  );
}

function IconClock() {
  return (
    <Svg>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </Svg>
  );
}

function IconUsers() {
  return (
    <Svg>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </Svg>
  );
}

function IconStar() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className="h-5 w-5">
      <path d="M12 2.5l2.94 5.96 6.56.95-4.75 4.63 1.12 6.54L12 17.5l-5.87 3.08 1.12-6.54L2.5 9.41l6.56-.95L12 2.5z" />
    </svg>
  );
}

function IconWhatsApp({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={`h-5 w-5 shrink-0 ${className}`}>
      <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.64.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35zM12.04 21.5h-.01a9.46 9.46 0 0 1-4.82-1.32l-.35-.21-3.58.94.96-3.49-.23-.36a9.43 9.43 0 0 1-1.45-5.03c0-5.22 4.25-9.47 9.48-9.47a9.4 9.4 0 0 1 6.7 2.78 9.4 9.4 0 0 1 2.77 6.7c0 5.22-4.25 9.46-9.47 9.46zm8.06-17.53A11.33 11.33 0 0 0 12.04.63C5.76.63.65 5.74.65 12.02c0 2 .52 3.96 1.52 5.68L.55 23.5l5.94-1.56a11.36 11.36 0 0 0 5.54 1.41h.01c6.28 0 11.39-5.11 11.39-11.39 0-3.04-1.18-5.9-3.33-8.05z" />
    </svg>
  );
}
