import { ChevronLeft, ChevronRight, Images } from 'lucide-react';
import { useState } from 'react';

import { PropertyImage } from '@/components/property/PropertyImage';
import { cn } from '@/lib/utils';

interface Props {
  images: string[];
  title: string;
}

/** Editorial mosaic — one hero frame plus a fixed 2×2 rail of supporting
 *  shots. Selecting any frame swaps it into the hero position. */
export function PropertyGallery({ images, title }: Props): React.JSX.Element {
  const [activeIndex, setActiveIndex] = useState(0);

  const count = images.length;
  const hasMultiple = count > 1;
  /* The rail always shows the same four frames so nothing reflows on select. */
  const railImages = images.slice(1, 5);

  const step = (delta: number): void => {
    setActiveIndex((i) => (i + delta + count) % count);
  };

  return (
    <div className="space-y-2 md:space-y-3">
      <div
        className={cn(
          'grid gap-2 md:gap-3',
          railImages.length > 0 && 'lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]',
        )}
      >
        {/* Hero frame */}
        <div className="group relative overflow-hidden rounded-xl bg-muted">
          <PropertyImage
            src={images[activeIndex]}
            alt={`${title} — photo ${activeIndex + 1} of ${Math.max(count, 1)}`}
            className="aspect-[4/3] lg:aspect-[5/4]"
          />
          {hasMultiple && (
            <>
              <button
                type="button"
                aria-label="Previous photo"
                onClick={() => step(-1)}
                className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-card/90 text-foreground opacity-0 shadow-xs backdrop-blur transition-opacity duration-200 hover:bg-card focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring group-hover:opacity-100 max-lg:opacity-100"
              >
                <ChevronLeft size={18} strokeWidth={2} />
              </button>
              <button
                type="button"
                aria-label="Next photo"
                onClick={() => step(1)}
                className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-card/90 text-foreground opacity-0 shadow-xs backdrop-blur transition-opacity duration-200 hover:bg-card focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring group-hover:opacity-100 max-lg:opacity-100"
              >
                <ChevronRight size={18} strokeWidth={2} />
              </button>
              <span className="pointer-events-none absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-card/95 px-3 py-1.5 text-xs font-medium text-foreground shadow-xs backdrop-blur">
                <Images size={14} strokeWidth={2} aria-hidden />
                <span className="tabular">
                  {activeIndex + 1} / {count}
                </span>
              </span>
            </>
          )}
        </div>

        {/* Supporting rail — 2×2 on desktop, horizontal scroll on mobile */}
        {railImages.length > 0 && (
          <div className="no-scrollbar flex gap-2 overflow-x-auto lg:grid lg:grid-cols-2 lg:grid-rows-2 lg:gap-3 lg:overflow-visible">
            {railImages.map((src, i) => {
              const index = i + 1;
              return (
                <button
                  key={`${src}-${index}`}
                  type="button"
                  aria-label={`Show photo ${index + 1}`}
                  aria-current={index === activeIndex}
                  onClick={() => setActiveIndex(index)}
                  className={cn(
                    'relative w-32 shrink-0 overflow-hidden rounded-lg bg-muted transition-opacity duration-200 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 lg:h-full lg:w-auto lg:rounded-xl',
                    index === activeIndex && 'ring-2 ring-primary ring-offset-2 ring-offset-background',
                  )}
                >
                  <PropertyImage src={src} alt="" className="aspect-[4/3] lg:h-full lg:w-full" />
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Overflow rail for galleries deeper than five photos */}
      {count > 5 && (
        <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1 md:gap-3">
          {images.slice(5).map((src, i) => {
            const index = i + 5;
            return (
              <button
                key={`${src}-${index}`}
                type="button"
                aria-label={`Show photo ${index + 1}`}
                aria-current={index === activeIndex}
                onClick={() => setActiveIndex(index)}
                className={cn(
                  'w-28 shrink-0 overflow-hidden rounded-lg bg-muted transition-opacity duration-200 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                  index === activeIndex && 'ring-2 ring-primary ring-offset-2 ring-offset-background',
                )}
              >
                <PropertyImage src={src} alt="" className="aspect-[4/3]" />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
