import { CalendarCheck, CircleAlert, Phone } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { PriceTag } from '@/components/property/PriceTag';
import { UserAvatar } from '@/components/shared/UserAvatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useCreateBooking } from '@/hooks/queries/use-bookings';
import { apiErrorMessage } from '@/lib/api';
import { useAuthStore } from '@/stores/auth-store';
import type { Property } from '@/types/property';

interface Props {
  property: Property;
}

const UNAVAILABLE_MESSAGES: Partial<Record<Property['status'], string>> = {
  sold: 'This property has already been sold.',
  rented: 'This property has already been rented.',
  pending: 'This listing is awaiting approval and isn’t open for booking yet.',
  inactive: 'This listing is no longer available.',
};

export function BookingPanel({ property }: Props): React.JSX.Element {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const userRole = useAuthStore((s) => s.user?.role);
  const createBooking = useCreateBooking();
  const [showVisitForm, setShowVisitForm] = useState(false);
  const [message, setMessage] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');

  const handleVisit = (): void => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setShowVisitForm((v) => !v);
  };

  const submitVisit = (): void => {
    if (!scheduledAt) {
      toast.error('Please select a date and time for the visit');
      return;
    }
    createBooking.mutate(
      {
        property: property.id,
        type: 'visit',
        scheduledAt: new Date(scheduledAt).toISOString(),
        message: message || undefined,
      },
      {
        onSuccess: () => {
          toast.success('Visit scheduled! Check your dashboard for updates.');
          setShowVisitForm(false);
          setMessage('');
          setScheduledAt('');
        },
        onError: (err) => toast.error(apiErrorMessage(err, 'Could not schedule visit')),
      },
    );
  };

  const submitRequest = (type: 'reservation' | 'purchase-request'): void => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    createBooking.mutate(
      { property: property.id, type, message: message || undefined },
      {
        onSuccess: () => {
          toast.success('Request sent! The owner will be in touch.');
        },
        onError: (err) => toast.error(apiErrorMessage(err, 'Could not send request')),
      },
    );
  };

  const isOwner = property.ownerId === useAuthStore.getState().user?.id || userRole === 'admin';
  const unavailableMessage = UNAVAILABLE_MESSAGES[property.status];

  return (
    <div className="surface-card overflow-hidden shadow-card">
      <div className="border-b border-border bg-surface px-5 py-5">
        <p className="type-eyebrow">
          {property.listingType === 'sale' ? 'Asking price' : 'Monthly rent'}
        </p>
        <PriceTag
          amount={property.price}
          listingType={property.listingType}
          className="mt-2 block text-[1.75rem]"
        />
      </div>

      <div className="space-y-5 p-5">
        <div>
          <p className="type-eyebrow">Listed by</p>
          <div className="mt-3 flex items-center gap-3">
            <UserAvatar name={property.owner.name} />
            <div className="min-w-0">
              <p className="truncate text-[0.9375rem] font-medium">{property.owner.name}</p>
              {property.ownerContact?.phone && (
                <p className="mt-0.5 flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Phone size={13} strokeWidth={1.75} aria-hidden />
                  {property.ownerContact.phone}
                </p>
              )}
            </div>
          </div>
          {!property.ownerContact && !isOwner && (
            <p className="mt-3 text-xs leading-5 text-muted-foreground">
              The owner's number is shared once they confirm your visit or request.
            </p>
          )}
        </div>

        {!isOwner && unavailableMessage && (
          <p className="flex items-start gap-2 rounded-lg border border-border bg-surface px-3.5 py-3 text-sm text-muted-foreground">
            <CircleAlert size={16} strokeWidth={1.75} aria-hidden className="mt-0.5 shrink-0" />
            {unavailableMessage}
          </p>
        )}

        {!isOwner && !unavailableMessage && (
          <div className="space-y-2.5 border-t border-border pt-5">
            <Button
              className="w-full gap-2"
              size="lg"
              onClick={handleVisit}
              disabled={createBooking.isPending}
            >
              <CalendarCheck size={17} strokeWidth={2} aria-hidden />
              Schedule a visit
            </Button>

            {showVisitForm && (
              <div className="animate-fade-in space-y-4 rounded-lg border border-border bg-surface p-4">
                <div className="space-y-2">
                  <Label htmlFor="visit-date">Preferred date &amp; time</Label>
                  <Input
                    id="visit-date"
                    type="datetime-local"
                    value={scheduledAt}
                    onChange={(e) => setScheduledAt(e.target.value)}
                    min={new Date().toISOString().slice(0, 16)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="visit-msg">Message (optional)</Label>
                  <Textarea
                    id="visit-msg"
                    placeholder="Any questions or special requests…"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={3}
                  />
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={submitVisit} disabled={createBooking.isPending}>
                    {createBooking.isPending ? 'Sending…' : 'Confirm visit'}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setShowVisitForm(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            <Button
              variant="outline"
              size="lg"
              className="w-full"
              onClick={() =>
                submitRequest(property.listingType === 'sale' ? 'purchase-request' : 'reservation')
              }
              disabled={createBooking.isPending}
            >
              {property.listingType === 'sale' ? 'Make purchase request' : 'Request to rent'}
            </Button>

            <p className="pt-1 text-center text-xs leading-5 text-muted-foreground">
              EstateAI connects you directly with the verified owner.
            </p>
          </div>
        )}

        {isOwner && (
          <p className="rounded-lg bg-secondary px-3 py-2.5 text-center text-sm text-muted-foreground">
            This is your listing
          </p>
        )}
      </div>
    </div>
  );
}
