import { cn } from '@/lib/utils';

interface Props {
  eyebrow?: string;
  title: string;
  description?: string;
  /** Optional trailing control — usually a "view all" link. */
  action?: React.ReactNode;
  className?: string;
}

/** Consistent section masthead: eyebrow, heading, optional lead + action. */
export function SectionHeader({
  eyebrow,
  title,
  description,
  action,
  className,
}: Props): React.JSX.Element {
  return (
    <div
      className={cn(
        'flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between sm:gap-8',
        className,
      )}
    >
      <div className="max-w-xl">
        {eyebrow && <p className="type-eyebrow">{eyebrow}</p>}
        <h2 className={cn('type-h2', eyebrow && 'mt-3')}>{title}</h2>
        {description && <p className="mt-3 text-sm leading-7 text-muted-foreground">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
