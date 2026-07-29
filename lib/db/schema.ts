import {
  pgTable,
  pgEnum,
  uuid,
  text,
  timestamp,
  bigint,
  boolean,
  integer,
  date,
  numeric,
  uniqueIndex,
  index,
  primaryKey,
} from 'drizzle-orm/pg-core';

export const bankAccountTypeEnum = pgEnum('bank_account_type', [
  'checking',
  'savings',
  'cash',
  'credit_card',
]);

export const transactionTypeEnum = pgEnum('transaction_type', [
  'income',
  'expense',
]);

export const transactionStatusEnum = pgEnum('transaction_status', [
  'confirmed',
  'pending',
]);

export const installmentStatusEnum = pgEnum('installment_status', [
  'active',
  'completed',
  'cancelled',
]);

export const recurringFrequencyEnum = pgEnum('recurring_frequency', [
  'weekly',
  'biweekly',
  'monthly',
  'yearly',
]);

export const goalStatusEnum = pgEnum('goal_status', [
  'active',
  'completed',
  'cancelled',
]);

export const debtStatusEnum = pgEnum('debt_status', [
  'active',
  'paid',
  'cancelled',
]);

export const themeEnum = pgEnum('theme', ['light', 'dark', 'system']);

export const languageEnum = pgEnum('language', ['es', 'en']);

/* ─── NextAuth tables ─── */

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name'),
  email: text('email').notNull().unique(),
  emailVerified: timestamp('email_verified', { mode: 'date' }),
  image: text('image'),
  passwordHash: text('password_hash'),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().notNull(),
});

export const accounts = pgTable(
  'accounts',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    type: text('type').notNull(),
    provider: text('provider').notNull(),
    providerAccountId: text('provider_account_id').notNull(),
    refreshToken: text('refresh_token'),
    accessToken: text('access_token'),
    expiresAt: integer('expires_at'),
    tokenType: text('token_type'),
    scope: text('scope'),
    idToken: text('id_token'),
    sessionState: text('session_state'),
  },
  (table) => [
    uniqueIndex('idx_accounts_provider_provider_account_id').on(
      table.provider,
      table.providerAccountId
    ),
  ]
);

export const sessions = pgTable('sessions', {
  id: uuid('id').defaultRandom().primaryKey(),
  sessionToken: text('session_token').notNull().unique(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  expires: timestamp('expires', { mode: 'date' }).notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
});

export const verificationTokens = pgTable(
  'verification_tokens',
  {
    identifier: text('identifier').notNull(),
    token: text('token').notNull(),
    expires: timestamp('expires', { mode: 'date' }).notNull(),
  },
  (table) => [
    uniqueIndex('idx_verification_tokens_identifier_token').on(
      table.identifier,
      table.token
    ),
  ]
);

/* ─── Bank accounts ─── */

export const bankAccounts = pgTable(
  'bank_accounts',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    type: bankAccountTypeEnum('type').notNull(),
    currency: text('currency').default('CLP').notNull(),
    color: text('color').notNull(),
    icon: text('icon'),
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().notNull(),
  },
  (table) => [index('idx_bank_accounts_user').on(table.userId)]
);

/* ─── Categories ─── */

export const categories = pgTable(
  'categories',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    type: transactionTypeEnum('type').notNull(),
    color: text('color').notNull(),
    icon: text('icon'),
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().notNull(),
  },
  (table) => [index('idx_categories_user').on(table.userId)]
);

/* ─── Tags ─── */

export const tags = pgTable(
  'tags',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  },
  (table) => [uniqueIndex('idx_tags_user_name').on(table.userId, table.name)]
);

/* ─── Transactions ─── */

export const transactions = pgTable(
  'transactions',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    accountId: uuid('account_id')
      .notNull()
      .references(() => bankAccounts.id, { onDelete: 'restrict' }),
    categoryId: uuid('category_id')
      .notNull()
      .references(() => categories.id, { onDelete: 'restrict' }),
    type: transactionTypeEnum('type').notNull(),
    amount: bigint('amount', { mode: 'number' }).notNull(),
    date: date('date').notNull(),
    status: transactionStatusEnum('status').default('confirmed').notNull(),
    note: text('note'),
    installmentId: uuid('installment_id'),
    recurringId: uuid('recurring_id'),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().notNull(),
    version: integer('version').default(1).notNull(),
  },
  (table) => [
    index('idx_transactions_user_date').on(table.userId, table.date),
    index('idx_transactions_user_status').on(table.userId, table.status),
    index('idx_transactions_user_category').on(table.userId, table.categoryId),
    index('idx_transactions_account').on(table.accountId),
  ]
);

export const transactionTags = pgTable(
  'transaction_tags',
  {
    transactionId: uuid('transaction_id')
      .notNull()
      .references(() => transactions.id, { onDelete: 'cascade' }),
    tagId: uuid('tag_id')
      .notNull()
      .references(() => tags.id, { onDelete: 'cascade' }),
  },
  (table) => [primaryKey({ columns: [table.transactionId, table.tagId] })]
);

/* ─── Installments ─── */

export const installments = pgTable(
  'installments',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    accountId: uuid('account_id')
      .notNull()
      .references(() => bankAccounts.id, { onDelete: 'restrict' }),
    categoryId: uuid('category_id')
      .notNull()
      .references(() => categories.id, { onDelete: 'restrict' }),
    totalAmount: bigint('total_amount', { mode: 'number' }).notNull(),
    numberOfInstallments: integer('number_of_installments').notNull(),
    installmentValue: bigint('installment_value', { mode: 'number' }).notNull(),
    startDate: date('start_date').notNull(),
    status: installmentStatusEnum('status').default('active').notNull(),
    note: text('note'),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().notNull(),
  },
  (table) => [index('idx_installments_user_status').on(table.userId, table.status)]
);

export const installmentTags = pgTable(
  'installment_tags',
  {
    installmentId: uuid('installment_id')
      .notNull()
      .references(() => installments.id, { onDelete: 'cascade' }),
    tagId: uuid('tag_id')
      .notNull()
      .references(() => tags.id, { onDelete: 'cascade' }),
  },
  (table) => [primaryKey({ columns: [table.installmentId, table.tagId] })]
);

/* ─── Recurring transactions ─── */

export const recurringTransactions = pgTable(
  'recurring_transactions',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    accountId: uuid('account_id')
      .notNull()
      .references(() => bankAccounts.id, { onDelete: 'restrict' }),
    categoryId: uuid('category_id')
      .notNull()
      .references(() => categories.id, { onDelete: 'restrict' }),
    type: transactionTypeEnum('type').notNull(),
    amount: bigint('amount', { mode: 'number' }).notNull(),
    frequency: recurringFrequencyEnum('frequency').notNull(),
    startDate: date('start_date').notNull(),
    endDate: date('end_date'),
    nextExecution: date('next_execution').notNull(),
    isActive: boolean('is_active').default(true).notNull(),
    note: text('note'),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().notNull(),
  },
  (table) => [index('idx_recurring_next').on(table.userId, table.nextExecution)]
);

export const recurringTags = pgTable(
  'recurring_tags',
  {
    recurringId: uuid('recurring_id')
      .notNull()
      .references(() => recurringTransactions.id, { onDelete: 'cascade' }),
    tagId: uuid('tag_id')
      .notNull()
      .references(() => tags.id, { onDelete: 'cascade' }),
  },
  (table) => [primaryKey({ columns: [table.recurringId, table.tagId] })]
);

/* ─── Transfers ─── */

export const transfers = pgTable(
  'transfers',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    fromAccountId: uuid('from_account_id')
      .notNull()
      .references(() => bankAccounts.id, { onDelete: 'restrict' }),
    toAccountId: uuid('to_account_id')
      .notNull()
      .references(() => bankAccounts.id, { onDelete: 'restrict' }),
    amount: bigint('amount', { mode: 'number' }).notNull(),
    date: date('date').notNull(),
    note: text('note'),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().notNull(),
  }
);

/* ─── Budgets ─── */

export const budgets = pgTable(
  'budgets',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    categoryId: uuid('category_id')
      .notNull()
      .references(() => categories.id, { onDelete: 'restrict' }),
    amount: bigint('amount', { mode: 'number' }).notNull(),
    month: integer('month').notNull(),
    year: integer('year').notNull(),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().notNull(),
  },
  (table) => [index('idx_budgets_user_month').on(table.userId, table.month, table.year)]
);

/* ─── Goals ─── */

export const goals = pgTable(
  'goals',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    targetAmount: bigint('target_amount', { mode: 'number' }).notNull(),
    currentAmount: bigint('current_amount', { mode: 'number' }).default(0).notNull(),
    targetDate: date('target_date'),
    accountId: uuid('account_id').references(() => bankAccounts.id, {
      onDelete: 'set null',
    }),
    color: text('color'),
    icon: text('icon'),
    status: goalStatusEnum('status').default('active').notNull(),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().notNull(),
  },
  (table) => [index('idx_goals_user_status').on(table.userId, table.status)]
);

export const goalTransactions = pgTable(
  'goal_transactions',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    goalId: uuid('goal_id')
      .notNull()
      .references(() => goals.id, { onDelete: 'cascade' }),
    amount: bigint('amount', { mode: 'number' }).notNull(),
    date: date('date').notNull(),
    note: text('note'),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().notNull(),
  }
);

/* ─── Debts ─── */

export const debts = pgTable(
  'debts',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    totalAmount: bigint('total_amount', { mode: 'number' }).notNull(),
    paidAmount: bigint('paid_amount', { mode: 'number' }).default(0).notNull(),
    interestRate: numeric('interest_rate'),
    startDate: date('start_date').notNull(),
    dueDate: date('due_date'),
    personName: text('person_name'),
    status: debtStatusEnum('status').default('active').notNull(),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().notNull(),
  },
  (table) => [index('idx_debts_user_status').on(table.userId, table.status)]
);

export const debtPayments = pgTable(
  'debt_payments',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    debtId: uuid('debt_id')
      .notNull()
      .references(() => debts.id, { onDelete: 'cascade' }),
    amount: bigint('amount', { mode: 'number' }).notNull(),
    date: date('date').notNull(),
    note: text('note'),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().notNull(),
  }
);

/* ─── User settings ─── */

export const userSettings = pgTable('user_settings', {
  userId: uuid('user_id')
    .primaryKey()
    .references(() => users.id, { onDelete: 'cascade' }),
  closingDay: integer('closing_day').default(1).notNull(),
  theme: themeEnum('theme').default('system').notNull(),
  language: languageEnum('language').default('es').notNull(),
  currency: text('currency').default('CLP').notNull(),
  pushNotificationsEnabled: boolean('push_notifications_enabled').default(true).notNull(),
  budgetAlerts: boolean('budget_alerts').default(true).notNull(),
  installmentReminders: boolean('installment_reminders').default(true).notNull(),
  goalReminders: boolean('goal_reminders').default(true).notNull(),
  onboardingCompleted: boolean('onboarding_completed').default(false).notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().notNull(),
});

/* ─── Push subscriptions ─── */

export const pushSubscriptions = pgTable(
  'push_subscriptions',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    endpoint: text('endpoint').notNull(),
    p256dh: text('p256dh').notNull(),
    auth: text('auth').notNull(),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  },
  (table) => [uniqueIndex('idx_push_sub_user_endpoint').on(table.userId, table.endpoint)]
);
