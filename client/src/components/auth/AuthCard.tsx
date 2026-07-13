import { Building2 } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Props {
  title: string;
  footer: React.ReactNode;
  children: React.ReactNode;
}

export function AuthCard({ title, footer, children }: Props): React.JSX.Element {
  return (
    <div className="container flex justify-center py-16 md:py-24">
      <div className="w-full max-w-md rounded-lg border bg-card p-6 shadow-sm">
        <Link to="/" className="flex items-center justify-center gap-2 font-semibold">
          <Building2 size={24} className="text-primary" strokeWidth={2} aria-hidden />
          EstateAI
        </Link>
        <h1 className="mt-4 text-center text-2xl">{title}</h1>
        <div className="mt-6">{children}</div>
        <p className="mt-6 text-center text-sm text-muted-foreground">{footer}</p>
      </div>
    </div>
  );
}
