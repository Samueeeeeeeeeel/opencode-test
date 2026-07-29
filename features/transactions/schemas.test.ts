import {
  createTransactionSchema,
  createInstallmentSchema,
} from './schemas';

describe('createTransactionSchema', () => {
  it('validates a correct expense', () => {
    const result = createTransactionSchema.safeParse({
      type: 'expense',
      amount: 15000,
      accountId: '550e8400-e29b-41d4-a716-446655440000',
      categoryId: '550e8400-e29b-41d4-a716-446655440001',
      date: '2026-07-15',
      status: 'confirmed',
    });
    expect(result.success).toBe(true);
  });

  it('validates a correct income', () => {
    const result = createTransactionSchema.safeParse({
      type: 'income',
      amount: 500000,
      accountId: '550e8400-e29b-41d4-a716-446655440000',
      categoryId: '550e8400-e29b-41d4-a716-446655440001',
      date: '2026-07-15',
      status: 'confirmed',
    });
    expect(result.success).toBe(true);
  });

  it('rejects zero amount', () => {
    const result = createTransactionSchema.safeParse({
      type: 'expense',
      amount: 0,
      accountId: '550e8400-e29b-41d4-a716-446655440000',
      categoryId: '550e8400-e29b-41d4-a716-446655440001',
      date: '2026-07-15',
      status: 'confirmed',
    });
    expect(result.success).toBe(false);
  });

  it('rejects negative amount', () => {
    const result = createTransactionSchema.safeParse({
      type: 'expense',
      amount: -1000,
      accountId: '550e8400-e29b-41d4-a716-446655440000',
      categoryId: '550e8400-e29b-41d4-a716-446655440001',
      date: '2026-07-15',
      status: 'confirmed',
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid type', () => {
    const result = createTransactionSchema.safeParse({
      type: 'invalid',
      amount: 1000,
      accountId: '550e8400-e29b-41d4-a716-446655440000',
      categoryId: '550e8400-e29b-41d4-a716-446655440001',
      date: '2026-07-15',
      status: 'confirmed',
    });
    expect(result.success).toBe(false);
  });

  it('accepts missing accountId (auto-assigned server-side)', () => {
    const result = createTransactionSchema.safeParse({
      type: 'expense',
      amount: 1000,
      categoryId: '550e8400-e29b-41d4-a716-446655440001',
      date: '2026-07-15',
      status: 'confirmed',
    });
    expect(result.success).toBe(true);
  });
});

describe('createInstallmentSchema', () => {
  it('validates a correct installment', () => {
    const result = createInstallmentSchema.safeParse({
      type: 'expense',
      totalAmount: 120000,
      accountId: '550e8400-e29b-41d4-a716-446655440000',
      categoryId: '550e8400-e29b-41d4-a716-446655440001',
      numberOfInstallments: 6,
      startDate: '2026-07-15',
    });
    expect(result.success).toBe(true);
  });

  it('rejects less than 2 installments', () => {
    const result = createInstallmentSchema.safeParse({
      type: 'expense',
      totalAmount: 120000,
      accountId: '550e8400-e29b-41d4-a716-446655440000',
      categoryId: '550e8400-e29b-41d4-a716-446655440001',
      numberOfInstallments: 1,
      startDate: '2026-07-15',
    });
    expect(result.success).toBe(false);
  });

  it('rejects more than 48 installments', () => {
    const result = createInstallmentSchema.safeParse({
      type: 'expense',
      totalAmount: 120000,
      accountId: '550e8400-e29b-41d4-a716-446655440000',
      categoryId: '550e8400-e29b-41d4-a716-446655440001',
      numberOfInstallments: 49,
      startDate: '2026-07-15',
    });
    expect(result.success).toBe(false);
  });
});
