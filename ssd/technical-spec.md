# Aford — Especificaciones Técnicas

**Nombre del proyecto:** Aford
**Versión:** 1.0
**Fecha:** 22 de julio de 2026
**Documento base:** `ssd/functional-spec.md`

---

## 1. Stack tecnológico

| Componente | Tecnología | Versión |
|------------|------------|---------|
| Framework | Next.js (App Router) | 15.x |
| Runtime | Node.js | 22.x LTS |
| Base de datos | Neon (PostgreSQL serverless) | — |
| ORM | Drizzle ORM | Latest |
| Migraciones | Drizzle Kit | Latest |
| Estilos | Tailwind CSS | 4.x |
| Auth | NextAuth.js (Auth.js) | 5.x |
| Gráficas | ECharts (echarts-for-react) | Latest |
| State management | TanStack Query (React Query) | 5.x |
| Formularios | React Hook Form + Zod | Latest |
| Animaciones | Framer Motion | Latest |
| i18n | next-intl | Latest |
| Exportación | SheetJS (xlsx) + papaparse | Latest |
| Testing | Jest + React Testing Library | Latest |
| Linting | ESLint + Prettier | Latest |
| Deploy | Vercel | — |
| PWA | Configuración manual (Service Worker + manifest) | — |
| Push notifications | Web Push API nativa | — |
| Almacenamiento de archivos | PostgreSQL (base64) | — |

---

## 2. Arquitectura del proyecto

### 2.1 Estructura de carpetas (feature-based)

```
aford/
├── app/
│   ├── (auth)/                    # Rutas de autenticación (login, register)
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── register/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── (dashboard)/               # Rutas autenticadas
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── transactions/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── accounts/
│   │   │   └── page.tsx
│   │   ├── categories/
│   │   │   └── page.tsx
│   │   ├── budgets/
│   │   │   └── page.tsx
│   │   ├── goals/
│   │   │   └── page.tsx
│   │   ├── debts/
│   │   │   └── page.tsx
│   │   ├── reports/
│   │   │   └── page.tsx
│   │   ├── settings/
│   │   │   └── page.tsx
│   │   ├── profile/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── api/                       # API Routes
│   │   ├── auth/
│   │   │   └── [...nextauth]/route.ts
│   │   ├── accounts/
│   │   │   ├── route.ts
│   │   │   └── [id]/route.ts
│   │   ├── transactions/
│   │   │   ├── route.ts
│   │   │   ├── [id]/route.ts
│   │   │   └── search/route.ts
│   │   ├── categories/
│   │   │   ├── route.ts
│   │   │   └── [id]/route.ts
│   │   ├── tags/
│   │   │   ├── route.ts
│   │   │   └── [id]/route.ts
│   │   ├── budgets/
│   │   │   ├── route.ts
│   │   │   └── [id]/route.ts
│   │   ├── goals/
│   │   │   ├── route.ts
│   │   │   ├── [id]/route.ts
│   │   │   └── [id]/fund/route.ts
│   │   ├── debts/
│   │   │   ├── route.ts
│   │   │   ├── [id]/route.ts
│   │   │   └── [id]/payment/route.ts
│   │   ├── transfers/
│   │   │   ├── route.ts
│   │   │   └── [id]/route.ts
│   │   ├── reports/
│   │   │   └── route.ts
│   │   ├── export/
│   │   │   └── route.ts
│   │   └── user/
│   │       ├── profile/route.ts
│   │       └── settings/route.ts
│   ├── layout.tsx
│   ├── not-found.tsx
│   └── globals.css
├── features/                      # Lógica de negocio por feature
│   ├── auth/
│   │   ├── actions.ts
│   │   ├── auth.ts                # NextAuth config
│   │   └── schemas.ts
│   ├── accounts/
│   │   ├── actions.ts
│   │   ├── queries.ts
│   │   ├── hooks.ts
│   │   └── schemas.ts
│   ├── transactions/
│   │   ├── actions.ts
│   │   ├── queries.ts
│   │   ├── hooks.ts
│   │   ├── schemas.ts
│   │   └── utils.ts               # Lógica de cuotas, recurrencia
│   ├── categories/
│   │   ├── actions.ts
│   │   ├── queries.ts
│   │   └── hooks.ts
│   ├── tags/
│   │   ├── actions.ts
│   │   ├── queries.ts
│   │   └── hooks.ts
│   ├── budgets/
│   │   ├── actions.ts
│   │   ├── queries.ts
│   │   └── hooks.ts
│   ├── goals/
│   │   ├── actions.ts
│   │   ├── queries.ts
│   │   ├── hooks.ts
│   │   └── utils.ts               # Cálculo de ahorro mensual
│   ├── debts/
│   │   ├── actions.ts
│   │   ├── queries.ts
│   │   ├── hooks.ts
│   │   └── utils.ts               # Cálculo de intereses
│   ├── reports/
│   │   ├── queries.ts
│   │   ├── hooks.ts
│   │   └── utils.ts               # Generación de reportes
│   ├── export/
│   │   └── utils.ts               # CSV/Excel generation
│   ├── dashboard/
│   │   ├── queries.ts
│   │   └── hooks.ts
│   └── user/
│       ├── actions.ts
│       ├── queries.ts
│       └── hooks.ts
├── components/                    # Componentes compartidos
│   ├── ui/                        # Primitivas de UI (botones, inputs, etc.)
│   ├── layout/                    # Header, Sidebar, Navigation
│   ├── charts/                    # Wrapper de ECharts
│   ├── forms/                     # Componentes de formulario reutilizables
│   └── shared/                    # Modals, Toasts, Loading states
├── lib/                           # Utilidades y configuración global
│   ├── db/
│   │   ├── index.ts               # Cliente de Drizzle
│   │   ├── schema.ts              # Schema principal de la DB
│   │   └── migrations/            # Migraciones generadas por Drizzle Kit
│   ├── auth.ts                    # Configuración de NextAuth
│   ├── i18n.ts                    # Configuración de next-intl
│   ├── push.ts                    # Web Push API helper
│   ├── utils.ts                   # Utilidades generales (formatCurrency, etc.)
│   └── constants.ts               # Constantes de la app
├── messages/                      # Archivos de traducción
│   ├── es.json
│   └── en.json
├── public/
│   ├── manifest.json              # PWA manifest
│   ├── sw.js                      # Service Worker
│   ├── icons/                     # Iconos PWA
│   └── favicon.ico
├── types/                         # Tipos compartidos globales
│   └── index.ts
├── drizzle.config.ts
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── .env.local
├── .env.example
├── .eslintrc.json
├── .prettierrc
└── package.json
```

### 2.2 Arquitectura de capas

```
┌─────────────────────────────────────────────┐
│                  FRONTEND                    │
│  Pages → Components → Hooks → Queries/Mutations│
├─────────────────────────────────────────────┤
│                  API LAYER                   │
│  API Routes → Actions → Business Logic       │
├─────────────────────────────────────────────┤
│                  DATA LAYER                  │
│  Drizzle ORM → PostgreSQL (Neon)             │
└─────────────────────────────────────────────┘
```

- **Pages** (`app/`): Routing y rendering de páginas.
- **Components** (`components/`): UI reutilizable, sin lógica de negocio.
- **Features** (`features/`): Lógica de negocio, hooks personalizados, schemas de validación.
- **API Routes** (`app/api/`): Endpoints REST para CRUD y operaciones complejas.
- **Actions** (`features/*/actions.ts`): Server Actions de Next.js para mutations simples.
- **Queries** (`features/*/queries.ts`): Funciones que ejecutan consultas a la DB.
- **Hooks** (`features/*/hooks.ts`): Custom hooks que usan TanStack Query.
- **Lib** (`lib/`): Configuración, utilidades, conexión a DB.

---

## 3. Base de datos

### 3.1 Esquema de tablas

```sql
-- Usuarios (manejado por NextAuth)
users
├── id (uuid, PK)
├── name (text)
├── email (text, unique)
├── email_verified (timestamp)
├── image (text)                    -- foto de perfil (base64 o URL)
├── password_hash (text)            -- para login con email/password
├── created_at (timestamp)
└── updated_at (timestamp)

-- Sesiones (manejado por NextAuth)
sessions
├── id (uuid, PK)
├── session_token (text, unique)
├── user_id (uuid, FK → users)
├── expires (timestamp)
└── created_at (timestamp)

-- Cuentas
accounts
├── id (uuid, PK)
├── user_id (uuid, FK → users)
├── name (text)
├── type (enum: checking, savings, cash, credit_card)
├── currency (text, default 'CLP')
├── color (text)
├── icon (text, nullable)
├── is_active (boolean, default true)
├── created_at (timestamp)
└── updated_at (timestamp)

-- Categorías
categories
├── id (uuid, PK)
├── user_id (uuid, FK → users)
├── name (text)
├── type (enum: income, expense)
├── color (text)
├── icon (text, nullable)
├── is_active (boolean, default true)
├── created_at (timestamp)
└── updated_at (timestamp)

-- Tags
tags
├── id (uuid, PK)
├── user_id (uuid, FK → users)
├── name (text)
├── created_at (timestamp)
└── UNIQUE(user_id, name)

-- Transacciones
transactions
├── id (uuid, PK)
├── user_id (uuid, FK → users)
├── account_id (uuid, FK → accounts)
├── category_id (uuid, FK → categories)
├── type (enum: income, expense)
├── amount (bigint)                 -- CLP sin decimales
├── date (date)
├── status (enum: confirmed, pending)
├── note (text, nullable)
├── installment_id (uuid, FK → installments, nullable)
├── recurring_id (uuid, FK → recurring_transactions, nullable)
├── created_at (timestamp)
├── updated_at (timestamp)
└── version (integer, default 1)    -- para control de concurrencia

-- Relación transacciones-tags (N:N)
transaction_tags
├── transaction_id (uuid, FK → transactions)
└── tag_id (uuid, FK → tags)

-- Cuotas (compras en cuotas)
installments
├── id (uuid, PK)
├── user_id (uuid, FK → users)
├── account_id (uuid, FK → accounts)
├── category_id (uuid, FK → categories)
├── total_amount (bigint)
├── number_of_installments (integer)
├── installment_value (bigint)      -- total_amount / number_of_installments
├── start_date (date)
├── status (enum: active, completed, cancelled)
├── note (text, nullable)
├── created_at (timestamp)
└── updated_at (timestamp)

-- Relación cuotas-tags (N:N)
installment_tags
├── installment_id (uuid, FK → installments)
└── tag_id (uuid, FK → tags)

-- Transacciones recurrentes
recurring_transactions
├── id (uuid, PK)
├── user_id (uuid, FK → users)
├── account_id (uuid, FK → accounts)
├── category_id (uuid, FK → categories)
├── type (enum: income, expense)
├── amount (bigint)
├── frequency (enum: weekly, biweekly, monthly, yearly)
├── start_date (date)
├── end_date (date, nullable)       -- null = indefinido
├── next_execution (date)           -- fecha de la próxima ejecución
├── is_active (boolean, default true)
├── note (text, nullable)
├── created_at (timestamp)
└── updated_at (timestamp)

-- Relación recurrentes-tags (N:N)
recurring_tags
├── recurring_id (uuid, FK → recurring_transactions)
└── tag_id (uuid, FK → tags)

-- Transferencias
transfers
├── id (uuid, PK)
├── user_id (uuid, FK → users)
├── from_account_id (uuid, FK → accounts)
├── to_account_id (uuid, FK → accounts)
├── amount (bigint)
├── date (date)
├── note (text, nullable)
├── created_at (timestamp)
└── updated_at (timestamp)

-- Presupuestos
budgets
├── id (uuid, PK)
├── user_id (uuid, FK → users)
├── category_id (uuid, FK → categories)
├── amount (bigint)                 -- límite mensual
├── month (integer)                 -- 1-12
├── year (integer)
├── created_at (timestamp)
└── updated_at (timestamp)

-- Metas de ahorro
goals
├── id (uuid, PK)
├── user_id (uuid, FK → users)
├── name (text)
├── target_amount (bigint)
├── current_amount (bigint, default 0)
├── target_date (date, nullable)
├── account_id (uuid, FK → accounts, nullable)
├── color (text, nullable)
├── icon (text, nullable)
├── status (enum: active, completed, cancelled)
├── created_at (timestamp)
└── updated_at (timestamp)

-- Movimientos de metas (cuando el usuario agrega fondos)
goal_transactions
├── id (uuid, PK)
├── goal_id (uuid, FK → goals)
├── amount (bigint)
├── date (date)
├── note (text, nullable)
├── created_at (timestamp)
└── updated_at (timestamp)

-- Deudas
debts
├── id (uuid, PK)
├── user_id (uuid, FK → users)
├── name (text)
├── total_amount (bigint)
├── paid_amount (bigint, default 0)
├── interest_rate (numeric, nullable)
├── start_date (date)
├── due_date (date, nullable)
├── person_name (text, nullable)    -- persona o institución
├── status (enum: active, paid, cancelled)
├── created_at (timestamp)
└── updated_at (timestamp)

-- Pagos de deudas
debt_payments
├── id (uuid, PK)
├── debt_id (uuid, FK → debts)
├── amount (bigint)
├── date (date)
├── note (text, nullable)
├── created_at (timestamp)
└── updated_at (timestamp)

-- Configuración del usuario
user_settings
├── user_id (uuid, PK, FK → users)
├── closing_day (integer, default 1)
├── theme (enum: light, dark, system)
├── language (enum: es, en)
├── currency (text, default 'CLP')
├── push_notifications_enabled (boolean, default true)
├── budget_alerts (boolean, default true)
├── installment_reminders (boolean, default true)
├── goal_reminders (boolean, default true)
├── onboarding_completed (boolean, default false)
├── created_at (timestamp)
└── updated_at (timestamp)

-- Push subscriptions (para notificaciones)
push_subscriptions
├── id (uuid, PK)
├── user_id (uuid, FK → users)
├── endpoint (text)
├── p256dh (text)
├── auth (text)
├── created_at (timestamp)
└── UNIQUE(user_id, endpoint)
```

### 3.2 Índices

```sql
-- Índices para queries frecuentes
CREATE INDEX idx_transactions_user_date ON transactions(user_id, date DESC);
CREATE INDEX idx_transactions_user_status ON transactions(user_id, status);
CREATE INDEX idx_transactions_user_category ON transactions(user_id, category_id);
CREATE INDEX idx_transactions_account ON transactions(account_id);
CREATE INDEX idx_accounts_user ON accounts(user_id);
CREATE INDEX idx_categories_user ON categories(user_id);
CREATE INDEX idx_budgets_user_month ON budgets(user_id, month, year);
CREATE INDEX idx_installments_user_status ON installments(user_id, status);
CREATE INDEX idx_recurring_next ON recurring_transactions(user_id, next_execution);
CREATE INDEX idx_goals_user_status ON goals(user_id, status);
CREATE INDEX idx_debts_user_status ON debts(user_id, status);
```

### 3.3 Enums de Drizzle

```typescript
// lib/db/schema.ts
export const accountTypeEnum = pgEnum('account_type', [
  'checking', 'savings', 'cash', 'credit_card'
]);

export const transactionTypeEnum = pgEnum('transaction_type', [
  'income', 'expense'
]);

export const transactionStatusEnum = pgEnum('transaction_status', [
  'confirmed', 'pending'
]);

export const installmentStatusEnum = pgEnum('installment_status', [
  'active', 'completed', 'cancelled'
]);

export const recurringFrequencyEnum = pgEnum('recurring_frequency', [
  'weekly', 'biweekly', 'monthly', 'yearly'
]);

export const goalStatusEnum = pgEnum('goal_status', [
  'active', 'completed', 'cancelled'
]);

export const debtStatusEnum = pgEnum('debt_status', [
  'active', 'paid', 'cancelled'
]);

export const themeEnum = pgEnum('theme', ['light', 'dark', 'system']);

export const languageEnum = pgEnum('language', ['es', 'en']);
```

---

## 4. Autenticación

### 4.1 Configuración de NextAuth.js (Auth.js v5)

```typescript
// features/auth/auth.ts
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { DrizzleAdapter } from '@auth/drizzle-adapter';

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db),
  session: { strategy: 'jwt' },
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      authorize: async (credentials) => {
        // Validar con Zod, buscar usuario, verificar password con bcrypt
      },
    }),
  ],
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) token.userId = user.id;
      return token;
    },
    session: async ({ session, token }) => {
      session.user.id = token.userId as string;
      return session;
    },
  },
  pages: {
    signIn: '/login',
    newUser: '/onboarding',
  },
});
```

### 4.2 Middleware de protección de rutas

```typescript
// middleware.ts
export { auth as middleware } from '@/features/auth/auth';

export const config = {
  matcher: ['/dashboard/:path*', '/api/:path*'],
};
```

### 4.3 Gestión de sesión

- **Recordar sesión**: El token JWT se almacena en cookie con `maxAge: 30 días`.
- **No recordar sesión**: Token con `maxAge:sesión` (se borra al cerrar el navegador).
- **Multi-sesión**: Cada login crea un nuevo token; no se invalidan sesiones anteriores.

---

## 5. API Routes

### 5.1 Convenciones

- Todas las rutas están bajo `/api/`.
- Método HTTP determina la operación: `GET` (leer), `POST` (crear), `PUT` (actualizar), `DELETE` (soft delete / desactivar).
- Todas las rutas requieren autenticación (middleware).
- Request y response en formato JSON.
- Errores retornados con status code apropiado y mensaje descriptivo.

### 5.2 Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/auth/register` | Registrar nuevo usuario |
| GET | `/api/accounts` | Listar cuentas del usuario |
| POST | `/api/accounts` | Crear cuenta |
| PUT | `/api/accounts/[id]` | Actualizar cuenta |
| DELETE | `/api/accounts/[id]` | Desactivar cuenta |
| GET | `/api/transactions` | Listar transacciones (con filtros) |
| GET | `/api/transactions/search` | Búsqueda en tiempo real |
| POST | `/api/transactions` | Crear transacción (simple o cuota) |
| PUT | `/api/transactions/[id]` | Actualizar transacción |
| PUT | `/api/transactions/[id]/confirm` | Confirmar transacción pendiente |
| GET | `/api/categories` | Listar categorías |
| POST | `/api/categories` | Crear categoría |
| PUT | `/api/categories/[id]` | Actualizar categoría |
| DELETE | `/api/categories/[id]` | Desactivar categoría |
| GET | `/api/tags` | Listar tags |
| POST | `/api/tags` | Crear tag |
| DELETE | `/api/tags/[id]` | Eliminar tag |
| GET | `/api/transfers` | Listar transferencias |
| POST | `/api/transfers` | Crear transferencia |
| GET | `/api/budgets` | Listar presupuestos (mes/año) |
| POST | `/api/budgets` | Crear/actualizar presupuesto |
| GET | `/api/goals` | Listar metas de ahorro |
| POST | `/api/goals` | Crear meta |
| PUT | `/api/goals/[id]` | Actualizar meta |
| POST | `/api/goals/[id]/fund` | Agregar fondos a meta |
| GET | `/api/debts` | Listar deudas |
| POST | `/api/debts` | Crear deuda |
| PUT | `/api/debts/[id]` | Actualizar deuda |
| POST | `/api/debts/[id]/payment` | Registrar pago parcial |
| GET | `/api/reports` | Generar reporte (con filtros) |
| GET | `/api/export` | Exportar datos (CSV/Excel) |
| PUT | `/api/user/profile` | Actualizar perfil |
| PUT | `/api/user/settings` | Actualizar configuración |
| POST | `/api/user/push-subscription` | Registrar suscripción push |

### 5.3 Server Actions

Para operaciones simples (CRUD básico), se usan Server Actions en lugar de API Routes:

```typescript
// features/accounts/actions.ts
'use server';

import { auth } from '@/features/auth/auth';
import { db } from '@/lib/db';
import { accounts } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function createAccount(data: CreateAccountInput) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');

  const [account] = await db
    .insert(accounts)
    .values({ ...data, userId: session.user.id })
    .returning();

  revalidatePath('/accounts');
  return account;
}
```

---

## 6. Lógica de negocio

### 6.1 Cálculo de saldos

```typescript
// features/accounts/utils.ts
export async function calculateAccountBalance(accountId: string): Promise<bigint> {
  const confirmedTransactions = await db
    .select({
      type: transactions.type,
      amount: transactions.amount,
    })
    .from(transactions)
    .where(
      and(
        eq(transactions.accountId, accountId),
        eq(transactions.status, 'confirmed')
      )
    );

  return confirmedTransactions.reduce((balance, tx) => {
    return tx.type === 'income'
      ? balance + tx.amount
      : balance - tx.amount;
  }, 0n);
}
```

### 6.2 Distribución de cuotas

```typescript
// features/transactions/utils.ts
export function generateInstallmentDates(
  startDate: Date,
  numberOfInstallments: number
): Date[] {
  const dates: Date[] = [];
  for (let i = 0; i < numberOfInstallments; i++) {
    const date = new Date(startDate);
    date.setMonth(date.getMonth() + i);
    dates.push(date);
  }
  return dates;
}

export async function createInstallmentTransactions(
  installmentId: string,
  startDate: Date,
  numberOfInstallments: number,
  installmentValue: bigint,
  // ... otros parámetros
) {
  const dates = generateInstallmentDates(startDate, numberOfInstallments);

  const transactions = dates.map((date, index) => ({
    installmentId,
    amount: installmentValue,
    date,
    status: index === 0 ? 'confirmed' : 'pending', // primera cuota confirmada
    // ... otros campos
  }));

  await db.insert(transactions).values(transactions);
}
```

### 6.3 Generación de transacciones recurrentes

```typescript
// features/transactions/utils.ts
export async function processRecurringTransactions() {
  const today = new Date();

  const dueRecurring = await db
    .select()
    .from(recurringTransactions)
    .where(
      and(
        eq(recurringTransactions.isActive, true),
        lte(recurringTransactions.nextExecution, today)
      )
    );

  for (const recurring of dueRecurring) {
    // Crear transacción
    await createTransaction({
      accountId: recurring.accountId,
      categoryId: recurring.categoryId,
      type: recurring.type,
      amount: recurring.amount,
      date: recurring.nextExecution,
      status: 'confirmed',
      recurringId: recurring.id,
    });

    // Actualizar next_execution
    const nextDate = calculateNextExecution(
      recurring.nextExecution,
      recurring.frequency
    );

    if (recurring.endDate && nextDate > recurring.endDate) {
      // Desactivar si pasó la fecha de fin
      await db
        .update(recurringTransactions)
        .set({ isActive: false })
        .where(eq(recurringTransactions.id, recurring.id));
    } else {
      await db
        .update(recurringTransactions)
        .set({ nextExecution: nextDate })
        .where(eq(recurringTransactions.id, recurring.id));
    }
  }
}
```

### 6.4 Calendario financiero

```typescript
// lib/utils.ts
export function getFinancialMonth(closingDay: number, referenceDate: Date = new Date()) {
  const day = referenceDate.getDate();
  const month = referenceDate.getMonth();
  const year = referenceDate.getFullYear();

  if (day >= closingDay) {
    // Mes actual: desde closingDay del mes anterior hasta closingDay-1 del mes actual
    return {
      start: new Date(year, month - 1, closingDay),
      end: new Date(year, month, closingDay - 1),
    };
  } else {
    // Mes anterior
    return {
      start: new Date(year, month - 2, closingDay),
      end: new Date(year, month - 1, closingDay - 1),
    };
  }
}
```

### 6.5 Validación de saldo negativo

```typescript
// features/transactions/schemas.ts
export async function validateNonNegativeBalance(
  accountId: string,
  amount: bigint,
  type: 'income' | 'expense',
  excludeTransactionId?: string
): Promise<{ valid: boolean; currentBalance: bigint }> {
  const currentBalance = await calculateAccountBalance(accountId);

  if (type === 'expense') {
    const newBalance = currentBalance - amount;
    if (newBalance < 0n) {
      return { valid: false, currentBalance };
    }
  }

  return { valid: true, currentBalance };
}
```

---

## 7. TanStack Query

### 7.1 Convenciones

- **Query Keys**: Prefijo con el dominio, ej: `['transactions', { userId, month, year }]`.
- **Stale Time**: 30 segundos para datos que cambian frecuentemente, 5 minutos para datos estáticos.
- **Invalidación**: Después de cada mutation, se invalidan las queries relacionadas.

### 7.2 Ejemplo de hooks

```typescript
// features/transactions/hooks.ts
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export function useTransactions(filters: TransactionFilters) {
  return useQuery({
    queryKey: ['transactions', filters],
    queryFn: () => fetchTransactions(filters),
    staleTime: 30_000,
  });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useTransactionSearch(query: string) {
  return useQuery({
    queryKey: ['transactions', 'search', query],
    queryFn: () => searchTransactions(query),
    enabled: query.length >= 2,
    staleTime: 10_000,
  });
}
```

---

## 8. ECharts

### 8.1 Configuración del wrapper

```typescript
// components/charts/Chart.tsx
'use client';

import ReactECharts from 'echarts-for-react';
import { useTheme } from 'next-themes';

interface ChartProps {
  option: EChartsOption;
  height?: string;
}

export function Chart({ option, height = '400px' }: ChartProps) {
  const { theme } = useTheme();

  const themedOption = {
    ...option,
    backgroundColor: 'transparent',
    textStyle: {
      color: theme === 'dark' ? '#e5e7eb' : '#374151',
    },
  };

  return (
    <ReactECharts
      option={themedOption}
      style={{ height }}
      opts={{ renderer: 'svg' }}
    />
  );
}
```

### 8.2 Tipos de gráficas

| Gráfica | Uso | Tipo ECharts |
|---------|-----|--------------|
| Distribución gastos por categoría | Dashboard, Reportes | `pie` |
| Ingresos vs gastos mensuales | Dashboard, Reportes | `bar` |
| Tendencia de saldo | Dashboard, Reportes | `line` |
| Heatmap de gastos diarios | Dashboard | `heatmap` |
| Comparativa entre períodos | Reportes | `bar` (grouped) |

---

## 9. Internacionalización (i18n)

### 9.1 Configuración de next-intl

```typescript
// lib/i18n.ts
import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async ({ locale }) => ({
  messages: (await import(`../messages/${locale}.json`)).default,
}));
```

### 9.2 Estructura de mensajes

```json
// messages/es.json
{
  "common": {
    "save": "Guardar",
    "cancel": "Cancelar",
    "delete": "Eliminar",
    "edit": "Editar",
    "loading": "Cargando...",
    "currency": "CLP"
  },
  "nav": {
    "dashboard": "Panel",
    "transactions": "Transacciones",
    "accounts": "Cuentas",
    "categories": "Categorías",
    "budgets": "Presupuestos",
    "goals": "Metas",
    "debts": "Deudas",
    "reports": "Reportes",
    "settings": "Configuración"
  },
  "dashboard": {
    "balance": "Saldo total",
    "income": "Ingresos",
    "expenses": "Gastos",
    "upcomingCommitments": "Compromisos próximos"
  },
  // ... más traducciones
}
```

### 9.3 Uso en componentes

```tsx
'use client';

import { useTranslations } from 'next-intl';

export function DashboardHeader() {
  const t = useTranslations('dashboard');
  return <h1>{t('balance')}</h1>;
}
```

---

## 10. Notificaciones Push

### 10.1 Registro de suscripción

```typescript
// lib/push.ts
export async function registerPushSubscription(userId: string) {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    return null;
  }

  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: process.env.NEXT_PUBLIC_VAPID_KEY,
  });

  // Enviar suscripción al servidor
  await fetch('/api/user/push-subscription', {
    method: 'POST',
    body: JSON.stringify(subscription.toJSON()),
  });
}
```

### 10.2 Envío de notificaciones (server-side)

```typescript
// lib/push.ts
import webPush from 'web-push';

webPush.setVapidDetails(
  'mailto:admin@aford.app',
  process.env.VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export async function sendPushNotification(
  subscription: PushSubscription,
  title: string,
  body: string
) {
  await webPush.sendNotification(subscription, JSON.stringify({
    title,
    body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
  }));
}
```

### 10.3 Service Worker

```typescript
// public/sw.js
self.addEventListener('push', (event) => {
  const data = event.data.json();
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon,
      badge: data.badge,
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/dashboard')
  );
});
```

---

## 11. PWA

### 11.1 manifest.json

```json
{
  "name": "Aford",
  "short_name": "Aford",
  "description": "Finanzas personales inteligentes",
  "start_url": "/dashboard",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#0ea5e9",
  "orientation": "portrait-primary",
  "icons": [
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable"
    }
  ]
}
```

### 11.2 Service Worker manual

- Registrar SW en `layout.tsx` o en un `useEffect`.
- Implementar cache de assets estáticos.
- Implementar estrategia de cache para API routes (network-first).
- Manejar offline fallback.

---

## 12. Exportación

### 12.1 CSV (papaparse)

```typescript
// features/export/utils.ts
import Papa from 'papaparse';

export function generateCSV(transactions: Transaction[]): string {
  const data = transactions.map(tx => ({
    Fecha: tx.date,
    Tipo: tx.type === 'income' ? 'Ingreso' : 'Gasto',
    Categoría: tx.category.name,
    Monto: tx.amount,
    Cuenta: tx.account.name,
    Tags: tx.tags.map(t => t.name).join(', '),
    Nota: tx.note || '',
    Estado: tx.status === 'confirmed' ? 'Confirmada' : 'Pendiente',
  }));

  return Papa.unparse(data, { header: true });
}
```

### 12.2 Excel (SheetJS)

```typescript
// features/export/utils.ts
import * as XLSX from 'xlsx';

export function generateExcel(transactions: Transaction[]): Buffer {
  const data = transactions.map(tx => ({
    Fecha: tx.date,
    Tipo: tx.type === 'income' ? 'Ingreso' : 'Gasto',
    Categoría: tx.category.name,
    Monto: tx.amount,
    Cuenta: tx.account.name,
    Tags: tx.tags.map(t => t.name).join(', '),
    Nota: tx.note || '',
    Estado: tx.status === 'confirmed' ? 'Confirmada' : 'Pendiente',
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Transacciones');
  return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
}
```

### 12.3 API Route de exportación

```typescript
// app/api/export/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/features/auth/auth';
import { generateCSV, generateExcel } from '@/features/export/utils';

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const format = searchParams.get('format') || 'csv';
  const transactions = await getFilteredTransactions(session.user.id, searchParams);

  if (format === 'xlsx') {
    const buffer = generateExcel(transactions);
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename=aford-transacciones.xlsx',
      },
    });
  }

  const csv = generateCSV(transactions);
  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename=aford-transacciones.csv',
    },
  });
}
```

---

## 13. Formularios

### 13.1 Schema de validación con Zod

```typescript
// features/transactions/schemas.ts
import { z } from 'zod';

export const createTransactionSchema = z.object({
  accountId: z.string().uuid('Selecciona una cuenta'),
  categoryId: z.string().uuid('Selecciona una categoría'),
  type: z.enum(['income', 'expense']),
  amount: z.number().positive('El monto debe ser mayor a 0'),
  date: z.date(),
  status: z.enum(['confirmed', 'pending']),
  note: z.string().optional(),
  tags: z.array(z.string().uuid()).optional(),
});

export const createInstallmentSchema = z.object({
  accountId: z.string().uuid(),
  categoryId: z.string().uuid(),
  totalAmount: z.number().positive(),
  numberOfInstallments: z.number().int().min(2).max(48),
  startDate: z.date(),
  note: z.string().optional(),
  tags: z.array(z.string().uuid()).optional(),
});

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type CreateInstallmentInput = z.infer<typeof createInstallmentSchema>;
```

### 13.2 Ejemplo de formulario

```tsx
// features/transactions/components/TransactionForm.tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createTransactionSchema, CreateTransactionInput } from '../schemas';
import { useCreateTransaction } from '../hooks';

export function TransactionForm() {
  const { mutate: createTransaction, isPending } = useCreateTransaction();

  const form = useForm<CreateTransactionInput>({
    resolver: zodResolver(createTransactionSchema),
    defaultValues: {
      type: 'expense',
      date: new Date(),
      status: 'confirmed',
    },
  });

  const onSubmit = (data: CreateTransactionInput) => {
    createTransaction(data);
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* Form fields */}
    </form>
  );
}
```

---

## 14. Testing

### 14.1 Configuración de Jest

```typescript
// jest.config.ts
import type { Config } from 'jest';
import nextJest from 'next/jest';

const createJestConfig = nextJest({ dir: './' });

const config: Config = {
  testEnvironment: 'jsdom',
  setupFilesAfterSetup: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/.next/'],
};

export default createJestConfig(config);
```

### 14.2 Tipos de tests

| Tipo | Ubicación | Qué testea |
|------|-----------|------------|
| Unit tests | `features/*/utils.test.ts` | Funciones puras (cálculos, utilidades) |
| Component tests | `components/**/*.test.tsx` | Renderizado, interacciones, formularios |
| Hook tests | `features/**/*.test.ts` | Custom hooks con `renderHook` |

### 14.3 Ejemplo

```typescript
// features/transactions/utils.test.ts
import { generateInstallmentDates } from './utils';

describe('generateInstallmentDates', () => {
  it('generates correct dates for 3 monthly installments', () => {
    const start = new Date('2026-01-15');
    const dates = generateInstallmentDates(start, 3);

    expect(dates).toHaveLength(3);
    expect(dates[0]).toEqual(new Date('2026-01-15'));
    expect(dates[1]).toEqual(new Date('2026-02-15'));
    expect(dates[2]).toEqual(new Date('2026-03-15'));
  });
});
```

---

## 15. Deployment

### 15.1 Variables de entorno

```env
# .env.example
DATABASE_URL=postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/aford
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-here
VAPID_PUBLIC_KEY=your-vapid-public-key
VAPID_PRIVATE_KEY=your-vapid-private-key
```

### 15.2 Configuración de Vercel

- **Framework**: Next.js (detectado automáticamente).
- **Build Command**: `next build`.
- **Root Directory**: `/`.
- **Environment Variables**: Copiar desde `.env.local`.
- **Database**: Neon connection string.
- **Edge Runtime**: API Routes y middleware (opcional).

### 15.3 CI/CD

- Deploy automático al hacer push a `main`.
- Preview deployments para PRs.
- Integración con GitHub Actions (opcional) para:
  - Linting (`npm run lint`).
  - Type checking (`npm run typecheck`).
  - Tests (`npm test`).

---

## 16. Scripts del package.json

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "lint:fix": "next lint --fix",
    "typecheck": "tsc --noEmit",
    "test": "jest",
    "test:watch": "jest --watch",
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate",
    "db:push": "drizzle-kit push",
    "db:studio": "drizzle-kit studio"
  }
}
```

---

## 17. Dependencias principales

```json
{
  "dependencies": {
    "next": "^15.x",
    "react": "^19.x",
    "react-dom": "^19.x",
    "next-auth": "^5.x",
    "@auth/drizzle-adapter": "latest",
    "drizzle-orm": "latest",
    "postgres": "latest",
    "@tanstack/react-query": "^5.x",
    "react-hook-form": "latest",
    "@hookform/resolvers": "latest",
    "zod": "latest",
    "echarts": "latest",
    "echarts-for-react": "latest",
    "framer-motion": "latest",
    "next-intl": "latest",
    "next-themes": "latest",
    "xlsx": "latest",
    "papaparse": "latest",
    "web-push": "latest",
    "bcryptjs": "latest"
  },
  "devDependencies": {
    "typescript": "latest",
    "tailwindcss": "^4.x",
    "@types/node": "latest",
    "@types/react": "latest",
    "@types/react-dom": "latest",
    "@types/papaparse": "latest",
    "@types/web-push": "latest",
    "@types/bcryptjs": "latest",
    "jest": "latest",
    "@testing-library/react": "latest",
    "@testing-library/jest-dom": "latest",
    "jest-environment-jsdom": "latest",
    "eslint": "latest",
    "eslint-config-next": "latest",
    "prettier": "latest",
    "drizzle-kit": "latest"
  }
}
```

---

*Documento generado para el proyecto Aford. complementa `ssd/functional-spec.md`.*
