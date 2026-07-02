# CITABELLA — Current State

> **Última actualización:** 2026-07-02  
> **Sprint activo:** Piloto founders — personalización salón + UX móvil  
> **Fase:** Fase 1 MVP ✅ | Piloto founders en curso

## Resumen en una línea

MVP en Vercel. Founders pueden personalizar salón (nombre, logo, política reembolso), perfil y contraseña en `/ajustes`. UX móvil: menú se cierra al navegar.

## Estado por área

| Área | Estado | Notas |
|------|--------|-------|
| Documentación | 🟢 Al día | Sprint 02 + fixes documentados |
| Repositorio / código | 🟢 MVP core | Flujo reserva + validación pagos verificado |
| Base de datos | 🟢 Migraciones 005/006 | Aplicadas en cloud (usuario confirmó) |
| Supabase | 🟢 Operativo | RLS público + bucket `comprobantes` + service role |
| Deploy | 🟢 Staging Vercel | GitHub → Vercel; link reserva en dashboard |
| Prototipo UI | 🟢 MVP core | Dashboard + clientas listos |
| Finanzas / gastos | 🟢 MVP | `/finanzas` ingresos vs gastos + balance mes |
| PWA | 🟢 Configurado | Manifest + iconos Gota+Check; nombre app instalada: Gota+Check |

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
- Link de reserva visible en dashboard (`LinkReserva`) + URL production Vercel
- Reserva pública usa cliente Supabase anónimo (RLS `anon`)
- `/ajustes`: perfil (nombre, contraseña); admin: nombre salón, logo, política reembolso
- Bucket `logos-salon` (público); migración `007_salon_branding.sql`
- Menú móvil cierra al seleccionar sección; identidad salón en sidebar (logo + nombre)
- Link reserva: tema rosa propio (`reservar.css`) + logo vía URL pública Supabase
- Agenda: cambio de fecha sin recargar página completa (server action)
- PWA: `manifest.ts`, iconos cuadrados generados desde `public/icons/logogotacheck.png` (asset oficial Gota+Check); paleta `#f4b0a6`

## Decisiones pendientes

- [ ] Nombre de marca final y dominio
- [ ] Prototipo navegable validado con founders
- [ ] Tiers y precios del plan de pago
- [ ] WhatsApp: Meta Cloud API vs Twilio (Fase 2)
- [ ] Dominio propio (`NEXT_PUBLIC_SITE_URL`) vs `*.vercel.app`

## Bloqueadores actuales

Ninguno.

## Desarrollo local

- App: **puerto 3004** (`npm run dev` → http://localhost:3004)
- Link público: http://localhost:3004/reservar/belleza-luna
- Supabase: cloud. Seeds: `seed-cloud.sql`, `seed-cloud-agenda.sql`
- Env requerido: `NEXT_PUBLIC_SUPABASE_*` + `SUPABASE_SERVICE_ROLE_KEY`
- Tests: `npm test` | Build: `npm run build`

## Próximo paso inmediato

1. **Aplicar migraciones 007 y 008** en Supabase Cloud (logo + gastos)
2. Push a GitHub → redeploy Vercel
3. Probar PWA: “Agregar a pantalla de inicio” en móvil
4. Piloto founders — Ruth (Tutis) y Andrea (Galaxy) provisionadas

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
| 2026-07-01 | Fase 0 + Sprint 1.1 catálogo |
| 2026-07-01 | Sprint 02A agenda admin + motor disponibilidad |
| 2026-07-01 | Sprint 02B link público `/reservar/[slug]` |
| 2026-07-01 | Fixes: slots ISO, upload comprobantes, rollback RPC |
| 2026-07-01 | Panel `/pagos` validación + liberación slots al cancelar/rechazar |
| 2026-07-01 | Dashboard home: citas hoy, pagos pendientes, ingresos del día |
| 2026-07-01 | Ajustes founders: logo, perfil, contraseña, menú móvil, estilos |

## Cómo actualizar este archivo

Actualizar **al final de cada sesión** o **al cerrar cada sprint**.
