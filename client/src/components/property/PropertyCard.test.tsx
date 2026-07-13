import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { PropertyCard } from '@/components/property/PropertyCard';
import { MOCK_PROPERTIES } from '@/lib/mock-data';

const property = MOCK_PROPERTIES[0];
if (!property) throw new Error('mock data missing');

describe('PropertyCard', () => {
  it('renders title, formatted price, location, and detail link', () => {
    render(
      <MemoryRouter>
        <PropertyCard property={property} />
      </MemoryRouter>,
    );
    expect(screen.getByText(property.title)).toBeInTheDocument();
    expect(screen.getByText('৳ 3,25,00,000')).toBeInTheDocument();
    expect(screen.getByText(/Gulshan, Dhaka/)).toBeInTheDocument();
    expect(screen.getByRole('link')).toHaveAttribute('href', `/properties/${property.id}`);
  });

  it('hides spec icons in compact variant', () => {
    render(
      <MemoryRouter>
        <PropertyCard property={property} variant="compact" />
      </MemoryRouter>,
    );
    expect(screen.queryByText(/sqft/)).not.toBeInTheDocument();
  });
});
