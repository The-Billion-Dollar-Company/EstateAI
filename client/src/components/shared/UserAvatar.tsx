import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export function UserAvatar({ name }: { name: string }): React.JSX.Element {
  const initials = name
    .split(' ')
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
  return (
    <Avatar>
      <AvatarFallback className="bg-primary/10 text-sm text-primary">{initials}</AvatarFallback>
    </Avatar>
  );
}
