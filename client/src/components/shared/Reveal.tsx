import { useReveal } from '@/hooks/use-reveal';
import { cn } from '@/lib/utils';

interface Props {
  children: React.ReactNode;
  /** Stagger offset in ms (30–50ms per sibling reads best). */
  delay?: number;
  className?: string;
}

/** Scroll-reveal wrapper — fades/slides children in when scrolled into view. */
export function Reveal({ children, delay = 0, className }: Props): React.JSX.Element {
  const { ref, isVisible } = useReveal<HTMLDivElement>();
  return (
    <div
      ref={ref}
      style={{ '--reveal-delay': `${delay}ms` } as React.CSSProperties}
      className={cn('reveal', isVisible && 'is-visible', className)}
    >
      {children}
    </div>
  );
}
