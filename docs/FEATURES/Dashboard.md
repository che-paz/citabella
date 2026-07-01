# Feature: Dashboard

> **Módulo:** Core  
> **Fase:** 1 (básico) / 2 (métricas ampliadas)  
> **Estado:** 🟢 MVP completado  
> **Sprint objetivo:** 1.4

## User stories — MVP

### Admin
- [x] Ver citas del día (próximas y en curso)
- [x] Ver pagos pendientes de validación (badge/cola)
- [x] Ver ingresos del día (suma pagos validados)
- [x] Accesos rápidos: nueva cita, validar pago, ver agenda

## User stories — Fase 2

- [ ] Cumpleaños de clientas en próximos 7 días
- [ ] Historial de no-shows del mes
- [ ] Gráfico ingresos vs egresos
- [ ] Métricas: tasa no-show, servicios más vendidos

## Criterios de aceptación MVP

1. Dashboard carga en <2s con datos del día
2. Contador de pagos pendientes es exacto
3. Ingresos del día = suma pagos `validado` con fecha hoy
4. Responsive: usable en móvil (founders en teléfono)

## Widgets MVP

| Widget | Fuente |
|--------|--------|
| Citas hoy | `citas` WHERE inicio = today |
| Pagos por validar | `pagos` WHERE estado = pendiente |
| Ingresos hoy | `pagos` WHERE estado = validado AND today |
| Acciones rápidas | Links internos |

## Archivos de código

```
src/app/(dashboard)/page.tsx          # Dashboard home
src/lib/dashboard/queries.ts          # Citas hoy, pagos pendientes, ingresos
src/components/dashboard/CitasHoy.tsx
src/components/dashboard/PagosPendientes.tsx
src/components/dashboard/IngresosHoy.tsx
src/components/dashboard/AccionesRapidas.tsx
```

## Tablas DB

- `citas`, `pagos` (lectura agregada)

## Dependencias

- Agenda, pagos, catálogo operativos

## Notas

- Colaboradora: dashboard simplificado (solo sus citas del día)
- Admin: vista completa del salón
