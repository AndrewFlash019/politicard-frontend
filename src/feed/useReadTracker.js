import { useCallback, useEffect, useRef, useState } from 'react';

const READ_KEY = 'politiscore_read_cards';
const VIEWPORT_DWELL_MS = 1000;

function loadReadIds() {
  try {
    const raw = localStorage.getItem(READ_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    return new Set(Array.isArray(arr) ? arr : []);
  } catch (_) {
    return new Set();
  }
}

function persistReadIds(set) {
  try {
    localStorage.setItem(READ_KEY, JSON.stringify(Array.from(set)));
  } catch (_) { /* ignore */ }
}

/**
 * Tracks which feed_card ids the user has marked read.
 * Cards are marked read when:
 *   - they remain in the viewport for >1 second (via IntersectionObserver), OR
 *   - markRead(id) is called explicitly (e.g. on click/expand).
 */
export function useReadTracker() {
  const [readIds, setReadIds] = useState(() => loadReadIds());
  const dwellTimers = useRef(new Map());
  const observerRef = useRef(null);

  const markRead = useCallback((id) => {
    if (id == null) return;
    setReadIds((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      persistReadIds(next);
      return next;
    });
  }, []);

  // Lazy-create the IntersectionObserver
  useEffect(() => {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) return;
    const timersAtMount = dwellTimers.current;
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const el = entry.target;
          const id = el.getAttribute('data-card-id');
          if (!id) return;
          if (entry.isIntersecting) {
            if (timersAtMount.has(id)) return;
            const t = setTimeout(() => {
              markRead(id);
              timersAtMount.delete(id);
            }, VIEWPORT_DWELL_MS);
            timersAtMount.set(id, t);
          } else {
            const t = timersAtMount.get(id);
            if (t) {
              clearTimeout(t);
              timersAtMount.delete(id);
            }
          }
        });
      },
      { threshold: 0.6 }
    );
    const observer = observerRef.current;
    return () => {
      observer.disconnect();
      timersAtMount.forEach(clearTimeout);
      timersAtMount.clear();
    };
  }, [markRead]);

  /**
   * Returns a ref-callback you attach to each card root via `ref={observe(id)}`.
   * Sets data-card-id on the element and registers it with the observer.
   */
  const observe = useCallback((id) => (el) => {
    if (!el || !observerRef.current) return;
    el.setAttribute('data-card-id', String(id));
    observerRef.current.observe(el);
  }, []);

  const isRead = useCallback((id) => readIds.has(String(id)), [readIds]);

  return { isRead, markRead, observe };
}
