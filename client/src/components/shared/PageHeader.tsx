import { cn } from '@/lib/utils';

interface Props {
  eyebrow?: string;
  title: string;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

/** Standard masthead for dashboard, admin, form, and account pages. */
export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  className,
}: Props): React.JSX.Element {
  return (
    <div
      className={cn(
        'flex flex-col gap-5 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between sm:gap-8',
        className,
      )}
    >
      <div className="min-w-0">
        {eyebrow && <p className="type-eyebrow">{eyebrow}</p>}
        <h1 className={cn('type-h1', eyebrow && 'mt-2.5')}>{title}</h1>
        {description && (
          <div className="mt-2.5 text-sm leading-6 text-muted-foreground">{description}</div>
        )}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-2.5">{actions}</div>}
    </div>
  );
}
