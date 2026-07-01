# Feature: Pagos y Control Financiero

> **Módulo:** Core (pagos MVP) + Fase 2 (contabilidad)  
> **Fase:** 1 (pagos básicos) / 2 (contabilidad completa)  
> **Estado:** 🔴 Pendiente  
> **Sprint objetivo:** 1.4

## User stories — MVP (Fase 1)

### Clienta
- [ ] Subir foto de comprobante de transferencia/depósito
- [ ] Ver instrucciones de pago (incl. link Fri si configurado)
- [ ] Elegir "pago en efectivo en salón" (sin comprobante previo)
- [ ] Ver política de reembolso antes de confirmar

### Admin
- [ ] Ver cola de pagos pendientes de validación
- [ ] Aprobar o rechazar comprobante
- [ ] Al aprobar → cita pasa a `confirmada`
- [ ] Registrar pago en efectivo directamente

## User stories — Fase 2

- [ ] Registro de ingresos y egresos
- [ ] Control de gastos operativos
- [ ] Control de deudas (clienta debe saldo)
- [ ] Reporte financiero mensual

## Criterios de aceptación MVP

1. Comprobante se almacena en Supabase Storage (privado)
2. Solo admin del salón ve comprobantes
3. Cita sin pago validado permanece en `pendiente_validacion`
4. Efectivo: cita puede crearse como `confirmada` directamente por admin
5. Política de reembolso del salón visible en flujo de reserva

## Métodos de pago

| Método | MVP | Notas |
|--------|-----|-------|
| Transferencia + comprobante | ✅ | Validación manual |
| Efectivo en salón | ✅ | Sin comprobante previo |
| Fri (QR) | ✅ | Instrucciones visibles; comprobante manual |
| Pasarela automática | ❌ | Fase 3+ si aplica |

## Archivos de código (planificados)

```
src/app/(dashboard)/pagos/
src/app/reservar/[slug]/pago/
src/components/pagos/ComprobanteUpload.tsx
src/components/pagos/ValidacionCola.tsx
src/lib/storage/comprobantes.ts
```

## Tablas DB

- `pagos` (MVP)
- `movimientos_contables` (Fase 2, tabla ya diseñada)

## Dependencias

- Citas creadas (link público o admin)
- Supabase Storage configurado

## Riesgos

- Validación manual no escala → aceptable MVP; automatizar post-validación con founders
