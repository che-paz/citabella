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

En Vercel (proyecto marketing), configura ambas en **Settings → Environment Variables**.

Ejemplo de app URL (proyecto actual de founders):

```
NEXT_PUBLIC_APP_URL=https://citabella-eight.vercel.app/login
```

Objetivo futuro: app en `app.gotacheck.app` y marketing en `gotacheck.app`.

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
| `app.gotacheck.app` (futuro) | App | Mismo proyecto app; CNAME a Vercel |
