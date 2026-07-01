# CITABELLA — Current State

> **Última actualización:** 2026-07-01  
> **Sprint activo:** Sprint 01 — Fundación + Catálogo (Parte B pendiente)  
> **Fase:** Fase 0 ✅ completada | Sprint 1.1 catálogo 🔴 pendiente

## Resumen en una línea

Fase 0 operativa: login admin con Supabase Cloud, migraciones aplicadas, dashboard con nav. CRUD de catálogo pendiente.

## Estado por área

| Área | Estado | Notas |
|------|--------|-------|
| Documentación | 🟢 Al día | Estructura `docs/` completa |
| Repositorio / código | 🟡 En progreso | Fase 0 entregada; catálogo pendiente |
| Base de datos | 🟡 En progreso | Migraciones + seed listos; aplicar con Supabase CLI |
| Supabase | 🟢 Operativo | Cloud configurado; login verificado con seed |
| Deploy | 🔴 No iniciado | Vercel pendiente |
| Prototipo UI | 🟡 Parcial | Login + dashboard nav funcionales |
| Marca / dominio | 🟡 Pendiente | "CitaBella" es placeholder |

## Decisiones tomadas

- Stack: Next.js 14 + TypeScript + Tailwind + shadcn/ui + Supabase + Vercel
- Multi-tenant vía Row Level Security (RLS) en PostgreSQL
- Disponibilidad de agenda: cálculo dinámico por duración de servicio
- Suscripciones/planes desde MVP (founder / trial / pago)
- Pagos MVP: comprobante manual + efectivo + instrucciones Fri (sin API)
- **Nuevo:** `@supabase/ssr` para auth en App Router (server + middleware + browser)
- **Nuevo:** Roles leídos desde `usuarios.rol`; RLS con helpers `get_user_salon_id()` / `get_user_rol()`
- **Nuevo:** Solo `admin_salon` puede INSERT/UPDATE en servicios y paquetes (RLS)
- **Nuevo:** zod v4 instalado (usa `.issues` en errores de validación)

## Decisiones pendientes

- [ ] Nombre de marca final y dominio
- [ ] Prototipo navegable validado con founders
- [ ] Tiers y precios del plan de pago
- [ ] WhatsApp: Meta Cloud API vs Twilio (Fase 2)
- [ ] Fastify separado vs API routes de Next.js (evaluar si crece complejidad)

## Bloqueadores actuales

Ninguno técnico para Parte B.

## Desarrollo local

- App Next.js: **puerto 3004** (`npm run dev` → http://localhost:3004)
- Supabase: **cloud** (no requiere Docker). Scripts en `supabase/cloud-init.sql` + `seed-cloud.sql`

## Próximo paso inmediato

1. Aplicar migraciones: `supabase db reset` (local) o push a proyecto cloud
2. Implementar CRUD servicios (Sprint 1.1 — Parte B)
3. Implementar CRUD paquetes

## Credenciales de desarrollo (seed)

| Rol | Email | Contraseña |
|-----|-------|------------|
| Admin | admin@belleza-luna.test | Admin123! |
| Colaboradora | maria@belleza-luna.test | Colab123! |

## Estructura creada

```
src/app/(auth)/login/          → Login
src/app/(dashboard)/           → Panel con nav (Catálogo, Agenda, Clientas, Pagos)
src/lib/supabase/              → Clientes server, browser, middleware
supabase/migrations/           → 001 schema, 002 RLS
supabase/seed.sql              → Salón Belleza Luna + datos de prueba
```

## Historial de cambios recientes

| Fecha | Cambio |
|-------|--------|
| 2026-07-01 | Creación de documentación base del proyecto |
| 2026-07-01 | PRD v1.0 y Roadmap técnico v1.0 analizados |
| 2026-07-01 | **Fase 0 verificada:** Supabase Cloud + login admin en localhost:3004 |

## Cómo actualizar este archivo

Actualizar **al final de cada sesión de trabajo** o **al cerrar cada sprint**:
- Cambiar estado por área
- Mover decisiones de "pendientes" a "tomadas"
- Registrar bloqueadores nuevos
- Actualizar "próximo paso inmediato" (máx. 3 items)
