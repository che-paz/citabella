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
- [x] Crear evento personal (reunión, dentista): título, fecha, inicio, fin y notas; ocupa la agenda
- [x] Editar y borrar un evento personal
- [x] Ver el evento en día, semana y mes, con el mismo formato de una cita y color violeta
- [x] Elegir «Recordarme» en un evento personal (sin aviso, 15 min, 30 min, 1 hora o 1 día). Al crear, el default es 30 min
- [x] Ver una campana en la tarjeta del evento cuando tiene recordatorio
- [x] En Ajustes, «Recordarme mis citas» (apagado, 15, 30 o 60 min). Nace apagado

### Clienta (link público)
- [x] Acceder a `/reservar/[slug]` sin login
- [x] Elegir servicio o paquete (ve precio y duración)
- [x] Ver solo slots disponibles según duración elegida
- [x] Ver una × en los días que ya no tienen hora libre, sin abrirlos
- [x] No ver el título ni las notas de un evento personal (solo que la hora está ocupada)
- [x] Confirmar reserva (pasa a flujo de pago)
- [x] Reservar para otra persona (si el salón lo habilita): contacto ≠ quien asiste
- [x] Recibir confirmación (in-app MVP; WhatsApp Fase 2)

## Criterios de aceptación

1. Dos servicios de distinta duración no generan solapamiento incorrecto ✅
2. Cita en feriado configurado como cerrado → no permite reserva ✅
3. Slot ocupado no aparece como disponible ✅
4. Link de reserva funciona 24/7 sin auth ✅
5. Reagendar respeta nueva disponibilidad ✅
6. DB: trigger `citas_prevent_overlap` (migración 019) bloquea solapes en estados bloqueantes ✅
7. Disponibilidad falla cerrado si no se pueden leer citas, horarios o eventos personales ✅
8. Un evento personal no se guarda encima de una cita bloqueante; el aviso incluye nombre y hora ✅
9. Una cita nueva no cae encima de un evento personal (trigger `citas_prevent_bloqueo`, migración 020) ✅
10. El link público no lee `titulo` ni `notas` (RPC `get_salon_bloqueos_ocupados`) ✅
11. Un recordatorio se envía una sola vez. Si cambia la hora de inicio o el aviso del evento, queda pendiente otra vez. Si el evento se borra, no se envía ✅
12. El aviso de citas solo sale para `pendiente_validacion` y `confirmada`, y solo si el salón lo encendió. Un reagendado puede avisar de nuevo. Lo ya empezado no se avisa ✅

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
src/components/agenda/AgendaEventoCard.tsx
src/components/agenda/EventoPersonalForm.tsx
src/components/agenda/CitaForm.tsx
src/components/agenda/HorariosConfig.tsx
src/components/ui/month-calendar.tsx
src/components/reservar/ReservarWizard.tsx
src/components/reservar/SlotPicker.tsx
src/lib/availability/engine.ts
src/lib/availability/slots.ts
src/lib/availability/timezone.ts
src/lib/availability/queries.ts
src/lib/agenda/actions.ts
src/lib/agenda/bloqueos.ts
src/lib/agenda/queries.ts
src/lib/reservar/actions.ts
src/lib/reservar/queries.ts
src/lib/agenda/dates.ts
src/lib/reminders/window.ts
src/lib/reminders/format.ts
src/lib/reminders/run.ts
src/app/api/cron/recordatorios/route.ts
```

## Tablas DB

- `citas`, `bloqueos_agenda`, `horarios_salon`, `excepciones_horario`, `clientas`, `pagos`
- FK a `servicios`, `paquetes`, `clientas`, `usuarios`
- Migraciones: `003_agenda_schema.sql`, `004_agenda_rls.sql`, `005_public_booking_rls.sql`, `019_prevent_cita_overlap.sql`, `020_bloqueos_agenda.sql`, `021_recordatorios.sql`

## Dependencias

- Catálogo de servicios (duraciones) ✅
- Gestión de clientas (upsert por teléfono en link público) ✅
- Pagos (estado `pendiente_validacion` al reservar) ✅

## Fuera de scope MVP

- Recordatorios WhatsApp automáticos (Fase 2)
- Sync con Google Calendar
- Lista de espera
- Repetición semanal de eventos personales (v2)
- Elegir qué colaboradora recibe el recordatorio (v1 avisa a todos los dispositivos del salón)
- SMS y recordatorios a la clienta

## Notas

- Colaboradora ve solo su agenda (RLS por `colaboradora_id`)
- Admin ve agenda completa del salón
- Citas `cancelada` no se muestran en la agenda (sí quedan en historial de clienta)
- Admin/colaboradora pueden crear o reagendar con hora libre y duración custom (solo panel; link público usa slots)
- Pausa diaria (almuerzo): bloqueo recurrente en `salones`; opt-in, default desactivado
- Evento personal: botón aparte de «Nueva cita». Tabla `bloqueos_agenda`. Por defecto ocupa todo el salón; la admin puede asignarlo a una colaboradora. La colaboradora solo crea los suyos y ve los de todo el salón. Mismo día local; cualquier hora, también fuera del horario. En la agenda se ve como cita, en violeta. Si ya hay cita bloqueante, no se guarda y el aviso lleva el nombre y la hora
- Día lleno: el mes marca × cuando ya no queda hora libre (citas + eventos + pausa). En el panel el día se puede abrir. En `/reservar` la × usa la duración del servicio elegido y ese día no se abre. Un día cerrado no lleva ×
- El link público solo recibe inicio y fin del evento, vía `get_salon_bloqueos_ocupados`
- Migración `020` aplicada en cloud (2026-10-12). Este código y esa migración van juntos: si la RPC no existe, la disponibilidad falla cerrada (no muestra horas libres)
- Recordatorios v1: push al salón, no a la clienta. Evento: «Recordarme» en el formulario (default 30 min al crear; un evento viejo sin valor sigue en «Sin aviso»). Citas: ajuste del salón, default apagado (`NULL`). Textos en 12 h, zona del salón. Al tocar, abre `/agenda` en ese día. Cada aviso sale una vez. La tarea corre cada 5 min (`pg_cron` + `pg_net` → `POST /api/cron/recordatorios`, header `Authorization: Bearer CRON_SECRET`). No usa Vercel Cron. Migración `021` aplicada en cloud el 2026-10-15. El cron de producción aún no está programado
- Timezone desde `salones.timezone` (default `America/Guatemala`)
- Reserva pública: `creada_por = 'clienta'`, sin colaboradora asignada
- RPC `upsert_clienta_public` evita duplicar clientas por teléfono
