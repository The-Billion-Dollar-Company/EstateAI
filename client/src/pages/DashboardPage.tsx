import { Building2, CalendarClock, Eye, Star } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

import { PriceTag } from '@/components/property/PriceTag';
import { StatusBadge } from '@/components/property/StatusBadge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { MOCK_PROPERTIES } from '@/lib/mock-data';

const STATS: Array<{ icon: LucideIcon; label: string; value: string }> = [
  { icon: Building2, label: 'Active listings', value: '4' },
  { icon: Eye, label: 'Views this month', value: '1,284' },
  { icon: CalendarClock, label: 'Pending visits', value: '3' },
  { icon: Star, label: 'Average rating', value: '4.5' },
];

/** Owner dashboard skeleton — DashboardLayout + wizard + role views come with phase 4. */
export function DashboardPage(): React.JSX.Element {
  const listings = MOCK_PROPERTIES.slice(0, 4);
  return (
    <div className="container py-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl">Owner dashboard</h1>
        <Button asChild>
          <Link to="/dashboard">Add property</Link>
        </Button>
      </div>

      <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {STATS.map(({ icon: Icon, label, value }) => (
          <div key={label} className="rounded-lg border bg-card p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Icon size={16} strokeWidth={2} aria-hidden />
              {label}
            </div>
            <p className="mt-2 text-3xl font-semibold tracking-tight">{value}</p>
          </div>
        ))}
      </div>

      <section aria-labelledby="listings-heading" className="mt-10">
        <h2 id="listings-heading" className="text-xl">
          My listings
        </h2>
        <div className="mt-4 overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Property</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {listings.map((property) => (
                <TableRow key={property.id}>
                  <TableCell className="max-w-64">
                    <Link
                      to={`/properties/${property.id}`}
                      className="line-clamp-1 font-medium hover:text-primary"
                    >
                      {property.title}
                    </Link>
                    <span className="text-sm text-muted-foreground">
                      {property.location.area}, {property.location.city}
                    </span>
                  </TableCell>
                  <TableCell>
                    <PriceTag amount={property.price} listingType={property.listingType} />
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={property.status} />
                  </TableCell>
                  <TableCell>{property.avgRating.toFixed(1)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>
    </div>
  );
}
