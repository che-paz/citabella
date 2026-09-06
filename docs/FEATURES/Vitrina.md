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
| Tutis | `salon-tutis` | ✅ Live |
| Galaxy | `galaxy-barberia-infantil` | ✅ Live |
| Pitch stock | sin live pack | `?demo=1` → Unsplash |

## Archivos

| Path | Rol |
|------|-----|
| `src/lib/vitrina/live.ts` | Packs reales por slug |
| `public/vitrina/[slug]/` | Logo, hero, portfolio (web) |
| `files/vitrina/` | Fuentes crudas |
| `src/components/vitrina/VitrinaLanding.tsx` | UI |
| `src/components/vitrina/VitrinaPortfolioGallery.tsx` | Lightbox |

## URLs

- Tutis: `…/vitrina/salon-tutis`
- Galaxy: `…/vitrina/galaxy-barberia-infantil`
- Pitch genérico: `…/vitrina/gota-prueba-s13?demo=1`
