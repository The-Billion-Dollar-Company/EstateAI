import { Building2, CalendarClock, MessageSquare, Phone, Plus, Shield, Star } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

import { RespondBookingDialog } from '@/components/bookings/RespondBookingDialog';
import { BecomeOwnerButton } from '@/components/dashboard/BecomeOwnerButton';
import { StatCard } from '@/components/dashboard/StatCard';
import { PriceTag } from '@/components/property/PriceTag';
import { PropertyImage } from '@/components/property/PropertyImage';
import { StatusBadge } from '@/components/property/StatusBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  useCancelBooking,
  useMyBookings,
  useOwnerBookings,
  useUpdateBookingStatus,
  type Booking,
} from '@/hooks/queries/use-bookings';
import { useMyProperties } from '@/hooks/queries/use-properties';
import { apiErrorMessage } from '@/lib/api';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth-store';
import type { Property } from '@/types/property';

function statsFor(listings: Property[]): Array<{ icon: LucideIcon; label: string; value: string }> {
  const active = listings.filter((p) => p.status === 'active').length;
  const pending = listings.filter((p) => p.status === 'pending').length;
  const reviews = listings.reduce((sum, p) => sum + p.reviewCount, 0);
  const rated = listings.filter((p) => p.reviewCount > 0);
  const avg = rated.length
    ? (rated.reduce((s, p) => s + p.avgRating, 0) / rated.length).toFixed(1)
    : '—';
  return [
    { icon: Building2, label: 'Active listings', value: String(active) },
    { icon: CalendarClock, label: 'Pending approval', value: String(pending) },
    { icon: MessageSquare, label: 'Total reviews', value: String(reviews) },
    { icon: Star, label: 'Average rating', value: avg },
  ];
}

const BOOKING_STATUS_BADGE: Record<string, string> = {
  pending: 'bg-warning/12 text-warning',
  confirmed: 'bg-success/12 text-success',
  cancelled: 'bg-destructive/10 text-destructive',
  completed: 'bg-info/12 text-info',
};

function BookingStatusPill({ status }: { status: string }): React.JSX.Element {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-1 text-[0.6875rem] font-semibold capitalize tracking-wide',
        BOOKING_STATUS_BADGE[status] ?? 'bg-secondary text-secondary-foreground',
      )}
    >
      {status}
    </span>
  );
}

export function DashboardPage(): React.JSX.Element {
  const user = useAuthStore((s) => s.user);
  const canManage = user?.role === 'owner' || user?.role === 'admin';
  const isAdmin = user?.role === 'admin';

  const { data: listings = [], isPending: listingsPending } = useMyProperties(canManage);
  // Bookings you made as a buyer are yours regardless of your current role — an owner
  // can still have open visit requests on other people's listings, so this always loads.
  const { data: myBookings = [], isPending: myBookingsPending } = useMyBookings();
  const { data: ownerBookings = [], isPending: ownerBookingsPending } = useOwnerBookings(canManage);
  const cancelBooking = useCancelBooking();
  const updateStatus = useUpdateBookingStatus();
  const [respondTarget, setRespondTarget] = useState<{
    booking: Booking;
    action: 'confirm' | 'decline';
  } | null>(null);

  const stats = statsFor(listings);

  const handleCancel = (id: string): void => {
    cancelBooking.mutate(id, {
      onSuccess: () => toast.success('Booking cancelled'),
      onError: (err) => toast.error(apiErrorMessage(err, 'Could not cancel booking')),
    });
  };

  const handleRespond = (ownerMessage: string): void => {
    if (!respondTarget) return;
    updateStatus.mutate(
      {
        id: respondTarget.booking.id,
        status: respondTarget.action === 'confirm' ? 'confirmed' : 'cancelled',
        ownerMessage: ownerMessage || undefined,
      },
      {
        onSuccess: () => {
          toast.success(
            respondTarget.action === 'confirm' ? 'Booking confirmed' : 'Booking declined',
          );
          setRespondTarget(null);
        },
        onError: (err) => toast.error(apiErrorMessage(err, 'Could not respond to booking')),
      },
    );
  };

  return (
    <div className="container py-8 md:py-12">
      {respondTarget && (
        <RespondBookingDialog
          open={Boolean(respondTarget)}
          onOpenChange={(open) => {
            if (!open) setRespondTarget(null);
          }}
          action={respondTarget.action}
          bookingTitle={respondTarget.booking.property.title}
          loading={updateStatus.isPending}
          onSubmit={handleRespond}
        />
      )}

      <PageHeader
        eyebrow={isAdmin ? 'Admin' : canManage ? 'Owner' : 'Account'}
        title={isAdmin ? 'Admin dashboard' : canManage ? 'Owner dashboard' : 'My dashboard'}
        description={`Welcome back, ${user?.name ?? 'there'}.`}
        actions={
          <>
            {isAdmin && (
              <Button asChild variant="outline" className="gap-2">
                <Link to="/admin">
                  <Shield size={16} strokeWidth={1.75} aria-hidden />
                  Admin panel
                </Link>
              </Button>
            )}
            {canManage ? (
              <Button asChild className="press-scale gap-2">
                <Link to="/dashboard/new">
                  <Plus size={16} strokeWidth={2} aria-hidden />
                  Add property
                </Link>
              </Button>
            ) : (
              <BecomeOwnerButton label="Become an owner to list" />
            )}
          </>
        }
      />

      {canManage && (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map(({ icon, label, value }) => (
            <StatCard
              key={label}
              icon={icon}
              label={label}
              value={value}
              isLoading={listingsPending}
            />
          ))}
        </div>
      )}

      <div className="mt-10">
        <Tabs defaultValue={canManage ? 'listings' : 'bookings'}>
          <TabsList>
            {canManage && <TabsTrigger value="listings">My listings</TabsTrigger>}
            {canManage && <TabsTrigger value="received-bookings">Received bookings</TabsTrigger>}
            <TabsTrigger value="bookings">My bookings</TabsTrigger>
          </TabsList>

          {/* Listings tab (owner/admin) */}
          {canManage && (
            <TabsContent value="listings" className="mt-6">
              {!listingsPending && listings.length === 0 ? (
                <EmptyState
                  icon={Building2}
                  message="You haven't listed any properties yet. Your first listing takes about two minutes."
                  action={
                    <Button asChild className="press-scale">
                      <Link to="/dashboard/new">Add your first property</Link>
                    </Button>
                  }
                />
              ) : (
                <div className="overflow-x-auto rounded-xl border border-border bg-card">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="px-5 py-3.5">Property</TableHead>
                        <TableHead className="py-3.5">Price</TableHead>
                        <TableHead className="py-3.5">Status</TableHead>
                        <TableHead className="py-3.5">Rating</TableHead>
                        <TableHead className="px-5 py-3.5 text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {listingsPending &&
                        Array.from({ length: 3 }, (_, i) => (
                          <TableRow key={i}>
                            <TableCell colSpan={5} className="px-5 py-4">
                              <Skeleton className="h-10 w-full" />
                            </TableCell>
                          </TableRow>
                        ))}
                      {listings.map((property) => (
                        <TableRow key={property.id}>
                          <TableCell className="max-w-72 px-5 py-4">
                            <div className="flex items-center gap-3.5">
                              <PropertyImage
                                src={property.images[0]}
                                alt=""
                                className="aspect-[4/3] w-16 shrink-0 rounded-lg"
                              />
                              <div className="min-w-0">
                                <Link
                                  to={`/properties/${property.id}`}
                                  className="line-clamp-1 font-medium transition-colors hover:text-primary"
                                >
                                  {property.title}
                                </Link>
                                <span className="line-clamp-1 text-sm text-muted-foreground">
                                  {property.location.area}, {property.location.city}
                                </span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="py-4 whitespace-nowrap">
                            <PriceTag
                              amount={property.price}
                              listingType={property.listingType}
                              className="text-[0.9375rem]"
                            />
                          </TableCell>
                          <TableCell className="py-4">
                            <StatusBadge status={property.status} />
                          </TableCell>
                          <TableCell className="tabular py-4">
                            {property.reviewCount > 0 ? property.avgRating.toFixed(1) : '—'}
                          </TableCell>
                          <TableCell className="px-5 py-4 text-right">
                            <div className="inline-flex gap-1.5">
                              <Button asChild variant="ghost" size="sm">
                                <Link to={`/properties/${property.id}`}>View</Link>
                              </Button>
                              <Button asChild variant="outline" size="sm">
                                <Link to={`/dashboard/edit/${property.id}`}>Edit</Link>
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>
          )}

          {/* Received bookings (owner/admin) */}
          {canManage && (
            <TabsContent value="received-bookings" className="mt-6">
              {!ownerBookingsPending && ownerBookings.length === 0 ? (
                <EmptyState
                  icon={CalendarClock}
                  message="No bookings received yet. Visit requests from buyers will land here."
                />
              ) : (
                <div className="space-y-3">
                  {ownerBookingsPending &&
                    Array.from({ length: 3 }, (_, i) => (
                      <Skeleton key={i} className="h-24 w-full rounded-xl" />
                    ))}
                  {ownerBookings.map((booking) => (
                    <div key={booking.id} className="surface-card p-5">
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <Link
                            to={`/properties/${booking.property.id}`}
                            className="font-medium transition-colors hover:text-primary"
                          >
                            {booking.property.title}
                          </Link>
                          <p className="mt-1 text-sm capitalize text-muted-foreground">
                            {booking.type.replace('-', ' ')}
                            {booking.scheduledAt
                              ? ` · ${new Date(booking.scheduledAt).toLocaleDateString()}`
                              : ''}
                          </p>
                          {booking.message && (
                            <p className="mt-3 border-l-2 border-border pl-3 text-sm italic leading-6 text-muted-foreground">
                              {booking.message}
                            </p>
                          )}
                          {booking.ownerMessage && (
                            <p className="mt-2 text-sm text-muted-foreground">
                              <span className="font-medium text-foreground">Your reply:</span>{' '}
                              {booking.ownerMessage}
                            </p>
                          )}
                        </div>
                        <div className="flex shrink-0 flex-col items-end gap-3">
                          <BookingStatusPill status={booking.status} />
                          {booking.status === 'pending' && (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => setRespondTarget({ booking, action: 'confirm' })}
                                disabled={updateStatus.isPending}
                              >
                                Confirm
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-destructive hover:text-destructive"
                                onClick={() => setRespondTarget({ booking, action: 'decline' })}
                                disabled={updateStatus.isPending}
                              >
                                Decline
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          )}

          {/* My bookings — requests you made as a buyer, visible regardless of role */}
          <TabsContent value="bookings" className="mt-6">
            {!myBookingsPending && myBookings.length === 0 ? (
              <EmptyState
                icon={CalendarClock}
                message="You haven't made any bookings yet."
                action={
                  <Button asChild>
                    <Link to="/search">Browse properties</Link>
                  </Button>
                }
              />
            ) : (
              <div className="space-y-3">
                {myBookingsPending &&
                  Array.from({ length: 3 }, (_, i) => (
                    <Skeleton key={i} className="h-24 w-full rounded-xl" />
                  ))}
                {myBookings.map((booking) => (
                  <div key={booking.id} className="surface-card p-5">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <Link
                          to={`/properties/${booking.property.id}`}
                          className="font-medium transition-colors hover:text-primary"
                        >
                          {booking.property.title}
                        </Link>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {booking.property.area}, {booking.property.city}
                        </p>
                        <p className="mt-1 text-sm capitalize">
                          {booking.type.replace('-', ' ')}
                          {booking.scheduledAt
                            ? ` · ${new Date(booking.scheduledAt).toLocaleDateString()}`
                            : ''}
                        </p>
                        {booking.message && (
                          <p className="mt-3 border-l-2 border-border pl-3 text-sm italic leading-6 text-muted-foreground">
                            {booking.message}
                          </p>
                        )}
                        {booking.ownerMessage && (
                          <p className="mt-2 text-sm text-muted-foreground">
                            <span className="font-medium text-foreground">Owner replied:</span>{' '}
                            {booking.ownerMessage}
                          </p>
                        )}
                        {booking.status === 'confirmed' && booking.ownerContact && (
                          <div className="mt-4 flex items-center gap-2.5 rounded-lg border border-success/25 bg-success/[0.07] px-3.5 py-2.5 text-sm">
                            <Phone size={14} className="shrink-0 text-success" strokeWidth={1.75} />
                            <span>
                              <span className="font-medium">{booking.ownerContact.name}</span>
                              {booking.ownerContact.phone && ` · ${booking.ownerContact.phone}`}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <BookingStatusPill status={booking.status} />
                        {booking.status === 'pending' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleCancel(booking.id)}
                            disabled={cancelBooking.isPending}
                          >
                            Cancel
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
