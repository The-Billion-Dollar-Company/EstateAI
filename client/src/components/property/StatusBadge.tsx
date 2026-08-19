import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { PropertyStatus } from '@/types/property';

const STATUS_STYLES: Record<PropertyStatus, string> = {
  active: 'bg-success/15 text-success border-transparent',
  pending: 'bg-warning/15 text-warning border-transparent',
  sold: 'bg-muted text-muted-foreground border-transparent',
  rented: 'bg-info/15 text-info border-transparent',
  inactive: 'bg-destructive/10 text-destructive border-transparent',
};

export function StatusBadge({ status }: { status: PropertyStatus }): React.JSX.Element {
  return <Badge className={cn('capitalize', STATUS_STYLES[status])}>{status}</Badge>;
}
