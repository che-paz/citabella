# Feature: Agenda y Reservas

> **Módulo:** Core  
> **Fase:** 1 (MVP)  
> **Estado:** 🔴 Pendiente  
> **Sprint objetivo:** 1.2 + 1.3

## User stories

### Admin / Colaboradora
- [ ] Configurar días y horarios de atención del salón
- [ ] Definir excepciones (feriados, días cerrados)
- [ ] Ver calendario día y semana
- [ ] Crear cita: clienta + servicio/paquete + colaboradora + slot
- [ ] Reagendar y cancelar con reglas definidas
- [ ] Ver estado de cada cita (pendiente, confirmada, etc.)

### Clienta (link público)
- [ ] Acceder a `/reservar/[slug]` sin login
- [ ] Elegir servicio o paquete (ve precio y duración)
- [ ] Ver solo slots disponibles según duración elegida
- [ ] Confirmar reserva (pasa a flujo de pago)
- [ ] Recibir confirmación (in-app MVP; WhatsApp Fase 2)

## Criterios de aceptación

1. Dos servicios de distinta duración no generan solapamiento incorrecto
2. Cita en feriado configurado como cerrado → no permite reserva
3. Slot ocupado no aparece como disponible
4. Link de reserva funciona 24/7 sin auth
5. Reagendar respeta nueva disponibilidad

## Motor de disponibilidad

**Ubicación código:** `src/lib/availability/`

```
Input:  salon_id, fecha, duracion_minutos, colaboradora_id?
Output: Array<{ inicio: Date, fin: Date }>
```

Algoritmo: ver `ARCHITECTURE.md` sección "Motor de disponibilidad"

## Archivos de código (planificados)

```
src/app/(dashboard)/agenda/
src/app/reservar/[slug]/
src/components/agenda/
src/lib/availability/engine.ts
src/lib/availability/slots.ts
src/hooks/useCitas.ts
```

## Tablas DB

- `citas`, `horarios_salon`, `excepciones_horario`
- FK a `servicios`, `paquetes`, `clientas`, `usuarios`

## Dependencias

- Catálogo de servicios (duraciones)
- Gestión de clientas (para citas admin)
- Pagos (estado `pendiente_validacion` al reservar con comprobante)

## Fuera de scope MVP

- Recordatorios WhatsApp automáticos (Fase 2)
- Sync con Google Calendar
- Lista de espera

## Notas

- Colaboradora ve solo su agenda (RLS por `colaboradora_id`)
- Admin ve agenda completa del salón
