"use client";

import { useState, useEffect, useRef } from "react";

interface AnimatedCounterProps {
  end: number;
  suffix?: string;
  prefix?: string;
  delay?: number;
}

export function AnimatedCounter({ end, suffix = "", prefix = "", delay = 0 }: AnimatedCounterProps) {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element || hasAnimated) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasAnimated(true);
          observer.disconnect();

          // Delay antes de empezar la animacion
          const startTimeout = setTimeout(() => {
            const duration = 1500;
            const steps = 40;
            const increment = end / steps;
            let current = 0;

            const timer = setInterval(() => {
              current += increment;
              if (current >= end) {
                setCount(end);
                clearInterval(timer);
              } else {
                setCount(Math.floor(current));
              }
            }, duration / steps);
          }, delay);

          return () => clearTimeout(startTimeout);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [end, delay, hasAnimated]);

  return (
    <span
      ref={ref}
      style={{ minWidth: '3ch', display: 'inline-block' }}
      suppressHydrationWarning
    >
      {prefix}
      {count.toLocaleString("es-AR")}
      {suffix}
    </span>
  );
}
