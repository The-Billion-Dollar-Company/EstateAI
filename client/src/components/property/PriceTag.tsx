import { formatPrice } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { ListingType } from '@/types/property';

interface Props {
  amount: number;
  listingType: ListingType;
  className?: string;
}

export function PriceTag({ amount, listingType, className }: Props): React.JSX.Element {
  return (
    <span
      className={cn(
        'tabular font-display font-semibold tracking-[-0.02em] text-foreground',
        className,
      )}
    >
      {formatPrice(amount, listingType)}
    </span>
  );
}
