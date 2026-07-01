# CITABELLA — Current State

> **Última actualización:** 2026-07-01  
> **Sprint activo:** Sprint 1.4 ✅ (dashboard + clientas completados; deploy pendiente)  
> **Fase:** Fase 0 ✅ | Sprint 1.1 ✅ | Sprint 02 ✅ | Sprint 1.4 ✅ (excepto deploy)

## Resumen en una línea

MVP operativo en local: catálogo, agenda, link público, validación de pagos, dashboard home y CRUD clientas. Falta deploy Vercel.

## Estado por área

| Área | Estado | Notas |
|------|--------|-------|
| Documentación | 🟢 Al día | Sprint 02 + fixes documentados |
| Repositorio / código | 🟢 MVP core | Flujo reserva + validación pagos verificado |
| Base de datos | 🟢 Migraciones 005/006 | Aplicadas en cloud (usuario confirmó) |
| Supabase | 🟢 Operativo | RLS público + bucket `comprobantes` + service role |
| Deploy | 🟢 Staging Vercel | GitHub → Vercel; link reserva en dashboard |
| Prototipo UI | 🟢 MVP core | Dashboard + clientas listos |
| Marca / dominio | 🟡 Pendiente | "CitaBella" es placeholder |

## Decisiones tomadas

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
- Validación pagos: `/pagos` admin — aprobar/rechazar + signed URL comprobante

## Decisiones pendientes

- [ ] Nombre de marca final y dominio
- [ ] Prototipo navegable validado con founders
- [ ] Tiers y precios del plan de pago
- [ ] WhatsApp: Meta Cloud API vs Twilio (Fase 2)
- [ ] Deploy Vercel: dominio staging vs producción

## Bloqueadores actuales

Ninguno.

## Desarrollo local

- App: **puerto 3004** (`npm run dev` → http://localhost:3004)
- Link público: http://localhost:3004/reservar/belleza-luna
- Supabase: cloud. Seeds: `seed-cloud.sql`, `seed-cloud-agenda.sql`
- Env requerido: `NEXT_PUBLIC_SUPABASE_*` + `SUPABASE_SERVICE_ROLE_KEY`
- Tests: `npm test` | Build: `npm run build`

## Próximo paso inmediato

1. **Deploy Vercel** — staging con env vars (`NEXT_PUBLIC_SUPABASE_*`, `SUPABASE_SERVICE_ROLE_KEY`)
2. Validación founders con salón real 1 semana

## Credenciales de desarrollo (seed)

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
src/lib/clientas/                  → Queries + actions clientas
```

## Historial de cambios recientes

| Fecha | Cambio |
|-------|--------|
| 2026-07-01 | Fase 0 + Sprint 1.1 catálogo |
| 2026-07-01 | Sprint 02A agenda admin + motor disponibilidad |
| 2026-07-01 | Sprint 02B link público `/reservar/[slug]` |
| 2026-07-01 | Fixes: slots ISO, upload comprobantes, rollback RPC |
| 2026-07-01 | Panel `/pagos` validación + liberación slots al cancelar/rechazar |
| 2026-07-01 | Dashboard home: citas hoy, pagos pendientes, ingresos del día |
| 2026-07-01 | CRUD clientas `/clientas` + historial por clienta |

## Cómo actualizar este archivo

Actualizar **al final de cada sesión** o **al cerrar cada sprint**.
