import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';

export function NotFoundPage(): React.JSX.Element {
  return (
    <section className="py-20 md:py-32">
      <div className="container max-w-xl text-center">
        <p className="type-eyebrow">Error 404</p>
        <h1 className="type-h1 mt-4">Page not found</h1>
        <p className="mx-auto mt-4 max-w-sm text-sm leading-7 text-muted-foreground">
          The page you're looking for doesn't exist or was moved.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button asChild className="press-scale">
            <Link to="/">Back home</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/search">Browse properties</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
