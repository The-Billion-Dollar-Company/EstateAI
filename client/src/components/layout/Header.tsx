import { Building2 } from 'lucide-react';
import { Link, NavLink } from 'react-router-dom';

import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { to: '/search?listingType=sale', label: 'Buy' },
  { to: '/search?listingType=rent', label: 'Rent' },
  { to: '/dashboard', label: 'Sell' },
  { to: '/assistant', label: 'AI Assistant' },
] as const;

export function Header(): React.JSX.Element {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-lg font-semibold">
          <Building2 size={24} className="text-primary" strokeWidth={2} />
          EstateAI
        </Link>
        <nav aria-label="Main" className="hidden items-center gap-6 md:flex">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.label}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'text-sm font-medium text-muted-foreground transition-colors hover:text-foreground',
                  isActive && 'text-primary',
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <Link
          to="/login"
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Sign in
        </Link>
      </div>
    </header>
  );
}
