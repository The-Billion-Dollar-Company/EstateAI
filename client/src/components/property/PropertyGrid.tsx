import { SearchX, ServerCrash } from 'lucide-react';
import { Link } from 'react-router-dom';

import { PropertyCard } from '@/components/property/PropertyCard';
import { EmptyState } from '@/components/shared/EmptyState';
import { Reveal } from '@/components/shared/Reveal';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import type { Property } from '@/types/property';

interface Props {
  properties: Property[];
  isLoading?: boolean;
  isError?: boolean;
}

function CardSkeleton(): React.JSX.Element {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <Skeleton className="aspect-[4/3] w-full rounded-none" />
      <div className="space-y-2.5 p-4 md:p-5">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-40" />
        <Skeleton className="mt-4 h-4 w-full" />
      </div>
    </div>
  );
}

export function PropertyGrid({
  properties,
  isLoading = false,
  isError = false,
}: Props): React.JSX.Element {
  if (isLoading) {
    return (
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
        {Array.from({ length: 6 }, (_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <EmptyState
        icon={ServerCrash}
        message="Couldn't load properties. Check that the API server is running, then retry."
      />
    );
  }

  if (properties.length === 0) {
    return (
      <EmptyState
        icon={SearchX}
        message="No properties match your filters."
        action={
          <Button asChild className="press-scale">
            <Link to="/assistant">Ask the AI assistant</Link>
          </Button>
        }
      />
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {properties.map((property, i) => (
        <Reveal key={property.id} delay={(i % 3) * 60} className="h-full">
          <PropertyCard property={property} />
        </Reveal>
      ))}
    </div>
  );
}
