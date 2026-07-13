import { MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

import { PriceTag } from '@/components/property/PriceTag';
import { PropertyImage } from '@/components/property/PropertyImage';
import { SaveButton } from '@/components/property/SaveButton';
import { SpecIcons } from '@/components/property/SpecIcons';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { Property } from '@/types/property';

interface Props {
  property: Property;
  variant?: 'default' | 'compact';
}

/** THE atomic unit — image, price, title, location, specs, badge, save button. */
export function PropertyCard({ property, variant = 'default' }: Props): React.JSX.Element {
  const isCompact = variant === 'compact';
  return (
    <Link
      to={`/properties/${property.id}`}
      className="group block overflow-hidden rounded-lg border bg-card shadow-sm transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="relative">
        <PropertyImage
          src={property.images[0]}
          alt={property.title}
          className="transition-transform duration-300 group-hover:scale-[1.02]"
        />
        <Badge className="absolute left-3 top-3 capitalize" variant="secondary">
          For {property.listingType === 'sale' ? 'sale' : 'rent'}
        </Badge>
        <SaveButton propertyTitle={property.title} className="absolute right-3 top-3" />
      </div>
      <div className={cn('space-y-2', isCompact ? 'p-3' : 'p-4')}>
        <PriceTag
          amount={property.price}
          listingType={property.listingType}
          className={isCompact ? 'text-base' : 'text-lg'}
        />
        <h3 className={cn('line-clamp-1 font-medium', isCompact ? 'text-sm' : 'text-base')}>
          {property.title}
        </h3>
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin size={16} strokeWidth={2} aria-hidden />
          <span className="line-clamp-1">
            {property.location.area}, {property.location.city}
          </span>
        </p>
        {!isCompact && (
          <SpecIcons beds={property.beds} baths={property.baths} sizeSqft={property.sizeSqft} />
        )}
      </div>
    </Link>
  );
}
