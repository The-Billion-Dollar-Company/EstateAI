import { CalendarCheck, MessageSquareText, Search } from 'lucide-react';

import { Reveal } from '@/components/shared/Reveal';

const STEPS = [
  {
    icon: Search,
    title: 'Search or ask',
    text: 'Filter listings yourself, or describe your ideal home to the AI assistant in plain language.',
  },
  {
    icon: MessageSquareText,
    title: 'Compare & shortlist',
    text: 'Save favourites, read reviews, and get grounded recommendations with real listings only.',
  },
  {
    icon: CalendarCheck,
    title: 'Visit & close',
    text: 'Schedule visits, negotiate directly with owners, and complete your purchase or rental.',
  },
] as const;

export function HowItWorks(): React.JSX.Element {
  return (
    <section className="section container">
      <Reveal>
        <p className="type-eyebrow">How it works</p>
        <h2 className="type-h2 mt-3 max-w-lg">Three steps from "just looking" to holding the keys.</h2>
      </Reveal>

      <ol className="mt-12 grid gap-px overflow-hidden rounded-xl border border-border bg-border md:grid-cols-3">
        {STEPS.map(({ icon: Icon, title, text }, i) => (
          <li key={title} className="bg-card">
            <Reveal delay={i * 90} className="h-full">
              <div className="group flex h-full flex-col p-6 transition-colors duration-300 hover:bg-surface md:p-8">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-surface text-foreground transition-colors duration-300 group-hover:border-primary group-hover:bg-primary group-hover:text-primary-foreground">
                    <Icon size={18} strokeWidth={1.75} aria-hidden />
                  </span>
                  <span className="tabular text-xs font-semibold tracking-[0.16em] text-muted-foreground">
                    0{i + 1}
                  </span>
                </div>
                <h3 className="type-h3 mt-6">{title}</h3>
                <p className="mt-2.5 text-sm leading-6 text-muted-foreground">{text}</p>
              </div>
            </Reveal>
          </li>
        ))}
      </ol>
    </section>
  );
}
