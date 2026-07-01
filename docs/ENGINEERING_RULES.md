# CITABELLA — Engineering Rules

> **Última actualización:** 2026-07-01  
> Reglas obligatorias para todo desarrollo en este repositorio.

## Principios

1. **Multi-tenant first** — Toda query y mutación debe estar scoped por `salon_id`. Nunca confiar solo en el frontend.
2. **RLS es la fuente de verdad** — La seguridad vive en PostgreSQL, no en la app.
3. **MVP sobre perfección** — Entregar valor a founders antes de optimizar.
4. **Documentar decisiones** — Cambios de arquitectura → actualizar `ARCHITECTURE.md` o `CURRENT_STATE.md`.
5. **Minimizar scope** — Un PR = una feature o fix. No mezclar módulos.

## Convenciones de código

### TypeScript

- `strict: true` siempre
- Tipos en `src/types/`; no duplicar interfaces
- Preferir `zod` para validación de formularios y API inputs
- Server Components por defecto; `"use client"` solo cuando haya interactividad

### Naming

| Elemento | Convención | Ejemplo |
|----------|------------|---------|
| Tablas DB | snake_case, plural | `salones`, `citas` |
| Columnas DB | snake_case | `salon_id`, `created_at` |
| Componentes React | PascalCase | `AgendaCalendar.tsx` |
| Hooks | camelCase con `use` | `useCitas.ts` |
| Rutas App Router | kebab-case | `/reservar/[slug]` |
| Env vars | SCREAMING_SNAKE | `NEXT_PUBLIC_SUPABASE_URL` |

### Idioma

- **Código:** inglés (variables, funciones, commits)
- **UI / copy:** español (Guatemala)
- **Documentación:** español

## Supabase / Base de datos

- Migraciones versionadas en `supabase/migrations/` — nunca editar migraciones ya aplicadas
- Toda tabla de negocio: `id UUID PK`, `salon_id UUID FK`, `created_at`, `updated_at`
- Políticas RLS: una política por operación (SELECT, INSERT, UPDATE, DELETE)
- Seeds solo para desarrollo local

## Autenticación y roles

```
admin_salon    → CRUD completo de su salón
colaboradora   → Su agenda + clientas asignadas
clienta        → Solo su historial (auth opcional en MVP link público)
platform_admin → Panel global (Fase 3)
```

Rol almacenado en `usuarios.rol` + claim en JWT de Supabase.

## Componentes UI

- Usar shadcn/ui como base; no reinventar botones, modales, forms
- Tailwind para estilos; evitar CSS modules salvo excepción
- Mobile-first: founders usan el teléfono como herramienta principal

## API y Server Actions

- Preferir Server Actions para mutaciones del panel
- API Routes solo para: webhooks, endpoints públicos del link de reserva, integraciones externas
- Siempre validar input con zod antes de tocar DB
- Respuestas de error: mensajes en español para UI, códigos internos en logs

## Storage

- Bucket `comprobantes`: path `{salon_id}/{cita_id}/{filename}`
- Bucket `fotos-servicio`: path `{salon_id}/{cita_id}/{filename}`
- Nunca exponer URLs públicas permanentes; usar signed URLs

## Testing (cuando aplique)

- Tests unitarios para motor de disponibilidad (crítico)
- Tests de integración para flujos RLS
- No agregar tests triviales que no cubren comportamiento real

## Git y PRs

- Branch: `feat/agenda-calendario`, `fix/rls-citas`, `docs/update-schema`
- Commits: imperativo, en inglés, ≤72 chars
  - `feat: add availability engine for service duration`
  - `fix: prevent cross-tenant leak in citas query`
- Un PR por feature documentada en `FEATURES/`

## Qué NO hacer

- ❌ Queries sin filtro `salon_id` (aunque RLS proteja, la app debe ser explícita)
- ❌ Lógica de negocio en componentes React — extraer a `lib/`
- ❌ Hardcodear precios, planes o límites — usar tabla `planes_suscripcion`
- ❌ Agregar dependencias sin justificación en `CURRENT_STATE.md`
- ❌ Conversaciones largas en Cursor sin actualizar `docs/`

## Actualización de documentación

| Evento | Archivo(s) a actualizar |
|--------|-------------------------|
| Nueva feature completada | `FEATURES/<modulo>.md`, `CURRENT_STATE.md` |
| Cambio de schema | `DATABASE_SCHEMA.md` + migración |
| Cambio de arquitectura | `ARCHITECTURE.md` |
| Fin de sprint | `archive/sprint-XX.md`, `ROADMAP.md`, `CURRENT_STATE.md` |
| Nueva decisión de producto | `PROJECT_OVERVIEW.md` o feature doc |
