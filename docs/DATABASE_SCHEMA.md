# CITABELLA — Database Schema

> **Última actualización:** 2026-07-01  
> **Motor:** PostgreSQL 15+ vía Supabase  
> **Convención:** snake_case, UUIDs, timestamps UTC

## Diagrama relacional (simplificado)

```
salones ──┬── usuarios
          ├── clientas
          ├── servicios ──┬── paquete_servicios ── paquetes
          ├── citas ──────┼── pagos
          │               └── fotos_servicio
          ├── movimientos_contables
          ├── horarios_salon
          ├── excepciones_horario
          └── suscripciones ── planes_suscripcion (catálogo)
```

## Tablas

### `salones` (tenant root)

| Columna | Tipo | Notas |
|---------|------|-------|
| id | UUID PK | |
| nombre | TEXT NOT NULL | |
| slug | TEXT UNIQUE NOT NULL | Para `/reservar/[slug]` |
| plan_tipo | ENUM | `founder`, `trial`, `pago` |
| plan_inicio | TIMESTAMPTZ | |
| plan_fin | TIMESTAMPTZ NULL | NULL = founder (sin fin) |
| moneda | TEXT DEFAULT 'GTQ' | |
| timezone | TEXT DEFAULT 'America/Guatemala' | |
| fri_link | TEXT NULL | QR/instrucciones Fri |
| politica_reembolso | TEXT | Visible en reserva |
| activo | BOOLEAN DEFAULT true | |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

### `usuarios`

| Columna | Tipo | Notas |
|---------|------|-------|
| id | UUID PK | = auth.users.id |
| salon_id | UUID FK → salones | |
| email | TEXT | |
| nombre | TEXT | |
| rol | ENUM | `admin_salon`, `colaboradora`, `platform_admin` |
| activo | BOOLEAN DEFAULT true | |
| created_at | TIMESTAMPTZ | |

### `clientas`

| Columna | Tipo | Notas |
|---------|------|-------|
| id | UUID PK | |
| salon_id | UUID FK | |
| nombre | TEXT NOT NULL | |
| telefono | TEXT | WhatsApp |
| email | TEXT NULL | |
| fecha_nacimiento | DATE NULL | Alertas cumpleaños (Fase 2) |
| notas | TEXT | |
| created_at | TIMESTAMPTZ | |

### `servicios`

| Columna | Tipo | Notas |
|---------|------|-------|
| id | UUID PK | |
| salon_id | UUID FK | |
| nombre | TEXT NOT NULL | |
| categoria | TEXT | ej. maquillaje_social, novias |
| precio | DECIMAL(10,2) | GTQ |
| duracion_minutos | INT NOT NULL | Alimenta motor disponibilidad |
| activo | BOOLEAN DEFAULT true | |
| descripcion | TEXT NULL | |
| created_at | TIMESTAMPTZ | |

### `paquetes`

| Columna | Tipo | Notas |
|---------|------|-------|
| id | UUID PK | |
| salon_id | UUID FK | |
| nombre | TEXT NOT NULL | |
| precio | DECIMAL(10,2) | Puede diferir de suma servicios |
| duracion_minutos | INT NOT NULL | Tiempo total estimado |
| activo | BOOLEAN DEFAULT true | |
| created_at | TIMESTAMPTZ | |

### `paquete_servicios` (junction)

| Columna | Tipo | Notas |
|---------|------|-------|
| paquete_id | UUID FK | |
| servicio_id | UUID FK | |
| orden | INT | |

### `citas`

| Columna | Tipo | Notas |
|---------|------|-------|
| id | UUID PK | |
| salon_id | UUID FK | |
| clienta_id | UUID FK | |
| servicio_id | UUID FK NULL | XOR con paquete_id |
| paquete_id | UUID FK NULL | |
| colaboradora_id | UUID FK → usuarios NULL | |
| inicio | TIMESTAMPTZ NOT NULL | |
| fin | TIMESTAMPTZ NOT NULL | Calculado: inicio + duración |
| estado | ENUM | `pendiente`, `pendiente_validacion`, `confirmada`, `cancelada`, `completada`, `no_show` |
| notas | TEXT | |
| creada_por | ENUM | `admin`, `clienta`, `colaboradora` |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

### `pagos`

| Columna | Tipo | Notas |
|---------|------|-------|
| id | UUID PK | |
| salon_id | UUID FK | |
| cita_id | UUID FK | |
| monto | DECIMAL(10,2) | |
| metodo | ENUM | `transferencia`, `efectivo`, `fri` |
| comprobante_url | TEXT NULL | Supabase Storage path |
| estado | ENUM | `pendiente`, `validado`, `rechazado` |
| validado_por | UUID FK → usuarios NULL | |
| validado_at | TIMESTAMPTZ NULL | |
| notas | TEXT | |
| created_at | TIMESTAMPTZ | |

### `movimientos_contables` (Fase 2, diseñar ahora)

| Columna | Tipo | Notas |
|---------|------|-------|
| id | UUID PK | |
| salon_id | UUID FK | |
| tipo | ENUM | `ingreso`, `egreso` |
| categoria | TEXT | |
| monto | DECIMAL(10,2) | |
| fecha | DATE | |
| cita_id | UUID FK NULL | Si aplica |
| descripcion | TEXT | |
| created_at | TIMESTAMPTZ | |

### `fotos_servicio` (Fase 2, diseñar ahora)

| Columna | Tipo | Notas |
|---------|------|-------|
| id | UUID PK | |
| salon_id | UUID FK | |
| cita_id | UUID FK | |
| clienta_id | UUID FK | |
| storage_path | TEXT | |
| created_at | TIMESTAMPTZ | |

### `horarios_salon`

| Columna | Tipo | Notas |
|---------|------|-------|
| id | UUID PK | |
| salon_id | UUID FK | |
| dia_semana | INT | 0=domingo … 6=sábado |
| hora_inicio | TIME | |
| hora_fin | TIME | |

### `excepciones_horario`

| Columna | Tipo | Notas |
|---------|------|-------|
| id | UUID PK | |
| salon_id | UUID FK | |
| fecha | DATE | Feriado o día cerrado |
| cerrado | BOOLEAN | true = no atiende |
| hora_inicio | TIME NULL | Si horario especial |
| hora_fin | TIME NULL | |

### `planes_suscripcion` (catálogo de planes)

| Columna | Tipo | Notas |
|---------|------|-------|
| id | UUID PK | |
| tipo | ENUM UNIQUE | `founder`, `trial`, `pago` |
| nombre | TEXT | |
| max_colaboradoras | INT NULL | NULL = ilimitado |
| max_citas_mes | INT NULL | |
| precio_mensual | DECIMAL NULL | Q0 para founder/trial |

## Índices críticos

```sql
CREATE INDEX idx_citas_salon_inicio ON citas(salon_id, inicio);
CREATE INDEX idx_citas_colaboradora ON citas(colaboradora_id, inicio);
CREATE INDEX idx_clientas_salon ON clientas(salon_id);
CREATE UNIQUE INDEX idx_salones_slug ON salones(slug);
```

## RLS — Política base (patrón)

Todas las tablas con `salon_id`:

```sql
-- SELECT: usuario pertenece al salón
CREATE POLICY "tenant_select" ON citas FOR SELECT
  USING (salon_id = (SELECT salon_id FROM usuarios WHERE id = auth.uid()));

-- INSERT: mismo patrón + validar salon_id en payload
-- Link público: política especial para INSERT en citas/pagos scoped por slug
```

> Detalle completo de políticas: implementar en `supabase/migrations/002_rls_policies.sql`

## Enums

```sql
CREATE TYPE plan_tipo AS ENUM ('founder', 'trial', 'pago');
CREATE TYPE usuario_rol AS ENUM ('admin_salon', 'colaboradora', 'platform_admin');
CREATE TYPE cita_estado AS ENUM ('pendiente', 'pendiente_validacion', 'confirmada', 'cancelada', 'completada', 'no_show');
CREATE TYPE pago_metodo AS ENUM ('transferencia', 'efectivo', 'fri');
CREATE TYPE pago_estado AS ENUM ('pendiente', 'validado', 'rechazado');
CREATE TYPE movimiento_tipo AS ENUM ('ingreso', 'egreso');
```

## Seeds de desarrollo

- 1 salón founder de prueba
- 1 admin + 1 colaboradora
- 5 servicios, 1 paquete
- 3 clientas, 5 citas en distintos estados
