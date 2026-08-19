import { Check, ChevronRight, MapPin, SearchX, Trash2 } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'sonner';

import { BookingPanel } from '@/components/property/BookingPanel';
import { PropertyGallery } from '@/components/property/PropertyGallery';
import { RelatedProperties } from '@/components/property/RelatedProperties';
import { ReviewForm } from '@/components/property/ReviewForm';
import { SaveButton } from '@/components/property/SaveButton';
import { StatusBadge } from '@/components/property/StatusBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { RatingStars } from '@/components/shared/RatingStars';
import { UserAvatar } from '@/components/shared/UserAvatar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useDeleteReview, useProperty, usePropertyReviews } from '@/hooks/queries/use-properties';
import { apiErrorMessage } from '@/lib/api';
import { formatDate, formatPrice } from '@/lib/format';
import { useAuthStore } from '@/stores/auth-store';
import type { Property } from '@/types/property';

const SECTION_LINKS = [
  { href: '#overview', label: 'Overview' },
  { href: '#about', label: 'About' },
  { href: '#amenities', label: 'Amenities' },
  { href: '#reviews', label: 'Reviews' },
] as const;

function DetailSkeleton(): React.JSX.Element {
  return (
    <div className="container py-8 md:py-10">
      <Skeleton className="h-4 w-56" />
      <div className="mt-6 grid gap-3 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        <Skeleton className="aspect-[4/3] w-full rounded-xl" />
        <div className="hidden grid-cols-2 grid-rows-2 gap-3 lg:grid">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-full min-h-32 w-full rounded-xl" />
          ))}
        </div>
      </div>
      <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-4">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-28 w-full" />
        </div>
        <Skeleton className="h-72 rounded-xl" />
      </div>
    </div>
  );
}

/** Key figures row — the three numbers buyers scan for first. */
function KeyStats({ property }: { property: Property }): React.JSX.Element {
  const stats = [
    { value: property.beds, label: property.beds === 1 ? 'Bed' : 'Beds' },
    { value: property.baths, label: property.baths === 1 ? 'Bath' : 'Baths' },
    { value: property.sizeSqft.toLocaleString('en-IN'), label: 'Sqft' },
  ];
  return (
    <dl className="flex items-center gap-6 sm:gap-10">
      {stats.map((stat) => (
        <div key={stat.label}>
          <dd className="tabular font-display text-2xl font-semibold tracking-[-0.02em]">
            {stat.value}
          </dd>
          <dt className="mt-0.5 text-sm text-muted-foreground">{stat.label}</dt>
        </div>
      ))}
    </dl>
  );
}

export function PropertyDetailPage(): React.JSX.Element {
  const { id } = useParams();
  const { data: property, isPending } = useProperty(id);
  const { data: reviews = [] } = usePropertyReviews(id);
  const deleteReview = useDeleteReview(id ?? '');
  const isAdmin = useAuthStore((s) => s.user?.role === 'admin');

  const handleDeleteReview = (reviewId: string): void => {
    deleteReview.mutate(reviewId, {
      onSuccess: () => toast.success('Review deleted'),
      onError: (err) => toast.error(apiErrorMessage(err, 'Could not delete review')),
    });
  };

  if (isPending) return <DetailSkeleton />;

  if (!property) {
    return (
      <div className="container max-w-xl py-16 md:py-24">
        <EmptyState
          icon={SearchX}
          message="This property doesn't exist or is no longer listed."
          action={
            <Button asChild variant="outline">
              <Link to="/search">Browse all properties</Link>
            </Button>
          }
        />
      </div>
    );
  }

  const pricePerSqft =
    property.sizeSqft > 0 ? Math.round(property.price / property.sizeSqft) : null;

  const facts = [
    { label: 'Property type', value: property.type },
    { label: 'Listing', value: property.listingType === 'sale' ? 'For sale' : 'For rent' },
    property.sizeSqft > 0 ? { label: 'Size', value: `${property.sizeSqft.toLocaleString('en-IN')} sqft` } : null,
    pricePerSqft !== null && property.listingType === 'sale'
      ? { label: 'Price / sqft', value: `৳ ${pricePerSqft.toLocaleString('en-IN')}` }
      : null,
    { label: 'Listed', value: formatDate(property.createdAt) },
    property.reviewCount > 0
      ? { label: 'Rating', value: `${property.avgRating.toFixed(1)} / 5 (${property.reviewCount})` }
      : null,
  ].filter((fact): fact is { label: string; value: string } => fact !== null);

  return (
    <div className="animate-fade-in">
      <div className="container py-6 md:py-8">
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-1.5 text-sm text-muted-foreground"
        >
          <Link to="/search" className="transition-colors hover:text-foreground">
            Search
          </Link>
          <ChevronRight size={14} strokeWidth={2} aria-hidden className="text-border" />
          <span className="line-clamp-1 text-foreground">{property.title}</span>
        </nav>
      </div>

      {/* Section rail + save action */}
      <div className="sticky top-16 z-30 border-y border-border bg-background/90 backdrop-blur-md md:top-[4.5rem]">
        <div className="container flex items-center justify-between gap-4">
          <nav aria-label="Sections" className="no-scrollbar flex gap-6 overflow-x-auto">
            {SECTION_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="shrink-0 border-b-2 border-transparent py-3.5 text-sm font-medium text-muted-foreground transition-colors hover:border-border hover:text-foreground"
              >
                {link.label}
              </a>
            ))}
          </nav>
          <div className="relative shrink-0">
            <SaveButton
              propertyId={property.id}
              propertyTitle={property.title}
              className="static"
            />
          </div>
        </div>
      </div>

      <div className="container pt-6 md:pt-8">
        <PropertyGallery images={property.images} title={property.title} />
      </div>

      <div className="container grid items-start gap-10 py-10 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-14 lg:py-14">
        <div className="min-w-0">
          {/* Overview */}
          <section id="overview" className="scroll-mt-32">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center rounded-full bg-secondary px-2.5 py-1 text-[0.6875rem] font-semibold tracking-wide text-secondary-foreground">
                For {property.listingType === 'sale' ? 'sale' : 'rent'}
              </span>
              <StatusBadge status={property.status} />
            </div>

            <h1 className="type-h1 mt-4">{property.title}</h1>
            <p className="mt-3 flex items-start gap-2 text-muted-foreground">
              <MapPin size={17} strokeWidth={1.75} aria-hidden className="mt-0.5 shrink-0" />
              <span>
                {property.location.address}, {property.location.area}, {property.location.city}
              </span>
            </p>

            <div className="mt-8 flex flex-wrap items-end justify-between gap-8 border-y border-border py-6">
              <p className="tabular font-display text-[2rem] font-semibold leading-none tracking-[-0.02em] md:text-[2.5rem]">
                {formatPrice(property.price, property.listingType)}
              </p>
              <KeyStats property={property} />
            </div>

            <dl className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {facts.map((fact) => (
                <div key={fact.label} className="rounded-lg bg-surface px-4 py-3">
                  <dt className="text-xs text-muted-foreground">{fact.label}</dt>
                  <dd className="mt-1 text-sm font-medium capitalize">{fact.value}</dd>
                </div>
              ))}
            </dl>
          </section>

          {/* About */}
          <section id="about" className="mt-12 scroll-mt-32">
            <h2 className="type-h3">About this property</h2>
            <p className="mt-4 max-w-prose whitespace-pre-line text-[0.9375rem] leading-8 text-muted-foreground">
              {property.description}
            </p>
          </section>

          {/* Amenities */}
          {property.amenities.length > 0 && (
            <section id="amenities" className="mt-12 scroll-mt-32">
              <h2 className="type-h3">Amenities</h2>
              <ul className="mt-5 grid gap-x-6 gap-y-3.5 sm:grid-cols-2 lg:grid-cols-3">
                {property.amenities.map((amenity) => (
                  <li key={amenity} className="flex items-start gap-2.5 text-sm">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-success/10">
                      <Check size={12} className="text-success" strokeWidth={2.5} aria-hidden />
                    </span>
                    {amenity}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Reviews */}
          <section id="reviews" className="mt-12 scroll-mt-32">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="type-h3">Reviews</h2>
              <RatingStars rating={property.avgRating} count={property.reviewCount} />
            </div>
            {property.ownerId !== useAuthStore.getState().user?.id && (
              <div className="mt-6">
                <ReviewForm propertyId={property.id} />
              </div>
            )}
            <div className="mt-6 space-y-3">
              {reviews.length === 0 && (
                <p className="rounded-xl border border-dashed border-border bg-surface/60 px-4 py-8 text-center text-sm text-muted-foreground">
                  No written reviews yet.
                </p>
              )}
              {reviews.map((review) => (
                <article key={review.id} className="surface-card p-5">
                  <div className="flex items-center gap-3">
                    <UserAvatar name={review.userName} />
                    <div className="min-w-0">
                      <p className="text-sm font-medium">{review.userName}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(review.date)}</p>
                    </div>
                    <RatingStars rating={review.rating} className="ml-auto shrink-0" />
                    {(review.isMine || isAdmin) && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="ml-1 h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
                        aria-label="Delete review"
                        disabled={deleteReview.isPending}
                        onClick={() => handleDeleteReview(review.id)}
                      >
                        <Trash2 size={15} strokeWidth={1.75} />
                      </Button>
                    )}
                  </div>
                  <p className="mt-4 text-sm leading-7 text-muted-foreground">{review.comment}</p>
                </article>
              ))}
            </div>
          </section>
        </div>

        <aside aria-label="Contact owner" className="lg:sticky lg:top-32 lg:self-start">
          <BookingPanel property={property} />
        </aside>
      </div>

      <RelatedProperties city={property.location.city} excludeId={property.id} />
    </div>
  );
}
