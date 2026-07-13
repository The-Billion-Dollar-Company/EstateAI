import { Heart } from 'lucide-react';
import { useState } from 'react';

import { cn } from '@/lib/utils';

interface Props {
  propertyTitle: string;
  className?: string;
}

/** Heart toggle — local state only until the saved-properties API lands (phase 5). */
export function SaveButton({ propertyTitle, className }: Props): React.JSX.Element {
  const [isSaved, setIsSaved] = useState(false);
  return (
    <button
      type="button"
      aria-pressed={isSaved}
      aria-label={isSaved ? `Unsave ${propertyTitle}` : `Save ${propertyTitle}`}
      onClick={(e) => {
        e.preventDefault();
        setIsSaved((s) => !s);
      }}
      className={cn(
        'rounded-full bg-background/80 p-2 backdrop-blur transition-colors hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        className,
      )}
    >
      <Heart
        size={16}
        strokeWidth={2}
        className={cn('transition-colors', isSaved ? 'fill-destructive text-destructive' : 'text-foreground')}
      />
    </button>
  );
}
