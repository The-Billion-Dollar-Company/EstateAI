import { Outlet } from 'react-router-dom';

import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { Toaster } from '@/components/ui/sonner';
import { useCompleteGoogleRedirect } from '@/hooks/queries/use-auth';

export function AppShell(): React.JSX.Element {
  useCompleteGoogleRedirect();

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      {/* Mount point for the toast() calls used across bookings, listings, and admin. */}
      <Toaster />
    </div>
  );
}
