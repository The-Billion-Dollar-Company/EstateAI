import { SearchX } from 'lucide-react';
import { Link } from 'react-router-dom';

import { PropertyCard } from '@/components/property/PropertyCard';
import { EmptyState } from '@/components/shared/EmptyState';
import { Skeleton } from '@/components/ui/skeleton';
import type { Property } from '@/types/property';

interface Props {
  properties: Property[];
  isLoading?: boolean;
}

function CardSkeleton(): React.JSX.Element {
  return (
    <div className="overflow-hidden rounded-lg border">
      <Skeleton className="aspect-[16/10] w-full rounded-none" />
      <div className="space-y-2 p-4">
        <Skeleton className="h-5 w-28" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-40" />
      </div>
    </div>
  );
}

export function PropertyGrid({ properties, isLoading = false }: Props): React.JSX.Element {
  if (isLoading) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <EmptyState
        icon={SearchX}
        message="No properties match your filters."
        action={
          <Link
            to="/assistant"
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Ask the AI assistant
          </Link>
        }
      />
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {properties.map((property) => (
        <PropertyCard key={property.id} property={property} />
      ))}
    </div>
  );
}
