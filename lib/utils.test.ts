import { formatCurrency, formatDate, cn } from '@/lib/utils';

describe('formatCurrency', () => {
  it('formats zero', () => {
    expect(formatCurrency(0)).toBe('$0');
  });

  it('formats positive amounts', () => {
    expect(formatCurrency(15000)).toBe('$15.000');
  });

  it('formats large amounts', () => {
    expect(formatCurrency(1500000)).toBe('$1.500.000');
  });

  it('formats negative amounts', () => {
    const result = formatCurrency(-5000);
    expect(result).toContain('5.000');
  });
});

describe('formatDate', () => {
  it('formats a date string', () => {
    const result = formatDate('2026-07-15');
    expect(result).toContain('julio');
    expect(result).toContain('2026');
  });

  it('formats a Date object', () => {
    const result = formatDate(new Date(2026, 0, 1));
    expect(result).toContain('enero');
    expect(result).toContain('2026');
  });
});

describe('cn', () => {
  it('joins class names', () => {
    expect(cn('a', 'b', 'c')).toBe('a b c');
  });

  it('filters falsy values', () => {
    expect(cn('a', false, null, undefined, 'b')).toBe('a b');
  });

  it('returns empty string for no args', () => {
    expect(cn()).toBe('');
  });
});
