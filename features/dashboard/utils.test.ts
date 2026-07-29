import { getFinancialMonth } from './utils';

describe('getFinancialMonth', () => {
  it('returns correct month when day >= closing day', () => {
    const reference = new Date(2026, 6, 15);
    const result = getFinancialMonth(1, reference);

    expect(result.start.getFullYear()).toBe(2026);
    expect(result.start.getMonth()).toBe(5);
    expect(result.start.getDate()).toBe(1);
    expect(result.end.getFullYear()).toBe(2026);
    expect(result.end.getMonth()).toBe(5);
    expect(result.end.getDate()).toBe(30);
  });

  it('returns correct month when day < closing day', () => {
    const reference = new Date(2026, 6, 1);
    const result = getFinancialMonth(5, reference);

    expect(result.start.getFullYear()).toBe(2026);
    expect(result.start.getMonth()).toBe(4);
    expect(result.start.getDate()).toBe(5);
    expect(result.end.getFullYear()).toBe(2026);
    expect(result.end.getMonth()).toBe(5);
    expect(result.end.getDate()).toBe(4);
  });

  it('handles closing day 28', () => {
    const reference = new Date(2026, 2, 15);
    const result = getFinancialMonth(28, reference);

    expect(result.start.getFullYear()).toBe(2026);
    expect(result.start.getDate()).toBe(28);
    expect(result.end.getDate()).toBe(27);
  });

  it('handles year boundary (January)', () => {
    const reference = new Date(2026, 0, 10);
    const result = getFinancialMonth(1, reference);

    expect(result.start.getFullYear()).toBe(2025);
    expect(result.start.getMonth()).toBe(11);
    expect(result.start.getDate()).toBe(1);
    expect(result.end.getFullYear()).toBe(2025);
    expect(result.end.getMonth()).toBe(11);
    expect(result.end.getDate()).toBe(31);
  });

  it('returns correct dates for closing day 15', () => {
    const reference = new Date(2026, 3, 20);
    const result = getFinancialMonth(15, reference);

    expect(result.start.getDate()).toBe(15);
    expect(result.end.getDate()).toBe(14);
  });
});
