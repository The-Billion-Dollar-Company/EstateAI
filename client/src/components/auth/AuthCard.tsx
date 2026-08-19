import { Link } from 'react-router-dom';

import { Wordmark } from '@/components/layout/Header';

interface Props {
  title: string;
  footer: React.ReactNode;
  children: React.ReactNode;
}

export function AuthCard({ title, footer, children }: Props): React.JSX.Element {
  return (
    <div className="container flex justify-center py-14 md:py-20">
      <div className="w-full max-w-[26rem]">
        <div className="flex justify-center">
          <Link
            to="/"
            className="rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background"
          >
            <Wordmark />
          </Link>
        </div>

        <div className="surface-card mt-8 p-6 shadow-card md:p-8">
          <h1 className="type-h3 text-center">{title}</h1>
          <div className="mt-7">{children}</div>
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">{footer}</p>
      </div>
    </div>
  );
}
