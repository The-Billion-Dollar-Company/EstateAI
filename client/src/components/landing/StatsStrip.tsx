const STATS = [
  { value: '1,200+', label: 'Active listings' },
  { value: '15', label: 'Cities covered' },
  { value: '4.7/5', label: 'Average owner rating' },
  { value: '900+', label: 'Visits scheduled' },
] as const;

export function StatsStrip(): React.JSX.Element {
  return (
    <section className="border-y bg-primary text-primary-foreground">
      <dl className="container grid grid-cols-2 gap-8 py-12 text-center md:grid-cols-4">
        {STATS.map((stat) => (
          <div key={stat.label}>
            <dt className="order-last mt-1 text-sm opacity-80">{stat.label}</dt>
            <dd className="text-3xl font-semibold tracking-tight">{stat.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
