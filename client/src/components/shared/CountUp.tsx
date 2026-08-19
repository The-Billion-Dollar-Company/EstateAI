import { useEffect, useState } from 'react';

import { useReveal } from '@/hooks/use-reveal';

interface Props {
  /** Target string, e.g. "1,200+" or "4.7/5" — digits animate, suffix stays. */
  value: string;
  durationMs?: number;
}

const REDUCED_MOTION =
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/** Counts numeric prefix up from 0 when scrolled into view. */
export function CountUp({ value, durationMs = 900 }: Props): React.JSX.Element {
  const { ref, isVisible } = useReveal<HTMLSpanElement>();
  const match = /^([\d,.]+)(.*)$/.exec(value);
  const target = match?.[1] ? Number(match[1].replaceAll(',', '')) : NaN;
  const suffix = match?.[2] ?? '';
  const isDecimal = (match?.[1] ?? '').includes('.');
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!isVisible || Number.isNaN(target) || REDUCED_MOTION) return;
    let frame = 0;
    const start = performance.now();
    const tick = (now: number): void => {
      const progress = Math.min((now - start) / durationMs, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCurrent(target * eased);
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    // Snap to target even if rAF is throttled (backgrounded/embedded views).
    const settle = window.setTimeout(() => setCurrent(target), durationMs + 150);
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(settle);
    };
  }, [isVisible, target, durationMs]);

  if (Number.isNaN(target)) return <span ref={ref}>{value}</span>;

  const shown = isVisible && !REDUCED_MOTION ? current : REDUCED_MOTION ? target : 0;
  const formatted = isDecimal
    ? shown.toFixed(1)
    : Math.round(shown).toLocaleString('en-US');
  return (
    <span ref={ref} className="tabular-nums">
      {isVisible || REDUCED_MOTION ? formatted : '0'}
      {suffix}
    </span>
  );
}
