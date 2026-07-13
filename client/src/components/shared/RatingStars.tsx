import { Star } from 'lucide-react';

import { cn } from '@/lib/utils';

interface Props {
  rating: number;
  count?: number;
  className?: string;
}

export function RatingStars({ rating, count, className }: Props): React.JSX.Element {
  return (
    <span className={cn('inline-flex items-center gap-2 text-sm', className)}>
      <span className="flex" aria-hidden>
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            size={16}
            strokeWidth={2}
            className={i <= Math.round(rating) ? 'fill-accent text-accent' : 'text-border'}
          />
        ))}
      </span>
      <span className="text-muted-foreground">
        {rating.toFixed(1)}
        {count !== undefined && ` (${count})`}
        <span className="sr-only">out of 5 stars</span>
      </span>
    </span>
  );
}
