# LoyalTeam - Agentes Disponibles y Flujo de Trabajo Automatizado

## Resumen del Proyecto

**LoyalTeam** es una plataforma SaaS multi-tenant de inteligencia de negocios con:
- Monorepo Turborepo (apps/api, apps/web, apps/workers, packages/*)
- Backend NestJS + Frontend Next.js 15
- Supabase PostgreSQL + JWT Auth custom
- Sistema de créditos para billing

---

## Agentes Disponibles

### 1. Agentes de Arquitectura y Planificación

| Agente | Descripción | Cuándo Usar |
|--------|-------------|-------------|
| **Explore** | Exploración rápida de codebase | Búsqueda de archivos, patrones, entender estructura |
| **Plan** | Planificación de implementación | Tareas complejas que requieren diseño previo |
| **architect-reviewer** | Revisión arquitectónica SOLID | Validar cambios estructurales, nuevos servicios |
| **backend-architect** | Diseño de APIs y microservicios | APIs RESTful, schemas DB, escalabilidad |
| **database-architect** | Arquitectura de base de datos | Diseño de schemas, relaciones, índices |

### 2. Agentes de Desarrollo

| Agente | Descripción | Cuándo Usar |
|--------|-------------|-------------|
| **typescript-pro** | TypeScript avanzado | Tipos complejos, generics, migraciones JS→TS |
| **frontend-developer** | Desarrollo React/Next.js | Componentes UI, estado, accesibilidad |
| **nextjs-architecture-expert** | Experto Next.js | App Router, Server Components, optimización |
| **ai-engineer** | Aplicaciones LLM/RAG | Integraciones OpenAI, embeddings, prompts |
| **data-engineer** | Pipelines de datos | ETL, streaming, data warehouses |
| **prompt-engineer** | Optimización de prompts | System prompts, técnicas de prompting |

### 3. Agentes de Base de Datos

| Agente | Descripción | Cuándo Usar |
|--------|-------------|-------------|
| **supabase-schema-architect** | Schemas Supabase | Diseño de tablas, migraciones, RLS |
| **database-architect** | Arquitectura DB general | Modelado de datos, patrones multi-tenant |

### 4. Agentes de Calidad y Seguridad

| Agente | Descripción | Cuándo Usar |
|--------|-------------|-------------|
| **code-reviewer** | Revisión de código | Post-implementación, PRs |
| **security-auditor** | Auditoría de seguridad | Auth, OWASP, vulnerabilidades |
| **debugger** | Debugging especializado | Errores, stack traces, comportamiento inesperado |
| **error-detective** | Análisis de logs | Errores producción, patrones de fallo |

### 5. Agentes de DevOps y Documentación

| Agente | Descripción | Cuándo Usar |
|--------|-------------|-------------|
| **devops-engineer** | CI/CD e infraestructura | Pipelines, Docker, monitoreo |
| **api-documenter** | Documentación de APIs | OpenAPI/Swagger, SDKs |
| **ui-ux-designer** | Diseño UI/UX | User research, wireframes, design systems |
| **search-specialist** | Investigación web | Análisis competitivo, fact-checking |
| **context-manager** | Gestión de contexto | Workflows multi-agente, sesiones largas |

---

## Flujo de Trabajo Automatizado por Tipo de Tarea

### FLUJO 1: Nueva Feature (End-to-End)

```
┌─────────────────────────────────────────────────────────────────────┐
│                    NUEVA FEATURE REQUEST                            │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 1. ANÁLISIS Y PLANIFICACIÓN                                         │
│    ├── Explore: Buscar código relacionado existente                 │
│    ├── Plan: Diseñar implementación                                 │
│    └── architect-reviewer: Validar diseño arquitectónico            │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 2. DISEÑO DE DATOS (si aplica)                                      │
│    ├── database-architect: Diseñar schema                           │
│    └── supabase-schema-architect: Crear migraciones Supabase        │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 3. IMPLEMENTACIÓN BACKEND                                           │
│    ├── backend-architect: Diseñar endpoints/servicios               │
│    ├── typescript-pro: Implementar con tipos seguros                │
│    └── security-auditor: Validar auth/seguridad                     │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 4. IMPLEMENTACIÓN FRONTEND                                          │
│    ├── nextjs-architecture-expert: Diseño de páginas/componentes    │
│    ├── frontend-developer: Implementar UI                           │
│    └── ui-ux-designer: Validar UX (opcional)                        │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 5. CALIDAD Y DOCUMENTACIÓN                                          │
│    ├── code-reviewer: Revisión de código completa                   │
│    ├── api-documenter: Documentar nuevos endpoints                  │
│    └── devops-engineer: Actualizar pipelines si necesario           │
└─────────────────────────────────────────────────────────────────────┘
```

### FLUJO 2: Bug Fix

```
┌─────────────────────────────────────────────────────────────────────┐
│                         BUG REPORT                                  │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 1. INVESTIGACIÓN                                                    │
│    ├── error-detective: Analizar logs/errores                       │
│    ├── debugger: Identificar causa raíz                             │
│    └── Explore: Encontrar código afectado                           │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 2. IMPLEMENTACIÓN DEL FIX                                           │
│    ├── typescript-pro: Implementar corrección                       │
│    └── security-auditor: Validar que no introduce vulnerabilidades  │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 3. VALIDACIÓN                                                       │
│    └── code-reviewer: Verificar calidad del fix                     │
└─────────────────────────────────────────────────────────────────────┘
```

### FLUJO 3: Refactoring/Mejora Arquitectónica

```
┌─────────────────────────────────────────────────────────────────────┐
│                    REFACTORING REQUEST                              │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 1. ANÁLISIS ACTUAL                                                  │
│    ├── Explore: Mapear código a refactorizar                        │
│    └── architect-reviewer: Identificar problemas SOLID              │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 2. DISEÑO DE LA SOLUCIÓN                                            │
│    ├── Plan: Diseñar nueva arquitectura                             │
│    ├── backend-architect: Definir nuevos patrones                   │
│    └── database-architect: Cambios de schema si aplica              │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 3. IMPLEMENTACIÓN INCREMENTAL                                       │
│    ├── typescript-pro: Implementar cambios                          │
│    └── code-reviewer: Validar cada incremento                       │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 4. VALIDACIÓN FINAL                                                 │
│    ├── architect-reviewer: Verificar mejoras                        │
│    └── security-auditor: Audit de seguridad                         │
└─────────────────────────────────────────────────────────────────────┘
```

### FLUJO 4: Feature de AI/LLM

```
┌─────────────────────────────────────────────────────────────────────┐
│                      AI FEATURE REQUEST                             │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 1. DISEÑO                                                           │
│    ├── ai-engineer: Diseñar arquitectura LLM/RAG                    │
│    ├── prompt-engineer: Diseñar system prompts                      │
│    └── backend-architect: Integrar con API existente                │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 2. IMPLEMENTACIÓN                                                   │
│    ├── ai-engineer: Implementar pipeline LLM                        │
│    ├── typescript-pro: Tipos y validación                           │
│    └── data-engineer: Pipeline de datos si necesario                │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 3. VALIDACIÓN                                                       │
│    ├── code-reviewer: Revisión de código                            │
│    └── security-auditor: Validar manejo de datos sensibles          │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Mejoras Arquitectónicas Identificadas (Prioritarias)

### CRÍTICAS (Implementar Primero)

1. **Repository Pattern** - Abstraer acceso a Supabase
   ```
   apps/api/src/repositories/
   ├── base.repository.ts
   ├── business.repository.ts
   ├── user.repository.ts
   └── tenant.repository.ts
   ```

2. **Dependency Injection mejorada** - Interfaces para servicios
   ```
   packages/shared/src/interfaces/
   ├── repositories/
   └── services/
   ```

3. **Unit of Work** - Transacciones consistentes

### ALTA PRIORIDAD

4. **Caching Layer** - Redis para queries frecuentes
5. **Error Handling centralizado** - Exception filters globales
6. **Logging estructurado** - Winston/Pino con correlación
7. **API Versioning** - `/api/v1/...`
8. **Rate Limiting** - Protección de endpoints

### MEDIA PRIORIDAD

9. **CQRS Light** - Separar reads/writes para reports
10. **Event-driven** - Domain events para acciones async
11. **Health checks** - `/health` endpoints
12. **OpenAPI/Swagger** - Documentación automática

---

## Comandos de Slash Disponibles

| Comando | Descripción |
|---------|-------------|
| `/generate-tests` | Genera suite de tests completa |
| `/create-architecture-documentation` | Documentación arquitectónica con diagramas |
| `/code-review` | Revisión de calidad, seguridad y arquitectura |
| `/supabase-performance-optimizer` | Optimizar performance de Supabase |
| `/supabase-data-explorer` | Explorar y analizar datos |
| `/ultra-think` | Análisis profundo multi-dimensional |
| `/update-docs` | Actualizar documentación del proyecto |

---

## Ejemplo de Uso: "Agregar sistema de notificaciones"

### Comando del Usuario:
```
"Necesito agregar un sistema de notificaciones push y email para cuando se complete un análisis"
```

### Cadena de Agentes Automatizada:

```bash
# FASE 1: Planificación
1. Explore → Buscar código de análisis existente, jobs, etc.
2. Plan → Diseñar arquitectura de notificaciones
3. architect-reviewer → Validar diseño propuesto

# FASE 2: Base de Datos
4. database-architect → Diseñar tablas (notifications, user_preferences)
5. supabase-schema-architect → Crear migración SQL

# FASE 3: Backend
6. backend-architect → Diseñar NotificationModule
7. typescript-pro → Implementar servicios y DTOs
8. ai-engineer → Si se usa AI para personalizar notificaciones

# FASE 4: Workers
9. backend-architect → Job para envío de notificaciones
10. devops-engineer → Configurar Redis si no está

# FASE 5: Frontend
11. nextjs-architecture-expert → Página de preferencias
12. frontend-developer → Componentes de notificación

# FASE 6: Calidad
13. code-reviewer → Revisión completa
14. security-auditor → Validar tokens push, PII en emails
15. api-documenter → Documentar nuevos endpoints
```

---

## Tips para Optimizar el Flujo

1. **Siempre empezar con Explore** - Evita duplicar código existente
2. **Plan para tareas >2 horas** - Reduce retrabajo
3. **code-reviewer después de cada feature** - Catch issues temprano
4. **security-auditor para auth/datos** - Crítico para SaaS
5. **Paralelizar cuando posible** - Backend y Frontend pueden ir juntos después del diseño

---

## Configuración Recomendada para .claude/

```
.claude/
├── AGENTS_WORKFLOW.md          # Este documento
├── commands/                   # Slash commands custom
│   ├── generate-tests.md
│   ├── create-architecture-documentation.md
│   └── ...
└── settings.local.json         # Configuración local
```
