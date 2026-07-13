import { Check, MapPin, SearchX } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';

import { BookingPanel } from '@/components/property/BookingPanel';
import { PropertyGallery } from '@/components/property/PropertyGallery';
import { SpecIcons } from '@/components/property/SpecIcons';
import { StatusBadge } from '@/components/property/StatusBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { RatingStars } from '@/components/shared/RatingStars';
import { UserAvatar } from '@/components/shared/UserAvatar';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/format';
import { getPropertyById, getReviewsForProperty } from '@/lib/mock-data';

export function PropertyDetailPage(): React.JSX.Element {
  const { id } = useParams();
  const property = id ? getPropertyById(id) : undefined;

  if (!property) {
    return (
      <div className="container max-w-xl py-16">
        <EmptyState
          icon={SearchX}
          message="This property doesn't exist or is no longer listed."
          action={
            <Link to="/search" className="text-sm font-medium text-primary hover:underline">
              Browse all properties
            </Link>
          }
        />
      </div>
    );
  }

  const reviews = getReviewsForProperty(property.id);

  return (
    <div className="container py-8">
      <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
        <Link to="/search" className="hover:text-foreground">
          Search
        </Link>
        <span aria-hidden> / </span>
        <span className="text-foreground">{property.title}</span>
      </nav>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-8">
          <PropertyGallery images={property.images} title={property.title} />

          <div>
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="secondary" className="capitalize">
                For {property.listingType === 'sale' ? 'sale' : 'rent'}
              </Badge>
              <StatusBadge status={property.status} />
            </div>
            <h1 className="mt-3 text-3xl">{property.title}</h1>
            <p className="mt-2 flex items-center gap-2 text-muted-foreground">
              <MapPin size={16} strokeWidth={2} aria-hidden />
              {property.location.address}, {property.location.area}, {property.location.city}
            </p>
            <SpecIcons
              beds={property.beds}
              baths={property.baths}
              sizeSqft={property.sizeSqft}
              className="mt-4"
            />
          </div>

          <section aria-labelledby="about-heading">
            <h2 id="about-heading" className="text-xl">
              About this property
            </h2>
            <p className="mt-3 max-w-prose text-muted-foreground">{property.description}</p>
          </section>

          <section aria-labelledby="amenities-heading">
            <h2 id="amenities-heading" className="text-xl">
              Amenities
            </h2>
            <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {property.amenities.map((amenity) => (
                <li key={amenity} className="flex items-center gap-2 text-sm">
                  <Check size={16} className="text-success" strokeWidth={2} aria-hidden />
                  {amenity}
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="reviews-heading">
            <h2 id="reviews-heading" className="text-xl">
              Reviews
            </h2>
            <RatingStars
              rating={property.avgRating}
              count={property.reviewCount}
              className="mt-2"
            />
            <div className="mt-4 space-y-4">
              {reviews.length === 0 && (
                <p className="text-sm text-muted-foreground">No written reviews yet.</p>
              )}
              {reviews.map((review) => (
                <article key={review.id} className="rounded-lg border p-4">
                  <div className="flex items-center gap-3">
                    <UserAvatar name={review.userName} />
                    <div>
                      <p className="text-sm font-medium">{review.userName}</p>
                      <p className="text-sm text-muted-foreground">{formatDate(review.date)}</p>
                    </div>
                    <RatingStars rating={review.rating} className="ml-auto" />
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">{review.comment}</p>
                </article>
              ))}
            </div>
          </section>
        </div>

        <aside aria-label="Booking" className="lg:sticky lg:top-24 lg:self-start">
          <BookingPanel property={property} />
        </aside>
      </div>
    </div>
  );
}
