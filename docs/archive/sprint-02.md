# Sprint 02 — Agenda + Link Público

> **Estado:** ✅ Completado (Parte A + B)  
> **Fechas:** 2026-07-01  
> **Fase:** 1.2 + 1.3

## Objetivo

Calendario admin funcional y flujo de reserva clienta vía link público.

## Entregado (Parte A)

- [x] Migraciones DB: `clientas`, `citas`, `horarios_salon`, `excepciones_horario` + RLS
- [x] Motor de disponibilidad dinámico por duración (`engine.ts`, `slots.ts`)
- [x] Tests unitarios del motor (9 casos, `npm test`)
- [x] Configuración horarios y excepciones (solo admin)
- [x] UI agenda día/semana mobile-first
- [x] Crear, reagendar, cancelar citas con validación de slots
- [x] RLS: colaboradora ve solo sus citas
- [x] Seed: 3 clientas, horarios Lun–Sáb, 5 citas de prueba

## Entregado (Parte B)

- [x] Migración `005_public_booking_rls.sql`: tabla `pagos`, RLS público, bucket `comprobantes`
- [x] Link público `/reservar/[slug]` sin login
- [x] Catálogo activo (servicios + paquetes con precio y duración)
- [x] Política de reembolso visible en flujo
- [x] Slots vía `fetchAvailabilitySlots` (motor existente)
- [x] Formulario clienta: nombre + teléfono (upsert por RPC)
- [x] Confirmar reserva → `pendiente_validacion`
- [x] Pago MVP: transferencia/Fri con comprobante + efectivo sin comprobante
- [x] Página de confirmación post-reserva
- [x] `npm run build` pasa sin errores

## Decisiones tomadas

- Slots generados cada 15 minutos dentro de ventanas disponibles
- Timezone vía `Intl` nativo (sin `date-fns-tz`)
- vitest como runner de tests unitarios
- Citas bloqueantes: `pendiente`, `pendiente_validacion`, `confirmada`
- RLS `anon` para lectura catálogo/horarios/citas (disponibilidad)
- INSERT anónimo citas/clientas/pagos scoped por salón activo
- Storage comprobantes: path `{salon_id}/{cita_id}/{filename}`, bucket privado

## Deuda técnica

- Aplicar migración 005 en Supabase Cloud
- CRUD clientas en dashboard sigue pendiente (usa seed + upsert público)
- Panel `/pagos` admin (validación comprobantes) → Sprint 1.4

## Próximo sprint

- Sprint 1.4: cola validación pagos admin
- Deploy Vercel

## Archivos clave tocados

```
supabase/migrations/003_agenda_schema.sql
supabase/migrations/004_agenda_rls.sql
supabase/migrations/005_public_booking_rls.sql
src/lib/availability/*
src/lib/agenda/*
src/lib/reservar/*
src/lib/storage/comprobantes.ts
src/components/agenda/*
src/components/reservar/*
src/app/(dashboard)/agenda/page.tsx
src/app/reservar/[slug]/*
src/types/database.ts
```
