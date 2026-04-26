import { useEffect, useState } from 'react';

const STREAK_COUNT_KEY = 'politiscore_streak_count';
const STREAK_LAST_DATE_KEY = 'politiscore_streak_last_date';

function todayYMD() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function dayDiff(prevYMD, currYMD) {
  const prev = new Date(prevYMD + 'T00:00:00');
  const curr = new Date(currYMD + 'T00:00:00');
  const ms = curr.getTime() - prev.getTime();
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

/**
 * Tracks consecutive-day app opens via localStorage.
 *  - First ever visit: streak = 1
 *  - Same day reopen: no change
 *  - Next-day reopen: increment
 *  - Gap > 1 day: reset to 1
 */
export function useStreak() {
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    try {
      const today = todayYMD();
      const lastDate = localStorage.getItem(STREAK_LAST_DATE_KEY);
      const lastCount = parseInt(localStorage.getItem(STREAK_COUNT_KEY) || '0', 10);

      if (!lastDate || isNaN(lastCount) || lastCount <= 0) {
        localStorage.setItem(STREAK_COUNT_KEY, '1');
        localStorage.setItem(STREAK_LAST_DATE_KEY, today);
        setStreak(1);
        return;
      }

      if (lastDate === today) {
        setStreak(lastCount);
        return;
      }

      const diff = dayDiff(lastDate, today);
      let next;
      if (diff === 1) next = lastCount + 1;
      else next = 1;

      localStorage.setItem(STREAK_COUNT_KEY, String(next));
      localStorage.setItem(STREAK_LAST_DATE_KEY, today);
      setStreak(next);
    } catch (_) {
      setStreak(0);
    }
  }, []);

  return streak;
}
