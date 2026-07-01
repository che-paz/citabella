# CITABELLA — Project Overview

> **Última actualización:** 2026-07-01  
> **Versión del documento:** 1.0  
> **Nombre de trabajo:** CitaBella (marca final pendiente)

## Qué es

CITABELLA es una plataforma **SaaS multi-tenant** para salones de belleza, maquillistas, cultoras, barberías y spas en Guatemala y LATAM. Centraliza agenda, catálogo de servicios, pagos y control financiero en una sola herramienta web responsive.

## Problema que resuelve

| Dolor | Impacto |
|-------|---------|
| Agenda dispersa (papel, Google Calendar, WhatsApp) | Pérdida de tiempo, doble reserva |
| Sin confirmación de pago previo | No-shows, citas fantasma |
| Sin historial centralizado | Sin fidelización ni portafolio |
| Contabilidad manual o inexistente | Sin visibilidad del negocio |
| Sin catálogo estructurado | Disponibilidad mal calculada |

## Usuarios y roles

| Rol | Descripción | Acceso principal |
|-----|-------------|------------------|
| **Admin del salón** | Dueña o responsable del negocio | Configuración, agenda, catálogo, finanzas, dashboard |
| **Colaboradora** | Atiende citas en el salón | Su agenda, historial de sus clientas |
| **Clienta** | Agenda servicios | Link de reserva, historial, comprobantes |
| **Founder / Admin plataforma** | Equipo SaaS | Panel global, planes, métricas |

## Modelo de negocio

| Plan | Condición | Precio |
|------|-----------|--------|
| **Founders** | Maquillistas fundadoras; feedback continuo | Q0 de por vida |
| **Trial** | Salones nuevos | 1 mes gratis, acceso completo |
| **De pago** | Post-trial | Suscripción mensual (tiers por definir) |

> **Decisión crítica:** El sistema de suscripciones y planes debe existir desde el MVP (afecta modelo de datos multi-tenant).

## Módulos del producto

1. **Agenda y reservas** — Calendario, link público, disponibilidad dinámica
2. **Catálogo de servicios y paquetes** — Precios, duraciones, categorías
3. **Pagos y control financiero** — Comprobantes, deudas, contabilidad
4. **Gestión de clientas** — Historial, fotos, cumpleaños
5. **Dashboard** — Estado del salón en tiempo real

## Métricas de éxito (MVP)

- Reducción de no-shows en salones founder
- % founders que migran de papel/WhatsApp al sistema
- Salones nuevos activados en trial mensual
- Tasa de conversión trial → plan de pago

## Restricciones clave

- Multi-tenant con aislamiento total entre salones
- Moneda: quetzales (GTQ)
- Canal principal: WhatsApp (Guatemala)
- MVP: web app responsive, sin app nativa
- Pagos: validación manual de comprobante en MVP (sin pasarela automática)

## Documentos relacionados

- Arquitectura → `ARCHITECTURE.md`
- Estado actual → `CURRENT_STATE.md`
- Roadmap → `ROADMAP.md`
- Features → `FEATURES/`
