# Sprint 01 — Fundación + Catálogo

> **Estado:** En progreso — Fase 0 completada, Sprint 1.1 pendiente  
> **Fechas:** 2026-07-01 — _en curso_  
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

### Sprint 1.1 — Catálogo 🔴
- [ ] CRUD servicios
- [ ] CRUD paquetes
- [ ] Verificación RLS cross-tenant

## Decisiones tomadas

- Auth con `@supabase/ssr` y middleware en `src/middleware.ts`
- Helpers RLS: `get_user_salon_id()`, `get_user_rol()` como `SECURITY DEFINER`
- Mutaciones de catálogo restringidas a `admin_salon` en RLS
- Signup deshabilitado en Supabase config (solo usuarios creados por seed/admin)
- UUIDs fijos en seed para reproducibilidad en tests locales

## Deuda técnica

- JWT custom claim para `rol` no implementado (se lee de `usuarios` en cada request)
- Segundo tenant de prueba en seed para validar RLS cross-tenant (pendiente)
- Warning Edge Runtime con `@supabase/supabase-js` en middleware (aceptable en MVP)
- zod v4 instalado; verificar compatibilidad con `@hookform/resolvers` en Parte B

## Próximo sprint

- Agenda salón + motor de disponibilidad

## Archivos clave tocados

```
package.json, tailwind.config.ts, components.json
src/app/(auth)/, src/app/(dashboard)/
src/lib/supabase/, src/lib/auth/
src/components/ui/, src/components/dashboard/, src/components/auth/
src/types/database.ts
supabase/migrations/001_initial_schema.sql
supabase/migrations/002_rls_policies.sql
supabase/seed.sql, supabase/config.toml
.env.example
```
