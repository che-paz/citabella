# Vitrina — landing del salón (servicio del estudio)

> **Sprint:** S2.3 🟡 · S2.1 ✅ · S2.2 ❌ aparcado  
> **Ruta:** `/vitrina/[slug]`  
> **Spec:** `docs/S2.0_SPEC_VITRINA.md`

## Qué es

Página pública: marca + servicios + fotos + CTA a `/reservar/[slug]`.  
El estudio monta el contenido (no hay editor self-serve en esta fase).

## Estado

| Salón | Slug | Contenido |
|-------|------|-----------|
| Tutis | `salon-tutis` | ✅ Live — `src/lib/vitrina/live.ts` + `public/vitrina/salon-tutis/` |
| Galaxy | `galaxy-barberia-infantil` | ⬜ Pendiente |
| Pitch stock | sin live pack | `?demo=1` → Unsplash |

## Archivos

| Path | Rol |
|------|-----|
| `src/lib/vitrina/live.ts` | Packs reales por slug |
| `public/vitrina/[slug]/` | Logo, hero, portfolio (web) |
| `files/vitrina/` | Fuentes crudas (no requeridas en deploy) |
| `src/components/vitrina/VitrinaLanding.tsx` | UI |
| `src/lib/vitrina/demo.ts` | Solo pitch `?demo=1` |

## URLs

- **Tutis (compartir):** `…/vitrina/salon-tutis` — sin `?demo=1`
- Galaxy: cuando exista pack live
- Pitch genérico: `…/vitrina/gota-prueba-s13?demo=1`
