import type { ListingType } from '@/types/property';

/** BDT lakh-format price per ui-guidelines: `৳ 45,00,000`, `/mo` suffix for rent. */
export function formatPrice(amount: number, listingType: ListingType): string {
  const grouped = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(amount);
  return listingType === 'rent' ? `৳ ${grouped}/mo` : `৳ ${grouped}`;
}

/** `12 Mar 2026` per ui-guidelines. */
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}
