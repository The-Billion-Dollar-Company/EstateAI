import { useEffect, useRef, useState } from 'react';

/**
 * Marks an element visible once it enters the viewport (one-shot).
 * Falls back to visible if IntersectionObserver is unavailable or never
 * fires (throttled webviews) so content is never permanently hidden.
 */
export function useReveal<T extends HTMLElement>(): {
  ref: React.RefObject<T>;
  isVisible: boolean;
} {
  const ref = useRef<T>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setIsVisible(true);
      return;
    }

    // Already on screen at mount — reveal without waiting for the observer.
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' },
    );
    observer.observe(el);

    // Safety net: reveal after 2.5s even if the observer never fires.
    const fallback = window.setTimeout(() => setIsVisible(true), 2500);
    return () => {
      observer.disconnect();
      window.clearTimeout(fallback);
    };
  }, []);

  return { ref, isVisible };
}
