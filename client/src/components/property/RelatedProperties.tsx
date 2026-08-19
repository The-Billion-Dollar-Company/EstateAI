import { PropertyCard } from '@/components/property/PropertyCard';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { useProperties } from '@/hooks/queries/use-properties';

interface Props {
  city: string;
  /** The listing currently being viewed — never show it back to the user. */
  excludeId: string;
}

/** Nearby listings, pulled from the existing search endpoint by city. */
export function RelatedProperties({ city, excludeId }: Props): React.JSX.Element | null {
  const { data } = useProperties({ city, limit: 4 });
  const related = (data?.items ?? []).filter((p) => p.id !== excludeId).slice(0, 3);

  if (related.length === 0) return null;

  return (
    <section aria-label="Related properties" className="border-t border-border">
      <div className="section-tight container">
        <SectionHeader
          eyebrow="Nearby"
          title={`More properties in ${city}`}
          className="[&_h2]:!text-2xl"
        />
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {related.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      </div>
    </section>
  );
}
