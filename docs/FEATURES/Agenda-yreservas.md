# Feature: Agenda y Reservas

> **Módulo:** Core  
> **Fase:** 1 (MVP)  
> **Estado:** 🟢 MVP completo (admin + link público + validación pagos)  
> **Sprint objetivo:** 1.2 + 1.3 ✅

## User stories

### Admin / Colaboradora
- [x] Configurar días y horarios de atención del salón
- [x] Definir excepciones (feriados, días cerrados)
- [x] Ver calendario día y semana
- [x] Crear cita: clienta + servicio/paquete + colaboradora + slot
- [x] Reagendar y cancelar con reglas definidas
- [x] Ver estado de cada cita (pendiente, confirmada, etc.)

### Clienta (link público)
- [x] Acceder a `/reservar/[slug]` sin login
- [x] Elegir servicio o paquete (ve precio y duración)
- [x] Ver solo slots disponibles según duración elegida
- [x] Confirmar reserva (pasa a flujo de pago)
- [x] Recibir confirmación (in-app MVP; WhatsApp Fase 2)

## Criterios de aceptación

1. Dos servicios de distinta duración no generan solapamiento incorrecto ✅
2. Cita en feriado configurado como cerrado → no permite reserva ✅
3. Slot ocupado no aparece como disponible ✅
4. Link de reserva funciona 24/7 sin auth ✅
5. Reagendar respeta nueva disponibilidad ✅

## Motor de disponibilidad

**Ubicación código:** `src/lib/availability/`

```
Input:  salon_id, fecha, duracion_minutos, colaboradora_id?
Output: Array<{ inicio: Date, fin: Date }>
```

Algoritmo: ver `ARCHITECTURE.md` sección "Motor de disponibilidad"

**Tests:** `src/lib/availability/engine.test.ts` — `npm test`

## Archivos de código

```
src/app/(dashboard)/agenda/
src/app/reservar/[slug]/
src/components/agenda/AgendaView.tsx
src/components/agenda/CitaForm.tsx
src/components/agenda/HorariosConfig.tsx
src/components/reservar/ReservarWizard.tsx
src/lib/availability/engine.ts
src/lib/availability/slots.ts
src/lib/availability/timezone.ts
src/lib/availability/queries.ts
src/lib/agenda/actions.ts
src/lib/reservar/actions.ts
src/lib/reservar/queries.ts
src/lib/agenda/dates.ts
```

## Tablas DB

- `citas`, `horarios_salon`, `excepciones_horario`, `clientas`, `pagos`
- FK a `servicios`, `paquetes`, `clientas`, `usuarios`
- Migraciones: `003_agenda_schema.sql`, `004_agenda_rls.sql`, `005_public_booking_rls.sql`

## Dependencias

- Catálogo de servicios (duraciones) ✅
- Gestión de clientas (upsert por teléfono en link público) ✅
- Pagos (estado `pendiente_validacion` al reservar) ✅

## Fuera de scope MVP

- Recordatorios WhatsApp automáticos (Fase 2)
- Sync con Google Calendar
- Lista de espera

## Notas

- Colaboradora ve solo su agenda (RLS por `colaboradora_id`)
- Admin ve agenda completa del salón
- Timezone desde `salones.timezone` (default `America/Guatemala`)
- Reserva pública: `creada_por = 'clienta'`, sin colaboradora asignada
- RPC `upsert_clienta_public` evita duplicar clientas por teléfono
