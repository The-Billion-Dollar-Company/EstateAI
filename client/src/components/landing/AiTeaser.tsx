import { ArrowRight, Bot } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Reveal } from '@/components/shared/Reveal';
import { Button } from '@/components/ui/button';

export function AiTeaser(): React.JSX.Element {
  return (
    <section className="border-t border-border bg-surface">
      <div className="section container grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
        <Reveal>
          <p className="type-eyebrow">AI assistant</p>
          <h2 className="type-h2 mt-3">Describe it. We'll find it.</h2>
          <p className="mt-5 max-w-md text-base leading-8 text-muted-foreground">
            "A 3-bed under ৳ 40 lakh near a good school in Uttara" — that's all it takes. The
            assistant searches real listings and explains every recommendation. It never invents
            properties.
          </p>
          <Button asChild size="lg" className="press-scale mt-8 gap-2">
            <Link to="/assistant">
              Try the assistant
              <ArrowRight size={16} strokeWidth={2} aria-hidden />
            </Link>
          </Button>
        </Reveal>

        <Reveal delay={120}>
          <div className="surface-card p-6 shadow-lift md:p-8" aria-hidden>
            <div className="flex justify-end">
              <p className="max-w-[85%] rounded-2xl rounded-br-md bg-primary px-4 py-3 text-sm leading-6 text-primary-foreground">
                I need a 2-bed rental near Dhanmondi Lake, budget ৳ 40,000.
              </p>
            </div>
            <div className="mt-5 flex items-start gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-surface">
                <Bot size={15} className="text-foreground" strokeWidth={1.75} />
              </span>
              <div className="space-y-2.5">
                <p className="max-w-[92%] rounded-2xl rounded-bl-md bg-secondary px-4 py-3 text-sm leading-6 text-secondary-foreground">
                  I found 2 matches. The closest is a modern 2-bed flat on Road 8A at ৳ 38,000/mo, a
                  five-minute walk from the lake…
                </p>
                <span className="ml-1 inline-flex gap-1">
                  <i className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-muted-foreground" />
                  <i className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-muted-foreground [animation-delay:150ms]" />
                  <i className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-muted-foreground [animation-delay:300ms]" />
                </span>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
