# Gota+Check — Ruta a mercado (fuente de verdad)

> **Última actualización:** 2026-09-21  
> **Marca de presentación:** Gota+Check  
> **Estudio / desarrollo:** VajaLabs (aún sin constituir)  
> **Repo / dominio técnico histórico:** CITABELLA (`che-paz/citabella`)  
> **Dominio producto:** `gotacheck.app` (marketing live)  
> **Estado:** Piloto founders · Vitrinas Tutis/Galaxy live · **Fase 1 ✅** · **F2 mín. para pitch ✅** (S2.2 editor aparcado) · **Fase 3 en curso** (precios ✅ · fecha taller ⬜)  
> **Precios / trial:** `DECISION_PRECIOS_TALLER.md` · Guion: `TALLER_PRESENTACION.md`

Este documento traduce la estrategia a fases y sprints. No sustituye features técnicas en `FEATURES/`; define **qué construir en qué orden** y **cuándo se puede vender**.

---

## 1. Oferta (oleada 1 — 2 SKUs)

| SKU | Nombre | Precio | Incluye | URL agenda |
|-----|--------|--------|---------|------------|
| **A** | Agenda | **Q100/mes** · trial **30 días** | App bajo Gota+Check | `/reservar/[slug]` (hoy en Vercel app) |
| **Vitrina** | Vitrina (servicio estudio) | **Q3,500** (único) · **sin trial** | A + dominio **1er año** + landing montada por el estudio | `misalon.com` → CTA agenda |

- Landing tipo mínimo (referencia Daysi): informativa, portafolio, servicios, CTA agendar. **Sin** carrito, blog ni e-commerce.
- **Sin** editor self-serve (S2.2 aparcado). **Sin** sesión de fotos en oferta.
- Renovación dominio año 2+: **Q200/año** (paga la clienta; renovamos nosotros).
- Cupo vitrinas: **4–6/mes** con info completa.
- Dueña del dominio: quien paga el servicio (ver §9).
- Founders (Tutis, Galaxy): demos vivos; app founder Q0.

Detalle cerrado: **`DECISION_PRECIOS_TALLER.md`**.

**Marca hacia el gremio:** Gota+Check.  
**Marca hacia desarrollo/contratos futuros:** VajaLabs.

---

## 2. Metas de negocio

| Horizonte | Meta | Nota |
|-----------|------|------|
| 90 días post “listos para salir” | ≥10 pagos activos (mín) / **15** (stretch) | Capacidad ~10–12 h/sem |
| 12 meses | **>50** salones | Tras taller + referidos; SKU A más self-serve después |
| Piso ingreso recurrente | ~**Q2,500/mes** (cubre costos + margen chico) | No contar setups Vitrina (Q3,500) como ingreso mensual |
| Adquisición v1 | Taller ≤**15** interesadas reales (sondeo founders) | Sin ads hasta validar |

**Puertas de salida (Fase 3):**
1. ~~Precios A + Vitrina~~ ✅ 2026-09-21 → `DECISION_PRECIOS_TALLER.md`
2. ~~Trial~~ ✅ 30 días solo Agenda; Vitrina sin trial
3. Fecha del taller ⬜ (`TALLER_PRESENTACION.md`)

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

Leyenda de estado: ⬜ pending · 🟡 in progress · ✅ done

### Fase 0 — Congelar marco (docs / negocio)

| ID | Entregable | Done cuando |
|----|------------|-------------|
| F0.1 | Marca presentación = Gota+Check | ✅ (2026-07-28) |
| F0.2 | SKUs A/B/C + ownership dominio documentados | ✅ (este doc) |
| F0.3 | Dominio producto Gota+Check comprado | ✅ `gotacheck.app` (2026-08-04) |
| F0.4 | One-pager taller | ✅ Landing `gotacheck.app`; precios en web → actualizar oleada 1 |
| F0.5 | Sesión precios + trial + fecha taller | 🟡 Precios/trial ✅ 2026-09-21 · fecha taller ⬜ |

**Criterio fase:** nombre + oferta claros; dominio en camino; precios aún pueden esperar.

---

### Fase 1 — Producción seria (app, sin vitrina aún)

Objetivo: operar y dar de alta salones **asistido** sin riesgo a founders.

| Sprint | Scope | Done cuando |
|--------|--------|-------------|
| **S1.1 Docs & inventario** | Actualizar `CURRENT_STATE`; checklist migraciones cloud; runbook alta salón | ✅ 2026-08-05 — `MIGRATIONS_CHECKLIST.md` + `RUNBOOK_ALTA_SALON.md` |
| **S1.2 Infra** | Checklist Supabase; Vercel env; Auth redirect URLs; smoke | ✅ 2026-08-05 — `S1.2_INFRA_CHECKLIST.md`; push OK en dispositivo founder |
| **S1.3 Onboarding asistido** | Script/proceso genérico: salón + admin + slug + plan + horarios + link | ✅ 2026-08-05 — `scripts/provision-salon.mjs`; prueba `gota-prueba-s13` |
| **S1.4 Hardening** | Smoke RLS tenant A≠B; demo aislada; reset seguro | ✅ 2026-08-05 — `S1.4_HARDENING_CHECKLIST.md`; Tutis vs Belleza Luna DEMO |

**Criterio fase:** “Puedo onboardear salón N sin tocar founders ni improvisar SQL.” → **cumplido (Fase 1 ✅)**

---

### Fase 2 — Vitrina v1 (bloquea el taller)

Objetivo: plantilla mínima + founders como laboratorio.

| Sprint | Scope | Done cuando |
|--------|--------|-------------|
| **S2.0 Contenido** | Sesión dedicada: secciones landing tipo Daysi (copy, fotos, CTA) | ✅ Packs Tutis/Galaxy en producción |
| **S2.1 Plantilla técnica** | 1 plantilla (máx 2) desplegable; dominio salón → landing → agenda | ✅ + `?demo=1` |
| **S2.2 Editor dueña** | Rellenar plantilla self-serve | ⏸️ **Aparcado** (oleada 1: estudio monta vitrina) |
| **S2.3 Add-on diseño / fotos** | Sesión foto / Presencia (ex-SKU C) | ⏸️ **Fuera de oferta** oleada 1 |
| **S2.4 URLs** | App-only vs `misalon.com` | ✅ Tutis + Galaxy (2026-09-10) |

**Criterio fase (ajustado oleada 1):** 1–2 landings founders **live** en dominio propio → **cumplido**. Editor dueña ya no es puerta del taller.

**Capacidad vitrinas:** **4–6/mes** con brief completo (sin fotos de estudio en oferta).

---

### Fase 3 — Listos para salir (sesión exclusiva)

Puerta técnica: F1 ✅ + founders vitrina live (S2.1/S2.4) ✅. S2.2 no bloquea.

| ID | Entregable | Estado |
|----|------------|--------|
| X.1 | Precios Agenda + Vitrina → meta piso Q2,500 | ✅ `DECISION_PRECIOS_TALLER.md` |
| X.2 | Reglas trial | ✅ 30d Agenda; Vitrina sin trial |
| X.3 | Fecha taller + one-pager final | 🟡 Guion + copy web ✅ · fecha ⬜ · deploy marketing |
| X.4 | Supabase Pro | Al **primer cobro** (Vercel Pro ✅) |
| X.5 | Legal mínimo informal | Cuando cobres a terceros |

**Criterio:** fecha de taller en calendario + precios en voz alta **y** en `gotacheck.app`.

---

### Fase 4 — Taller + oleada 90 días

| Sprint / bloque | Done cuando |
|-----------------|-------------|
| Taller demo founders + captura WhatsApp (≤15) | Lista de interesados — `TALLER_PRESENTACION.md` |
| Onboarding asistido (A trial; Vitrina cupo 4–6/mes) | ≥10 mensuales (mín) / 15 stretch |
| Semana 6: revisar conversión y fricción plantilla | Ajuste precio o proceso |
| Semana 12: ingreso recurrente vs Q2,500 | Go / adjust |

---

### Fase 5 — Hacia 50 (post-validación)

- Self-serve **solo SKU A** (trial o pago).
- B/C semi-asistidos o editor más maduro.
- 2ª plantilla; constituir / facturar cuando ingreso estable.
- Métricas mínimas: salones activos, reservas/semana, churn.
- **No** WhatsApp API hasta que la oleada esté estable.

---

## 5. Orden de ejecución inmediato

1. ~~Fase 1 completa~~ ✅  
2. ~~Vitrinas founders + dominios (S2.4)~~ ✅  
3. ~~Precios + trial (X.1–X.2)~~ ✅ 2026-09-21  
4. **Actualizar `gotacheck.app`** con precios y oferta A + Vitrina  
5. **Fijar fecha taller** + sondeo ≤15 (`TALLER_PRESENTACION.md`)  
6. Optimizar enrolamiento nuevas (proceso dueño; no self-serve aún)  
7. Supabase Pro al primer cobro

---

## 6. Fuera de alcance (explicitamente)

- Hosting WordPress/cPanel para la app core  
- Carrito, blog, tienda en la landing  
- Campañas ads antes del taller  
- Self-serve masivo antes de F2  
- Fase 2 técnica del `ROADMAP.md` (WhatsApp API, etc.) como si fuera MVP  

---

## 7. Sesión exclusiva “salida”

| Tema | Resultado |
|------|-----------|
| Precios | ✅ A Q100/mes · Vitrina Q3,500 · dominio año2 Q200 |
| Trial | ✅ 30 días solo Agenda |
| Cupos | ✅ Taller 15 · Vitrinas 4–6/mes |
| Fecha taller | ⬜ |
| Pro | Vercel ✅ · Supabase al primer cobro |
| One-pager | Actualizar marketing con precios |

---

## 8. Infra: cuándo pagar (disparadores, no fechas)

| Servicio | Free alcanza para | Disparador para pagar | Costo |
|----------|-------------------|------------------------|-------|
| **Supabase** | Piloto + 3–5 salones sin cobrar | **Primer salón que paga** (Free no tiene backups diarios) o Storage cerca de 1 GB por comprobantes | ~$25 + compute |
| **Vercel** | Desarrollo y founders | **Uso comercial** (Hobby es solo no comercial) o pasar de **50 dominios por proyecto** | $20/mes |

Regla operativa: **primer quetzal cobrado → Supabase Pro el mismo día; Vercel Pro al conectar el primer dominio de clienta.**

Límite real más cercano en Free: **Storage 1 GB**. Los comprobantes admiten hasta 5 MB cada uno, así que con varios salones activos se llena antes que la base de datos.

---

## 9. Dominios y alojamiento

**Registrador:** Cloudflare Registrar (a costo) para `.com`. Compatible con Vercel vía DNS.

Advertencias registradas:
- Cloudflare Registrar **no soporta `.gt` / `.com.gt`** → registrador local si se quiere identidad GT.
- Requiere usar nameservers de Cloudflare.
- Al apuntar a Vercel: registros en **DNS-only** (sin proxy naranja) para evitar doble CDN/SSL.
- Traslados bloqueados **60 días** después de registrar o transferir.
- **Propiedad:** el dominio es de quien paga el servicio. Dos modelos permitidos:
  1. La dueña registra en su cuenta y delega DNS (preferido a largo plazo).
  2. Se registra en la cuenta del estudio con cláusula escrita de traspaso al salir.

**Dónde vive cada cosa:**

| Sitio | Dónde | Notas |
|-------|-------|-------|
| App (agenda, pagos, `/reservar`) | Proyecto Vercel app + Supabase | Canónico: `app.gotacheck.app` (ver `APP_DOMAIN_CHECKLIST.md`); respaldo `*.vercel.app` |
| **Landings de salones** | **Mismo proyecto de la app**, multi-tenant por dominio | El contenido viene de la plantilla en DB; 1 proyecto + N dominios |
| Sitio Gota+Check (marketing) | Proyecto Vercel **aparte**, Root Directory = `marketing/` | Código en monorepo; se edita sin arriesgar deploys de la app. Este sprint: apex `gotacheck.app` → marketing |
| Sitio VajaLabs | Proyecto aparte, baja prioridad | Identidad del estudio |

**Plan de URLs (2026-08-04):**

| Host | Destino |
|------|---------|
| `gotacheck.app` | Marketing (`marketing/`) |
| `www.gotacheck.app` | Redirect → apex (opcional) |
| `app.gotacheck.app` | App (agenda / login / reservar) — checklist `APP_DOMAIN_CHECKLIST.md` |
| `*.vercel.app` (app) | Respaldo técnico |

DNS Cloudflare → Vercel: registros en **DNS-only** (sin proxy naranja). Instrucciones: `marketing/README.md`.

**No** un proyecto Vercel por salón.

---

## 10. Alta de salones y cobro

**Alta de salones (progresión):**

| Etapa | Herramienta | Umbral para pasar a la siguiente |
|-------|-------------|----------------------------------|
| Hoy | **`scripts/provision-salon.mjs`** (S1.3 ✅) | — |
| Legacy founders | `scripts/provision-founders-pilot.mjs` | Solo Tutis/Galaxy |
| Interno | Página admin de plataforma (rol `platform_admin`) | ~5–8 salones o &gt;1 alta/semana |
| Self-serve | Signup solo **SKU A** | Después de la oleada; B/C siguen asistidos |

**Cobro (progresión):**

| Etapa | Método | Requisitos | Costo |
|-------|--------|------------|-------|
| Inicio (sin facturar) | Transferencia + recordatorio WhatsApp; registro manual | Ninguno | Q0 |
| Formal | **Recurrente** (GT): links de pago + suscripciones automáticas | NIT, DPI, cuenta bancaria GT, **FEL** | 4.5% + Q1.20 tarjeta · 1% (máx Q20) transferencia |
| Facturación | Certificador FEL (ej. INFILE) | Patente / NIT | desde ~Q99/mes |

Impacto en el piso de Q2,500: comisiones + FEL ≈ **Q250–300/mes** con ~12 clientes. El piso debe leerse **después** de comisiones.

No construir procesamiento de tarjetas propio. Stripe no aplica para GT.

---

## 11. Cómo usar este doc en Cursor

- Al iniciar trabajo de go-to-market: leer **este archivo** + `CURRENT_STATE.md` + `ENGINEERING_RULES.md`.  
- Al cerrar un sprint de la ruta: marcar Done aquí y actualizar `CURRENT_STATE.md`.  
- Precios/taller: no inventar en código; esperar sesión §7.
