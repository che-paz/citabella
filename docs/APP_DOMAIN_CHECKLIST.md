# App domain — `app.gotacheck.app`

> **Objetivo:** que clientas y dueñas vean Gota+Check, no `*.vercel.app`, en login y `/reservar`.  
> **Proyecto Vercel:** app (`citabella` / `citabella-eight`) — **no** `gotacheck-marketing`  
> **Marketing** se queda en apex `gotacheck.app`

## Resultado esperado

| URL | Qué abre |
|-----|----------|
| `https://app.gotacheck.app/login` | Login panel |
| `https://app.gotacheck.app/reservar/salon-tutis` | Agenda Tutis |
| `https://app.gotacheck.app/reservar/gota-prueba-interna` | Agenda de prueba |
| `https://gotacheck.app` | Marketing (sin cambio) |
| `https://citabella-eight.vercel.app/...` | Sigue vivo como respaldo |

Founders con dominio propio (`estudiotutis.com`, etc.) **no cambian**.

---

## 1. Vercel — proyecto app

1. Abrí el proyecto **app** (Citabella / citabella-eight), no marketing.  
2. **Settings → Domains → Add** → `app.gotacheck.app`  
3. Copiá el registro que Vercel indique (casi siempre):

| Tipo | Nombre | Contenido | Proxy Cloudflare |
|------|--------|-----------|------------------|
| CNAME | `app` | `cname.vercel-dns.com` (o el que muestre Vercel) | **DNS only** (gris) |

No pongas `app.gotacheck.app` en el proyecto marketing.

---

## 2. Cloudflare DNS (`gotacheck.app`)

1. DNS del dominio `gotacheck.app`  
2. Añadir CNAME `app` → target de Vercel  
3. **Nube gris** (DNS only), no naranja  
4. Esperar a que en Vercel el dominio pase a **Valid** + HTTPS OK  

(Apex `gotacheck.app` / `www` ya apuntan a marketing; no los toques.)

---

## 3. Env — proyecto **app** (Vercel)

**Settings → Environment Variables** (Production + Preview):

| Variable | Valor nuevo |
|----------|-------------|
| `NEXT_PUBLIC_SITE_URL` | `https://app.gotacheck.app` |

El resto (Supabase, VAPID, etc.) no cambia.

**Redeploy** del proyecto app.

---

## 4. Env — proyecto **marketing** (Vercel)

| Variable | Valor nuevo |
|----------|-------------|
| `NEXT_PUBLIC_SITE_URL` | `https://app.gotacheck.app` |
| `NEXT_PUBLIC_APP_URL` | `https://app.gotacheck.app/login` |

**Redeploy** marketing (para que `/interna` y “Ya tengo cuenta” usen el dominio nuevo).

---

## 5. Supabase Auth

**Authentication → URL Configuration:**

| Campo | Valor |
|-------|--------|
| **Site URL** | `https://app.gotacheck.app` |
| **Redirect URLs** (añadir, no borrar localhost) | `https://app.gotacheck.app/**` |
| | `https://citabella-eight.vercel.app/**` (respaldo) |
| | `http://localhost:3004/**` |

Guardar.

---

## 6. Smoke

- [ ] `https://app.gotacheck.app` carga (o redirige a login/home)  
- [ ] `https://app.gotacheck.app/login` → login OK (probar con prueba interna o founder)  
- [ ] `https://app.gotacheck.app/reservar/salon-tutis` → wizard  
- [ ] Dashboard: el link de reserva que se copia ya muestra `app.gotacheck.app`  
- [ ] `/interna` → alta de prueba: URLs de éxito con `app.gotacheck.app`  
- [ ] `gotacheck.app` marketing intacto  
- [ ] Tutis / Galaxy en dominio propio OK  

---

## Si algo falla

| Síntoma | Qué revisar |
|---------|-------------|
| Domain Pending en Vercel | CNAME mal / proxy naranja en Cloudflare |
| SSL error | Esperar propagación; DNS only |
| Login / magic link raro | Site URL + Redirect URLs en Supabase |
| Links de reserva siguen en vercel.app | `NEXT_PUBLIC_SITE_URL` en **app** + Redeploy |

---

## Docs relacionados

- Ruta GTM §9: `ROUTE_GOTACHECK.md`  
- Infra auth: `S1.2_INFRA_CHECKLIST.md`  
- Dominios salón: `S2.4_DOMAINS_CHECKLIST.md`
