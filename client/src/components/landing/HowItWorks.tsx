import { CalendarCheck, MessageSquareText, Search } from 'lucide-react';

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
    <section className="border-b bg-secondary/50">
      <div className="container py-16 md:py-24">
        <h2 className="text-center text-3xl">How it works</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {STEPS.map(({ icon: Icon, title, text }, i) => (
            <div key={title} className="rounded-lg border bg-card p-4 shadow-sm md:p-6">
              <div className="flex items-center gap-2">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <Icon size={20} className="text-primary" strokeWidth={2} aria-hidden />
                </span>
                <span className="text-sm font-medium text-muted-foreground">Step {i + 1}</span>
              </div>
              <h3 className="mt-4 text-lg">{title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
