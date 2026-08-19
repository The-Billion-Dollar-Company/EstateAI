import { ArrowRight, Building, Home, LandPlot, Store } from 'lucide-react';
import { Link } from 'react-router-dom';

import { AiTeaser } from '@/components/landing/AiTeaser';
import { Hero } from '@/components/landing/Hero';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { StatsStrip } from '@/components/landing/StatsStrip';
import { PropertyGrid } from '@/components/property/PropertyGrid';
import { Reveal } from '@/components/shared/Reveal';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { Button } from '@/components/ui/button';
import { useProperties } from '@/hooks/queries/use-properties';

/** Each category maps to a filter the search page already understands. */
const CATEGORIES = [
  { to: '/search?type=apartment', label: 'Apartments', icon: Building, blurb: 'Flats & condos' },
  { to: '/search?type=house', label: 'Houses', icon: Home, blurb: 'Family homes' },
  { to: '/search?type=commercial', label: 'Commercial', icon: Store, blurb: 'Offices & retail' },
  { to: '/search?type=land', label: 'Land', icon: LandPlot, blurb: 'Plots & projects' },
] as const;

export function HomePage(): React.JSX.Element {
  const { data, isPending, isError } = useProperties({ limit: 6 });
  const properties = data?.items ?? [];

  /* Popular locations come from the listings actually in the database. */
  const cities = Array.from(new Set(properties.map((p) => p.location.city).filter(Boolean))).slice(
    0,
    6,
  );

  return (
    <>
      <Hero featured={properties} />

      {/* Categories */}
      <section className="section-tight container">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {CATEGORIES.map(({ to, label, icon: Icon, blurb }, i) => (
            <Reveal key={label} delay={i * 60}>
              <Link
                to={to}
                className="group flex h-full items-center gap-4 rounded-xl border border-border bg-card p-4 transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:border-foreground/15 hover:shadow-lift focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-surface text-foreground transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
                  <Icon size={19} strokeWidth={1.75} aria-hidden />
                </span>
                <span className="min-w-0">
                  <span className="block text-[0.9375rem] font-medium">{label}</span>
                  <span className="block text-sm text-muted-foreground">{blurb}</span>
                </span>
                <ArrowRight
                  size={16}
                  strokeWidth={1.75}
                  aria-hidden
                  className="ml-auto shrink-0 text-muted-foreground transition-transform duration-300 group-hover:translate-x-0.5 group-hover:text-foreground"
                />
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Featured listings */}
      <section className="section container pt-0 md:pt-0">
        <Reveal>
          <SectionHeader
            eyebrow="Featured"
            title="Homes worth a second look"
            description="Hand-picked listings from verified owners across the country."
            action={
              <Button asChild variant="outline" className="gap-2">
                <Link to="/search">
                  View all listings
                  <ArrowRight size={16} strokeWidth={2} aria-hidden />
                </Link>
              </Button>
            }
          />
        </Reveal>
        <div className="mt-10">
          <PropertyGrid properties={properties} isLoading={isPending} isError={isError} />
        </div>
      </section>

      {/* Popular locations — derived from live listing data */}
      {cities.length > 0 && (
        <section className="border-t border-border">
          <div className="section-tight container">
            <Reveal>
              <SectionHeader eyebrow="Popular locations" title="Browse by city" />
            </Reveal>
            <div className="mt-8 flex flex-wrap gap-2.5">
              {cities.map((city, i) => (
                <Reveal key={city} delay={i * 40}>
                  <Link
                    to={`/search?q=${encodeURIComponent(city)}`}
                    className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2.5 text-sm font-medium transition-colors duration-200 hover:border-foreground/25 hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    {city}
                    <ArrowRight size={14} strokeWidth={1.75} aria-hidden className="text-muted-foreground" />
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      <HowItWorks />
      <AiTeaser />
      <StatsStrip />

      {/* Closing CTA */}
      <section className="section container">
        <Reveal>
          <div className="overflow-hidden rounded-2xl bg-ink px-6 py-16 text-center text-ink-foreground md:px-16 md:py-20">
            <h2 className="type-h2 mx-auto max-w-xl text-white">Ready to find your place?</h2>
            <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-white/65">
              Create a free account to save properties, schedule visits, and chat with the AI
              assistant.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button asChild size="lg" className="press-scale">
                <Link to="/register">Get started</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white/25 bg-transparent text-white hover:border-white/40 hover:bg-white/10 hover:text-white"
              >
                <Link to="/search">Browse listings</Link>
              </Button>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
