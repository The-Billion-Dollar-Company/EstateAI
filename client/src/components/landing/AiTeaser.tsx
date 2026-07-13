import { Bot, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';

export function AiTeaser(): React.JSX.Element {
  return (
    <section className="container py-16 md:py-24">
      <div className="grid items-center gap-10 md:grid-cols-2">
        <div>
          <p className="flex items-center gap-2 text-sm font-medium text-primary">
            <Sparkles size={16} strokeWidth={2} aria-hidden />
            AI assistant
          </p>
          <h2 className="mt-2 text-3xl">Describe it. We'll find it.</h2>
          <p className="mt-4 text-muted-foreground">
            "A 3-bed under ৳ 40 lakh near a good school in Uttara" — that's all it takes. The
            assistant searches real listings and explains every recommendation. It never
            invents properties.
          </p>
          <Button asChild className="mt-6">
            <Link to="/assistant">Try the assistant</Link>
          </Button>
        </div>
        <div className="rounded-lg border bg-card p-4 shadow-sm md:p-6" aria-hidden>
          <div className="flex justify-end">
            <p className="max-w-[80%] rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground">
              I need a 2-bed rental near Dhanmondi Lake, budget ৳ 40,000.
            </p>
          </div>
          <div className="mt-4 flex items-start gap-2">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <Bot size={16} className="text-primary" strokeWidth={2} />
            </span>
            <p className="max-w-[80%] rounded-lg bg-secondary px-4 py-2 text-sm">
              I found 2 matches. The closest is a modern 2-bed flat on Road 8A at ৳ 38,000/mo,
              a five-minute walk from the lake…
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
