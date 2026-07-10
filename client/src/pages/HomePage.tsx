import { Activity, Bot, Home, Search } from 'lucide-react';

import { useHealth } from '@/hooks/queries/use-health';
import { cn } from '@/lib/utils';

function HealthIndicator(): React.JSX.Element {
  const { data, isPending, isError } = useHealth();
  const label = isPending ? 'Checking API…' : isError ? 'API unreachable' : `API ${data.status}`;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm',
        isPending && 'text-muted-foreground',
        isError && 'border-destructive/40 text-destructive',
        !isPending && !isError && 'border-success/40 text-success',
      )}
    >
      <Activity size={16} strokeWidth={2} />
      {label}
    </span>
  );
}

const PILLARS = [
  { icon: Home, title: 'Listings', text: 'Buy, sell, and rent with rich property detail pages.' },
  { icon: Search, title: 'Smart search', text: 'Filters, map view, and sorting that stay out of your way.' },
  { icon: Bot, title: 'AI assistant', text: 'Describe your dream home; get grounded recommendations.' },
] as const;

export function HomePage(): React.JSX.Element {
  return (
    <section className="py-16 md:py-24">
      <div className="container max-w-3xl space-y-8 text-center">
        <HealthIndicator />
        <h1 className="text-4xl md:text-5xl">Find your next home with AI</h1>
        <p className="text-lg text-muted-foreground">
          EstateAI is under construction — phase 3 scaffold. This page proves the client, API,
          and design tokens are wired end to end.
        </p>
        <div className="grid gap-6 pt-4 text-left sm:grid-cols-3">
          {PILLARS.map(({ icon: Icon, title, text }) => (
            <div key={title} className="rounded-lg border p-4 shadow-sm md:p-6">
              <Icon size={24} className="text-primary" strokeWidth={2} />
              <h2 className="mt-3 text-lg">{title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
