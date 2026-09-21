# Decisión — Precios, trial y taller (oleada 1)

> **Fecha decisión:** 2026-09-21  
> **Estado:** Aprobado para presentación / taller (Fase 3)  
> **Fuente de verdad** para copy, guion y `gotacheck.app`.  
> Relacionado: `ROUTE_GOTACHECK.md` · `TALLER_PRESENTACION.md`

---

## 1. Oferta (2 SKUs — oleada 1)

| SKU | Nombre | Precio | Trial | Incluye | No incluye |
|-----|--------|--------|-------|---------|------------|
| **A** | Agenda | **Q100/mes** | **30 días** | App, link `/reservar/[slug]`, panel, pagos por comprobante, alta asistida | Dominio propio, landing/vitrina, fotos, editor |
| **Vitrina** | Vitrina (servicio estudio) | **Q3,500** (único) | **No** | Agenda (misma app) + dominio 1er año + landing vitrina hecha por el estudio (copy/fotos que aporte la dueña) | Editor self-serve, sesión de fotos, e-commerce, blog |

**Fuera de oferta oleada 1 (explícito):**
- Sesión de fotos / SKU “Presencia” (antes C)
- Editor de vitrina self-serve (S2.2 aparcado)
- WhatsApp API, ads, app móvil nativa

**Mensualidad post-vitrina:** la dueña sigue con **Agenda Q100/mes** (mismo producto A). El Q3,500 es el setup de presencia web + dominio año 1.

---

## 2. Dominio — propiedad y renovación

| Año | Quién paga | Monto |
|-----|------------|-------|
| 1er año | Incluido en Vitrina (estudio) | Dentro de Q3,500 |
| 2º año en adelante | La clienta | **Q200/año** (renovación vía estudio) |

- Propiedad del dominio: de quien paga el servicio (ver `ROUTE_GOTACHECK.md` §9).
- En taller: decir en voz alta “el primer año va incluido; desde el segundo renovamos por Q200/año”.

---

## 3. Capacidad operativa

| Ítem | Cupo | Nota |
|------|------|------|
| Taller / oleada 1 | **≤15** interesadas reales (tras sondeo) | Grupo manejable; no open invite a ~35 |
| Altas Vitrina / mes | **4–6** | Solo con **info completa** (copy, fotos, datos dominio). Si falta material, no cuenta en el cupo del mes |
| Agenda (A) | Alta asistida; sin cupo duro de vitrina | Trial 30 días; cobro Q100 al día 31 si continúa |

**Pendiente técnico/proceso (dueño producto):** optimizar forma de enrolar nuevas (hoy `npm run provision:salon` + `RUNBOOK_ALTA_SALON.md`). No bloquea el taller; sí conviene antes de escalar altas.

---

## 4. Trial — reglas

### Agenda (A)
- **Sí:** 30 días calendario desde el alta.
- Incluye uso completo de la app (mismo alcance que plan de pago).
- Al día 31: cobro **Q100** o baja asistida (sin cargo sorpresa: avisar en alta y en día ~25).
- Cobro oleada 1: transferencia + recordatorio WhatsApp (sin pasarela).

### Vitrina
- **Sin trial.** Es proyecto del estudio con entrega definida.
- Enrolamiento: lista de espera / cola por cupo 4–6/mes; requiere brief completo.

---

## 5. Taller

| Campo | Valor |
|-------|--------|
| Cupo | **15** personas |
| Entrada | Sondeo vía founders (Ruth / Andrea) → lista corta |
| Objetivo | Demo live + captura interesados A / Vitrina |
| Fecha | Por fijar cuando checklist de `TALLER_PRESENTACION.md` esté ✅ |

---

## 6. Infra (recordatorio, no cambia)

- Vercel Pro: ✅  
- Supabase Free → **Pro al primer cobro** a clienta (backups)  
- App: `citabella-eight.vercel.app` · Marketing: `gotacheck.app`

---

## 7. Copy mínimo aprobado (voz alta / web)

- “Agenda: Q100 al mes, con **30 días de prueba**.”
- “Vitrina: **Q3,500** una vez — te dejamos página + dominio el primer año; después renovación **Q200/año**.”
- “No vendemos sesión de fotos ni editor para que edites sola: nosotros montamos la vitrina contigo.”
- “Cupo de vitrinas: unas **4 a 6 al mes**, cuando nos pasen la info completa.”

---

## 8. Historial

| Fecha | Cambio |
|-------|--------|
| 2026-09-21 | Decisión founders/producto: A Q100 + trial 30d; Vitrina Q3500; dominio año2 Q200; cupo vitrina 4–6/mes; taller ≤15; sin fotos/editor |
