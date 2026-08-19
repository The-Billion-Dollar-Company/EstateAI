import { Sparkles } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';

/** Hero search bar — a natural-language prompt handed straight to the AI assistant. */
export function SearchBar(): React.JSX.Element {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    const trimmed = query.trim();
    navigate(trimmed ? `/assistant?q=${encodeURIComponent(trimmed)}` : '/assistant');
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-2 rounded-xl bg-card p-2 shadow-panel sm:flex-row sm:items-center"
    >
      <div className="relative flex-1">
        <Sparkles
          size={17}
          strokeWidth={1.75}
          aria-hidden
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-primary"
        />
        <input
          aria-label="Describe what you're looking for"
          placeholder="e.g. a 2-bed apartment near Dhanmondi under ৳ 40,000…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="h-12 w-full rounded-lg border-0 bg-transparent pl-10 pr-3 text-[0.9375rem] text-foreground placeholder:text-muted-foreground/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
        />
      </div>

      <Button type="submit" size="lg" className="press-scale h-12 gap-2 sm:px-8">
        <Sparkles size={18} strokeWidth={2} aria-hidden />
        Ask AI
      </Button>
    </form>
  );
}
