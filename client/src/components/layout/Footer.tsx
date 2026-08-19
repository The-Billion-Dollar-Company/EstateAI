import { Link } from 'react-router-dom';

import { Wordmark } from '@/components/layout/Header';
import { useHealth } from '@/hooks/queries/use-health';
import { cn } from '@/lib/utils';

function ApiStatusDot(): React.JSX.Element {
  const { isPending, isError } = useHealth();
  const label = isPending ? 'Checking API' : isError ? 'API offline' : 'API online';
  return (
    <span className="inline-flex items-center gap-2 text-xs text-muted-foreground">
      <span
        aria-hidden
        className={cn(
          'h-1.5 w-1.5 rounded-full',
          isPending && 'bg-muted-foreground',
          isError && 'bg-destructive',
          !isPending && !isError && 'bg-success',
        )}
      />
      {label}
    </span>
  );
}

const FOOTER_COLUMNS = [
  {
    title: 'Discover',
    links: [
      { to: '/search?listingType=sale', label: 'Homes for sale' },
      { to: '/search?listingType=rent', label: 'Homes for rent' },
      { to: '/search?type=commercial', label: 'Commercial space' },
      { to: '/search?type=land', label: 'Land & plots' },
    ],
  },
  {
    title: 'Owners',
    links: [
      { to: '/dashboard', label: 'Your dashboard' },
      { to: '/dashboard/new', label: 'List a property' },
      { to: '/profile', label: 'Account settings' },
    ],
  },
  {
    title: 'Platform',
    links: [
      { to: '/assistant', label: 'AI assistant' },
      { to: '/register', label: 'Create an account' },
      { to: '/login', label: 'Sign in' },
    ],
  },
] as const;

export function Footer(): React.JSX.Element {
  return (
    <footer className="mt-auto border-t border-border bg-surface">
      <div className="container py-14 md:py-16">
        <div className="grid gap-10 md:grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(0,1fr))] md:gap-8">
          <div className="max-w-xs">
            <Wordmark />
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              A calmer way to buy, rent, and list property — with an assistant that only ever
              recommends real, verified listings.
            </p>
          </div>

          {FOOTER_COLUMNS.map((column) => (
            <nav key={column.title} aria-label={column.title}>
              <h3 className="type-eyebrow">{column.title}</h3>
              <ul className="mt-4 space-y-2.5">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} EstateAI — CSE 400 Capstone, BUBT.
          </p>
          <ApiStatusDot />
        </div>
      </div>
    </footer>
  );
}
