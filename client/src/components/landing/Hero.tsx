import { SearchBar } from '@/components/search/SearchBar';

export function Hero(): React.JSX.Element {
  return (
    <section className="border-b bg-secondary/50">
      <div className="container max-w-4xl py-16 text-center md:py-24">
        <h1 className="text-4xl md:text-5xl">Find your next home with AI</h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
          Buy, rent, and manage properties across Bangladesh — with an assistant that
          understands what you're looking for.
        </p>
        <div className="mt-8 text-left">
          <SearchBar />
        </div>
      </div>
    </section>
  );
}
