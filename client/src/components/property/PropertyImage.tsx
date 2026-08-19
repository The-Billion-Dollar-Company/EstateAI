import { Building } from 'lucide-react';
import { useState } from 'react';

import { cn } from '@/lib/utils';

interface Props {
  src: string | undefined;
  alt: string;
  className?: string;
}

/** 16:10 property photo with the design-system fallback (muted bg + Building icon). */
export function PropertyImage({ src, alt, className }: Props): React.JSX.Element {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={cn(
          'flex aspect-[16/10] w-full items-center justify-center bg-secondary',
          className,
        )}
      >
        <Building size={28} className="text-muted-foreground/50" strokeWidth={1.25} />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setHasError(true)}
      className={cn('aspect-[16/10] w-full object-cover', className)}
    />
  );
}
