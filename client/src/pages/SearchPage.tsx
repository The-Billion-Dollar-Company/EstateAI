import { SlidersHorizontal, X } from 'lucide-react';
import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

import { PropertyGrid } from '@/components/property/PropertyGrid';
import { FilterSidebar, type Filters } from '@/components/search/FilterSidebar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { MOCK_PROPERTIES } from '@/lib/mock-data';
import type { Property } from '@/types/property';

function applyFilters(properties: Property[], params: URLSearchParams): Property[] {
  const q = params.get('q')?.toLowerCase() ?? '';
  const listingType = params.get('listingType') ?? 'any';
  const type = params.get('type') ?? 'any';
  const beds = Number(params.get('beds') ?? 0);
  const maxPrice = Number(params.get('maxPrice') ?? 0);
  const sort = params.get('sort') ?? 'newest';

  const filtered = properties.filter((p) => {
    if (q && !`${p.title} ${p.location.area} ${p.location.city}`.toLowerCase().includes(q))
      return false;
    if (listingType !== 'any' && p.listingType !== listingType) return false;
    if (type !== 'any' && p.type !== type) return false;
    if (beds > 0 && p.beds < beds) return false;
    if (maxPrice > 0 && p.price > maxPrice) return false;
    return true;
  });

  if (sort === 'price-asc') return [...filtered].sort((a, b) => a.price - b.price);
  if (sort === 'price-desc') return [...filtered].sort((a, b) => b.price - a.price);
  if (sort === 'rating') return [...filtered].sort((a, b) => b.avgRating - a.avgRating);
  return filtered;
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

  const results = useMemo(() => applyFilters(MOCK_PROPERTIES, searchParams), [searchParams]);

  return (
    <div className="container py-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl">Search properties</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {results.length} {results.length === 1 ? 'result' : 'results'}
            {query && ` for “${query}”`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="gap-2 lg:hidden">
                <SlidersHorizontal size={16} strokeWidth={2} aria-hidden />
                Filters
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
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
            <SelectTrigger aria-label="Sort results" className="w-44">
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
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {activeFilters.map(([key, value]) => (
            <Badge key={key} variant="secondary" className="gap-2 capitalize">
              {value === 'sale' || value === 'rent' ? `For ${value}` : value}
              <button
                type="button"
                aria-label={`Remove ${key} filter`}
                onClick={() => updateParams({ [key]: 'any' })}
              >
                <X size={16} strokeWidth={2} />
              </button>
            </Badge>
          ))}
          <Button variant="ghost" size="sm" onClick={() => setSearchParams({})}>
            Clear all
          </Button>
        </div>
      )}

      <div className="mt-6 grid gap-8 lg:grid-cols-[240px_1fr]">
        <aside className="hidden lg:block" aria-label="Filters">
          <FilterSidebar filters={filters} onChange={updateParams} />
        </aside>
        <PropertyGrid properties={results} />
      </div>
    </div>
  );
}
