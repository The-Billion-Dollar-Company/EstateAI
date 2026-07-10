import { createBrowserRouter } from 'react-router-dom';

import { AppShell } from '@/components/layout/AppShell';
import { HomePage } from '@/pages/HomePage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { PlaceholderPage } from '@/pages/PlaceholderPage';

// Route skeleton per phase 3. Real pages replace placeholders in phases 4–6.
export const router = createBrowserRouter([
  {
    element: <AppShell />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/search', element: <PlaceholderPage title="Search properties" phase="phase 4" /> },
      {
        path: '/properties/:id',
        element: <PlaceholderPage title="Property detail" phase="phase 4" />,
      },
      { path: '/assistant', element: <PlaceholderPage title="AI Assistant" phase="phase 6" /> },
      { path: '/login', element: <PlaceholderPage title="Sign in" phase="phase 4" /> },
      { path: '/register', element: <PlaceholderPage title="Create account" phase="phase 4" /> },
      { path: '/dashboard', element: <PlaceholderPage title="Dashboard" phase="phase 4" /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);
