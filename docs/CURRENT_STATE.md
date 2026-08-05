# CITABELLA / Gota+Check — Current State

> **Última actualización:** 2026-08-05  
> **Marca presentación:** Gota+Check · **Estudio:** VajaLabs (sin constituir)  
> **Sprint activo:** **S2.0 🟡** (borrador spec vitrina + brief founders) · Fase 1 ✅  
> **Fase:** MVP ✅ | Piloto founders | **Vitrina:** spec en borrador | Precios/taller al final

## Resumen en una línea

MVP operativo. **Fase 1 ✅**. S2.0: borrador spec vitrina + brief para founders (`docs/S2.0_*`).

## Estado por área

| Área | Estado | Notas |
|------|--------|-------|
| Documentación | 🟢 S1.1 | `MIGRATIONS_CHECKLIST.md` + `RUNBOOK_ALTA_SALON.md` + ruta GTM |
| Repositorio / código | 🟢 MVP core | Flujo reserva + validación pagos verificado |
| Base de datos | 🟢 001–015 en cloud | Re-verificado 2026-08-05 (probe REST); ver checklist |
| Supabase | 🟡 Free → Pro pendiente | Operativo; Pro + backups antes del taller |
| Deploy | 🟢 Vercel | App + marketing. S1.2: Auth redirects + push smoke OK (2026-08-05) |
| Prototipo UI | 🟢 MVP core | Dashboard + clientas listos |
| Finanzas / gastos | 🟢 MVP | `/finanzas` ingresos vs gastos + balance mes |
| PWA | 🟢 Operativo | Web Push por dispositivo; iPhone requiere icono en inicio |
| Sitio marketing Gota+Check | 🟢 Live | https://gotacheck.app → www · proyecto Vercel `gotacheck-marketing` |
| Vitrina / landings | ⬜ No iniciado | SKU B/C; plantillas post Fase 1 infra |

## Decisiones tomadas

- Marca de **presentación** al gremio: **Gota+Check**; estudio: VajaLabs; ruta GTM en `ROUTE_GOTACHECK.md`
- Oferta en 3 SKUs: A Agenda · B Vitrina (plantilla+dominio) · C Presencia (+foto); landing mínima tipo Daysi
- Sitio marketing: monorepo `marketing/` + proyecto Vercel aparte (Root Directory); apex `gotacheck.app` este sprint; app → `app.gotacheck.app` después
- Stack: Next.js 14 + TypeScript + Tailwind + shadcn/ui + Supabase + Vercel
- Multi-tenant vía Row Level Security (RLS) en PostgreSQL
- Disponibilidad de agenda: cálculo dinámico por duración de servicio
- Suscripciones/planes desde MVP (founder / trial / pago)
- Pagos MVP: comprobante manual + efectivo + instrucciones Fri (sin API)
- `@supabase/ssr` para auth en App Router (server + middleware + browser)
- Roles leídos desde `usuarios.rol`; RLS con helpers `get_user_salon_id()` / `get_user_rol()`
- Solo `admin_salon` puede INSERT/UPDATE en servicios y paquetes (RLS)
- zod v4 instalado (usa `.issues` en errores de validación)
- Soft delete en catálogo (`activo=false`); reactivar con `activo=true`
- Motor disponibilidad puro en `src/lib/availability/` (testeable sin DB)
- Slots cada 15 min; timezone del salón vía `Intl` (sin dependencia extra)
- vitest para tests unitarios del motor de disponibilidad
- Colaboradora ve solo citas con `colaboradora_id = auth.uid()` (RLS)
- Link público: RLS `anon` + RPC `upsert_clienta_public`
- Reserva pública → `pendiente_validacion`; aprobar pago → `confirmada`; rechazar/cancelar → `cancelada` (libera slot)
- Comprobantes: Storage privado + `SUPABASE_SERVICE_ROLE_KEY` en server para upload
- Slots disponibles: query solo citas bloqueantes (`pendiente`, `pendiente_validacion`, `confirmada`)
- Link de reserva visible en dashboard (`LinkReserva`) + URL production Vercel
- Reserva pública usa cliente Supabase anónimo (RLS `anon`)
- `/ajustes`: perfil (nombre, contraseña); admin: nombre salón, logo, política reembolso
- Bucket `logos-salon` (público); migración `007_salon_branding.sql`
- Menú móvil cierra al seleccionar sección; identidad salón en sidebar (logo + nombre)
- Link reserva: tema rosa propio (`reservar.css`) + logo vía URL pública Supabase
- Agenda: cambio de fecha sin recargar página completa (server action)
- Piloto founders: slots `:00` (Tutis + Galaxy); WhatsApp manual en `/pagos`; teléfonos GT/HN/SV
- Sprint Founders 02A: horizonte reserva 3 meses; CTAs reserva más visibles
- Sprint Founders 02B: pago `asegurado` al confirmar, `cobrado` al completar; reactivar cita admin
- Sprint Founders 02C: vista mes en agenda admin + calendario mensual en reserva pública
- Web Push: notificación al admin en reserva pública; activación por dispositivo; prueba solo al dispositivo actual; iPhone vía PWA en pantalla de inicio
- Pausa diaria (almuerzo): configurable en Agenda → Horarios; migración `013_pausa_diaria.sql`
- Reserva “para otra persona”: flag en Ajustes; checkbox en link; `beneficiario_nombre` en cita; Galaxy activado por defecto (migración 015)
- Link reserva: CTA Continuar fijo al pie al elegir servicio (catálogos largos)
- Agenda: citas canceladas ocultas (no aparecen en día/semana/mes)
- Agenda admin: hora libre + duración editable al crear/reagendar (emergencias); link público sigue con intervalos

## Decisiones pendientes

- [x] Dominio producto Gota+Check comprado (`gotacheck.app`, 2026-08-04)
- [x] DNS `gotacheck.app` → Vercel marketing (Cloudflare DNS-only; live 2026-08-04)
- [ ] `NEXT_PUBLIC_APP_URL` / `NEXT_PUBLIC_SITE_URL` en prod (app + marketing) — marketing ya con WhatsApp + app URL
- [ ] Precios A/B/C + trial — **sesión exclusiva al estar listos** (`ROUTE_GOTACHECK.md` §7)
- [ ] Fecha taller (~35 maquillistas vía founders) — depende de sprints F1+F2
- [ ] Spec contenido landing tipo Daysi (sesión S2.0)
- [ ] WhatsApp: Meta Cloud API vs Twilio (Fase 2 — fuera de ruta GTM)

## Bloqueadores actuales

Ninguno técnico duro. **Puerta de negocio:** precios/taller no se definen hasta cumplir F1+F2.

## Desarrollo local

- App: **puerto 3004** (`npm run dev` → http://localhost:3004)
- Marketing Gota+Check: **puerto 3010** (`cd marketing && npm run dev` → http://localhost:3010)
- Link público demo: ~~http://localhost:3004/reservar/belleza-luna~~ → aislada (`activo=false`); usar `/reservar/gota-prueba-s13` o founders
- Supabase: cloud. Seeds: `seed-cloud.sql`, `seed-cloud-agenda.sql`
- Env requerido (app): `NEXT_PUBLIC_SUPABASE_*` + `SUPABASE_SERVICE_ROLE_KEY`
- Env marketing: ver `marketing/.env.example` (`NEXT_PUBLIC_WHATSAPP_URL`, `NEXT_PUBLIC_APP_URL`)
- Tests: `npm test` | Build app: `npm run build` | Build marketing: `cd marketing && npm run build`

## Próximo paso inmediato

1. Enviar `docs/S2.0_BRIEF_FOUNDERS.md` a Tutis + Galaxy y agendar reunión de contenido
2. Cerrar spec con lo acordado en `docs/S2.0_SPEC_VITRINA.md` → marcar S2.0 ✅
3. **S2.1** plantilla técnica · **Último:** precios / trial / taller

## Docs operativos

- Checklist migraciones: `docs/MIGRATIONS_CHECKLIST.md`
- Alta asistida: `docs/RUNBOOK_ALTA_SALON.md` → `npm run provision:salon -- …`
- Reset seguro: `supabase/reset-salon-pilot.sql` (founders bloqueados)
- Aislar demo: `supabase/isolate-demo-belleza-luna.sql`
- Hardening S1.4: `docs/S1.4_HARDENING_CHECKLIST.md` ✅
- Infra / smoke S1.2: `docs/S1.2_INFRA_CHECKLIST.md`
- Ruta GTM: `docs/ROUTE_GOTACHECK.md`

## Piloto founders (activo)

| Founder | Salón | Slug | Email |
|---------|-------|------|-------|
| Ruth Guzman | Salón Tutis | `salon-tutis` | ruth@gmail.com |
| Andrea Juarez | Galaxy Barberia Infantil | `galaxy-barberia-infantil` | andrea@gmail.com |

- Provision: `scripts/provision-founders-pilot.mjs` o `supabase/seed-founders-pilot.sql`
- Reset datos de práctica: `supabase/reset-salon-pilot.sql`
- Login: `/login` → contraseña temporal comunicada por canal privado (cambiar en `/ajustes`)
- Links reserva: `/reservar/salon-tutis` y `/reservar/galaxy-barberia-infantil`
- Catálogo/citas: vacíos al inicio; configurar en `/ajustes` y `/catalogo`

## Credenciales de desarrollo (seed demo)

| Rol | Email | Contraseña |
|-----|-------|------------|
| Admin | admin@belleza-luna.test | Admin123! |
| Colaboradora | maria@belleza-luna.test | Colab123! |

## Estructura clave

```
src/app/(dashboard)/page.tsx       → Dashboard home ✅
src/app/(dashboard)/clientas/      → CRUD clientas + historial ✅
src/app/(dashboard)/pagos/         → Cola validación comprobantes ✅
src/app/(dashboard)/agenda/          → Calendario admin ✅
src/app/(dashboard)/catalogo/        → CRUD servicios/paquetes ✅
src/lib/dashboard/                 → Queries dashboard
src/app/(dashboard)/ajustes/         → Personalización salón + perfil ✅
```

## Historial de cambios recientes

| Fecha | Cambio |
|-------|--------|
| 2026-08-05 | S2.0 borrador: `S2.0_SPEC_VITRINA.md` + brief founders |
| 2026-08-05 | S1.4 ✅ / Fase 1 completa: reset blindado, demo aislada, smoke RLS UI |
| 2026-08-05 | S1.4: reset blindado (founders); Belleza Luna `activo=false` (link 404) |
| 2026-08-05 | S1.3: `scripts/provision-salon.mjs` + prueba `gota-prueba-s13` |
| 2026-08-05 | S1.2 cerrado: Auth redirects + push smoke (Tutis) OK |
| 2026-08-05 | S1.2: checklist infra/smoke + script público; S1.1 mergeado |
| 2026-08-05 | S1.1: checklist migraciones 001–015 (cloud OK) + runbook alta salón |
| 2026-08-04 | Landing marketing Gota+Check en `marketing/` (proyecto Vercel aparte → `gotacheck.app`) |
| 2026-07-28 | Ruta GTM `ROUTE_GOTACHECK.md`; marca Gota+Check; cloud 009–015 verificadas |
| 2026-07-01 | Fase 0 + Sprint 1.1 catálogo |
| 2026-07-01 | Sprint 02A agenda admin + motor disponibilidad |
| 2026-07-01 | Sprint 02B link público `/reservar/[slug]` |
| 2026-07-01 | Fixes: slots ISO, upload comprobantes, rollback RPC |
| 2026-07-01 | Panel `/pagos` validación + liberación slots al cancelar/rechazar |
| 2026-07-01 | Dashboard home: citas hoy, pagos pendientes, ingresos del día |
| 2026-07-06 | Sprint Founders 02A/B: 3 meses reserva, teléfonos CA, pago asegurado/cobrado, reactivar cita |
| 2026-07-03 | Sprint piloto: slots hora exacta, WhatsApp manual en pagos, teléfono GT |

## Cómo actualizar este archivo

Actualizar **al final de cada sesión** o **al cerrar cada sprint**.
