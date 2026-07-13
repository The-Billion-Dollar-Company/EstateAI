import { useHealth } from '@/hooks/queries/use-health';
import { cn } from '@/lib/utils';

function ApiStatusDot(): React.JSX.Element {
  const { isPending, isError } = useHealth();
  const label = isPending ? 'Checking API' : isError ? 'API offline' : 'API online';
  return (
    <span className="inline-flex items-center gap-2">
      <span
        aria-hidden
        className={cn(
          'h-2 w-2 rounded-full',
          isPending && 'bg-muted-foreground',
          isError && 'bg-destructive',
          !isPending && !isError && 'bg-success',
        )}
      />
      {label}
    </span>
  );
}

export function Footer(): React.JSX.Element {
  return (
    <footer className="border-t py-8">
      <div className="container flex flex-wrap items-center justify-between gap-4 text-sm text-muted-foreground">
        <span>© {new Date().getFullYear()} EstateAI — CSE 400 Capstone, BUBT.</span>
        <ApiStatusDot />
      </div>
    </footer>
  );
}
