import type { LucideIcon } from 'lucide-react';

import { cn } from '@/lib/utils';

interface Props {
  icon: LucideIcon;
  message: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon: Icon, message, action, className }: Props): React.JSX.Element {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-surface/60 px-6 py-16 text-center',
        className,
      )}
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-full border border-border bg-card">
        <Icon size={20} className="text-muted-foreground" strokeWidth={1.75} aria-hidden />
      </span>
      <p className="mt-4 max-w-sm text-sm leading-6 text-muted-foreground">{message}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
