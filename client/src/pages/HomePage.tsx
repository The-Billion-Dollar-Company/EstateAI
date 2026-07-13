import { Link } from 'react-router-dom';

import { AiTeaser } from '@/components/landing/AiTeaser';
import { Hero } from '@/components/landing/Hero';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { StatsStrip } from '@/components/landing/StatsStrip';
import { PropertyGrid } from '@/components/property/PropertyGrid';
import { Button } from '@/components/ui/button';
import { MOCK_PROPERTIES } from '@/lib/mock-data';

export function HomePage(): React.JSX.Element {
  const featured = MOCK_PROPERTIES.slice(0, 6);
  return (
    <>
      <Hero />
      <section className="container py-16 md:py-24">
        <div className="flex items-end justify-between">
          <h2 className="text-3xl">Featured properties</h2>
          <Button asChild variant="ghost">
            <Link to="/search">View all</Link>
          </Button>
        </div>
        <div className="mt-8">
          <PropertyGrid properties={featured} />
        </div>
      </section>
      <HowItWorks />
      <AiTeaser />
      <StatsStrip />
      <section className="container py-16 text-center md:py-24">
        <h2 className="text-3xl">Ready to find your place?</h2>
        <p className="mx-auto mt-3 max-w-md text-muted-foreground">
          Create a free account to save properties, schedule visits, and chat with the AI
          assistant.
        </p>
        <Button asChild size="lg" className="mt-6">
          <Link to="/register">Get started</Link>
        </Button>
      </section>
    </>
  );
}
