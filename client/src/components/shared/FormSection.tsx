import { cn } from '@/lib/utils';

interface Props {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

/** Groups related fields under a quiet heading — purely presentational. */
export function FormSection({ title, description, children, className }: Props): React.JSX.Element {
  return (
    <section className={cn('surface-card p-5 md:p-6', className)}>
      <div className="border-b border-border pb-4">
        <h2 className="text-[0.9375rem] font-semibold tracking-tight">{title}</h2>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      <div className="mt-5 space-y-5">{children}</div>
    </section>
  );
}
