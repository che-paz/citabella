# Feature: Catálogo de Servicios y Paquetes

> **Módulo:** Core  
> **Fase:** 1 (MVP)  
> **Estado:** 🔴 Pendiente  
> **Sprint objetivo:** 1.1

## User stories

### Admin
- [ ] Crear servicio: nombre, categoría, precio, duración, descripción
- [ ] Editar y desactivar servicio (no eliminar si tiene citas)
- [ ] Crear paquete: nombre, servicios incluidos, precio, duración total
- [ ] Ver catálogo organizado por categoría

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

## Archivos de código (planificados)

```
src/app/(dashboard)/catalogo/
src/components/catalogo/ServicioForm.tsx
src/components/catalogo/PaqueteForm.tsx
src/components/catalogo/CatalogoList.tsx
```

## Tablas DB

- `servicios`, `paquetes`, `paquete_servicios`

## Dependencias

- Fase 0 (RLS, auth admin)

## Bloquea a

- Agenda y reservas (necesita duraciones)
- Link público de reserva
