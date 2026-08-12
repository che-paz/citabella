# Gota+Check — Ruta a mercado (fuente de verdad)

> **Última actualización:** 2026-08-12  
> **Marca de presentación:** Gota+Check  
> **Estudio / desarrollo:** VajaLabs (aún sin constituir)  
> **Repo / dominio técnico histórico:** CITABELLA (`che-paz/citabella`)  
> **Dominio producto:** `gotacheck.app` (marketing live)  
> **Estado:** Piloto founders · Marketing live · **Fase 1 ✅** · S2.1 ✅ · **Modelo oferta actualizado (reunión founders 2026-08-12)**  
> **Precio app (SKU A):** **Q100/mes** (~USD 12) — acordado 2026-08-12  
> **Taller:** cupo **≤15** potenciales (sondeo vía founders); fecha TBD

Este documento traduce la estrategia a fases y sprints. No sustituye features técnicas en `FEATURES/`; define **qué construir en qué orden** y **cuándo se puede vender**.

---

## 1. Oferta (actualizada 2026-08-12)

| Línea | Nombre | Incluye | Quién la entrega | Precio |
|-------|--------|---------|------------------|--------|
| **A** | Agenda | App Gota+Check (reservas, pagos, agenda) bajo dominio producto | Self-serve / onboarding asistido | **Q100/mes** (~USD 12) |
| **V** | Vitrina web | Landing del salón + dominio propio + CTA a agenda | **Servicio del estudio** (VajaLabs / desarrollador) — **no** self-serve | Setup/proyecto (precio del servicio TBD) |
| **+** | Foto / diseño | Sesión o apoyo visual (opcional, cupo) | Estudio | Según cupo |

### Cambio de modelo (importante)

- **Antes:** SKU B = plantilla rellenable por la dueña (editor S2.2) + C = foto/diseño.
- **Ahora:** el margen del desarrollador en Q100/mes es bajo → **no se construye editor self-serve de vitrina** en esta fase.
- La **vitrina es un servicio pago del estudio**: el cliente entrega texto + imágenes + nombre de dominio; el estudio monta y publica el sitio.
- Ingreso de vitrinas → **directo al estudio/desarrollador** (no empaquetado como “ellas lo hacen solas” dentro del plan de Q100).
- **Founders (Tutis, Galaxy):** el estudio les hace la vitrina con su contenido real → **demos vivos** para el taller / venta del servicio V.

Landing tipo mínimo (referencia: [daysinavarroc.com](https://daysinavarroc.com/)): informativa, portafolio, servicios, CTA agendar. **Sin** carrito, blog ni e-commerce.

**Marca hacia el gremio:** Gota+Check.  
**Marca hacia desarrollo/contratos futuros:** VajaLabs.

---

## 1b. Acuerdos reunión founders (2026-08-12)

| # | Acuerdo |
|---|---------|
| 1 | Precio app = **Q100/mes** (~USD 12) |
| 2 | Quitar paquete “vitrina self-serve”; ofrecer vitrina como **servicio del estudio** |
| 3 | Estudio hace vitrinas de Tutis + Galaxy como **demo** del servicio |
| 4 | Founders entregan: **texto, imágenes, nombre de dominio** |
| 5 | Founders hacen **sondeo** en el gremio; taller con **≤15** interesadas reales (grupo manejable: agendas, dudas, soporte) |
| 6 | Tras esa oleada: adquisición más agresiva |

Notas: trial / factura / precio exacto del servicio Vitrina — pendientes de cerrar al cobrar a terceros.

---

## 2. Metas de negocio

| Horizonte | Meta | Nota |
|-----------|------|------|
| Oleada 1 (taller ≤15) | Validar interés real + operar soporte | Sondeo founders primero |
| 90 días post oleada | ≥10 pagos activos (mín) / **15** (stretch) | A Q100 → ~Q1,000–1,500 recurrente app; vitrinas = ingreso setup aparte |
| 12 meses | **>50** salones | Tras validar con el primer grupo |
| Piso ingreso | Revisar vs costos (Supabase/Vercel Pro + tiempo) | Q100 × N; vitrina no cuenta como recurrente salvo mantenimiento |
| Adquisición v1 | Taller **≤15** vía founders (no ~35) | Sin ads hasta validar |

---

## 3. Principios técnicos (no negociables)

- Stack fijo: Next.js 14 + TS + Tailwind + shadcn + **Supabase + Vercel**.
- **No** migrar a hosting clásico para la app.
- Un cerebro de datos (Supabase); N dominios de salón → landing → CTA agenda.
- Founders: **no recrear proyecto**; backups antes de cambios fuertes.
- Free tiers OK para desarrollo; **Pro (Supabase primero)** antes o al abrir el taller.
- WhatsApp API, pasarela, panel plataforma = fuera de esta ruta (ver `ROADMAP.md` Fase 2/3).

---

## 4. Fases → sprints

Leyenda de estado: ⬜ pending · 🟡 in progress · ✅ done · ❌ cancelado / aparcado

### Fase 0 — Congelar marco (docs / negocio)

| ID | Entregable | Done cuando |
|----|------------|-------------|
| F0.1 | Marca presentación = Gota+Check | ✅ (2026-07-28) |
| F0.2 | Oferta documentada | ✅ actualizado 2026-08-12 (A + servicio V) |
| F0.3 | Dominio producto Gota+Check comprado | ✅ `gotacheck.app` (2026-08-04) |
| F0.4 | One-pager taller (borrador) | ✅ Landing live `gotacheck.app` |
| F0.5 | Precios + trial + fecha taller | 🟡 **Precio A = Q100** (2026-08-12); trial + fecha taller TBD |

---

### Fase 1 — Producción seria (app) ✅

| Sprint | Scope | Done cuando |
|--------|--------|-------------|
| **S1.1–S1.4** | Docs, infra, provision, hardening | ✅ 2026-08-05 |

---

### Fase 2 — Vitrina v1 (bloquea el taller) — **reenfocada**

Objetivo: **1–2 vitrinas founders live** (servicio estudio) + dominio + CTA agenda. **No** editor self-serve.

| Sprint | Scope | Done cuando |
|--------|--------|-------------|
| **S2.0 Contenido** | Textos/fotos/dominio de founders | 🟡 Esperando entrega founders (tras reunión 2026-08-12) |
| **S2.1 Plantilla técnica** | Plantilla `/vitrina/[slug]` + `?demo=1` | ✅ 2026-08-05 |
| **S2.2 Editor dueña** | Self-serve relleno plantilla | ❌ **Aparcado** — no encaja con margen Q100 ni modelo servicio |
| **S2.3 Entrega vitrina founders** | Montar Tutis + Galaxy con contenido real (demo del servicio V) | Contenido en prod + sin `?demo=1` stock |
| **S2.4 URLs / dominios** | Dominios founders → landing → `/reservar/[slug]` | 2 ejemplos live documentados |

**Criterio fase:** Tutis y Galaxy con sitio usable en presentación + proceso claro “cliente manda assets → estudio publica”.

**Capacidad:** cupo de vitrinas del estudio limitado (tiempo); priorizar demos founders antes del taller ≤15.

---

### Fase 3 — Listos para oleada (antes del taller ≤15)

| ID | Entregable |
|----|------------|
| X.1 | Precio A confirmado en copy marketing (**Q100/mes**) |
| X.2 | Precio/alcance del **servicio Vitrina** (setup) dicho en voz alta |
| X.3 | Reglas trial (si aplica) |
| X.4 | Fecha taller ≤15 + lista sondeo founders |
| X.5 | Supabase Pro si ya se cobra; legal mínimo al cobrar terceros |

---

### Fase 4 — Taller + oleada (≤15)

| Sprint / bloque | Done cuando |
|-----------------|-------------|
| Taller con ≤15 interesadas reales | Lista onboard + soporte manejable |
| Onboarding asistido SKU A | Agendas operando |
| Vitrina solo a quien contrate el servicio | Sin sobrevender capacidad del estudio |
| Semana 6–12: fricción + ingreso | Go / adjust; luego adquisición más agresiva |

---

### Fase 5 — Crecimiento post-validación

- Self-serve **solo SKU A** cuando el proceso esté estable.
- Vitrina sigue como **servicio asistido** (editor self-serve = solo si el margen/tiempo lo justifican más adelante).
- Constituir / facturar cuando ingreso estable.
- **No** WhatsApp API hasta oleada estable.

---

## 5. Orden de ejecución inmediato

1. ~~Fase 1~~ ✅ · ~~S2.1~~ ✅  
2. **Recibir de founders:** textos, imágenes (portada + trabajos), nombre de dominio  
3. **S2.3** — Publicar vitrinas Tutis + Galaxy (contenido real)  
4. **S2.4** — Conectar dominios + documentar  
5. Actualizar `gotacheck.app` con precio Q100 cuando toque one-pager  
6. Esperar sondeo + fecha taller ≤15  
7. Oleada → luego adquisición agresiva  

---

## 6. Fuera de alcance (explicitamente)

- Hosting WordPress/cPanel para la app core  
- Carrito, blog, tienda en la landing  
- **Editor self-serve de vitrina (ex-S2.2)** en esta fase  
- Campañas ads antes de validar con el grupo ≤15  
- Self-serve masivo antes de cerrar oleada  
- Fase 2 técnica del `ROADMAP.md` (WhatsApp API, etc.) como si fuera MVP  

---

## 7. Sesión “salida” (restante)

Ya cerrado: precio A = Q100/mes.

Pendiente:

1. Precio y alcance exacto del **servicio Vitrina**  
2. Trial sí/no  
3. Fecha taller ≤15  
4. Confirmación Pro Supabase/Vercel al cobrar  
5. Copy final one-pager con precio  

---

## 8. Infra: cuándo pagar (disparadores, no fechas)

| Servicio | Free alcanza para | Disparador para pagar | Costo |
|----------|-------------------|------------------------|-------|
| **Supabase** | Piloto + 3–5 salones sin cobrar | **Primer salón que paga** o Storage cerca de 1 GB | ~$25 + compute |
| **Vercel** | Desarrollo y founders | **Uso comercial** o **50 dominios** | $20/mes |

Regla: **primer quetzal cobrado → Supabase Pro el mismo día; Vercel Pro al conectar el primer dominio de clienta.**

---

## 9. Dominios y alojamiento

**Registrador:** Cloudflare Registrar (a costo) para `.com`. Compatible con Vercel vía DNS.

- Cloudflare Registrar **no** soporta `.gt` / `.com.gt` → registrador local si aplica.
- DNS a Vercel: **DNS-only** (sin proxy naranja).
- **Propiedad:** dominio de quien paga. Preferido: dueña registra y delega DNS.

| Sitio | Dónde | Notas |
|-------|-------|-------|
| App (`/reservar`, dashboard) | Proyecto Vercel app + Supabase | Objetivo: `app.gotacheck.app` |
| **Landings salón** | Mismo proyecto app, multi-tenant / dominio | Contenido cargado por el estudio (servicio V) |
| Marketing Gota+Check | Proyecto `marketing/` | `gotacheck.app` |

**No** un proyecto Vercel por salón.

---

## 10. Alta de salones y cobro

| Etapa | Herramienta |
|-------|-------------|
| Hoy | `scripts/provision-salon.mjs` |
| Founders | Ya provisionadas |
| Self-serve A | Después de oleada ≤15 |

**Cobro inicio:** transferencia + recordatorio WhatsApp; registro manual. Formal (Recurrente/FEL) cuando se facture a terceros.

A Q100/mes: ~25 pagadoras ≈ Q2,500 bruto recurrente (antes de Pro/comisiones). Vitrinas = ingreso por proyecto, no confundir con MRR.

---

## 11. Cómo usar este doc en Cursor

- Al iniciar GTM: este archivo + `CURRENT_STATE.md` + `ENGINEERING_RULES.md`.  
- Al cerrar sprint: marcar Done aquí y actualizar `CURRENT_STATE.md`.  
- **No** retomar S2.2 editor sin decisión explícita de negocio.
