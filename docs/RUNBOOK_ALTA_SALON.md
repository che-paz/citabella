# Runbook — Alta asistida de un salón

> **Última actualización:** 2026-08-05 (S1.1)  
> **Objetivo:** dar de alta un salón **sin tocar** Tutis ni Galaxy.  
> **Estado del tooling:** proceso manual + piezas del script founders. Script **genérico** parametrizado = **S1.3**.

## Antes de empezar

- [ ] Migraciones 001–015 aplicadas (`docs/MIGRATIONS_CHECKLIST.md`)
- [ ] Acceso a Supabase Dashboard (Auth + SQL Editor) con rol suficiente
- [ ] App en producción: `https://citabella-eight.vercel.app` (o `NEXT_PUBLIC_SITE_URL`)
- [ ] Acordar con la dueña: nombre salón, email login, slug URL, plan (`trial` / `pago` / `founder`)

**No usar** los `salon_id` ni slugs de founders:

| Reservado | Slug | ID fijo (seed) |
|-----------|------|----------------|
| Tutis | `salon-tutis` | `22222222-2222-2222-2222-222222222201` |
| Galaxy | `galaxy-barberia-infantil` | `22222222-2222-2222-2222-222222222202` |
| Demo | `belleza-luna` | (seed demo — no reutilizar para clientas reales) |

## Datos a recolectar

| Campo | Ejemplo | Notas |
|-------|---------|-------|
| Nombre salón | `Studio Ana` | Visible en panel y reserva |
| Slug | `studio-ana` | kebab-case, único; URL `/reservar/[slug]` |
| Email admin | `ana@correo.com` | Login |
| Nombre admin | `Ana López` | |
| Plan | `trial` o `pago` | `founder` solo si aplica acuerdo |
| Slot step | `15` o `60` | Founders usan `60` (hora en punto) |
| Horario | Lun–Vie 9–18, Sáb 9–14 | Default razonable |
| Política reembolso | texto corto | Editable luego en `/ajustes` |
| Reserva otra persona | sí/no | Galaxy = sí; default `false` |

## Procedimiento (hoy)

### A. Usuario Auth

1. Supabase → **Authentication → Users → Add user**
2. Email + contraseña temporal (confirmar email / `email_confirm`)
3. Anotar el **UUID** del usuario (`auth.users.id`)

Alternativa: adaptar temporalmente `scripts/provision-founders-pilot.mjs` (hasta S1.3) — **no re-ejecutar** el array FOUNDERS en prod sin querer resetear passwords.

### B. Fila `salones`

En SQL Editor (o Table Editor):

```sql
INSERT INTO salones (
  nombre,
  slug,
  plan_tipo,
  politica_reembolso,
  slot_step_minutes,
  permite_reserva_otra_persona,
  activo
) VALUES (
  'Studio Ana',
  'studio-ana',
  'trial',  -- o 'pago' | 'founder'
  'Cancelación con 24 horas de anticipación para reembolso del anticipo.',
  15,       -- o 60
  false,
  true
)
RETURNING id, slug;
```

Guardar el `id` devuelto = `salon_id`.

### C. Fila `usuarios`

```sql
INSERT INTO usuarios (id, salon_id, email, nombre, rol, activo)
VALUES (
  '<UUID_AUTH>',           -- mismo id que Auth
  '<SALON_ID>',
  'ana@correo.com',
  'Ana López',
  'admin_salon',
  true
);
```

### D. Horarios default

`dia_semana`: 0=domingo … 6=sábado (mismo criterio que founders script: Lun=1 … Sáb=6).

```sql
INSERT INTO horarios_salon (salon_id, dia_semana, hora_inicio, hora_fin) VALUES
  ('<SALON_ID>', 1, '09:00', '18:00'),
  ('<SALON_ID>', 2, '09:00', '18:00'),
  ('<SALON_ID>', 3, '09:00', '18:00'),
  ('<SALON_ID>', 4, '09:00', '18:00'),
  ('<SALON_ID>', 5, '09:00', '18:00'),
  ('<SALON_ID>', 6, '09:00', '14:00')
ON CONFLICT (salon_id, dia_semana) DO UPDATE SET
  hora_inicio = EXCLUDED.hora_inicio,
  hora_fin = EXCLUDED.hora_fin;
```

### E. Entregar a la dueña

1. Login: `{SITE_URL}/login` + email + contraseña temporal  
2. Pedir cambio de contraseña en `/ajustes`  
3. Link reserva: `{SITE_URL}/reservar/{slug}`  
4. Ella configura catálogo en `/catalogo` y logo en `/ajustes`  
5. (Opcional) Activar push en `/ajustes` si VAPID está en Vercel

## Smoke checklist (nuevo salón)

- [ ] Login admin OK  
- [ ] Dashboard carga (scoped a su salón)  
- [ ] Crear 1 servicio en `/catalogo`  
- [ ] Abrir link público `/reservar/{slug}` — ve el servicio  
- [ ] (Ideal) Una reserva de prueba → aparece en `/pagos` o agenda  
- [ ] Confirmar que **no** ve citas/clientas de Tutis/Galaxy  

## Reset de práctica (cuidado)

`supabase/reset-salon-pilot.sql` borra **citas, pagos, clientas, movimientos** del slug indicado. Conserva salón, usuarios, horarios y catálogo.

1. Editar `v_slug` en el archivo  
2. Ejecutar en SQL Editor  
3. **Nunca** apuntar a un slug equivocado en producción sin backup  

## Qué viene en S1.3

Script genérico tipo:

```bash
node scripts/provision-salon.mjs \
  --nombre "Studio Ana" \
  --slug studio-ana \
  --email ana@correo.com \
  --plan trial \
  --slot-step 15
```

Hasta entonces, este runbook es la fuente de verdad operativa.

## Referencias

- Founders: `scripts/provision-founders-pilot.mjs`, `supabase/seed-founders-pilot.sql`  
- Schema: `docs/DATABASE_SCHEMA.md`  
- Ruta GTM: `docs/ROUTE_GOTACHECK.md` § Fase 1
