# CITABELLA — AI System (Gestión de contexto y tokens)

> **Última actualización:** 2026-07-01  
> Objetivo: eliminar dependencia de chats largos como memoria del proyecto.

## Principio rector

**Los archivos en `docs/` son la memoria persistente. Los chats son desechables.**

Cada conversación en Cursor debe poder iniciarse leyendo ≤5 archivos y producir trabajo coherente sin historial previo.

## Protocolo de inicio de chat (OBLIGATORIO)

### Lectura mínima (~2-4K tokens)

Leer **en este orden**, detenerse si el scope es acotado:

| Prioridad | Archivo | Cuándo |
|-----------|---------|--------|
| 1 | `CURRENT_STATE.md` | Siempre |
| 2 | `ENGINEERING_RULES.md` | Siempre |
| 3 | `ARCHITECTURE.md` | Si hay trabajo técnico |
| 4 | `FEATURES/<modulo>.md` | Solo el módulo en scope |
| 5 | `DATABASE_SCHEMA.md` | Solo si toca DB/migraciones |

### Lectura opcional (solo si necesario)

| Archivo | Cuándo |
|---------|--------|
| `PROJECT_OVERVIEW.md` | Onboarding, decisiones de producto |
| `ROADMAP.md` | Planificación de sprints |
| `archive/sprint-XX.md` | Contexto de sprint anterior |

### NO leer por defecto

- Todos los `FEATURES/` a la vez
- `archive/` completo
- Código fuente masivo sin scope definido

## Protocolo de cierre de sesión

Al terminar trabajo significativo, actualizar:

1. **`CURRENT_STATE.md`** — estado, decisiones, próximo paso
2. **Feature doc afectado** — marcar user stories completadas
3. **`DATABASE_SCHEMA.md`** — solo si hubo cambio de schema
4. **`archive/sprint-XX.md`** — al cerrar sprint (resumen compacto)

## Cuándo crear un chat nuevo

| Señal | Acción |
|-------|--------|
| Chat supera ~15-20 intercambios | Nuevo chat + leer `CURRENT_STATE.md` |
| Cambio de módulo/feature | Nuevo chat scoped al feature doc |
| Cambio de fase (Fase 0→1, 1→2) | Nuevo chat + leer `ROADMAP.md` |
| Bug fix aislado | Chat corto, solo `CURRENT_STATE` + archivo afectado |
| Retoma después de días | Siempre chat nuevo |

## Cuándo archivar conversaciones

Al cerrar cada sprint, generar `archive/sprint-XX.md` con:

```markdown
# Sprint XX — [nombre]
**Fechas:** YYYY-MM-DD → YYYY-MM-DD
**Objetivo:** [1 línea]

## Entregado
- [bullet concreto]

## Decisiones tomadas
- [decisión + razón breve]

## Deuda técnica
- [item]

## Próximo sprint
- [1-3 items]
```

El chat original puede descartarse. El archive es el resumen.

## Prompt maestro para chats nuevos

Copiar al iniciar cada sesión de desarrollo:

```
Proyecto: CITABELLA (SaaS multi-tenant belleza, Guatemala)
Lee antes de actuar: docs/CURRENT_STATE.md y docs/ENGINEERING_RULES.md
Scope de esta sesión: [FEATURE específica]
Si toca DB: docs/DATABASE_SCHEMA.md
Reglas: multi-tenant RLS, Next.js 14 + Supabase, UI en español
Al cerrar: actualiza CURRENT_STATE.md y el feature doc afectado
```

## Estrategia de reducción de tokens

### 1. Documentación como caché

| Antes (alto costo) | Después (bajo costo) |
|-------------------|---------------------|
| Re-explicar arquitectura en cada chat | `ARCHITECTURE.md` (~800 tokens) |
| Pegar PRD completo | `PROJECT_OVERVIEW.md` (~600 tokens) |
| Describir schema en conversación | `DATABASE_SCHEMA.md` referencia puntual |
| Historial de 50 mensajes | `archive/sprint-XX.md` (~300 tokens) |

### 2. Scope estricto por sesión

- Una sesión = una feature o un fix
- Mencionar explícitamente qué archivos NO tocar
- Usar `@docs/FEATURES/Agenda-yreservas.md` en lugar de pegar requisitos

### 3. Feature docs como contratos

Cada `FEATURES/*.md` contiene solo:
- User stories del módulo
- Criterios de aceptación
- Archivos de código relacionados
- Estado (pendiente / en progreso / hecho)

No duplicar arquitectura ni schema completo.

### 4. Cursor Rules (recomendado)

Crear `.cursor/rules/citabella.mdc` con:

```
Al trabajar en CITABELLA:
1. Leer docs/CURRENT_STATE.md al inicio
2. Seguir docs/ENGINEERING_RULES.md
3. No repetir contexto del PRD; usar docs/FEATURES/
4. Actualizar CURRENT_STATE.md al finalizar
```

### 5. Referencias por path, no por contenido

En prompts, usar:
- `@docs/DATABASE_SCHEMA.md` sección `citas`
- `@src/lib/availability/engine.ts`

Evitar copiar bloques grandes de código o docs al chat.

## Coherencia arquitectónica

| Riesgo | Mitigación |
|--------|------------|
| Agente propone stack diferente | `ARCHITECTURE.md` + rule de Cursor |
| Schema divergente | Migraciones versionadas; `DATABASE_SCHEMA.md` obligatorio |
| Feature fuera de scope MVP | `ROADMAP.md` marca qué es Fase 1 vs 2 |
| Decisiones perdidas | `CURRENT_STATE.md` → sección "Decisiones tomadas" |

## Métricas de salud del sistema documental

Revisar semanalmente:

- [ ] `CURRENT_STATE.md` actualizado en últimos 3 días de trabajo
- [ ] Feature docs reflejan estado real
- [ ] Ningún sprint cerrado sin `archive/sprint-XX.md`
- [ ] Chats nuevos arrancan con prompt maestro
- [ ] `DATABASE_SCHEMA.md` coincide con migraciones en `supabase/migrations/`

## Información que NUNCA va al chat (va a docs)

- Decisiones de arquitectura
- Esquema de base de datos
- Criterios de aceptación de features
- Estado del sprint y bloqueadores
- Convenciones de código
- Historial de sprints archivados

## Información que SÍ va al chat (efímera)

- Bug específico con stack trace
- Diff o archivo puntual a modificar
- Pregunta concreta de implementación
- Scope de la sesión actual
