import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { PropertyCard } from '@/components/property/PropertyCard';
import type { Property } from '@/types/property';

const property: Property = {
  id: 'p1',
  ownerId: 'u2',
  title: 'Sunlit 3-bed apartment in Gulshan 2',
  description: 'Bright corner unit.',
  type: 'apartment',
  listingType: 'sale',
  price: 32500000,
  location: { address: 'Road 55, Gulshan 2', city: 'Dhaka', area: 'Gulshan' },
  beds: 3,
  baths: 3,
  sizeSqft: 1850,
  amenities: ['Elevator'],
  images: [],
  documents: [],
  status: 'active',
  avgRating: 4.6,
  reviewCount: 12,
  owner: { name: 'Rahim Chowdhury' },
  createdAt: '2026-01-01T00:00:00.000Z',
};

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
