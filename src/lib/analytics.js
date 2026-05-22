// Privacy-friendly first-party analytics. Posts events to our own backend;
// no third-party scripts, no fingerprinting, no third-party cookies.
//
// Anyone can opt out by setting localStorage.analytics_opted_out = '1'
// (the Privacy Policy page exposes a button for this).

const BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://politicard-backend.onrender.com';

function optedOut() {
  try { return localStorage.getItem('analytics_opted_out') === '1'; }
  catch (_) { return false; }
}

function getAnonId() {
  try {
    let s = localStorage.getItem('politicard_anon_uid');
    if (!s) {
      s = 'anon-' + Math.random().toString(36).slice(2) + Date.now().toString(36);
      localStorage.setItem('politicard_anon_uid', s);
    }
    return s;
  } catch (_) { return 'anon-volatile'; }
}

function send(event_type, properties) {
  if (optedOut()) return;
  const body = JSON.stringify({ event_type, user_id: getAnonId(), properties: properties || {} });
  // Try the v1 path first; fall back to legacy. Fire-and-forget.
  const tryUrls = [`${BASE_URL}/api/v1/analytics/event`, `${BASE_URL}/analytics/event`];
  for (const url of tryUrls) {
    try {
      // navigator.sendBeacon is preferred — no blocking, ships during unload
      if (navigator.sendBeacon) {
        const blob = new Blob([body], { type: 'application/json' });
        if (navigator.sendBeacon(url, blob)) return;
      }
      fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body, keepalive: true })
        // eslint-disable-next-line no-console
        .catch((err) => console.warn('[analytics] send failed', event_type, err && err.message));
      return;
    } catch (_) { /* try next */ }
  }
}

export const analytics = {
  trackPageView: (page) => send('page_view', { page }),
  trackVote: (officialId, position, billNumber) =>
    send('vote_cast', { official_id: officialId, position, bill_number: billNumber }),
  trackQuizComplete: (typology) => send('quiz_complete', { typology }),
  trackSearch: (query) => send('search_query', { query }),
  trackBillExpand: (billNumber) => send('bill_expand', { bill_number: billNumber }),
  trackProfileView: (officialId) => send('profile_view', { official_id: officialId }),
  trackFeedScroll: (depth) => send('feed_scroll', { depth }),
};
