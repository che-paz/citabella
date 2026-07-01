# Feature: Catálogo de Servicios y Paquetes

> **Módulo:** Core  
> **Fase:** 1 (MVP)  
> **Estado:** 🟢 Completado (Sprint 1.1)  
> **Sprint objetivo:** 1.1

## User stories

### Admin
- [x] Crear servicio: nombre, categoría, precio, duración, descripción
- [x] Editar y desactivar servicio (no eliminar si tiene citas)
- [x] Reactivar servicio desactivado
- [x] Crear paquete: nombre, servicios incluidos, precio, duración total
- [x] Editar, desactivar y reactivar paquete
- [x] Ver catálogo organizado por categoría

### Clienta (link público)
- [ ] Ver servicios activos con precio y duración estimada
- [ ] Ver paquetes disponibles con precio

## Categorías iniciales (sugeridas)

- Maquillaje social
- Maquillaje novias
- Peinado
- Cejas
- Uñas
- Otro (custom)

## Criterios de aceptación

1. Duración en minutos alimenta motor de disponibilidad
2. Servicio desactivado no aparece en link público
3. Paquete muestra precio final (puede diferir de suma de servicios)
4. Precio en GTQ con formato local

## Archivos de código

```
src/app/(dashboard)/catalogo/page.tsx
src/components/catalogo/ServicioForm.tsx
src/components/catalogo/PaqueteForm.tsx
src/components/catalogo/CatalogoList.tsx
src/lib/catalogo/actions.ts
```

## Tablas DB

- `servicios`, `paquetes`, `paquete_servicios`

## Dependencias

- Fase 0 (RLS, auth admin)

## Bloquea a

- Agenda y reservas (necesita duraciones)
- Link público de reserva

## Notas de implementación

- Mutaciones vía Server Actions con validación zod
- Desactivar = `activo=false` (soft delete); reactivar = `activo=true`
- Colaboradora: solo lectura en UI (`isAdmin` controla botones de edición)
- Toggle "Ver inactivos" muestra items inactivos con botón Reactivar
- Paquetes: junction `paquete_servicios` se reemplaza (delete + insert) al editar
