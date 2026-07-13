import { CalendarCheck, Phone } from 'lucide-react';

import { PriceTag } from '@/components/property/PriceTag';
import { UserAvatar } from '@/components/shared/UserAvatar';
import { Button } from '@/components/ui/button';
import type { Property } from '@/types/property';

interface Props {
  property: Property;
}

/** Sticky booking panel — actions wire up to the booking API in phase 5. */
export function BookingPanel({ property }: Props): React.JSX.Element {
  return (
    <div className="space-y-4 rounded-lg border bg-card p-4 shadow-sm md:p-6">
      <PriceTag amount={property.price} listingType={property.listingType} className="text-2xl" />
      <div className="flex items-center gap-3 border-t pt-4">
        <UserAvatar name={property.owner.name} />
        <div>
          <p className="text-sm font-medium">{property.owner.name}</p>
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Phone size={16} strokeWidth={2} aria-hidden />
            {property.owner.phone}
          </p>
        </div>
      </div>
      <Button className="w-full gap-2">
        <CalendarCheck size={20} strokeWidth={2} aria-hidden />
        Schedule a visit
      </Button>
      <Button variant="outline" className="w-full">
        {property.listingType === 'sale' ? 'Make purchase request' : 'Request to rent'}
      </Button>
    </div>
  );
}
