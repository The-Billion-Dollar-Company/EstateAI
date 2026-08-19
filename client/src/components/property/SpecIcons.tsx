import { Bath, BedDouble, Maximize2 } from 'lucide-react';

import { cn } from '@/lib/utils';

interface Props {
  beds: number;
  baths: number;
  sizeSqft: number;
  className?: string;
}

export function SpecIcons({ beds, baths, sizeSqft, className }: Props): React.JSX.Element {
  return (
    <ul
      className={cn(
        'flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground',
        className,
      )}
    >
      {beds > 0 && (
        <li className="flex items-center gap-1.5">
          <BedDouble size={16} strokeWidth={1.75} className="shrink-0" aria-hidden />
          <span className="tabular">
            <span className="font-medium text-foreground">{beds}</span> beds
          </span>
        </li>
      )}
      {baths > 0 && (
        <li className="flex items-center gap-1.5">
          <Bath size={16} strokeWidth={1.75} className="shrink-0" aria-hidden />
          <span className="tabular">
            <span className="font-medium text-foreground">{baths}</span> baths
          </span>
        </li>
      )}
      <li className="flex items-center gap-1.5">
        <Maximize2 size={16} strokeWidth={1.75} className="shrink-0" aria-hidden />
        <span className="tabular">
          <span className="font-medium text-foreground">{sizeSqft.toLocaleString('en-IN')}</span>{' '}
          sqft
        </span>
      </li>
    </ul>
  );
}
