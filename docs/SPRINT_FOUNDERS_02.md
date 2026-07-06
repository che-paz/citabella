# Sprint Founders 02 — Reunión 2 (Ruth + Andrea)

> **Fecha reunión:** 2026-07-06  
> **Estado:** En implementación  
> **Fuente:** Feedback operativo con citas reales en producción

## Decisiones de producto (cerradas)

| # | Pedido | Decisión |
|---|--------|----------|
| 1 | Reservar meses adelante | **3 meses** máximo (panel + link público) |
| 2 | Anticipos transferencia/Fri | Aseguran la cita al confirmar; **ingreso solo al completar** servicio |
| 3 | Efectivo | **No cobrado** al confirmar; ingreso **al completar** cita |
| 4 | Teléfonos | **Guatemala (502), Honduras (504), El Salvador (503)** |
| 5 | Reactivar cita | Admin puede revertir `completada` y `cancelada` → `confirmada` (casos raros) |
| 6 | Vista mes | Calendario mensual en **agenda panel** y **selector fecha reserva pública** |

## Modelo de pagos (Sprint B)

Separar **cita confirmada** de **dinero cobrado (ingreso)**.

| Momento | Cita | Pago | Ingresos |
|---------|------|------|----------|
| Reserva + comprobante | `pendiente_validacion` | `pendiente` | No |
| Founder confirma | `confirmada` | `asegurado` | No |
| Founder completa + cobró | `completada` | `cobrado` | Sí (`cobrado_at` hoy) |
| Rechazo | `cancelada` | `rechazado` | No |

- `validado` (legacy): datos históricos; nuevas confirmaciones usan `asegurado`.
- Dashboard ingresos / finanzas: solo `cobrado` por `cobrado_at`.
- Migración: `010_pago_asegurado_cobrado.sql`

## Sprints de implementación

### Sprint A — Quick wins ✅
- [x] Horizonte reserva 3 meses (`SlotPicker`, `CitaForm`)
- [x] Botones Continuar/Confirmar más visibles (reserva + admin)
- [x] Teléfonos GT + HN + SV (`src/lib/utils/phone.ts`)

### Sprint B — Dinero y operación ✅
- [x] Migración estados pago `asegurado` / `cobrado`
- [x] `validarPagoAction` → `asegurado` (no ingreso)
- [x] Completar cita → `cobrado` + ingresos
- [x] Historial clienta: método + estado pago
- [x] Reactivar cita `completada` / `cancelada`

### Sprint C — Vista mes ✅
- [x] Vista `month` en `/agenda` (grilla + indicadores)
- [x] Calendario mensual en link público (`SlotPicker`)

### Después
- Web Push (nueva reserva / comprobante)
- Fotos historial clienta (Fase 1.5)

## Comunicación a founders (antes deploy Sprint B)

> “Confirmar cita ya no suma al ingreso del día. El ingreso se registra al marcar la cita completada y cobrada. Los anticipos por transferencia siguen asegurando la cita al confirmar.”

## Archivos clave

```
src/lib/utils/phone.ts
src/components/reservar/SlotPicker.tsx
src/lib/pagos/actions.ts
src/lib/agenda/actions.ts
src/lib/dashboard/queries.ts
src/lib/finanzas/queries.ts
src/components/clientas/HistorialCitas.tsx
src/components/agenda/AgendaView.tsx
supabase/migrations/010_pago_asegurado_cobrado.sql
```
