import type { LucideIcon } from 'lucide-react';

interface Props {
  icon: LucideIcon;
  message: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon: Icon, message, action }: Props): React.JSX.Element {
  return (
    <div className="flex flex-col items-center gap-4 rounded-lg border border-dashed py-16 text-center">
      <Icon size={24} className="text-muted-foreground" strokeWidth={2} aria-hidden />
      <p className="text-muted-foreground">{message}</p>
      {action}
    </div>
  );
}
