import { useRef, useEffect, useState } from "react";

export function useIntersection(options?: IntersectionObserverInit) {
  const ref = useRef<HTMLDivElement>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsIntersecting(entry?.isIntersecting ?? false),
      options,
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [options]);

  return { ref, isIntersecting };
}
