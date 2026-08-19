import { ArrowLeft, Lock, SearchX } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';

import { StatusBadge } from '@/components/property/StatusBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { FormSection } from '@/components/shared/FormSection';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import {
  useProperty,
  useSetPropertyStatus,
  useUpdateProperty,
} from '@/hooks/queries/use-properties';
import { apiErrorMessage } from '@/lib/api';
import { useAuthStore } from '@/stores/auth-store';
import {
  LISTING_TYPES,
  PROPERTY_TYPES,
  type ListingType,
  type Property,
  type PropertyType,
} from '@/types/property';

/** Owner-facing "mark sold/rented/active" control — a separate, immediate action
 * from the full-form "Save changes" below, since it doesn't need the rest of the
 * fields to be valid or touched. */
function ListingStatusControl({ property }: { property: Property }): React.JSX.Element {
  const setStatus = useSetPropertyStatus(property.id);

  const handleSetStatus = (status: 'active' | 'sold' | 'rented' | 'inactive'): void => {
    setStatus.mutate(status, {
      onSuccess: () => toast.success('Listing status updated'),
      onError: (err) => toast.error(apiErrorMessage(err, 'Could not update status')),
    });
  };

  const soldOrRented = property.listingType === 'sale' ? 'sold' : 'rented';

  return (
    <FormSection title="Listing status">
      <div className="flex flex-wrap items-center gap-3">
        <StatusBadge status={property.status} />
        <div className="flex flex-wrap gap-2">
          {property.status !== soldOrRented && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={setStatus.isPending}
              onClick={() => handleSetStatus(soldOrRented)}
            >
              Mark as {soldOrRented}
            </Button>
          )}
          {property.status !== 'active' && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={setStatus.isPending}
              onClick={() => handleSetStatus('active')}
            >
              Reactivate listing
            </Button>
          )}
          {property.status === 'active' && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-muted-foreground"
              disabled={setStatus.isPending}
              onClick={() => handleSetStatus('inactive')}
            >
              Deactivate listing
            </Button>
          )}
        </div>
      </div>
      <p className="text-xs leading-5 text-muted-foreground">
        Marking a listing {soldOrRented} hides it from search and stops new visit/purchase
        requests — anyone who tries will see a message that it's no longer available.
      </p>
    </FormSection>
  );
}

function Field({ id, label, hint, children }: { id: string; label: string; hint?: string; children: React.ReactNode }): React.JSX.Element {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {hint && <p className="text-xs leading-5 text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function EditPropertyPage(): React.JSX.Element {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const { data: property, isPending } = useProperty(id);
  const updateProperty = useUpdateProperty(id ?? '');
  const [type, setType] = useState<PropertyType | null>(null);
  const [listingType, setListingType] = useState<ListingType | null>(null);
  const [error, setError] = useState<string | null>(null);

  const canEdit =
    user?.role === 'admin' || (property && property.ownerId === user?.id);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    if (!property) return;
    setError(null);
    const f = new FormData(e.currentTarget);
    const num = (k: string): number => Number(f.get(k));

    updateProperty.mutate(
      {
        title: String(f.get('title')),
        description: String(f.get('description')),
        type: type ?? property.type,
        listingType: listingType ?? property.listingType,
        price: num('price'),
        location: {
          address: String(f.get('address')),
          city: String(f.get('city')),
          area: String(f.get('area')),
        },
        beds: num('beds'),
        baths: num('baths'),
        sizeSqft: num('sizeSqft'),
        amenities: String(f.get('amenities'))
          .split(',')
          .map((a) => a.trim())
          .filter(Boolean),
      },
      {
        onSuccess: () => {
          toast.success('Listing updated');
          navigate('/dashboard');
        },
        onError: (err) => setError(apiErrorMessage(err, 'Could not update the listing')),
      },
    );
  };

  if (isPending) {
    return (
      <div className="container max-w-3xl space-y-4 py-8 md:py-12">
        <Skeleton className="h-9 w-56" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="container max-w-xl py-16 md:py-24">
        <EmptyState
          icon={SearchX}
          message="Property not found. It may have been removed."
          action={
            <Button asChild variant="outline">
              <Link to="/dashboard">Back to dashboard</Link>
            </Button>
          }
        />
      </div>
    );
  }

  if (!canEdit) {
    return (
      <div className="container max-w-xl py-16 md:py-24">
        <EmptyState
          icon={Lock}
          message="You don't have permission to edit this listing."
          action={
            <Button asChild variant="outline">
              <Link to="/dashboard">Back to dashboard</Link>
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="container max-w-3xl py-8 md:py-12">
      <Button asChild variant="ghost" size="sm" className="-ml-3 mb-6 gap-2 text-muted-foreground">
        <Link to="/dashboard">
          <ArrowLeft size={16} strokeWidth={1.75} aria-hidden />
          Back to dashboard
        </Link>
      </Button>

      <PageHeader eyebrow="Edit listing" title={property.title} />

      <div className="mt-8">
        <ListingStatusControl property={property} />
      </div>

      <form className="mt-5 space-y-5" onSubmit={handleSubmit}>
        {error && (
          <p
            role="alert"
            className="rounded-lg border border-destructive/35 bg-destructive/[0.07] px-4 py-3 text-sm text-destructive"
          >
            {error}
          </p>
        )}

        <FormSection title="The basics">
          <Field id="title" label="Title">
            <Input id="title" name="title" required maxLength={150} defaultValue={property.title} />
          </Field>

          <Field id="description" label="Description">
            <Textarea
              id="description"
              name="description"
              required
              rows={5}
              defaultValue={property.description}
            />
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
          <Field id="type" label="Property type">
            <Select
              defaultValue={property.type}
              onValueChange={(v) => setType(v as PropertyType)}
            >
              <SelectTrigger id="type"><SelectValue /></SelectTrigger>
              <SelectContent>
                {PROPERTY_TYPES.map((t) => (
                  <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field id="listingType" label="Listing type">
            <Select
              defaultValue={property.listingType}
              onValueChange={(v) => setListingType(v as ListingType)}
            >
              <SelectTrigger id="listingType"><SelectValue /></SelectTrigger>
              <SelectContent>
                {LISTING_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>{t === 'sale' ? 'For sale' : 'For rent'}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            </Field>
          </div>
        </FormSection>

        <FormSection title="Price & size">
          <Field id="price" label="Price (৳)">
            <Input
              id="price"
              name="price"
              type="number"
              min={1}
              required
              defaultValue={property.price}
            />
          </Field>

          <div className="grid gap-5 sm:grid-cols-3">
            <Field id="beds" label="Bedrooms">
              <Input
                id="beds"
                name="beds"
                type="number"
                min={0}
                required
                defaultValue={property.beds}
              />
            </Field>
            <Field id="baths" label="Bathrooms">
              <Input
                id="baths"
                name="baths"
                type="number"
                min={0}
                required
                defaultValue={property.baths}
              />
            </Field>
            <Field id="sizeSqft" label="Size (sqft)">
              <Input
                id="sizeSqft"
                name="sizeSqft"
                type="number"
                min={0}
                required
                defaultValue={property.sizeSqft}
              />
            </Field>
          </div>
        </FormSection>

        <FormSection title="Location">
          <div className="grid gap-5 sm:grid-cols-3">
            <Field id="address" label="Address">
              <Input id="address" name="address" required defaultValue={property.location.address} />
            </Field>
            <Field id="area" label="Area">
              <Input id="area" name="area" required defaultValue={property.location.area} />
            </Field>
            <Field id="city" label="City">
              <Input id="city" name="city" required defaultValue={property.location.city} />
            </Field>
          </div>

          <Field id="amenities" label="Amenities" hint="Comma-separated.">
            <Input id="amenities" name="amenities" defaultValue={property.amenities.join(', ')} />
          </Field>
        </FormSection>

        <div className="flex flex-wrap gap-3 pt-2">
          <Button type="submit" disabled={updateProperty.isPending}>
            {updateProperty.isPending ? 'Saving…' : 'Save changes'}
          </Button>
          <Button asChild type="button" variant="outline">
            <Link to="/dashboard">Cancel</Link>
          </Button>
        </div>
      </form>
    </div>
  );
}
