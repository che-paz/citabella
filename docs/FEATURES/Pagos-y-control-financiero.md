# Feature: Pagos y Control Financiero

> **Módulo:** Core (pagos MVP) + Fase 2 (contabilidad)  
> **Fase:** 1 (pagos básicos) / 2 (contabilidad completa)  
> **Estado:** 🟡 MVP pagos básicos ✅ | contabilidad Fase 2 pendiente  
> **Sprint objetivo:** 1.4

## User stories — MVP (Fase 1)

### Clienta
- [x] Subir foto de comprobante de transferencia/depósito
- [x] Ver instrucciones de pago (incl. link Fri si configurado)
- [x] Elegir "pago en efectivo en salón" (sin comprobante previo)
- [x] Ver política de reembolso antes de confirmar

### Admin
- [x] Ver cola de pagos pendientes de validación
- [x] Aprobar o rechazar comprobante
- [x] Al aprobar → cita pasa a `confirmada`
- [x] Al rechazar → cita pasa a `cancelada` (libera horario)
- [x] Confirmar cita con pago en efectivo

## User stories — Fase 2

- [ ] Registro de ingresos y egresos
- [ ] Control de gastos operativos
- [ ] Control de deudas (clienta debe saldo)
- [ ] Reporte financiero mensual

## Criterios de aceptación MVP

1. Comprobante se almacena en Supabase Storage (privado) ✅
2. Solo admin del salón ve comprobantes ✅
3. Cita sin pago validado permanece en `pendiente_validacion` ✅
4. Efectivo: confirmación manual en `/pagos` ✅
5. Política de reembolso visible en flujo de reserva ✅

## Archivos de código

```
src/app/(dashboard)/pagos/page.tsx
src/components/pagos/ValidacionCola.tsx
src/lib/pagos/actions.ts
src/lib/pagos/queries.ts
src/lib/storage/comprobantes.ts
src/lib/supabase/admin.ts
src/app/reservar/[slug]/           # upload clienta
```

## Tablas DB

- `pagos` (MVP)
- `movimientos_contables` (Fase 2)

## Dependencias

- Citas creadas (link público o admin) ✅
- Supabase Storage configurado ✅
- `SUPABASE_SERVICE_ROLE_KEY` para upload server-side

## Notas

- Cancelar cita desde agenda también rechaza pago pendiente asociado
- Signed URL comprobante: 5 min TTL para admin
