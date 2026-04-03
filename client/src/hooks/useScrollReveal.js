import { useEffect, useRef, useCallback } from 'react';

/**
 * Custom hook for scroll-reveal animations using IntersectionObserver.
 * Elements with [data-reveal] will animate in when they enter the viewport.
 * 
 * Automatically re-observes when new elements are added to the DOM (via MutationObserver).
 * 
 * Variants: data-reveal="fade-up" | "fade-down" | "fade-left" | "fade-right" | "zoom" | "fade"
 * Stagger: data-reveal-delay="100" (ms)
 */
const useScrollReveal = () => {
  const observerRef = useRef(null);
  const observedSet = useRef(new Set());

  const observeElements = useCallback(() => {
    if (!observerRef.current) return;
    const revealElements = document.querySelectorAll('[data-reveal]');
    revealElements.forEach((el) => {
      if (!observedSet.current.has(el) && !el.classList.contains('revealed')) {
        observerRef.current.observe(el);
        observedSet.current.add(el);
      }
    });
  }, []);

  useEffect(() => {
    const handleIntersection = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const delay = entry.target.getAttribute('data-reveal-delay') || 0;
          setTimeout(() => {
            entry.target.classList.add('revealed');
          }, parseInt(delay));
          observerRef.current?.unobserve(entry.target);
        }
      });
    };

    observerRef.current = new IntersectionObserver(handleIntersection, {
      threshold: 0.08,
      rootMargin: '0px 0px -30px 0px',
    });

    // Initial observation
    observeElements();

    // Watch for dynamically added elements (e.g. after API data loads)
    const mutationObserver = new MutationObserver(() => {
      // Debounce: use requestAnimationFrame
      requestAnimationFrame(observeElements);
    });

    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });

    const currentObservedSet = observedSet.current;

    return () => {
      observerRef.current?.disconnect();
      mutationObserver.disconnect();
      currentObservedSet.clear();
    };
  }, [observeElements]);
};

export default useScrollReveal;
