# Aford — Plan de implementación

**Nombre del proyecto:** Aford
**Versión:** 1.0
**Fecha:** 22 de julio de 2026
**Documentos base:** `ssd/functional-spec.md`, `ssd/technical-spec.md`

---

## Fases del proyecto

| Fase | Nombre | Semanas | Depende de |
|------|--------|---------|------------|
| 0 | Setup del proyecto | 1 | — |
| 1 | Core (auth + cuentas + transacciones) | 3 | Fase 0 |
| 2 | Feature set avanzado | 3 | Fase 1 |
| 3 | Dashboard + reportes | 2 | Fase 1 |
| 4 | Cross-cutting (i18n, PWA, notificaciones, export) | 2 | Fase 2 |
| 5 | Testing + polish | 2 | Fase 1-4 |

**Total estimado:** 13 semanas (~3 meses)

---

## Fase 0: Setup del proyecto (semana 1)

### Tarea 0.1 — Inicializar proyecto Next.js
- `npx create-next-app@latest aford --typescript --app --tailwind --eslint`
- Configurar `tsconfig.json` con paths alias (`@/`).
- Configurar ESLint + Prettier.
- Configurar estructura de carpetas inicial.

**Esfuerzo:** 0.5 días
**Archivos involucrados:** `package.json`, `tsconfig.json`, `.eslintrc.json`, `.prettierrc`, `next.config.ts`

### Tarea 0.2 — Configurar Drizzle + Neon
- Instalar `drizzle-orm`, `drizzle-kit`, `postgres`.
- Configurar `drizzle.config.ts`.
- Crear conexión a Neon en `lib/db/index.ts`.
- Crear archivo `lib/db/schema.ts` con los enums.
- Ejecutar `db:push` para verificar conexión.

**Esfuerzo:** 0.5 días
**Archivos involucrados:** `drizzle.config.ts`, `lib/db/index.ts`, `lib/db/schema.ts`, `.env.local`

### Tarea 0.3 — Configurar Tailwind + tema oscuro
- Instalar `next-themes`.
- Configurar `ThemeProvider` en el layout raíz.
- Crear componentes base de layout (`<Header>`, `<Sidebar>`, `<Main>`).

**Esfuerzo:** 0.5 días
**Archivos involucrados:** `app/layout.tsx`, `components/layout/`

### Tarea 0.4 — Configurar i18n (next-intl)
- Instalar `next-intl`.
- Crear archivos `messages/es.json`, `messages/en.json` con estructura inicial.
- Configurar middleware de i18n.
- Configurar `lib/i18n.ts`.

**Esfuerzo:** 1 día
**Archivos involucrados:** `middleware.ts`, `lib/i18n.ts`, `messages/*.json`, `app/[locale]/`

### Tarea 0.5 — Configurar PWA
- Crear `public/manifest.json`.
- Crear `public/sw.js` con service worker básico.
- Agregar íconos PWA (192x192, 512x512, maskable).
- Registrar SW en el layout.

**Esfuerzo:** 0.5 días
**Archivos involucrados:** `public/manifest.json`, `public/sw.js`, `public/icons/`, `app/layout.tsx`

### Tarea 0.6 — Configurar TanStack Query
- Instalar `@tanstack/react-query`.
- Crear `<QueryProvider>` wrapper.
- Agregar `QueryClient` con configuración base (staleTime, retry).

**Esfuerzo:** 0.25 días
**Archivos involucrados:** `components/shared/QueryProvider.tsx`, `app/layout.tsx`

### Tarea 0.7 — Configurar Framer Motion
- Instalar `framer-motion`.
- Crear `<MotionProvider>` (si es necesario).
- Crear componentes de animación base (`<FadeIn>`, `<SlideUp>`).

**Esfuerzo:** 0.25 días
**Archivos involucrados:** `components/shared/motion.tsx`

**Entregable:** Proyecto compilando, conectado a Neon, con routing básico, tema oscuro, i18n, PWA listos.

---

## Fase 1: Core (semanas 2-4)

### Tarea 1.1 — Autenticación (NextAuth + login/register)

**Dependencias:** Fase 0.2 (DB), Fase 0.6 (Query)
**Subtareas:**
1. Instalar `next-auth@beta`, `@auth/drizzle-adapter`, `bcryptjs`.
2. Configurar adapter de Drizzle en `features/auth/auth.ts`.
3. Crear provider de Credentials.
4. Crear `app/api/auth/[...nextauth]/route.ts`.
5. Crear `app/(auth)/login/page.tsx`.
6. Crear `app/(auth)/register/page.tsx`.
7. Crear formularios con React Hook Form + Zod.
8. Implementar recordar sesión (cookie persistente).
9. Crear `middleware.ts` para proteger rutas.
10. Agregar tablas `users`, `sessions` a schema de Drizzle.

**Esfuerzo:** 2 días
**Archivos clave:** `features/auth/auth.ts`, `features/auth/schemas.ts`, `app/(auth)/login/page.tsx`, `app/(auth)/register/page.tsx`, `middleware.ts`

### Tarea 1.2 — Perfil de usuario + foto

**Dependencias:** Tarea 1.1
**Subtareas:**
1. Crear `app/(dashboard)/profile/page.tsx`.
2. Formulario de edición de nombre, email.
3. Cambio de contraseña.
4. Subida de foto (base64 → columna `image`).
5. API Routes: `PUT /api/user/profile`.

**Esfuerzo:** 1 día
**Archivos clave:** `features/user/`, `app/(dashboard)/profile/page.tsx`, `app/api/user/profile/route.ts`

### Tarea 1.3 — Cuentas (CRUD + manejo de saldos)

**Dependencias:** Tarea 1.1
**Subtareas:**
1. Agregar tabla `accounts` al schema de Drizzle.
2. Crear queries y actions en `features/accounts/`.
3. API Routes: `GET/POST /api/accounts`, `PUT/DELETE /api/accounts/[id]`.
4. Crear `app/(dashboard)/accounts/page.tsx` (lista + crear/editar).
5. Implementar cálculo de saldo en base a transacciones confirmadas.
6. Validación de saldo negativo.

**Esfuerzo:** 2 días
**Archivos clave:** `features/accounts/`, `app/(dashboard)/accounts/page.tsx`, `app/api/accounts/`

### Tarea 1.4 — Categorías (CRUD)

**Dependencias:** Tarea 1.1
**Subtareas:**
1. Agregar tabla `categories` al schema de Drizzle.
2. Crear queries y actions en `features/categories/`.
3. API Routes: CRUD completo.
4. Crear `app/(dashboard)/categories/page.tsx`.
5. Selector de color personalizado.
6. Crear/editar en modal o página dedicada.

**Esfuerzo:** 1 día
**Archivos clave:** `features/categories/`, `app/(dashboard)/categories/page.tsx`, `app/api/categories/`

### Tarea 1.5 — Tags (CRUD)

**Dependencias:** Tarea 1.1
**Subtareas:**
1. Agregar tabla `tags` al schema de Drizzle.
2. Crear queries y actions en `features/tags/`.
3. API Routes: CRUD completo.
4. UI: lista de tags con creación inline.

**Esfuerzo:** 0.5 días
**Archivos clave:** `features/tags/`, `app/(dashboard)/settings/`, `app/api/tags/`

### Tarea 1.6 — Transacciones (simples, pendientes, búsqueda)

**Dependencias:** Tarea 1.3 (cuentas), Tarea 1.4 (categorías), Tarea 1.5 (tags)
**Subtareas:**
1. Agregar tabla `transactions` y `transaction_tags` al schema.
2. Crear queries y actions en `features/transactions/`.
3. API Routes: `GET/POST /api/transactions`, `PUT /api/transactions/[id]`, `GET /api/transactions/search`.
4. Formulario de transacción simple (monto, fecha, categoría, cuenta, tags, nota).
5. Formulario de transacción en cuotas.
6. Marcar como pendiente y confirmar.
7. Validación de saldo negativo al confirmar.
8. Búsqueda en tiempo real (debounce 300ms, query a API).
9. Lista de transacciones con filtros (fecha, categoría, tipo).

**Esfuerzo:** 4 días
**Archivos clave:** `features/transactions/`, `app/(dashboard)/transactions/`, `app/api/transactions/`

### Tarea 1.7 — Transferencias

**Dependencias:** Tarea 1.3 (cuentas), Tarea 1.6 (transacciones)
**Subtareas:**
1. Agregar tabla `transfers` al schema.
2. API Routes: `GET/POST /api/transfers`.
3. Crear acción que resta de cuenta origen y suma en cuenta destino.
4. Formulario de transferencia.
5. Lista de transferencias.

**Esfuerzo:** 1 día
**Archivos clave:** `features/accounts/transfers/`, `app/api/transfers/`

### Tarea 1.7b — Configuración de usuario (settings)

**Dependencias:** Tarea 1.1
**Subtareas:**
1. Agregar tabla `user_settings` al schema.
2. API Route: `PUT /api/user/settings`.
3. Pantalla de settings con:
   - Día de cierre de mes (select 1-28).
   - Tema (claro/oscuro/sistema).
   - Idioma (es/en).
   - Toggles de notificaciones.
4. Persistir preferencia de idioma en cookie.

**Esfuerzo:** 1 día
**Archivos clave:** `features/user/`, `app/(dashboard)/settings/page.tsx`, `app/api/user/settings/route.ts`

### Tarea 1.8 — Onboarding

**Dependencias:** Tareas 1.1 a 1.7b
**Subtareas:**
1. Crear `app/(onboarding)/page.tsx`.
2. Flujo multi-paso:
   - Paso 1: Crear cuentas iniciales.
   - Paso 2: Crear categorías base (o sugerir defaults).
   - Paso 3: Configurar día de cierre.
3. Al completar, marcar `onboarding_completed = true`.
4. Redirigir a `/dashboard`.

**Esfuerzo:** 1.5 días
**Archivos clave:** `app/(onboarding)/page.tsx`, `features/user/`

**Entregable de Fase 1:** Usuario puede registrarse, crear cuentas/categorías/tags, registrar transacciones simples y en cuotas, transferir entre cuentas, y configurar preferencias.

---

## Fase 2: Feature set avanzado (semanas 5-7)

### Tarea 2.1 — Presupuestos

**Dependencias:** Tarea 1.4 (categorías), Tarea 1.6 (transacciones)
**Subtareas:**
1. Agregar tabla `budgets` al schema.
2. API Routes: `GET/POST /api/budgets`.
3. UI: crear/editar presupuesto mensual por categoría.
4. Cálculo del gasto real vs presupuesto.
5. Barras de progreso con colores (verde/amarillo/rojo).
6. Alerta visual al superar presupuesto.

**Esfuerzo:** 2 días
**Archivos clave:** `features/budgets/`, `app/(dashboard)/budgets/page.tsx`, `app/api/budgets/`

### Tarea 2.2 — Transacciones recurrentes

**Dependencias:** Tarea 1.6 (transacciones), Tarea 1.4 (categorías), Tarea 1.3 (cuentas)
**Subtareas:**
1. Agregar tabla `recurring_transactions` y `recurring_tags` al schema.
2. API Routes: CRUD de recurrentes.
3. UI: crear/editar recurrencia (frecuencia, monto, fechas).
4. Implementar `processRecurringTransactions()` (cron job o trigger).
   - Opción A: Cron job con Vercel Cron Jobs.
   - Opción B: Verificar al cargar dashboard y generar si es necesario.
5. Generar transacción automática en la fecha correspondiente.
6. Mostrar próximos recurrentes en dashboard.

**Esfuerzo:** 2.5 días
**Archivos clave:** `features/transactions/utils.ts`, `app/api/recurring/`, `app/(dashboard)/settings/recurring/`

### Tarea 2.3 — Metas de ahorro

**Dependencias:** Tarea 1.3 (cuentas)
**Subtareas:**
1. Agregar tablas `goals` y `goal_transactions` al schema.
2. API Routes: CRUD de metas + agregar fondos.
3. UI: crear meta (nombre, monto objetivo, fecha, cuenta, color).
4. Barra de progreso visual.
5. Cálculo automático de ahorro mensual necesario.
6. Registro de aportes a la meta.

**Esfuerzo:** 2 días
**Archivos clave:** `features/goals/`, `app/(dashboard)/goals/page.tsx`, `app/api/goals/`

### Tarea 2.4 — Deudas y préstamos

**Dependencias:** Tarea 1.3 (cuentas - opcional)
**Subtareas:**
1. Agregar tablas `debts` y `debt_payments` al schema.
2. API Routes: CRUD de deudas + registrar pagos.
3. UI: crear deuda, registrar pagos parciales.
4. Progreso de pago (pagado vs total).

**Esfuerzo:** 2 días
**Archivos clave:** `features/debts/`, `app/(dashboard)/debts/page.tsx`, `app/api/debts/`

**Entregable de Fase 2:** App completa a nivel funcional — presupuestos, recurrencia, metas de ahorro y deudas operativas.

---

## Fase 3: Dashboard + Reportes (semanas 8-9)

### Tarea 3.1 — Dashboard

**Dependencias:** Fase 1 y 2 completas
**Subtareas:**
1. Crear `app/(dashboard)/dashboard/page.tsx`.
2. Queries agregadas para:
   - Saldo total (suma de cuentas).
   - Ingresos y gastos del mes financiero actual.
   - Top categorías de gasto.
   - Compromisos próximos (cuotas + recurrentes próximos 30 días).
   - Estado de presupuestos.
3. Gráficas (ECharts):
   - Torta de gastos por categoría.
   - Barras de ingresos vs gastos mensuales (últimos 6 meses).
   - Línea de tendencia del saldo.
4. Cards con indicadores.

**Esfuerzo:** 3 días
**Archivos clave:** `features/dashboard/`, `app/(dashboard)/dashboard/page.tsx`, `components/charts/`

### Tarea 3.2 — Reportes mensuales

**Dependencias:** Fase 1 y 2 completas
**Subtareas:**
1. Queries agregadas para reportes (por rango de fechas, categorías, cuentas, tags).
2. API Route: `GET /api/reports` con filtros.
3. UI de reportes con:
   - Cards de resumen.
   - Filtros (rango de fechas, categorías, cuentas, tags, tipo).
   - Gráficas (torta, barras, comparativa).

**Esfuerzo:** 2 días
**Archivos clave:** `features/reports/`, `app/(dashboard)/reports/page.tsx`

### Tarea 3.3 — Heatmap de gastos

**Dependencias:** Tarea 3.1
**Subtareas:**
1. Implementar gráfico heatmap con ECharts.
2. Mostrar en dashboard como calendario de gastos diarios.
3. Tooltip con monto al hacer hover.

**Esfuerzo:** 1 día
**Archivos clave:** `components/charts/Heatmap.tsx`

**Entregable de Fase 3:** Dashboard con gráficas completo y reportes funcionales.

---

## Fase 4: Cross-cutting (semanas 10-11)

### Tarea 4.1 — i18n completo

**Dependencias:** Fase 0.4
**Subtareas:**
1. Traducir todas las cadenas de la app a ES y EN.
2. Completar `messages/es.json` y `messages/en.json`.
3. Asegurar que todas las fechas y monedas usan `Intl` formatter.
4. Selector de idioma en settings.

**Esfuerzo:** 2 días
**Archivos clave:** `messages/*.json`, `components/`

### Tarea 4.2 — Exportación CSV/Excel

**Dependencias:** Fase 1 (transacciones), Fase 3 (reportes)
**Subtareas:**
1. Instalar `xlsx` y `papaparse`.
2. Implementar generación de CSV en `features/export/utils.ts`.
3. Implementar generación de Excel en `features/export/utils.ts`.
4. API Route: `GET /api/export?format=csv|xlsx&filtros`.
5. Botones de exportar en pantalla de transacciones y reportes.

**Esfuerzo:** 1.5 días
**Archivos clave:** `features/export/`, `app/api/export/route.ts`

### Tarea 4.3 — Notificaciones push

**Dependencias:** Fase 0.5 (PWA), Tareas 2.2, 2.3, 2.4 (recurrentes, metas, deudas)
**Subtareas:**
1. Instalar `web-push`.
2. Generar claves VAPID.
3. Configurar suscripción push en `lib/push.ts`.
4. API Route: `POST /api/user/push-subscription`.
5. Implementar envío de notificaciones para:
   - Recordatorio de registro de gastos.
   - Alerta de presupuesto.
   - Cuota próxima a vencer.
   - Meta próxima a vencer.
6. Manejar click en notificación.

**Esfuerzo:** 2 días
**Archivos clave:** `lib/push.ts`, `public/sw.js`, `app/api/user/push-subscription/route.ts`

### Tarea 4.4 — Modo oscuro completo

**Dependencias:** Fase 0.3
**Subtareas:**
1. Asegurar que todas las pantallas respetan tema claro/oscuro.
2. Probar gráficas ECharts con tema oscuro.
3. Tooltips, modals, notificaciones in-app con tema correcto.

**Esfuerzo:** 1 día
**Archivos clave:** `components/`, `app/globals.css`

**Entregable de Fase 4:** App internacionalizada, exportable, con notificaciones push y tema oscuro pulido.

---

## Fase 5: Testing + polish (semanas 12-13)

### Tarea 5.1 — Tests unitarios

**Dependencias:** Todas las fases anteriores
**Subtareas:**
1. Tests de utilidades: `generateInstallmentDates`, `getFinancialMonth`, `calculateAccountBalance`.
2. Tests de schemas de Zod.
3. Tests de hooks más importantes.

**Esfuerzo:** 2 días
**Archivos clave:** `features/**/*.test.ts`

### Tarea 5.2 — Tests de componentes

**Dependencias:** Todas las fases anteriores
**Subtareas:**
1. Tests de formularios (TransactionForm, AccountForm).
2. Tests de componentes shared (Chart, Modal, etc.).
3. Tests de navegación básica.

**Esfuerzo:** 2 días
**Archivos clave:** `components/**/*.test.tsx`, `features/**/*.test.tsx`

### Tarea 5.3 — Optimización de rendimiento

**Dependencias:** Todas las fases anteriores
**Subtareas:**
1. Lazy loading de rutas.
2. Image optimization.
3. Bundle analysis (next/bundle-analyzer).
4. Optimistic updates en mutations de TanStack Query.
5. Paginación en listas largas (transacciones).

**Esfuerzo:** 2 días
**Archivos clave:** `next.config.ts`, `features/transactions/`

### Tarea 5.4 — Audit trail de ediciones

**Dependencias:** Tarea 1.6 (transacciones)
**Subtareas:**
1. Agregar columna `version` a la tabla `transactions`.
2. Implementar optimistic concurrency control (OCC) en ediciones.
3. Al actualizar, verificar que la versión no haya cambiado.
4. Mostrar alerta en caso de conflicto.

**Esfuerzo:** 1 día
**Archivos clave:** `features/transactions/actions.ts`

### Tarea 5.5 — QA y bug fixing

**Dependencias:** Todas las fases anteriores
**Subtareas:**
1. Probar todos los flujos principales (gasto simple, cuotas, recurrencia, transferencias, metas, deudas).
2. Probar edge cases: saldo negativo, cuotas con mes de cierre, multi-sesión.
3. Cross-browser testing.
4. Responsive testing (mobile, tablet, desktop).

**Esfuerzo:** 3 días

**Entregable de Fase 5:** App testeada, optimizada y lista para producción.

---

## Resumen de esfuerzo por fase

| Fase | Días hábiles | Semanas | 
|------|-------------|---------|
| 0 — Setup | 4 | 1 |
| 1 — Core | 12.5 | ~2.5 |
| 2 — Avanzado | 8.5 | ~2 |
| 3 — Dashboard + reportes | 6 | ~1.5 |
| 4 — Cross-cutting | 6.5 | ~1.5 |
| 5 — Testing + polish | 10 | 2 |
| **Total** | **~47.5** | **~10-13** |

---

## Dependencias entre tareas (grafo simplificado)

```
Fase 0 (Setup)
  └── Fase 1.1 (Auth)
       ├── 1.2 (Perfil)
       ├── 1.3 (Cuentas)
       ├── 1.4 (Categorías)
       ├── 1.5 (Tags)
       └── 1.7b (Settings)
            └── 1.8 (Onboarding) ← depende de 1.3, 1.4, 1.7b
       ├── 1.6 (Transacciones) ← depende de 1.3, 1.4, 1.5
       └── 1.7 (Transferencias) ← depende de 1.3, 1.6
            │
Fase 2:
  2.1 (Presupuestos) ← depende de 1.4, 1.6
  2.2 (Recurrentes) ← depende de 1.6, 1.4, 1.3
  2.3 (Metas) ← depende de 1.3
  2.4 (Deudas) ← independiente (solo DB)
            │
Fase 3:
  3.1 (Dashboard) ← depende de Fase 1 + 2
  3.2 (Reportes) ← depende de 1.6
  3.3 (Heatmap) ← depende de 3.1
            │
Fase 4:
  4.1 (i18n) ← cross-cutting sobre Fase 1-3
  4.2 (Export) ← depende de 1.6, 3.2
  4.3 (Push) ← depende de Fase 0.5, 2.2, 2.3, 2.4
  4.4 (Dark mode) ← cross-cutting sobre todo
            │
Fase 5:
  5.1-5.5 (Testing + polish) ← depende de todo lo anterior
```

---

## Entregables por milestone

### Milestone 1 — MVP (fin fase 1, semana 4)
- Registro/login funcional.
- CRUD de cuentas, categorías, tags.
- Transacciones simples y en cuotas.
- Transferencias.
- Settings (cierre de mes, tema, idioma).
- Onboarding.
- Dashboard básico (solo resumen numérico, sin gráficas).

### Milestone 2 — Feature completo (fin fase 2, semana 7)
- Presupuestos por categoría.
- Transacciones recurrentes.
- Metas de ahorro.
- Deudas y préstamos.

### Milestone 3 — Dashboard + analytics (fin fase 3, semana 9)
- Dashboard con gráficas (torta, barras, línea, heatmap).
- Reportes con filtros.

### Milestone 4 — Release candidate (fin fase 4, semana 11)
- i18n ES/EN completo.
- Exportación CSV/Excel.
- Notificaciones push.
- Modo oscuro.

### Milestone 5 — Producción (fin fase 5, semana 13)
- Tests.
- Optimizaciones.
- Bug fixes.
- Deploy a Vercel.

---

*Documento generado para el proyecto Aford. Complementa `ssd/functional-spec.md` y `ssd/technical-spec.md`.*
