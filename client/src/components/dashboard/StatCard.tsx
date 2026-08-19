import type { LucideIcon } from 'lucide-react';

import { Skeleton } from '@/components/ui/skeleton';

interface Props {
  icon: LucideIcon;
  label: string;
  value: string | number;
  isLoading?: boolean;
}

/** Overview tile — one number, one label, no chrome. */
export function StatCard({ icon: Icon, label, value, isLoading = false }: Props): React.JSX.Element {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">{label}</p>
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface text-muted-foreground">
          <Icon size={16} strokeWidth={1.75} aria-hidden />
        </span>
      </div>
      <div className="tabular mt-4 font-display text-[2rem] font-semibold leading-none tracking-[-0.02em]">
        {isLoading ? <Skeleton className="h-8 w-14" /> : value}
      </div>
    </div>
  );
}
