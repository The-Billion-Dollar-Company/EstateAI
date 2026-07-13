import { Search } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PROPERTY_TYPES } from '@/types/property';

/** Hero search bar — location + type + listing type, navigates to /search. */
export function SearchBar(): React.JSX.Element {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [type, setType] = useState('any');
  const [listingType, setListingType] = useState('sale');

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    const params = new URLSearchParams({ listingType });
    if (query.trim()) params.set('q', query.trim());
    if (type !== 'any') params.set('type', type);
    navigate(`/search?${params.toString()}`);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 rounded-lg border bg-card p-3 shadow-md sm:flex-row sm:items-center"
    >
      <Input
        aria-label="Location or keyword"
        placeholder="Search by area, city, or keyword…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="sm:flex-1"
      />
      <Select value={type} onValueChange={setType}>
        <SelectTrigger aria-label="Property type" className="sm:w-40">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="any">Any type</SelectItem>
          {PROPERTY_TYPES.map((t) => (
            <SelectItem key={t} value={t} className="capitalize">
              {t}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={listingType} onValueChange={setListingType}>
        <SelectTrigger aria-label="Buy or rent" className="sm:w-32">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="sale">Buy</SelectItem>
          <SelectItem value="rent">Rent</SelectItem>
        </SelectContent>
      </Select>
      <Button type="submit" className="gap-2">
        <Search size={20} strokeWidth={2} aria-hidden />
        Search
      </Button>
    </form>
  );
}
