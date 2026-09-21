export type GuideStep = {
  title: string;
  body: string;
  /** Filename under /ayuda/{slug}/ — omit until captura exists */
  screenshot?: string;
  screenshotAlt?: string;
};

export type Guide = {
  slug: string;
  title: string;
  summary: string;
  minutes: number;
  where: string;
  steps: GuideStep[];
  tip?: string;
};

/** Guías cortas para bajar soporte post-alta. Video: después. */
export const GUIDES: Guide[] = [
  {
    slug: "entrar-y-contrasena",
    title: "Entrar y cambiar contraseña",
    summary:
      "Cómo abrir tu panel la primera vez y dejar una contraseña que solo tú conozcas.",
    minutes: 2,
    where: "app.gotacheck.app/login → Ajustes",
    steps: [
      {
        title: "Abre el login",
        body: "Entrá a app.gotacheck.app/login (o el enlace que te enviamos por WhatsApp). Usá el correo y la contraseña temporal que te dimos al darte de alta.",
        screenshot: "01-login.png",
        screenshotAlt: "Pantalla de inicio de sesión de Gota+Check",
      },
      {
        title: "Entrá al panel",
        body: "Si los datos son correctos, vas a ver el inicio con el resumen del día y tu link de reserva. Si no entra: revisá que el correo esté escrito igual (sin espacios) y que Caps Lock esté apagado.",
        screenshot: "02-inicio.png",
        screenshotAlt: "Inicio del panel tras iniciar sesión",
      },
      {
        title: "Cambiá la contraseña",
        body: "Menú → Ajustes. En «Mi perfil», bajá a «Cambiar contraseña». Escribí una nueva (mínimo 8 caracteres), confirmala y tocá «Actualizar contraseña». Guardala en un lugar seguro; la temporal ya no sirve.",
        screenshot: "03-ajustes-password.png",
        screenshotAlt: "Sección Cambiar contraseña en Ajustes",
      },
    ],
    tip: "El correo de login no se cambia desde Ajustes. Si necesitás otro correo, escribinos por WhatsApp.",
  },
  {
    slug: "horarios",
    title: "Configurar horarios",
    summary:
      "Definí en qué días y horas pueden reservarte. Sin esto, el link no muestra turnos útiles.",
    minutes: 3,
    where: "Agenda → botón Horarios",
    steps: [
      {
        title: "Abrí Agenda",
        body: "En el menú tocá Agenda. Arriba vas a ver el botón «Horarios».",
        screenshot: "01-agenda-horarios.png",
        screenshotAlt: "Agenda con el botón Horarios",
      },
      {
        title: "Marcá días y horas",
        body: "Activá solo los días que atendés. Poné hora de inicio y fin de cada día (por ejemplo Lun–Vie 09:00–18:00, Sáb 09:00–14:00). Desactivá el domingo si no trabajás.",
        screenshot: "02-dialogo-horarios.png",
        screenshotAlt: "Diálogo Horarios del salón",
      },
      {
        title: "Pausa de almuerzo (opcional)",
        body: "Si cerrás al mediodía, activá la pausa diaria e indicá desde–hasta. Esos minutos no salen como disponibles en el link.",
        screenshot: "03-pausa.png",
        screenshotAlt: "Configuración de pausa diaria",
      },
      {
        title: "Guardá",
        body: "Tocá «Guardar horarios» y esperá el mensaje de confirmación. Probá el link de reserva: deberían aparecer solo esos días.",
      },
    ],
    tip: "Los feriados o cierres de un día puntual se agregan como excepción en el mismo diálogo de Horarios.",
  },
  {
    slug: "catalogo",
    title: "Armar tu catálogo",
    summary:
      "Servicios (y paquetes si querés) con precio y duración. Es lo que ven tus clientas al reservar.",
    minutes: 5,
    where: "Catálogo",
    steps: [
      {
        title: "Abrí Catálogo",
        body: "En el menú tocá Catálogo. Empezá por la pestaña Servicios.",
        screenshot: "01-catalogo.png",
        screenshotAlt: "Pantalla Catálogo",
      },
      {
        title: "Creá un servicio",
        body: "Tocá «Nuevo servicio». Completá nombre, categoría, precio en quetzales y duración en minutos (la duración define cuánto bloquea la agenda). La descripción es opcional.",
        screenshot: "02-nuevo-servicio.png",
        screenshotAlt: "Formulario de nuevo servicio",
      },
      {
        title: "Guardá y revisá",
        body: "Guardá. El servicio activo aparece en el link público. Si ya no lo ofrecés, desactivalo (no hace falta borrarlo); podés reactivarlo después.",
      },
      {
        title: "Paquetes (opcional)",
        body: "En la pestaña Paquetes podés combinar varios servicios con un precio de paquete. Útil para novias o combos. También podés omitir paquetes al inicio.",
      },
    ],
    tip: "Sin al menos un servicio activo, la clienta no puede avanzar en el link de reserva.",
  },
  {
    slug: "link-reserva",
    title: "Compartir el link de reserva",
    summary:
      "Dónde copiar tu enlace y cómo enviarlo por WhatsApp o redes para que reserven solas.",
    minutes: 2,
    where: "Inicio del panel",
    steps: [
      {
        title: "Encontrá el link",
        body: "En el Inicio del panel está la tarjeta «Link de reserva para clientas». Ahí ves tu URL (app.gotacheck.app/reservar/tu-salon).",
        screenshot: "01-link-inicio.png",
        screenshotAlt: "Tarjeta Link de reserva en el inicio",
      },
      {
        title: "Copiá y compartí",
        body: "Tocá el ícono de copiar. Pegalo en tu estado de WhatsApp, bio de Instagram o mensajes a clientas. También podés abrirlo con el ícono de enlace externo para probarlo vos.",
        screenshot: "02-copiar.png",
        screenshotAlt: "Botones copiar y abrir el link",
      },
      {
        title: "Probá como clienta",
        body: "Abrí el link en otra pestaña (o en el celular). Elegí servicio, fecha y hora. Si no hay horarios, volvé a la guía de Horarios y al Catálogo.",
      },
    ],
    tip: "Si tenés Vitrina con dominio propio, el botón de agendar de tu página ya apunta a este mismo link.",
  },
  {
    slug: "validar-pago",
    title: "Validar un pago",
    summary:
      "Cuando una clienta reserva y sube comprobante (o elige efectivo), vos confirmás o rechazás en Pagos.",
    minutes: 3,
    where: "Pagos",
    steps: [
      {
        title: "Abrí Pagos",
        body: "En el menú tocá Pagos. Ahí ves la cola de citas pendientes de validación (también aparece un aviso en el Inicio si hay pendientes).",
        screenshot: "01-cola-pagos.png",
        screenshotAlt: "Cola de pagos pendientes",
      },
      {
        title: "Revisá el comprobante",
        body: "Abrí la foto del comprobante si la clienta transfirió. Confirmá monto y que coincida con el servicio. Si eligió efectivo en salón, no habrá foto: solo confirmás cuando corresponda.",
        screenshot: "02-comprobante.png",
        screenshotAlt: "Ejemplo: cómo se ve el paso Ver comprobante (ilustración)",
      },
      {
        title: "Aprobar o rechazar",
        body: "Aprobar confirma la cita. Rechazar cancela la cita y libera el horario para otra persona. Podés avisar por WhatsApp con los botones que ofrece el panel.",
        screenshot: "03-aprobar.png",
        screenshotAlt: "Botones Aprobar y Rechazar",
      },
    ],
    tip: "Hasta que apruebes, la cita está pendiente y el horario queda reservado. No dejes la cola sin revisar el mismo día.",
  },
];

export function getGuide(slug: string): Guide | undefined {
  return GUIDES.find((g) => g.slug === slug);
}

export function getAllGuideSlugs(): string[] {
  return GUIDES.map((g) => g.slug);
}
