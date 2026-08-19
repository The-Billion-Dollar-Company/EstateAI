import { MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

import { PriceTag } from '@/components/property/PriceTag';
import { PropertyImage } from '@/components/property/PropertyImage';
import { SaveButton } from '@/components/property/SaveButton';
import { SpecIcons } from '@/components/property/SpecIcons';
import { cn } from '@/lib/utils';
import type { Property } from '@/types/property';

interface Props {
  property: Property;
  variant?: 'default' | 'compact';
}

const STATUS_OVERLAY_LABEL: Partial<Record<Property['status'], string>> = {
  sold: 'Sold',
  rented: 'Rented',
  pending: 'Pending review',
};

/** THE atomic unit — photography first, then price, title, location, specs.
 *  Stays a single anchor so the whole card is one keyboard/AT target. */
export function PropertyCard({ property, variant = 'default' }: Props): React.JSX.Element {
  const isCompact = variant === 'compact';
  const statusLabel = STATUS_OVERLAY_LABEL[property.status];

  return (
    <Link
      to={`/properties/${property.id}`}
      className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card shadow-card transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-0.5 hover:border-foreground/15 hover:shadow-lift focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <div className="relative overflow-hidden bg-muted">
        <PropertyImage
          src={property.images[0]}
          alt={property.title}
          className={cn(
            'transition-transform duration-[600ms] ease-out group-hover:scale-[1.04]',
            isCompact ? 'aspect-[16/10]' : 'aspect-[4/3]',
          )}
        />
        {/* Base scrim keeps the overlay chips legible on any photo. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/25 to-transparent"
        />
        <span className="absolute left-3 top-3 inline-flex items-center rounded-full bg-card/95 px-2.5 py-1 text-[0.6875rem] font-semibold tracking-wide text-foreground shadow-xs backdrop-blur">
          For {property.listingType === 'sale' ? 'sale' : 'rent'}
        </span>
        {statusLabel && (
          <span className="absolute left-3 top-11 inline-flex items-center rounded-full bg-foreground/85 px-2.5 py-1 text-[0.6875rem] font-semibold tracking-wide text-background backdrop-blur">
            {statusLabel}
          </span>
        )}
        <SaveButton propertyId={property.id} propertyTitle={property.title} />
      </div>

      <div className={cn('flex flex-1 flex-col', isCompact ? 'p-3.5' : 'p-4 md:p-5')}>
        <PriceTag
          amount={property.price}
          listingType={property.listingType}
          className={isCompact ? 'text-lg' : 'text-xl md:text-[1.375rem]'}
        />
        <h3
          className={cn(
            'mt-1.5 line-clamp-1 font-medium leading-snug text-foreground',
            isCompact ? 'text-sm' : 'text-[0.9375rem]',
          )}
        >
          {property.title}
        </h3>
        <p className="mt-1.5 flex items-center gap-1.5 text-sm text-muted-foreground">
          <MapPin size={14} strokeWidth={2} className="shrink-0" aria-hidden />
          <span className="line-clamp-1">
            {property.location.area}, {property.location.city}
          </span>
        </p>
        {!isCompact && (
          <SpecIcons
            beds={property.beds}
            baths={property.baths}
            sizeSqft={property.sizeSqft}
            className="mt-4 border-t border-border pt-3.5"
          />
        )}
      </div>
    </Link>
  );
}
