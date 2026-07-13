import { Bath, BedDouble, Ruler } from 'lucide-react';

import { cn } from '@/lib/utils';

interface Props {
  beds: number;
  baths: number;
  sizeSqft: number;
  className?: string;
}

export function SpecIcons({ beds, baths, sizeSqft, className }: Props): React.JSX.Element {
  return (
    <ul className={cn('flex items-center gap-4 text-sm text-muted-foreground', className)}>
      {beds > 0 && (
        <li className="flex items-center gap-2">
          <BedDouble size={16} strokeWidth={2} aria-hidden />
          <span>
            {beds} <span className="sr-only">bedrooms</span>
          </span>
        </li>
      )}
      {baths > 0 && (
        <li className="flex items-center gap-2">
          <Bath size={16} strokeWidth={2} aria-hidden />
          <span>
            {baths} <span className="sr-only">bathrooms</span>
          </span>
        </li>
      )}
      <li className="flex items-center gap-2">
        <Ruler size={16} strokeWidth={2} aria-hidden />
        <span>{sizeSqft.toLocaleString('en-IN')} sqft</span>
      </li>
    </ul>
  );
}
