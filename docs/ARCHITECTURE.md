# CITABELLA — Architecture

> **Última actualización:** 2026-07-01

## Diagrama de alto nivel

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENTES                              │
│  Admin/Colaboradora (auth)    Clienta (link público, sin auth)│
└──────────────┬──────────────────────────┬───────────────────┘
               │                          │
               ▼                          ▼
┌──────────────────────────────────────────────────────────────┐
│              Next.js 14 (App Router) — Vercel                 │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────────┐  │
│  │ Panel salón │  │ Link reserva │  │ API Routes / Server │  │
│  │ /dashboard  │  │ /reservar/   │  │ Actions             │  │
│  │             │  │ [slug]       │  │                     │  │
│  └─────────────┘  └──────────────┘  └─────────────────────┘  │
└──────────────────────────────┬───────────────────────────────┘
                               │
          ┌────────────────────┼────────────────────┐
          ▼                    ▼                    ▼
   ┌─────────────┐    ┌──────────────┐    ┌─────────────────┐
   │ Supabase    │    │ Supabase     │    │ WhatsApp API    │
   │ Auth        │    │ Storage      │    │ (Fase 2)        │
   │ + RLS       │    │ (comprobantes│    │                 │
   │ PostgreSQL  │    │  + fotos)    │    │                 │
   └─────────────┘    └──────────────┘    └─────────────────┘
```

## Stack tecnológico

| Capa | Tecnología | Motivo |
|------|------------|--------|
| Frontend | Next.js 14 (App Router) + TypeScript | SSR para link público, SEO, consistencia portafolio |
| UI | Tailwind CSS + shadcn/ui | Desarrollo rápido, accesible, AI-friendly |
| Backend | Next.js API Routes / Server Actions | Mismo repo; Fastify si se separa en Fase 3 |
| DB | PostgreSQL vía Supabase | RLS multi-tenant, auth integrada |
| Auth | Supabase Auth | Roles con RLS por salón |
| Storage | Supabase Storage | Comprobantes y fotos de servicio |
| Notificaciones | WhatsApp Business API | Canal principal GT (Fase 2) |
| Deploy | Vercel | CI/CD nativo con Next.js |

## Multi-tenancy

- Cada **salón** = un tenant (`salones.id`)
- Todas las tablas de negocio llevan `salon_id`
- **RLS** en Supabase: ninguna query cruza tenants
- Link público: `/reservar/[slug]` — sin login, scoped por slug
- Plan del salón (`founder` | `trial` | `pago`) controla límites desde sprint 1

## Estructura de carpetas propuesta

```
citabella/
├── docs/                    # Memoria del proyecto (fuente de verdad)
├── src/
│   ├── app/
│   │   ├── (auth)/          # Login, registro
│   │   ├── (dashboard)/     # Panel admin/colaboradora
│   │   ├── reservar/[slug]/ # Link público clienta
│   │   └── api/             # Webhooks, endpoints especiales
│   ├── components/
│   │   ├── ui/              # shadcn
│   │   ├── agenda/
│   │   ├── catalogo/
│   │   ├── pagos/
│   │   └── dashboard/
│   ├── lib/
│   │   ├── supabase/        # Cliente server + browser
│   │   ├── availability/    # Motor de disponibilidad
│   │   └── utils/
│   ├── types/               # Tipos compartidos
│   └── hooks/
├── supabase/
│   ├── migrations/          # SQL versionado
│   └── seed.sql
├── public/
└── package.json
```

## Motor de disponibilidad

La disponibilidad **no usa bloques fijos**. Algoritmo:

1. Obtener horario configurado del salón (días, bloques, excepciones)
2. Restar citas existentes (confirmadas + pendientes válidas)
3. Filtrar slots donde quepa la **duración del servicio/paquete** elegido
4. Retornar slots disponibles para la clienta o el admin

> Un servicio de 30 min y uno de 3h coexisten sin choques en el mismo calendario.

## Flujos críticos

### Reserva por clienta (link público)

```
Clienta → elige servicio → ve precio + política reembolso
       → elige slot disponible → sube comprobante (o marca efectivo)
       → cita en estado "pendiente_validacion"
       → admin valida pago → cita "confirmada"
       → recordatorio WhatsApp (Fase 2)
```

### Reserva por admin

```
Admin → selecciona clienta + servicio + colaboradora + slot
      → confirma directamente (sin comprobante si es efectivo en salón)
```

## Seguridad

- RLS en todas las tablas con datos de negocio
- Storage: buckets privados, URLs firmadas por salón
- Comprobantes de pago: solo admin del salón
- Link público: solo lectura de catálogo + creación de cita scoped

## Integraciones

| Integración | MVP | Fase 2 | Fase 3 |
|-------------|-----|--------|--------|
| Supabase Auth/DB/Storage | ✅ | ✅ | ✅ |
| WhatsApp | ❌ | ✅ | ✅ |
| Fri (QR transferencia) | Manual (instrucciones) | Manual | API si disponible |
| Pasarela de pago | ❌ | ❌ | Evaluar |

## Escalabilidad futura

- Separar API a Fastify si API routes se vuelven bottleneck
- App móvil nativa solo si métricas de uso lo justifican (Fase 3)
- Panel admin plataforma multi-salón (Fase 3)
- Automatización validación comprobantes (post-MVP, si volumen lo exige)
