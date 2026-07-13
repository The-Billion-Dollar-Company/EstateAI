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
        className={cn('flex aspect-[16/10] items-center justify-center bg-muted', className)}
      >
        <Building size={32} className="text-muted-foreground" strokeWidth={2} />
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
