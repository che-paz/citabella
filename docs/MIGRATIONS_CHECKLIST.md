# Checklist de migraciones (Supabase Cloud)

> **Última verificación:** 2026-08-05 (probe REST con service role)  
> **Proyecto:** CITABELLA / Gota+Check — esquema multi-tenant  
> **Regla:** nunca editar una migración ya aplicada; solo agregar `016_…` en adelante.

## Inventario

| Archivo | Qué aporta | Cloud |
|---------|------------|-------|
| `001_initial_schema.sql` | salones, usuarios, servicios, paquetes, planes | ✅ |
| `002_rls_policies.sql` | RLS base + helpers `get_user_salon_id` / `get_user_rol` | ✅ |
| `003_agenda_schema.sql` | clientas, citas, horarios, excepciones | ✅ |
| `004_agenda_rls.sql` | RLS agenda | ✅ |
| `005_public_booking_rls.sql` | pagos, RLS anon reserva, bucket comprobantes | ✅ |
| `006_booking_upload_fixes.sql` | RPC cancel reserva pública / upload | ✅ |
| `007_salon_branding.sql` | `logo_url`, update perfil | ✅ (`logo_url`) |
| `008_movimientos_contables.sql` | finanzas ingresos/egresos | ✅ |
| `009_slot_step_minutes.sql` | intervalo de slots por salón | ✅ |
| `010_pago_asegurado_cobrado.sql` | estados `asegurado` / `cobrado` | ✅ |
| `011_clienta_phone_normalize.sql` | normalización teléfono GT/HN/SV | ✅ |
| `012_push_subscriptions.sql` | Web Push por dispositivo | ✅ |
| `013_pausa_diaria.sql` | pausa (almuerzo) por salón | ✅ |
| `014_salon_pausa_diaria_rpc.sql` | RPC pública `get_salon_pausa_diaria` | ✅ |
| `015_reserva_otra_persona.sql` | flag + beneficiario en reserva | ✅ |

**Conclusión S1.1:** cloud al día con el repo (001–015). No hay migraciones pendientes conocidas.

## Cómo re-verificar (rápido)

En SQL Editor (service) o probe REST:

```sql
SELECT
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name='salones' AND column_name='slot_step_minutes') AS m009,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name='pagos' AND column_name='asegurado_at') AS m010,
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_name='push_subscriptions') AS m012,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name='salones' AND column_name='pausa_diaria_activa') AS m013,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name='salones' AND column_name='permite_reserva_otra_persona') AS m015;
```

Esperado: todos `1`.

## Salones activos observados (2026-08-05)

| Slug | Plan | `slot_step_minutes` | Rol |
|------|------|---------------------|-----|
| `salon-tutis` | founder | 60 | Piloto Ruth |
| `galaxy-barberia-infantil` | founder | 60 | Piloto Andrea |
| `belleza-luna` | founder | 30 | Demo seed (aislar en S1.4) |

## Archivos relacionados (no son migraciones)

| Archivo | Uso |
|---------|-----|
| `supabase/cloud-init.sql` | Bootstrap histórico / referencia |
| `supabase/seed-cloud.sql` / `seed-cloud-agenda.sql` | Demo local/cloud Belleza Luna |
| `supabase/seed-founders-pilot.sql` | Datos founders (requiere Auth users) |
| `supabase/reset-salon-pilot.sql` | Borra citas/pagos/clientas/movimientos de **un** slug |
| `scripts/provision-founders-pilot.mjs` | Alta Auth + salón + admin + horarios (solo founders hardcode) |

## Al aplicar una migración nueva

1. Crear `supabase/migrations/0XX_nombre.sql`  
2. Ejecutar en Supabase SQL Editor (o CLI si se usa)  
3. Marcar fila en esta tabla  
4. Actualizar `docs/DATABASE_SCHEMA.md` + `docs/CURRENT_STATE.md`
