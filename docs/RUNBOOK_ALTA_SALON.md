# Runbook — Alta asistida de un salón

> **Última actualización:** 2026-08-05 (S1.3)  
> **Objetivo:** dar de alta un salón **sin tocar** Tutis ni Galaxy.  
> **Tooling:** `node scripts/provision-salon.mjs` (genérico). SQL manual = respaldo.

## Antes de empezar

- [ ] Migraciones 001–015 aplicadas (`docs/MIGRATIONS_CHECKLIST.md`)
- [ ] `.env.local` con `NEXT_PUBLIC_SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY`
- [ ] App en producción: `https://citabella-eight.vercel.app` (o `NEXT_PUBLIC_SITE_URL`)
- [ ] Acordar con la dueña: nombre salón, email login, slug URL, plan (`trial` / `pago` / `founder`)

**Slugs bloqueados por el script:**

| Reservado | Slug |
|-----------|------|
| Tutis | `salon-tutis` |
| Galaxy | `galaxy-barberia-infantil` |
| Demo | `belleza-luna` (pide flag especial) |

## Datos a recolectar

| Campo | Ejemplo | Flag |
|-------|---------|------|
| Nombre salón | `Studio Ana` | `--nombre` |
| Slug | `studio-ana` | `--slug` |
| Email admin | `ana@correo.com` | `--email` |
| Nombre admin | `Ana López` | `--admin` |
| Plan | `trial` / `pago` / `founder` | `--plan` (default `trial`) |
| Slot step | `15` / `30` / `60` | `--slot-step` (default `15`) |
| Reserva otra persona | sí/no | `--otra-persona true` |
| Contraseña temporal | opcional | `--password` (si no, se genera) |

## Procedimiento (S1.3) — script

Desde la raíz del repo:

```bash
# Validar sin escribir
node scripts/provision-salon.mjs \
  --nombre "Studio Ana" \
  --slug studio-ana \
  --email ana@correo.com \
  --admin "Ana López" \
  --plan trial \
  --slot-step 15 \
  --dry-run

# Alta real
node scripts/provision-salon.mjs \
  --nombre "Studio Ana" \
  --slug studio-ana \
  --email ana@correo.com \
  --admin "Ana López" \
  --plan trial \
  --slot-step 15
```

El script crea/actualiza:

1. Usuario Auth (email confirmado)  
2. Fila `salones`  
3. Fila `usuarios` (`admin_salon`)  
4. Horarios default Lun–Vie 09–18, Sáb 09–14  

Imprime: login URL, email, contraseña temporal, link `/reservar/{slug}`.

Flags útiles:

| Flag | Uso |
|------|-----|
| `--dry-run` | Solo valida args / slug |
| `--allow-existing` | Si el slug o email ya existen, actualiza (reset password) |
| `--otra-persona true` | Activa reserva para otra persona |
| `--help` | Ayuda |

**No** re-ejecutar `provision-founders-pilot.mjs` en prod salvo mantenimiento consciente (resetea passwords de Ruth/Andrea).

## Entregar a la dueña

1. Login: `{SITE_URL}/login` + email + contraseña temporal  
2. Cambiar contraseña en `/ajustes`  
3. Link reserva: `{SITE_URL}/reservar/{slug}`  
4. Catálogo en `/catalogo` + logo en `/ajustes`  
5. (Opcional) Push en `/ajustes`  

## Smoke checklist (nuevo salón)

- [ ] Login admin OK  
- [ ] Dashboard carga (solo su salón)  
- [ ] Crear 1 servicio en `/catalogo`  
- [ ] Link público `/reservar/{slug}` muestra el servicio  
- [ ] (Ideal) Reserva de prueba → `/pagos` o agenda  
- [ ] No ve datos de Tutis / Galaxy  

## Verificación S1.3 (2026-08-05)

Salón de prueba provisionado en &lt; 5 min:

| Campo | Valor |
|-------|-------|
| Slug | `gota-prueba-s13` |
| Nombre | Gota Prueba S13 |
| Email | `gota.prueba.s13@gotacheck.app` |
| Link | https://citabella-eight.vercel.app/reservar/gota-prueba-s13 → 200 |

Contraseña: la del output del script (no guardar en git). Se puede desactivar (`activo=false`) o resetear con `reset-salon-pilot.sql` cuando ya no haga falta.

## Reset de práctica (cuidado — founders protegidos)

`supabase/reset-salon-pilot.sql` borra citas/pagos/clientas/movimientos **solo** del slug en `v_slug`.

Protecciones (S1.4):

- Default: `gota-prueba-s13` (no Tutis)
- `salon-tutis` y `galaxy-barberia-infantil` **bloqueados** salvo `v_allow_protected := true`

1. Editar `v_slug` al salón de prueba  
2. SQL Editor → Run  
3. Si pones un founder por error, el script **aborta** sin borrar nada  

Aislar demo: `supabase/isolate-demo-belleza-luna.sql` (`activo = false`).  

## Respaldo manual (SQL)

Si el script no está disponible, ver historial git de este archivo pre-S1.3 o usar SQL Editor siguiendo el mismo orden: Auth → `salones` → `usuarios` → `horarios_salon`.

## Qué viene después

- **S1.4** — Smoke RLS A≠B; aislar demo Belleza Luna  
- Panel `platform_admin` — cuando haya ~5–8 altas/semana  

## Referencias

- Script: `scripts/provision-salon.mjs`  
- Founders (legacy): `scripts/provision-founders-pilot.mjs`  
- Schema: `docs/DATABASE_SCHEMA.md`  
- Ruta GTM: `docs/ROUTE_GOTACHECK.md` § Fase 1
