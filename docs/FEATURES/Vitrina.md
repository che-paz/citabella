# Vitrina — landing del salón (servicio del estudio)

> **Sprint:** S2.3 ✅ · **S2.4** dominios 🟡 · S2.2 ❌ aparcado  
> **Ruta path:** `/vitrina/[slug]`  
> **Dominios:** ver `docs/S2.4_DOMAINS_CHECKLIST.md`

## Qué es

Página pública: marca + servicios + fotos + CTA a `/reservar/[slug]`.  
El estudio monta el contenido (no hay editor self-serve en esta fase).

## Estado

| Salón | Slug | Contenido | Dominio |
|-------|------|-----------|---------|
| Tutis | `salon-tutis` | ✅ Live | `estudiotutis.com` (DNS pendiente) |
| Galaxy | `galaxy-barberia-infantil` | ✅ Live | `galaxybarberiagt.com` (DNS pendiente) |
| Pitch stock | sin live pack | `?demo=1` | — |

## Archivos

| Path | Rol |
|------|-----|
| `src/lib/vitrina/live.ts` | Packs reales por slug + favicons |
| `src/lib/vitrina/hosts.ts` | Host → slug (S2.4) |
| `public/vitrina/[slug]/` | Logo, hero, portfolio, `favicon-32.png`, `apple-touch-icon.png` |
| `src/components/vitrina/*` | UI + lightbox |
| `src/middleware.ts` | Rewrite en dominio de salón |

## URLs

- Path app: `…/vitrina/salon-tutis` · `…/vitrina/galaxy-barberia-infantil`
- Dominio (post-DNS): `https://estudiotutis.com` · `https://galaxybarberiagt.com`
