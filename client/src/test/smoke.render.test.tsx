import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { AddPropertyPage } from '@/pages/AddPropertyPage';
import { AssistantPage } from '@/pages/AssistantPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { HomePage } from '@/pages/HomePage';
import { LoginPage } from '@/pages/LoginPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { PropertyDetailPage } from '@/pages/PropertyDetailPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { SearchPage } from '@/pages/SearchPage';

function wrap(ui: React.ReactNode, path = '/'): void {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="*" element={ui} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('redesign smoke render', () => {
  it('renders the header and footer', () => {
    wrap(
      <>
        <Header />
        <Footer />
      </>,
    );
    expect(screen.getAllByText('EstateAI').length).toBeGreaterThan(0);
    expect(screen.getByRole('navigation', { name: 'Main' })).toBeInTheDocument();
  });

  it('renders the homepage', () => {
    wrap(<HomePage />);
    expect(screen.getByRole('heading', { name: /find a home/i })).toBeInTheDocument();
  });

  it('renders the search page', () => {
    wrap(<SearchPage />, '/search?listingType=sale&beds=2');
    expect(screen.getByRole('heading', { name: /browse properties/i })).toBeInTheDocument();
    expect(screen.getByLabelText('Sort results')).toBeInTheDocument();
  });

  it('renders the property detail page in its loading state', () => {
    wrap(<PropertyDetailPage />, '/properties/p1');
  });

  it('renders the dashboard', () => {
    wrap(<DashboardPage />, '/dashboard');
    expect(screen.getByRole('heading', { name: /dashboard/i })).toBeInTheDocument();
  });

  it('renders the add-property form', () => {
    wrap(<AddPropertyPage />, '/dashboard/new');
    expect(screen.getByLabelText('Title')).toBeInTheDocument();
    expect(screen.getByLabelText('Price (৳)')).toBeInTheDocument();
  });

  it('renders the profile form', () => {
    wrap(<ProfilePage />, '/profile');
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
  });

  it('renders auth pages', () => {
    wrap(<LoginPage />, '/login');
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
  });

  it('renders the register page', () => {
    wrap(<RegisterPage />, '/register');
    expect(screen.getByLabelText('Full name')).toBeInTheDocument();
  });

  it('renders the assistant', () => {
    wrap(<AssistantPage />, '/assistant');
    expect(screen.getByLabelText('Message the assistant')).toBeInTheDocument();
  });
});
