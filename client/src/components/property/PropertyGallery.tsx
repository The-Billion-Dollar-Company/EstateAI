import { useState } from 'react';

import { PropertyImage } from '@/components/property/PropertyImage';
import { cn } from '@/lib/utils';

interface Props {
  images: string[];
  title: string;
}

/** Main image + thumbnails. Lightbox lands with the full phase-4 pass. */
export function PropertyGallery({ images, title }: Props): React.JSX.Element {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className="space-y-3">
      <PropertyImage
        src={images[activeIndex]}
        alt={`${title} — photo ${activeIndex + 1}`}
        className="rounded-lg"
      />
      {images.length > 1 && (
        <div className="flex gap-3">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              aria-label={`Show photo ${i + 1}`}
              aria-current={i === activeIndex}
              onClick={() => setActiveIndex(i)}
              className={cn(
                'w-24 overflow-hidden rounded-md border-2 transition-colors',
                i === activeIndex ? 'border-primary' : 'border-transparent',
              )}
            >
              <PropertyImage src={src} alt="" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
