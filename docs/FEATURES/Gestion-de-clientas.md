# Feature: Gestión de Clientas

> **Módulo:** Core  
> **Fase:** 1 (básico) / 2 (fotos, cumpleaños)  
> **Estado:** 🔴 Pendiente  
> **Sprint objetivo:** 1.3

## User stories — MVP

### Admin / Colaboradora
- [ ] Crear clienta: nombre, teléfono, email opcional, notas
- [ ] Buscar clienta por nombre o teléfono
- [ ] Ver historial de citas por clienta
- [ ] Ver servicios realizados y estados

### Clienta (link público)
- [ ] Al reservar, ingresar datos de contacto (crea o vincula clienta)

## User stories — Fase 2

- [ ] Registrar fecha de cumpleaños
- [ ] Alerta de cumpleaños próximo en dashboard
- [ ] Subir fotos de servicio completado (portafolio)
- [ ] Galería de fotos por clienta

## Criterios de aceptación MVP

1. Clienta identificada por teléfono dentro del salón (único por salon_id)
2. Historial muestra citas ordenadas por fecha descendente
3. Datos de clienta aislados por tenant (RLS)
4. Reserva desde link público crea clienta si no existe

## Archivos de código (planificados)

```
src/app/(dashboard)/clientas/
src/app/(dashboard)/clientas/[id]/
src/components/clientas/ClientaForm.tsx
src/components/clientas/HistorialCitas.tsx
```

## Tablas DB

- `clientas` (MVP)
- `fotos_servicio` (Fase 2, tabla ya diseñada)

## Dependencias

- Fase 0 (RLS)
- Citas (para historial)

## Notas

- Teléfono formato Guatemala (+502)
- Clienta no requiere cuenta Supabase Auth en MVP
