import { SlidersHorizontal, X } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

import { PropertyGrid } from '@/components/property/PropertyGrid';
import { FilterSidebar, type Filters } from '@/components/search/FilterSidebar';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useProperties, type PropertyListParams } from '@/hooks/queries/use-properties';

function paramsToApiQuery(params: URLSearchParams): PropertyListParams {
  const num = (key: string): number | undefined => {
    const v = Number(params.get(key));
    return v > 0 ? v : undefined;
  };
  return {
    q: params.get('q') ?? undefined,
    type: params.get('type') ?? undefined,
    listingType: params.get('listingType') ?? undefined,
    beds: num('beds'),
    maxPrice: num('maxPrice'),
    sort: params.get('sort') ?? 'newest',
  };
}

/** Human label for an active filter chip. */
function filterChipLabel(key: string, value: string): string {
  if (key === 'listingType') return value === 'sale' ? 'For sale' : 'For rent';
  if (key === 'beds') return `${value}+ beds`;
  if (key === 'maxPrice') return `Up to ৳ ${Number(value).toLocaleString('en-IN')}`;
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function SearchPage(): React.JSX.Element {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters: Filters = {
    listingType: searchParams.get('listingType') ?? 'any',
    type: searchParams.get('type') ?? 'any',
    beds: searchParams.get('beds') ?? 'any',
    maxPrice: searchParams.get('maxPrice') ?? 'any',
  };
  const activeFilters = Object.entries(filters).filter(([, v]) => v !== 'any');
  const query = searchParams.get('q') ?? '';

  const { data, isPending, isError, isPlaceholderData } = useProperties(
    paramsToApiQuery(searchParams),
  );
  const results = data?.items ?? [];
  const total = data?.total ?? 0;

  const updateParams = (patch: Partial<Filters & { sort: string }>): void => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      for (const [key, value] of Object.entries(patch)) {
        if (value === 'any' || value === '') next.delete(key);
        else next.set(key, value);
      }
      return next;
    });
  };

  return (
    <div className="container py-8 md:py-12">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <h1 className="type-h1">
            {query ? (
              <>
                Results for <span className="text-muted-foreground">“{query}”</span>
              </>
            ) : (
              'Browse properties'
            )}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground" aria-live="polite">
            {isPending ? 'Searching…' : `${total} ${total === 1 ? 'property' : 'properties'} found`}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="press-scale gap-2 lg:hidden">
                <SlidersHorizontal size={16} strokeWidth={1.75} aria-hidden />
                Filters
                {activeFilters.length > 0 && (
                  <span className="tabular ml-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[0.6875rem] font-semibold text-primary-foreground">
                    {activeFilters.length}
                  </span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[min(22rem,90vw)] overflow-y-auto">
              <SheetHeader>
                <SheetTitle className="text-left">Filters</SheetTitle>
              </SheetHeader>
              <div className="mt-6">
                <FilterSidebar filters={filters} onChange={updateParams} />
              </div>
            </SheetContent>
          </Sheet>

          <Select
            value={searchParams.get('sort') ?? 'newest'}
            onValueChange={(v) => updateParams({ sort: v })}
          >
            <SelectTrigger aria-label="Sort results" className="w-[11.5rem]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest first</SelectItem>
              <SelectItem value="price-asc">Price: low to high</SelectItem>
              <SelectItem value="price-desc">Price: high to low</SelectItem>
              <SelectItem value="rating">Top rated</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {activeFilters.length > 0 && (
        <div className="mt-6 flex animate-fade-in flex-wrap items-center gap-2">
          {activeFilters.map(([key, value]) => (
            <span
              key={key}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card py-1.5 pl-3.5 pr-2 text-[0.8125rem] font-medium"
            >
              {filterChipLabel(key, value)}
              <button
                type="button"
                aria-label={`Remove ${key} filter`}
                onClick={() => updateParams({ [key]: 'any' })}
                className="flex h-5 w-5 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <X size={13} strokeWidth={2.25} />
              </button>
            </span>
          ))}
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground"
            onClick={() => setSearchParams({})}
          >
            Clear all
          </Button>
        </div>
      )}

      <div className="mt-8 grid gap-8 lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-10">
        <aside className="hidden lg:block" aria-label="Filters">
          <div className="sticky top-28">
            <FilterSidebar filters={filters} onChange={updateParams} />
          </div>
        </aside>
        <div
          className={
            isPlaceholderData ? 'opacity-60 transition-opacity duration-200' : 'transition-opacity'
          }
        >
          <PropertyGrid properties={results} isLoading={isPending} isError={isError} />
        </div>
      </div>
    </div>
  );
}
