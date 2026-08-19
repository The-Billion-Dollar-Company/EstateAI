import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { PROPERTY_TYPES } from '@/types/property';

export interface Filters {
  listingType: string;
  type: string;
  beds: string;
  maxPrice: string;
}

interface Props {
  filters: Filters;
  onChange: (patch: Partial<Filters>) => void;
}

const MAX_PRICE_OPTIONS = [
  { value: 'any', label: 'Any price' },
  { value: '50000', label: 'Up to ৳ 50,000/mo' },
  { value: '100000', label: 'Up to ৳ 1,00,000/mo' },
  { value: '20000000', label: 'Up to ৳ 2,00,00,000' },
  { value: '40000000', label: 'Up to ৳ 4,00,00,000' },
  { value: '60000000', label: 'Up to ৳ 6,00,00,000' },
] as const;

const LISTING_OPTIONS = [
  { value: 'any', label: 'All' },
  { value: 'sale', label: 'Buy' },
  { value: 'rent', label: 'Rent' },
] as const;

const BED_OPTIONS = [
  { value: 'any', label: 'Any' },
  { value: '1', label: '1+' },
  { value: '2', label: '2+' },
  { value: '3', label: '3+' },
  { value: '4', label: '4+' },
] as const;

function FilterGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <div className="border-t border-border px-4 py-4 first:border-t-0 md:px-5">
      <p className="type-eyebrow">{label}</p>
      <div className="mt-3">{children}</div>
    </div>
  );
}

/** Segmented pill group — same value contract as the selects it replaces. */
function SegmentedGroup({
  label,
  value,
  options,
  onValueChange,
}: {
  label: string;
  value: string;
  options: ReadonlyArray<{ value: string; label: string }>;
  onValueChange: (v: string) => void;
}): React.JSX.Element {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap gap-2">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={value === option.value}
          onClick={() => onValueChange(option.value)}
          className={cn(
            'min-w-11 rounded-lg border px-3 py-2 text-sm font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            value === option.value
              ? 'border-primary bg-primary text-primary-foreground'
              : 'border-border bg-card text-muted-foreground hover:border-foreground/25 hover:text-foreground',
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

function FilterSelect({
  id,
  label,
  value,
  onValueChange,
  options,
}: {
  id: string;
  label: string;
  value: string;
  onValueChange: (v: string) => void;
  options: ReadonlyArray<{ value: string; label: string }>;
}): React.JSX.Element {
  return (
    <>
      <Label htmlFor={id} className="sr-only">
        {label}
      </Label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger id={id}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </>
  );
}

export function FilterSidebar({ filters, onChange }: Props): React.JSX.Element {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <FilterGroup label="Listing">
        <SegmentedGroup
          label="Listing type"
          value={filters.listingType}
          options={LISTING_OPTIONS}
          onValueChange={(v) => onChange({ listingType: v })}
        />
      </FilterGroup>

      <FilterGroup label="Property type">
        <FilterSelect
          id="filter-type"
          label="Property type"
          value={filters.type}
          onValueChange={(v) => onChange({ type: v })}
          options={[
            { value: 'any', label: 'Any type' },
            ...PROPERTY_TYPES.map((t) => ({
              value: t,
              label: t.charAt(0).toUpperCase() + t.slice(1),
            })),
          ]}
        />
      </FilterGroup>

      <FilterGroup label="Bedrooms">
        <SegmentedGroup
          label="Bedrooms"
          value={filters.beds}
          options={BED_OPTIONS}
          onValueChange={(v) => onChange({ beds: v })}
        />
      </FilterGroup>

      <FilterGroup label="Max price">
        <FilterSelect
          id="filter-max-price"
          label="Max price"
          value={filters.maxPrice}
          onValueChange={(v) => onChange({ maxPrice: v })}
          options={MAX_PRICE_OPTIONS}
        />
      </FilterGroup>
    </div>
  );
}
