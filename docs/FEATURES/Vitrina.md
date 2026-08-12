# Vitrina — landing del salón (servicio del estudio)

> **Sprint:** S2.1 ✅ · siguiente **S2.3** (contenido founders)  
> **Ruta:** `/vitrina/[slug]`  
> **Modelo (2026-08-12):** no self-serve; el estudio monta el sitio con assets del cliente  
> **Spec contenido:** `docs/S2.0_SPEC_VITRINA.md` · decisión: `docs/DECISION_2026-08-12_FOUNDERS.md`

## Qué es

Página pública de una sola URL: marca + servicios + fotos + CTA a `/reservar/[slug]`.  
Producto Gota+Check vende la **agenda (Q100/mes)**; la vitrina es **servicio VajaLabs** (ingreso setup al desarrollador).

## Estado

- Plantilla única con temas `beauty` | `kids`.
- Nombre/logo desde `salones` (`activo=true`).
- `?demo=1` = pitch con stock (taller / venta del servicio).
- Contenido real founders: se carga en código/storage por el estudio (**S2.3**); **S2.2 editor ❌ aparcado**.

## Archivos

| Path | Rol |
|------|-----|
| `src/app/vitrina/[slug]/page.tsx` | Route + `?demo=1` |
| `src/components/vitrina/VitrinaLanding.tsx` | UI |
| `src/lib/vitrina/*` | Placeholders, demo pack, resolve |

## URLs

- Pitch: `…/vitrina/salon-tutis?demo=1`
- Real (post S2.3): `…/vitrina/salon-tutis` (y dominio propio en S2.4)

## Fuera de alcance ahora

- Editor dueña (S2.2)
- Self-serve masivo de landings
