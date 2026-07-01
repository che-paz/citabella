# CITABELLA — Roadmap Técnico

> **Última actualización:** 2026-07-01  
> **Horizonte MVP:** ~6-9 semanas (1 dev + AI-assisted)

## Vista general

```
Fase 0 ──► Fase 1 (MVP) ──► Fase 2 ──► Fase 3
Fundación    5-7 sem        4-5 sem     4-6 sem
```

## Fase 0 — Fundación (1-2 semanas)

**Objetivo:** Repo, Supabase, schema, RLS, scaffold Next.js listo para features.

| Entregable | Archivos afectados |
|------------|-------------------|
| Repo + Next.js 14 scaffold | `package.json`, `src/app/`, `tsconfig.json` |
| Proyecto Supabase | `supabase/migrations/001_initial_schema.sql` |
| RLS multi-tenant | `supabase/migrations/002_rls_policies.sql` |
| Auth + roles | `src/lib/supabase/`, `src/app/(auth)/` |
| Seed dev | `supabase/seed.sql` |
| Deploy Vercel (staging) | `vercel.json`, env vars |

**Dependencias:** Ninguna  
**Riesgos:** Configuración incorrecta de RLS → auditar con tests antes de Fase 1  
**Criterio de finalización:**
- [ ] Login admin funcional
- [ ] Salón founder creado via seed
- [ ] RLS verificado: tenant A no ve datos de tenant B
- [ ] Deploy staging accesible

---

## Fase 1 — MVP (5-7 semanas)

**Objetivo:** Reemplazar hojas físicas y WhatsApp para founders.

### Sprint 1.1 — Catálogo (semana 1-2)

| Item | Feature doc |
|------|-------------|
| CRUD servicios y paquetes | `FEATURES/Catalogo-de-servicios-y-paquetes.md` |
| Categorías y duraciones | ↑ |
| Precios visibles | ↑ |

**Archivos:** `src/app/(dashboard)/catalogo/`, `src/components/catalogo/`  
**Dependencias:** Fase 0 completa  
**Criterio:** Admin crea/edita/desactiva servicios y paquetes

### Sprint 1.2 — Agenda salón (semana 2-3)

| Item | Feature doc |
|------|-------------|
| Config horarios + excepciones | `FEATURES/Agenda-yreservas.md` |
| Vista calendario día/semana | ↑ |
| CRUD citas desde admin | ↑ |
| Motor de disponibilidad | `src/lib/availability/` |

**Dependencias:** Catálogo (duraciones)  
**Riesgos:** Complejidad del motor de disponibilidad → tests unitarios obligatorios  
**Criterio:** Admin agenda cita sin choques, respeta duración

### Sprint 1.3 — Link público + clientas (semana 3-5)

| Item | Feature doc |
|------|-------------|
| `/reservar/[slug]` | `FEATURES/Agenda-yreservas.md` |
| Flujo reserva clienta | ↑ |
| Gestión clientas | `FEATURES/Gestion-de-clientas.md` |
| Historial básico | ↑ |

**Dependencias:** Agenda + catálogo  
**Criterio:** Clienta reserva sin login, ve solo slots disponibles

### Sprint 1.4 — Pagos + Dashboard (semana 5-7)

| Item | Feature doc |
|------|-------------|
| Carga comprobante | `FEATURES/Pagos-y-control-financiero.md` |
| Validación admin | ↑ |
| Efectivo sin comprobante | ↑ |
| Dashboard básico | `FEATURES/Dashboard.md` |
| Planes founder/trial en DB | `DATABASE_SCHEMA.md` |

**Dependencias:** Citas + link público  
**Riesgos:** Cuello de botella validación manual → aceptable en MVP  
**Criterio MVP completo:**
- [ ] Founder opera 1 semana real solo con CITABELLA
- [ ] Link de reserva 24/7 funcional
- [ ] Comprobante subido y validado
- [ ] Dashboard muestra citas del día + pagos pendientes
- [ ] Historial de clienta visible

---

## Fase 2 — Refuerzo operativo (4-5 semanas)

**Objetivo:** Control financiero completo y experiencia clienta pulida.

| Módulo | Entregables |
|--------|-------------|
| Contabilidad | Ingresos, egresos, gastos operativos |
| Deudas | Control pagos pendientes post-servicio |
| Fotos servicio | Upload + galería por clienta |
| Cumpleaños | Alertas fidelización |
| WhatsApp | Recordatorios y confirmaciones automáticas |

**Dependencias:** MVP estable en producción con founders  
**Riesgos:** Costos/límites WhatsApp Business API

---

## Fase 3 — Crecimiento SaaS (4-6 semanas)

**Objetivo:** Escalar a nuevos salones autogestionados.

| Módulo | Entregables |
|--------|-------------|
| Suscripciones | Cobro automatizado post-trial |
| Panel plataforma | Admin multi-salón, métricas |
| Fri | Integración API si disponible |
| App móvil | Solo si métricas lo justifican |

**Dependencias:** Fase 2 + métricas de conversión trial

---

## Priorización MVP (MoSCoW)

| Must | Should | Could (Fase 2) | Won't (MVP) |
|------|--------|----------------|-------------|
| Agenda admin + link público | Reagendar con reglas | Contabilidad completa | App nativa |
| Catálogo servicios/paquetes | Cancelar con reglas | Fotos servicio | Pasarela automática |
| Comprobante pago | Política reembolso visible | WhatsApp auto | Panel multi-salón |
| Dashboard básico | Planes en DB | Cumpleaños | Integración Fri API |
| Historial clienta | Colaboradora agenda propia | Deudas | |

## Hitos de negocio

| Hito | Fase | Fecha objetivo |
|------|------|----------------|
| Founders onboarded | Post MVP | +1 semana post Fase 1 |
| Primer trial externo | Fase 2 | TBD |
| Lanzamiento público GT | Fase 3 | TBD |
