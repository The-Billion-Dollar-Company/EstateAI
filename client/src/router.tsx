import { createBrowserRouter } from 'react-router-dom';

import { RequireAuth } from '@/components/auth/RequireAuth';
import { AppShell } from '@/components/layout/AppShell';
import { AddPropertyPage } from '@/pages/AddPropertyPage';
import { AdminPage } from '@/pages/AdminPage';
import { AssistantPage } from '@/pages/AssistantPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { EditPropertyPage } from '@/pages/EditPropertyPage';
import { HomePage } from '@/pages/HomePage';
import { LoginPage } from '@/pages/LoginPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { PropertyDetailPage } from '@/pages/PropertyDetailPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { SearchPage } from '@/pages/SearchPage';

export const router = createBrowserRouter([
  {
    element: <AppShell />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/search', element: <SearchPage /> },
      { path: '/properties/:id', element: <PropertyDetailPage /> },
      { path: '/assistant', element: <AssistantPage /> },
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
      {
        element: <RequireAuth />,
        children: [
          { path: '/dashboard', element: <DashboardPage /> },
          { path: '/dashboard/new', element: <AddPropertyPage /> },
          { path: '/dashboard/edit/:id', element: <EditPropertyPage /> },
          { path: '/profile', element: <ProfilePage /> },
          { path: '/admin', element: <AdminPage /> },
        ],
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);
