import { relations } from 'drizzle-orm';
import {
  users,
  bankAccounts,
  categories,
  tags,
  transactions,
  transactionTags,
  transfers,
} from './schema';

export const usersRelations = relations(users, ({ many }) => ({
  bankAccounts: many(bankAccounts),
  transactions: many(transactions),
}));

export const bankAccountsRelations = relations(bankAccounts, ({ one, many }) => ({
  user: one(users, { fields: [bankAccounts.userId], references: [users.id] }),
  transactions: many(transactions),
  outgoingTransfers: many(transfers, { relationName: 'outgoing' }),
  incomingTransfers: many(transfers, { relationName: 'incoming' }),
}));

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  user: one(users, { fields: [categories.userId], references: [users.id] }),
  transactions: many(transactions),
}));

export const transactionsRelations = relations(transactions, ({ one, many }) => ({
  user: one(users, { fields: [transactions.userId], references: [users.id] }),
  account: one(bankAccounts, {
    fields: [transactions.accountId],
    references: [bankAccounts.id],
  }),
  category: one(categories, {
    fields: [transactions.categoryId],
    references: [categories.id],
  }),
  tags: many(transactionTags),
}));

export const transactionTagsRelations = relations(transactionTags, ({ one }) => ({
  transaction: one(transactions, {
    fields: [transactionTags.transactionId],
    references: [transactions.id],
  }),
  tag: one(tags, {
    fields: [transactionTags.tagId],
    references: [tags.id],
  }),
}));

export const transfersRelations = relations(transfers, ({ one }) => ({
  user: one(users, { fields: [transfers.userId], references: [users.id] }),
  fromAccount: one(bankAccounts, {
    fields: [transfers.fromAccountId],
    references: [bankAccounts.id],
    relationName: 'outgoing',
  }),
  toAccount: one(bankAccounts, {
    fields: [transfers.toAccountId],
    references: [bankAccounts.id],
    relationName: 'incoming',
  }),
}));
