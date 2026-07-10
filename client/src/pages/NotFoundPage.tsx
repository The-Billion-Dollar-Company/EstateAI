import { Link } from 'react-router-dom';

export function NotFoundPage(): React.JSX.Element {
  return (
    <section className="py-16 md:py-24">
      <div className="container max-w-xl text-center">
        <p className="text-sm font-medium text-primary">404</p>
        <h1 className="mt-2 text-3xl">Page not found</h1>
        <p className="mt-3 text-muted-foreground">
          The page you're looking for doesn't exist or was moved.
        </p>
        <Link
          to="/"
          className="mt-6 inline-block rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Back home
        </Link>
      </div>
    </section>
  );
}
