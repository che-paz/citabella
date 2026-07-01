# Sprint 01 — Fundación + Catálogo

> **Estado:** ✅ Completado  
> **Fechas:** 2026-07-01  
> **Fase:** 0 → 1.1

## Objetivo

Establecer infraestructura multi-tenant y entregar CRUD de catálogo de servicios.

## Entregado

### Fase 0 — Fundación ✅
- [x] Scaffold Next.js 14 (App Router, TypeScript, Tailwind)
- [x] shadcn/ui configurado con componentes base
- [x] Estructura de carpetas según `ARCHITECTURE.md`
- [x] `.env.example` con variables Supabase
- [x] `001_initial_schema.sql` — tablas mínimas + enums + índices
- [x] `002_rls_policies.sql` — políticas multi-tenant por `salon_id`
- [x] `seed.sql` — salón founder, admin, colaboradora, 5 servicios, 1 paquete
- [x] Cliente Supabase (server + browser + middleware)
- [x] Auth: login admin, logout, callback route
- [x] Layout dashboard con navegación (Catálogo activo, placeholders Agenda/Clientas/Pagos)
- [x] `npm run build` exitoso

### Sprint 1.1 — Catálogo ✅
- [x] CRUD servicios (listar, crear, editar, desactivar)
- [x] CRUD paquetes (listar, crear, editar, desactivar)
- [x] Toggle "Ver inactivos" en listado
- [x] Reactivar servicios y paquetes inactivos
- [x] Precios GTQ con `formatQuetzales()`
- [x] Catálogo agrupado por categoría
- [x] Solo `admin_salon` puede mutar; colaboradora solo lectura
- [x] `npm run build` exitoso

## Decisiones tomadas

- Auth con `@supabase/ssr` y middleware en `src/middleware.ts`
- Helpers RLS: `get_user_salon_id()`, `get_user_rol()` como `SECURITY DEFINER`
- Mutaciones de catálogo restringidas a `admin_salon` en RLS
- Signup deshabilitado en Supabase config (solo usuarios creados por seed/admin)
- UUIDs fijos en seed para reproducibilidad en tests locales
- Soft delete en catálogo (`activo=false`) en lugar de DELETE físico
- Server Actions + zod para validación de formularios de catálogo

## Deuda técnica

- JWT custom claim para `rol` no implementado (se lee de `usuarios` en cada request)
- Segundo tenant de prueba en seed para validar RLS cross-tenant (pendiente)
- Warning Edge Runtime con `@supabase/supabase-js` en middleware (aceptable en MVP)
- zod v4 compatible con Server Actions; `@hookform/resolvers` no usado en catálogo (useFormState)

## Próximo sprint

- Agenda salón + motor de disponibilidad

## Archivos clave tocados

```
package.json, tailwind.config.ts, components.json
src/app/(auth)/, src/app/(dashboard)/catalogo/
src/lib/supabase/, src/lib/auth/, src/lib/catalogo/
src/components/ui/, src/components/dashboard/, src/components/auth/
src/components/catalogo/
src/types/database.ts
supabase/migrations/001_initial_schema.sql
supabase/migrations/002_rls_policies.sql
supabase/seed.sql, supabase/config.toml
.env.example
```
