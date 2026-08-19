import { ArrowUpRight, ShieldCheck, Sparkles, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

import { PriceTag } from '@/components/property/PriceTag';
import { PropertyImage } from '@/components/property/PropertyImage';
import { SearchBar } from '@/components/search/SearchBar';
import type { Property } from '@/types/property';

const TRUST_CHIPS = [
  { icon: ShieldCheck, label: 'Verified owners' },
  { icon: Star, label: 'Rated 4.7/5 by buyers' },
  { icon: Sparkles, label: 'AI-grounded recommendations' },
] as const;

interface Props {
  /** Real listings, reused from the page query — no extra request. */
  featured?: Property[];
}

/** Editorial hero — type on the left, live photography on the right. */
export function Hero({ featured = [] }: Props): React.JSX.Element {
  const [primary, secondary] = featured;

  return (
    <section className="relative overflow-hidden bg-ink text-ink-foreground">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-52 left-1/4 h-[520px] w-[720px] -translate-x-1/2 rounded-full bg-primary/20 blur-[140px]"
      />

      <div className="container relative grid items-center gap-14 py-20 md:py-24 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)] lg:gap-16 lg:py-28">
        <div className="max-w-2xl">
          <p
            className="inline-flex animate-fade-up items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-3.5 py-1.5 text-xs font-medium tracking-wide text-white/75 backdrop-blur"
            style={{ animationDelay: '0ms' }}
          >
            <Sparkles size={14} className="text-primary-foreground/80" strokeWidth={2} aria-hidden />
            Bangladesh's AI-powered property platform
          </p>

          <h1
            className="type-display mt-6 animate-fade-up text-white"
            style={{ animationDelay: '80ms' }}
          >
            Find a home that
            <br className="hidden sm:block" /> understands you.
          </h1>

          <p
            className="mt-6 max-w-lg animate-fade-up text-base leading-8 text-white/65 md:text-lg"
            style={{ animationDelay: '160ms' }}
          >
            Buy, rent, and manage properties — or simply describe your ideal home and let our
            assistant find it among real, verified listings.
          </p>

          <div className="mt-10 animate-fade-up text-left" style={{ animationDelay: '240ms' }}>
            <SearchBar />
          </div>

          <ul
            className="mt-8 flex animate-fade-up flex-wrap gap-x-7 gap-y-3 text-sm text-white/70"
            style={{ animationDelay: '320ms' }}
          >
            {TRUST_CHIPS.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-2">
                <Icon size={15} className="text-white/50" strokeWidth={1.75} aria-hidden />
                {label}
              </li>
            ))}
          </ul>
        </div>

        {/* Live listing showcase — hidden on small screens where the search
            widget deserves the full width. */}
        {primary && (
          <div
            className="relative hidden animate-fade-up lg:block"
            style={{ animationDelay: '200ms' }}
          >
            <Link
              to={`/properties/${primary.id}`}
              className="group relative block overflow-hidden rounded-2xl shadow-panel ring-1 ring-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <PropertyImage
                src={primary.images[0]}
                alt={primary.title}
                className="aspect-[4/5] transition-transform duration-[700ms] ease-out group-hover:scale-[1.03]"
              />
              <div aria-hidden className="photo-scrim absolute inset-0" />
              <div className="absolute inset-x-0 bottom-0 p-6">
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-white/70">
                  Featured listing
                </p>
                <p className="mt-2 line-clamp-1 text-lg font-medium text-white">{primary.title}</p>
                <p className="mt-1 text-sm text-white/70">
                  {primary.location.area}, {primary.location.city}
                </p>
              </div>
            </Link>

            {secondary && (
              <Link
                to={`/properties/${secondary.id}`}
                className="absolute -left-10 bottom-10 hidden w-56 overflow-hidden rounded-xl border border-border bg-card shadow-panel transition-transform duration-300 hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white xl:block"
              >
                <PropertyImage
                  src={secondary.images[0]}
                  alt={secondary.title}
                  className="aspect-[16/10]"
                />
                <div className="p-3.5">
                  <PriceTag
                    amount={secondary.price}
                    listingType={secondary.listingType}
                    className="text-base"
                  />
                  <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                    {secondary.location.area}, {secondary.location.city}
                  </p>
                </div>
                <span className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-card/95 text-foreground shadow-xs">
                  <ArrowUpRight size={14} strokeWidth={2} aria-hidden />
                </span>
              </Link>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
