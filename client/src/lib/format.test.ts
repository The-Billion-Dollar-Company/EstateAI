import { formatDate, formatPrice } from '@/lib/format';

describe('formatPrice', () => {
  it('formats sale prices in BDT lakh grouping', () => {
    expect(formatPrice(4500000, 'sale')).toBe('৳ 45,00,000');
  });

  it('adds /mo suffix for rent', () => {
    expect(formatPrice(25000, 'rent')).toBe('৳ 25,000/mo');
  });
});

describe('formatDate', () => {
  it('formats as `12 Mar 2026`', () => {
    expect(formatDate('2026-03-12')).toBe('12 Mar 2026');
  });
});
