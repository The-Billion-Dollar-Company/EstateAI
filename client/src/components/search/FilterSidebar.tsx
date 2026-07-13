import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
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
    </div>
  );
}

export function FilterSidebar({ filters, onChange }: Props): React.JSX.Element {
  return (
    <div className="space-y-4">
      <FilterSelect
        id="filter-listing-type"
        label="Listing"
        value={filters.listingType}
        onValueChange={(v) => onChange({ listingType: v })}
        options={[
          { value: 'any', label: 'Buy or rent' },
          { value: 'sale', label: 'For sale' },
          { value: 'rent', label: 'For rent' },
        ]}
      />
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
      <FilterSelect
        id="filter-beds"
        label="Bedrooms"
        value={filters.beds}
        onValueChange={(v) => onChange({ beds: v })}
        options={[
          { value: 'any', label: 'Any' },
          { value: '1', label: '1+' },
          { value: '2', label: '2+' },
          { value: '3', label: '3+' },
          { value: '4', label: '4+' },
        ]}
      />
      <FilterSelect
        id="filter-max-price"
        label="Max price"
        value={filters.maxPrice}
        onValueChange={(v) => onChange({ maxPrice: v })}
        options={MAX_PRICE_OPTIONS}
      />
    </div>
  );
}
