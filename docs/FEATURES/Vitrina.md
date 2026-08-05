# Vitrina — landing del salón (SKU B/C)

> **Sprint:** S2.1 (esqueleto)  
> **Ruta:** `/vitrina/[slug]`  
> **Spec contenido:** `docs/S2.0_SPEC_VITRINA.md`

## Qué es

Página pública de una sola URL: marca + servicios + fotos + CTA a `/reservar/[slug]`.  
No es el dashboard ni el wizard de reserva.

## Estado S2.1

- Plantilla única con temas `beauty` | `kids` (CSS vars).
- Nombre y logo desde `salones` (mismo filtro `activo=true` que reserva pública).
- Servicios: catálogo público si hay ítems; si no, placeholders.
- Copy / contacto / fotos: placeholders en `src/lib/vitrina/placeholders.ts` (por slug).
- Sin migración DB; editor = S2.2.

## Archivos

| Path | Rol |
|------|-----|
| `src/app/vitrina/[slug]/page.tsx` | Route + metadata |
| `src/app/vitrina/layout.tsx` | Fuentes Fraunces + Outfit |
| `src/components/vitrina/VitrinaLanding.tsx` | Secciones UI |
| `src/lib/vitrina/*` | Types, placeholders, resolve |

## URLs de prueba (prod)

- `…/vitrina/salon-tutis`
- `…/vitrina/galaxy-barberia-infantil`
- `…/vitrina/gota-prueba-s13`

Salones inactivos → 404 (igual que `/reservar`).

## Fuera de S2.1

- Editor dueña (S2.2)
- Dominio propio del salón (S2.4)
- Precios en vitrina (decisión abierta S2.0)
