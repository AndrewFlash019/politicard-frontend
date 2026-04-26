import { useCallback, useEffect, useState } from 'react';
import { fetchFeedV1 } from '../services/api';

const LAST_VISIT_KEY = 'politiscore_last_visit';

export function getLastVisit() {
  try {
    return localStorage.getItem(LAST_VISIT_KEY) || null;
  } catch (_) {
    return null;
  }
}

export function setLastVisit(iso) {
  try {
    localStorage.setItem(LAST_VISIT_KEY, iso);
  } catch (_) { /* ignore */ }
}

/**
 * Loads the v1 feed for `zip` and tracks loading/error state.
 * Captures the last_visit value at fetch time so badge logic stays consistent
 * for the duration of the rendered session, then writes a new last_visit
 * timestamp AFTER the response arrives (per spec).
 */
export function useFeedV1(zip) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastVisitAtLoad, setLastVisitAtLoad] = useState(null);
  const [reloadTick, setReloadTick] = useState(0);

  useEffect(() => {
    if (!zip) return;
    let cancelled = false;
    const lv = getLastVisit();
    setLastVisitAtLoad(lv);
    setLoading(true);
    setError(null);

    fetchFeedV1(zip, { lastVisit: lv })
      .then((res) => {
        if (cancelled) return;
        if (!res.success) {
          setError(res.error || 'Could not load feed.');
          setData(null);
        } else {
          setData(res.data);
          // Only stamp last_visit AFTER a successful render
          setLastVisit(new Date().toISOString());
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [zip, reloadTick]);

  const reload = useCallback(() => setReloadTick((n) => n + 1), []);

  return { data, loading, error, lastVisitAtLoad, reload };
}
