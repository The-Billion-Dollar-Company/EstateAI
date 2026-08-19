import { CountUp } from '@/components/shared/CountUp';
import { Reveal } from '@/components/shared/Reveal';

const STATS = [
  { value: '1,200+', label: 'Active listings' },
  { value: '15', label: 'Cities covered' },
  { value: '4.7/5', label: 'Average owner rating' },
  { value: '900+', label: 'Visits scheduled' },
] as const;

export function StatsStrip(): React.JSX.Element {
  return (
    <section className="border-y border-border bg-surface">
      <dl className="container grid grid-cols-2 gap-x-8 gap-y-10 py-14 md:grid-cols-4 md:py-16">
        {STATS.map((stat, i) => (
          <Reveal key={stat.label} delay={i * 60}>
            <dd className="font-display text-[2.25rem] font-semibold leading-none tracking-[-0.02em] text-foreground md:text-[2.75rem]">
              <CountUp value={stat.value} />
            </dd>
            <dt className="mt-3 text-sm text-muted-foreground">{stat.label}</dt>
          </Reveal>
        ))}
      </dl>
    </section>
  );
}
