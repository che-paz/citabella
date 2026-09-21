# Gota+Check — Sitio marketing

Landing de producto para **gotacheck.app**. Proyecto Next.js liviano, independiente de la app de agenda (dashboard / `/reservar`).

## Desarrollo local

```bash
cd marketing
cp .env.example .env.local   # opcional
npm install
npm run dev                  # http://localhost:3010
```

## Variables de entorno

| Variable | Requerida | Default | Descripción |
|----------|-----------|---------|-------------|
| `NEXT_PUBLIC_WHATSAPP_URL` | No | `https://wa.me/50250460346` | CTA principal (solicitar acceso) |
| `NEXT_PUBLIC_APP_URL` | No | _(vacío)_ | Link “Ya tengo cuenta” → login de la app. Si está vacío, el CTA secundario se oculta. |
| `NEXT_PUBLIC_SITE_URL` | Para `/interna` | app Vercel | Base para links de reserva tras alta |
| `NEXT_PUBLIC_SUPABASE_URL` | Para `/interna` | — | Mismo proyecto Supabase que la app |
| `SUPABASE_SERVICE_ROLE_KEY` | Para `/interna` | — | Solo server; nunca `NEXT_PUBLIC_` |
| `INTERNAL_TOOLS_PASSWORD` | Para `/interna` | — | Contraseña del panel (≥8). URL: `/interna` (no enlazada) |

## Ayuda (`/ayuda`)

Guías cortas post-alta (login, horarios, catálogo, link, pagos). Copy en
`src/lib/ayuda.ts`. Capturas en `public/ayuda/{slug}/` — ver
`public/ayuda/README.md`. Video: pendiente.

## Panel interno (leads)

Tras aplicar migración `018_onboarding_leads.sql` y configurar env:

1. Abrí `https://gotacheck.app/interna`
2. Entrá con `INTERNAL_TOOLS_PASSWORD`
3. Creá leads → completá slug/email → **Autorizar y dar de alta**
4. **Descargar Excel (CSV)** desde el listado

Detalle: `docs/ONBOARDING_LEADS.md`.


En Vercel (proyecto marketing), configura ambas en **Settings → Environment Variables**.

Ejemplo de app URL (proyecto actual de founders):

```
NEXT_PUBLIC_APP_URL=https://app.gotacheck.app/login
```

Objetivo: app en `app.gotacheck.app` y marketing en `gotacheck.app`. Checklist: `docs/APP_DOMAIN_CHECKLIST.md`.

## Deploy en Vercel

1. **Add New Project** → importa `che-paz/citabella`.
2. **Root Directory:** `marketing`
3. Framework: Next.js (auto).
4. Añade env vars de arriba.
5. Deploy.

No uses el mismo proyecto Vercel que la app: así editas marketing sin arriesgar deploys de founders (`docs/ROUTE_GOTACHECK.md` §9).

## DNS: Cloudflare → Vercel (`gotacheck.app`)

El dominio está en Cloudflare Registrar. Al apuntar a Vercel:

1. En Vercel → proyecto marketing → **Domains** → añade `gotacheck.app` (y opcional `www`).
2. Vercel te muestra los registros (A / CNAME).
3. En Cloudflare DNS, créalos en modo **DNS only** (nube **gris**, no naranja).
   - Proxy naranja = doble CDN/SSL y suele romper el certificado de Vercel.
4. Espera propagación (minutos a pocas horas).
5. Verifica SSL en Vercel.

Registros típicos (confirma con lo que muestre Vercel):

| Tipo | Nombre | Contenido | Proxy |
|------|--------|-----------|-------|
| A | `@` | `76.76.21.21` | DNS only |
| CNAME | `www` | `cname.vercel-dns.com` | DNS only |

## Relación con la app

| URL | Proyecto | Contenido |
|-----|----------|-----------|
| `gotacheck.app` | Este (`marketing/`) | Landing de producto |
| App actual (`*.vercel.app`) | Repo root | Agenda, login, `/reservar` |
| `app.gotacheck.app` | App | Agenda, login, `/reservar` — ver `docs/APP_DOMAIN_CHECKLIST.md` |
