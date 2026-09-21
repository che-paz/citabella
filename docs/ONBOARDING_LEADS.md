# Onboarding leads — formulario interno + alta

> **Última actualización:** 2026-09-21  
> **Uso:** solo dueño producto (no founders, no clientas)  
> **UI:** `gotacheck.app/interna` (sin links públicos)  
> **DB:** `onboarding_leads` (migración `018`)

## Flujo

```
Taller (PDF asistentes)
  → follow-up WhatsApp
  → /interna: capturar lead (contacto + datos de alta)
  → status listo
  → botón «Autorizar y dar de alta» (provision automático)
  → status enrolado + credenciales
  → entregar login a la dueña
```

Estados: `borrador` → `listo` → `autorizado` → `enrolado` | `error`

## Auth del panel

- URL no enlazada en el marketing público.
- Contraseña en env `INTERNAL_TOOLS_PASSWORD` (cookie HttpOnly tras login).
- Solo vos (no Ruth/Andrea en oleada 1).

## Campos

| Campo | Obligatorio para… | Nota |
|-------|-------------------|------|
| contact_name | guardar | Nombre persona |
| salon_nombre | guardar | |
| whatsapp | guardar | |
| interes | guardar | agenda / vitrina / ambas / otro |
| interes_otro | si otro | |
| notas | opcional | |
| admin_nombre | enrolar | Default = contact_name |
| email | enrolar | Login app |
| slug | enrolar | kebab-case; se sugiere desde nombre salón |
| plan_tipo | enrolar | default `trial` |
| slot_step_minutes | enrolar | default 15 |
| permite_reserva_otra_persona | enrolar | default false |

Email / NIT / dominio propio: reunión de seguimiento (no en hoja taller ni bloqueantes del alta Agenda).

## Automatización (recomendación aplicada)

1. **MVP (este sprint):** botón en el listado llama provision en server (service role) = misma lógica que `scripts/provision-salon.mjs`.  
2. Tras éxito: guarda `salon_id`, muestra login + contraseña temporal una vez (también en fila interna).  
3. Si falla: `status=error` + mensaje (slug/email duplicado, etc.).  
4. Export CSV (abre en Excel) desde el listado.

No self-serve público. No `platform_admin` UI todavía.

## Env (proyecto Vercel marketing)

```
NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
INTERNAL_TOOLS_PASSWORD=
NEXT_PUBLIC_APP_URL=https://app.gotacheck.app/login
NEXT_PUBLIC_SITE_URL=https://app.gotacheck.app
```

## Aplicar migración

SQL Editor en Supabase → pegar `018_onboarding_leads.sql` → Run.  
Marcar en `MIGRATIONS_CHECKLIST.md`.

## Referencias

- Runbook CLI: `RUNBOOK_ALTA_SALON.md`  
- Hoja taller: `TALLER_ASISTENTES.print.html`  
- Precios: `DECISION_PRECIOS_TALLER.md`
