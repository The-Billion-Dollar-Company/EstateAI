import { Building2, Menu, Moon, Shield, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';

import { UserMenu } from '@/components/layout/UserMenu';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth-store';
import { useUiStore } from '@/stores/ui-store';

const NAV_ITEMS = [
  { to: '/search?listingType=sale', label: 'Buy' },
  { to: '/search?listingType=rent', label: 'Rent' },
  { to: '/dashboard', label: 'Sell' },
  { to: '/assistant', label: 'AI Assistant' },
] as const;

/** Wordmark — small evergreen mark + display-face name. */
export function Wordmark({ className }: { className?: string }): React.JSX.Element {
  return (
    <span className={cn('flex items-center gap-2.5', className)}>
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <Building2 size={17} strokeWidth={2} aria-hidden />
      </span>
      <span className="font-display text-[1.0625rem] font-semibold tracking-[-0.01em]">
        EstateAI
      </span>
    </span>
  );
}

function ThemeToggle(): React.JSX.Element {
  const theme = useUiStore((s) => s.theme);
  const toggleTheme = useUiStore((s) => s.toggleTheme);
  return (
    <Button
      variant="ghost"
      size="icon"
      className="text-muted-foreground hover:text-foreground"
      aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
      onClick={toggleTheme}
    >
      {theme === 'light' ? <Moon size={18} strokeWidth={1.75} /> : <Sun size={18} strokeWidth={1.75} />}
    </Button>
  );
}

export function Header(): React.JSX.Element {
  const isMobileNavOpen = useUiStore((s) => s.isMobileNavOpen);
  const setMobileNavOpen = useUiStore((s) => s.setMobileNavOpen);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const userRole = useAuthStore((s) => s.user?.role);
  const isAdmin = userRole === 'admin';
  const [isScrolled, setIsScrolled] = useState(false);

  /* Border only appears once the page moves — keeps the top of the hero clean. */
  useEffect(() => {
    const onScroll = (): void => setIsScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinkClass = ({ isActive }: { isActive: boolean }): string =>
    cn(
      'relative text-sm font-medium text-muted-foreground transition-colors hover:text-foreground',
      'after:absolute after:-bottom-1.5 after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-foreground after:transition-transform after:duration-200 hover:after:scale-x-100',
      isActive && 'text-foreground after:scale-x-100',
    );

  return (
    <header
      className={cn(
        'sticky top-0 z-40 bg-background/85 backdrop-blur-md transition-shadow duration-300',
        isScrolled ? 'border-b border-border shadow-xs' : 'border-b border-transparent',
      )}
    >
      <div className="container flex h-16 items-center justify-between gap-6 md:h-[4.5rem]">
        <Link
          to="/"
          className="rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background"
        >
          <Wordmark />
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-8 md:flex">
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.label} to={item.to} className={navLinkClass}>
              {item.label}
            </NavLink>
          ))}
          {isAdmin && (
            <NavLink to="/admin" className={navLinkClass}>
              <span className="flex items-center gap-1.5">
                <Shield size={14} strokeWidth={2} aria-hidden />
                Admin
              </span>
            </NavLink>
          )}
        </nav>

        <div className="flex items-center gap-1.5">
          <ThemeToggle />
          <UserMenu />
          <Sheet open={isMobileNavOpen} onOpenChange={setMobileNavOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open menu" className="md:hidden">
                <Menu size={20} strokeWidth={1.75} />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[min(20rem,88vw)]">
              <SheetHeader>
                <SheetTitle className="text-left">
                  <Wordmark />
                </SheetTitle>
              </SheetHeader>
              <nav aria-label="Mobile" className="mt-8 flex flex-col">
                {NAV_ITEMS.map((item) => (
                  <NavLink
                    key={item.label}
                    to={item.to}
                    onClick={() => setMobileNavOpen(false)}
                    className={({ isActive }) =>
                      cn(
                        'border-b border-border py-3.5 text-[0.9375rem] font-medium transition-colors',
                        isActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
                      )
                    }
                  >
                    {item.label}
                  </NavLink>
                ))}
                {isAdmin && (
                  <NavLink
                    to="/admin"
                    onClick={() => setMobileNavOpen(false)}
                    className="flex items-center gap-2 border-b border-border py-3.5 text-[0.9375rem] font-medium text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <Shield size={15} strokeWidth={2} aria-hidden />
                    Admin Panel
                  </NavLink>
                )}
                {!isAuthenticated && (
                  <Button asChild className="mt-6">
                    <Link to="/login" onClick={() => setMobileNavOpen(false)}>
                      Sign in
                    </Link>
                  </Button>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
