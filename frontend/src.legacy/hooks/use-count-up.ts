import { useEffect, useRef, useState } from "react";

/**
 * Animates a number from 0 to `target` over `duration` ms
 * using requestAnimationFrame. Starts when the element enters the viewport.
 */
export function useCountUp(target: number, duration = 600) {
  const [count, setCount] = useState(0);
  const frameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLElement | null>(null);
  const hasStarted = useRef(false);

  const animate = (timestamp: number) => {
    if (startTimeRef.current === null) startTimeRef.current = timestamp;
    const elapsed = timestamp - startTimeRef.current;
    const progress = Math.min(elapsed / duration, 1);
    // Ease-out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    setCount(Math.round(eased * target));

    if (progress < 1) {
      frameRef.current = requestAnimationFrame(animate);
    }
  };

  const startAnimation = () => {
    if (hasStarted.current) return;
    hasStarted.current = true;
    frameRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          startAnimation();
          observer.disconnect();
        }
      },
      { threshold: 0.3 },
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);

  return { count, containerRef };
}
