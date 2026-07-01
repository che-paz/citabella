# Feature: Dashboard

> **Módulo:** Core  
> **Fase:** 1 (básico) / 2 (métricas ampliadas)  
> **Estado:** 🔴 Pendiente  
> **Sprint objetivo:** 1.4

## User stories — MVP

### Admin
- [ ] Ver citas del día (próximas y en curso)
- [ ] Ver pagos pendientes de validación (badge/cola)
- [ ] Ver ingresos del día (suma pagos validados)
- [ ] Accesos rápidos: nueva cita, validar pago, ver agenda

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

## Archivos de código (planificados)

```
src/app/(dashboard)/page.tsx          # Dashboard home
src/components/dashboard/CitasHoy.tsx
src/components/dashboard/PagosPendientes.tsx
src/components/dashboard/IngresosHoy.tsx
```

## Tablas DB

- `citas`, `pagos` (lectura agregada)

## Dependencias

- Agenda, pagos, catálogo operativos

## Notas

- Colaboradora: dashboard simplificado (solo sus citas del día)
- Admin: vista completa del salón
