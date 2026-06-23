const BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://politicard-backend.onrender.com';

// ─── apiFetch: timeout + 401 handling + GET retry ────────────────────────────
// Every backend call in this module goes through apiFetch so the behavior is
// consistent: a hung backend aborts after 20s instead of hanging the UI; a
// transient 5xx on an idempotent GET is retried once; a 401/403 on a request
// that carried a Bearer token clears the stale session and fires a window
// event so the UI can re-prompt for login. Callers can override via
// opts.timeoutMs / opts.noRetry; non-idempotent methods are never retried.
const DEFAULT_TIMEOUT_MS = 20000;
const RETRYABLE_STATUS = new Set([502, 503, 504]);
const RATE_LIMIT_MAX_WAIT_MS = 10000;
let _authExpiredSignaled = false;

// Parse a Retry-After header (RFC 7231 §7.1.3): either a non-negative integer
// number of seconds, or an HTTP-date. Returns ms, clamped to a sane ceiling so
// a hostile/garbled value can't hang the UI; null if header is absent.
function parseRetryAfter(header) {
  if (!header) return null;
  const secs = Number(header);
  if (Number.isFinite(secs) && secs >= 0) {
    return Math.min(Math.round(secs * 1000), RATE_LIMIT_MAX_WAIT_MS);
  }
  const when = Date.parse(header);
  if (!Number.isNaN(when)) {
    return Math.min(Math.max(0, when - Date.now()), RATE_LIMIT_MAX_WAIT_MS);
  }
  return null;
}

function signalAuthExpired() {
  if (_authExpiredSignaled) return;
  _authExpiredSignaled = true;
  try {
    window._psToken = null;
    window._psUser = null;
    localStorage.removeItem('politiscore_token');
  } catch (_) {}
  try {
    window.dispatchEvent(new CustomEvent('politiscore:auth-expired'));
  } catch (_) {}
}

async function _fetchOnce(url, opts, timeoutMs) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    return await fetch(url, { ...opts, signal: ctrl.signal });
  } catch (err) {
    if (err && err.name === 'AbortError') {
      const e = new Error(`Request timed out after ${timeoutMs}ms`);
      e.name = 'TimeoutError';
      throw e;
    }
    throw err;
  } finally {
    clearTimeout(t);
  }
}

async function apiFetch(url, opts = {}) {
  const { timeoutMs = DEFAULT_TIMEOUT_MS, noRetry = false, ...fetchOpts } = opts;
  const method = (fetchOpts.method || 'GET').toUpperCase();
  const isIdempotent = method === 'GET' || method === 'HEAD';
  const hasAuth = !!(fetchOpts.headers && fetchOpts.headers.Authorization);

  let res;
  try {
    res = await _fetchOnce(url, fetchOpts, timeoutMs);
  } catch (err) {
    if (isIdempotent && !noRetry) {
      await new Promise((r) => setTimeout(r, 400));
      res = await _fetchOnce(url, fetchOpts, timeoutMs);
    } else {
      throw err;
    }
  }

  if (isIdempotent && !noRetry && RETRYABLE_STATUS.has(res.status)) {
    await new Promise((r) => setTimeout(r, 400));
    res = await _fetchOnce(url, fetchOpts, timeoutMs);
  }

  // 429: backend slowapi rate limit. Honor Retry-After if present (capped), or
  // fall back to a fixed wait. Only retry idempotent methods — replaying a POST
  // could double-vote, double-waitlist, etc.
  if (res.status === 429 && isIdempotent && !noRetry) {
    const wait = parseRetryAfter(res.headers.get('Retry-After')) ?? 1500;
    await new Promise((r) => setTimeout(r, wait));
    res = await _fetchOnce(url, fetchOpts, timeoutMs);
  }

  if (hasAuth && (res.status === 401 || res.status === 403)) {
    signalAuthExpired();
  }

  return res;
}

// Party color mapping
const partyColor = (party) => {
  if (!party) return '#6b7280';
  const p = party.toUpperCase();
  if (p === 'R' || p === 'REPUBLICAN') return '#dc2626';
  if (p === 'D' || p === 'DEMOCRATIC' || p === 'DEMOCRAT') return '#1d4ed8';
  return '#6b7280';
};

// Level label mapping
const levelLabel = (level) => {
  if (!level) return 'Federal';
  const l = level.toLowerCase();
  if (l === 'federal') return 'Federal';
  if (l === 'state') return 'State';
  return 'Local';
};

// Map backend official to frontend format.
// `backendId` is the unambiguous backend id — set only when the backend
// actually returned an id (the `index + 9000` fallback above is a synthetic
// placeholder for rows that came back without one and must never be sent to
// /officials/<id>/* endpoints). Components consult this via apiId(o).
const mapOfficial = (official, index) => ({
  id: official.id || index + 9000,
  backendId: official.id != null ? official.id : null,
  name: official.name || 'Unknown Official',
  title: official.office || official.title || 'Elected Official',
  party: official.party ? official.party.charAt(0).toUpperCase() : '?',
  level: levelLabel(official.level),
  followers: '—',
  approval: null,
  typologyMatch: null,
  bio: official.bio || `${official.name} serves as ${official.office || 'an elected official'}.`,
  image: official.photo_url || null,
  avatar: official.party?.toUpperCase().startsWith('R') ? '🏛️' : '🏛️',
  color: partyColor(official.party),
  category: official.category || null,
  district: official.district || null,
  website: official.website || null,
  phone: official.phone || null,
  email: official.email || null,
  posts: [],
  _live: true, // flag to indicate this is real data
});

// Fetch officials by ZIP code from live backend
export async function fetchOfficialsByZip(zip) {
  try {
    const token = window._psToken || localStorage.getItem('politiscore_token') || '';
    const response = await apiFetch(`${BASE_URL}/officials/zip/${zip}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
    });

    if (!response.ok) {
      throw new Error(`Backend returned ${response.status}`);
    }

    const data = await response.json();

    // Backend returns { federal: [...], state: [...] } or a flat array
    let officials = [];
    if (Array.isArray(data)) {
      officials = data;
    } else {
      if (data.federal) officials = [...officials, ...data.federal];
      if (data.state) officials = [...officials, ...data.state];
      if (data.local) officials = [...officials, ...data.local];
      if (data.officials) officials = data.officials;
    }

    return {
      success: true,
      officials: officials.map(mapOfficial),
    };
  } catch (err) {
    console.error('PolitiCard API error:', err);
    return { success: false, error: err.message, officials: [] };
  }
}

// Free-text search across FL officials by name, county, city, or title.
// Returns { results, count }. Sub-2-char queries short-circuit before any
// network call. Network failures and 4xx/5xx responses both degrade to an
// empty result rather than throwing, so the caller can just read .results.
export async function searchOfficials(query) {
  const q = (query || '').trim();
  if (q.length < 2) return { results: [], count: 0 };
  try {
    const r = await apiFetch(`${BASE_URL}/officials/search?q=${encodeURIComponent(q)}`);
    if (!r.ok) return { results: [], count: 0 };
    return await r.json();
  } catch (_) {
    return { results: [], count: 0 };
  }
}

// Register new user
export async function registerUser({ email, password, full_name, zip_code }) {
  try {
    const response = await apiFetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, full_name, zip_code }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || 'Registration failed');
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// Login user
export async function loginUser({ email, password }) {
  try {
    const response = await apiFetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || 'Login failed');
    // Store token in memory
    if (data.access_token) {
      window._psToken = data.access_token;
      window._psUser = data.user || { email };
      localStorage.setItem('politiscore_token', data.access_token);
    }
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// Fetch the authenticated caller's own profile from /users/me. The backend
// validates the JWT and returns only that user's row (UserResponse schema —
// never hashed_password or recovery_token). Returns { success, data } with
// data.full_name when authenticated; { success:false } on missing/invalid
// token (apiFetch fires the politiscore:auth-expired event on 401).
export async function fetchMyProfile() {
  const token = window._psToken || localStorage.getItem('politiscore_token') || '';
  if (!token) return { success: false, error: 'no_token' };
  try {
    const response = await apiFetch(`${BASE_URL}/users/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      return { success: false, error: `status_${response.status}` };
    }
    const data = await response.json();
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// Logout
export function logoutUser() {
  window._psToken = null;
  window._psUser = null;
  localStorage.removeItem('politiscore_user');
  localStorage.removeItem('politiscore_zip');
  localStorage.removeItem('politiscore_token');
}

// Health check
export async function checkBackendHealth() {
  try {
    const res = await apiFetch(`${BASE_URL}/docs`);
    return res.ok;
  } catch {
    return false;
  }
}

// Fetch county metrics by ZIP
export async function fetchMetricsByZip(zip) {
  try {
    const token = window._psToken || localStorage.getItem('politiscore_token') || '';
    const response = await apiFetch(`${BASE_URL}/metrics/zip/${zip}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
    });

    if (!response.ok) {
      throw new Error(`Backend returned ${response.status}`);
    }

    const data = await response.json();
    return { success: true, data };
  } catch (err) {
    console.error('PolitiCard metrics error:', err);
    return { success: false, data: null };
  }
}

// Fetch metrics relevant to a specific official by id
export async function fetchOfficialMetrics(officialId) {
  try {
    const token = window._psToken || localStorage.getItem('politiscore_token') || '';
    const response = await apiFetch(`${BASE_URL}/officials/${officialId}/metrics`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
    });

    if (response.status === 404) {
      return { success: true, items: [] };
    }
    if (!response.ok) {
      throw new Error(`Backend returned ${response.status}`);
    }

    const data = await response.json();
    return { success: true, items: Array.isArray(data) ? data : [] };
  } catch (err) {
    console.error('PolitiCard official metrics error:', err);
    return { success: false, items: [] };
  }
}

// Fetch FEC campaign finance data for a specific official by id
export async function fetchOfficialDonors(officialId) {
  try {
    const token = window._psToken || localStorage.getItem('politiscore_token') || '';
    const response = await apiFetch(`${BASE_URL}/officials/${officialId}/donors`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
    });

    if (response.status === 404) {
      return { success: true, data: null };
    }
    if (!response.ok) {
      throw new Error(`Backend returned ${response.status}`);
    }

    const data = await response.json();
    const hasData = data && typeof data === 'object' && Object.keys(data).length > 0;
    return { success: true, data: hasData ? data : null };
  } catch (err) {
    console.error('PolitiCard official donors error:', err);
    return { success: false, data: null };
  }
}

// Fetch funders grouped by industry for a specific official
export async function fetchOfficialFundersByIndustry(officialId) {
  try {
    const token = window._psToken || localStorage.getItem('politiscore_token') || '';
    const response = await apiFetch(`${BASE_URL}/officials/${officialId}/funders-by-industry`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
    });

    if (response.status === 404) {
      return { success: true, items: [] };
    }
    if (!response.ok) {
      throw new Error(`Backend returned ${response.status}`);
    }

    const data = await response.json();
    return { success: true, items: Array.isArray(data) ? data : [] };
  } catch (err) {
    console.error('PolitiCard funders-by-industry error:', err);
    return { success: false, items: [] };
  }
}

// Fetch campaign spending breakdown for a specific official
export async function fetchOfficialSpending(officialId) {
  try {
    const token = window._psToken || localStorage.getItem('politiscore_token') || '';
    const response = await apiFetch(`${BASE_URL}/officials/${officialId}/spending`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
    });

    if (response.status === 404) {
      return { success: true, data: null };
    }
    if (!response.ok) {
      throw new Error(`Backend returned ${response.status}`);
    }

    const data = await response.json();
    return { success: true, data };
  } catch (err) {
    console.error('PolitiCard spending error:', err);
    return { success: false, data: null };
  }
}

// Top expenditures (FEC schedule_b-derived) for a specific official.
// Returns {success, data} where data is null when the backend has no
// expenditure data for this official (so the UI can hide the section).
export async function fetchOfficialExpenditures(officialId) {
  try {
    const token = window._psToken || localStorage.getItem('politiscore_token') || '';
    const response = await apiFetch(`${BASE_URL}/officials/${officialId}/expenditures`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
    });
    if (response.status === 404) {
      return { success: true, data: null };
    }
    if (!response.ok) {
      throw new Error(`Backend returned ${response.status}`);
    }
    const data = await response.json();
    return { success: true, data };
  } catch (err) {
    console.error('PolitiCard expenditures error:', err);
    return { success: false, data: null };
  }
}

// Fetch legislative activity for a specific official by id
export async function fetchOfficialLegislation(officialId) {
  try {
    const token = window._psToken || localStorage.getItem('politiscore_token') || '';
    const response = await apiFetch(`${BASE_URL}/officials/${officialId}/legislation`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
    });

    if (response.status === 404) {
      return { success: true, items: [] };
    }
    if (!response.ok) {
      throw new Error(`Backend returned ${response.status}`);
    }

    const data = await response.json();
    return { success: true, items: Array.isArray(data) ? data : [] };
  } catch (err) {
    console.error('PolitiCard legislation error:', err);
    return { success: false, items: [] };
  }
}

// Fetch accountability scorecard for a specific official
export async function fetchOfficialScorecard(officialId) {
  try {
    const token = window._psToken || localStorage.getItem('politiscore_token') || '';
    const response = await apiFetch(`${BASE_URL}/officials/${officialId}/accountability-scorecard`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
    });

    if (response.status === 404) {
      return { success: true, data: null };
    }
    if (!response.ok) {
      throw new Error(`Backend returned ${response.status}`);
    }

    const data = await response.json();
    return { success: true, data };
  } catch (err) {
    console.error('PolitiCard scorecard error:', err);
    return { success: false, data: null };
  }
}

// Fetch real feed items (legislation, votes) by ZIP — legacy endpoint
export async function fetchFeedByZip(zip) {
  try {
    const token = window._psToken || localStorage.getItem('politiscore_token') || '';
    const response = await apiFetch(`${BASE_URL}/feed/zip/${zip}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
    });

    if (!response.ok) {
      throw new Error(`Backend returned ${response.status}`);
    }

    const data = await response.json();
    return { success: true, items: data.items || [], total: data.total_count || 0 };
  } catch (err) {
    console.error('PolitiCard feed error:', err);
    return { success: false, items: [], total: 0 };
  }
}

// All constituent_votes the given user has cast on bills tied to this official.
// Returns Map-friendly { votes: [{feed_card_id, position}] }.
export async function fetchOfficialMyVotes(officialId, userId) {
  if (!userId) return { success: false, votes: [] };
  try {
    const params = new URLSearchParams({ user_id: userId });
    const token = window._psToken || localStorage.getItem('politiscore_token') || '';
    const url = `${BASE_URL}/officials/${officialId}/my-votes?${params.toString()}`;
    const response = await apiFetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
    });
    if (!response.ok) throw new Error(`Backend returned ${response.status}`);
    const data = await response.json();
    return { success: true, votes: Array.isArray(data?.votes) ? data.votes : [] };
  } catch (err) {
    console.error('PolitiCard my-votes error:', err);
    return { success: false, votes: [] };
  }
}

// Drill-down: legislative_activity records behind a scorecard metric.
// activity_type: 'bill_sponsored' | 'bill_cosponsored' | 'vote' | 'committee'
export async function fetchOfficialLegislativeActivity(officialId, { activityType, status, limit = 25, offset = 0 } = {}) {
  try {
    const params = new URLSearchParams();
    if (activityType) params.set('type', activityType);
    if (status) params.set('status', status);
    params.set('limit', String(limit));
    params.set('offset', String(offset));
    const token = window._psToken || localStorage.getItem('politiscore_token') || '';
    const url = `${BASE_URL}/officials/${officialId}/legislative-activity?${params.toString()}`;
    const response = await apiFetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
    });
    if (!response.ok) throw new Error(`Backend returned ${response.status}`);
    const data = await response.json();
    return { success: true, data };
  } catch (err) {
    console.error('PolitiCard drilldown error:', err);
    return { success: false, data: null, error: String(err.message || err) };
  }
}

// Feed Engine v1: structured per-ZIP response with today's brief, since-last-visit,
// this-week, your-officials, and coming-up sections.
export async function fetchFeedV1(zip, { lastVisit, limit = 20, offset = 0 } = {}) {
  try {
    const params = new URLSearchParams();
    if (lastVisit) params.set('last_visit', lastVisit);
    params.set('limit', String(limit));
    params.set('offset', String(offset));
    const token = window._psToken || localStorage.getItem('politiscore_token') || '';
    const response = await apiFetch(`${BASE_URL}/feed/${zip}?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
    });
    if (!response.ok) throw new Error(`Backend returned ${response.status}`);
    const data = await response.json();
    return {
      success: true,
      data: {
        zipCode: data.zip_code,
        county: data.county || null,
        today: data.today || { brief: null },
        sinceLastVisit: data.since_last_visit || [],
        thisWeek: data.this_week || [],
        yourOfficials: data.your_officials || [],
        comingUp: data.coming_up || [],
        activeCardCount: data.active_card_count || 0,
        lastRefreshAt: data.last_refresh_at || null,
      },
    };
  } catch (err) {
    console.error('PolitiCard feed v1 error:', err);
    return { success: false, data: null, error: String(err.message || err) };
  }
}

// ─── Stream feed: chronological mix of legislative_activity for a ZIP ───────
// Stream endpoint can take longer than the default 20s under load (large
// constituent_votes aggregates on the backend), so give it a 30s ceiling.
export async function fetchFeedStream(zip, { limit = 50, offset = 0 } = {}) {
  try {
    const params = new URLSearchParams({ limit: String(limit), offset: String(offset) });
    const url = `${BASE_URL}/feed/${zip}/stream?${params.toString()}`;
    const r = await apiFetch(url, { method: 'GET', headers: { 'Content-Type': 'application/json' }, timeoutMs: 30000 });
    if (!r.ok) throw new Error(`Backend returned ${r.status}`);
    const data = await r.json();
    return { success: true, data };
  } catch (err) {
    console.error('PolitiCard stream error:', err);
    return { success: false, data: null, error: String(err.message || err) };
  }
}

// ─── Notices: public-notice digests for the user's ZIP ─────────────────────
// Backed by /announcements/{zip}/stream which reads announcement_daily_digest.
// One returned row per (category, county, municipality, notice_date) bucket;
// each row carries an items[] array the UI expands inline.
export async function fetchAnnouncementsStream(zip, { limit = 50, offset = 0 } = {}) {
  try {
    const params = new URLSearchParams({ limit: String(limit), offset: String(offset) });
    const url = `${BASE_URL}/announcements/${zip}/stream?${params.toString()}`;
    const r = await apiFetch(url, { method: 'GET', headers: { 'Content-Type': 'application/json' }, timeoutMs: 30000 });
    if (!r.ok) throw new Error(`Backend returned ${r.status}`);
    const data = await r.json();
    return { success: true, data };
  } catch (err) {
    console.error('PolitiCard notices error:', err);
    return { success: false, data: null, error: String(err.message || err) };
  }
}

// ─── Constituent vote: support / oppose / neutral on a feed card ────────────
let _ANON_USER_ID = null;
function anonUserId() {
  if (_ANON_USER_ID) return _ANON_USER_ID;
  try {
    let stored = localStorage.getItem('politicard_anon_uid');
    if (!stored) {
      stored = 'anon-' + Math.random().toString(36).slice(2) + Date.now().toString(36);
      localStorage.setItem('politicard_anon_uid', stored);
    }
    _ANON_USER_ID = stored;
  } catch (_) {
    _ANON_USER_ID = 'anon-volatile-' + Math.random().toString(36).slice(2);
  }
  return _ANON_USER_ID;
}

export async function postConstituentVote({ officialId, feedCardId, position }) {
  try {
    const r = await apiFetch(`${BASE_URL}/constituent-votes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        official_id: officialId,
        feed_card_id: feedCardId,
        position,
        user_id: anonUserId(),
      }),
    });
    if (!r.ok) throw new Error(`Backend returned ${r.status}`);
    return { success: true, data: await r.json() };
  } catch (err) {
    console.error('PolitiCard constituent vote error:', err);
    return { success: false, data: null };
  }
}

// ─── Per-official committees ────────────────────────────────────────────────
export async function fetchOfficialCommittees(officialId) {
  try {
    const r = await apiFetch(`${BASE_URL}/officials/${officialId}/committees`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    if (r.status === 404) return { success: true, items: [] };
    if (!r.ok) throw new Error(`Backend returned ${r.status}`);
    const data = await r.json();
    return { success: true, items: Array.isArray(data) ? data : [] };
  } catch (err) {
    console.error('PolitiCard committees error:', err);
    return { success: false, items: [] };
  }
}

// ─── Civic engagement (level + total votes) for a user_id ───────────────────
export async function fetchUserEngagement(userId) {
  try {
    const r = await apiFetch(`${BASE_URL}/users/${encodeURIComponent(userId)}/engagement`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!r.ok) throw new Error(`Backend returned ${r.status}`);
    return { success: true, data: await r.json() };
  } catch (err) {
    console.error('PolitiCard engagement error:', err);
    return { success: false, data: null };
  }
}

// ─── Per-official alignment for a user_id ───────────────────────────────────
export async function fetchOfficialAlignment(officialId, userId) {
  try {
    const url = `${BASE_URL}/officials/${officialId}/alignment?user_id=${encodeURIComponent(userId)}`;
    const r = await apiFetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!r.ok) throw new Error(`Backend returned ${r.status}`);
    return { success: true, data: await r.json() };
  } catch (err) {
    console.error('PolitiCard alignment error:', err);
    return { success: false, data: null };
  }
}

// ─── Waitlist ────────────────────────────────────────────────────────────────
export async function postWaitlist({ email, zipCode, source }) {
  try {
    const r = await apiFetch(`${BASE_URL}/waitlist`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        zip_code: zipCode || null,
        source: source || 'organic',
      }),
    });
    if (!r.ok) {
      let detail = '';
      try { detail = (await r.json()).detail || ''; } catch (_) {}
      throw new Error(detail || `Backend returned ${r.status}`);
    }
    return { success: true, data: await r.json() };
  } catch (err) {
    return { success: false, error: String(err.message || err) };
  }
}

// ─── Health (used by launch checklist page) ──────────────────────────────────
export async function fetchHealth() {
  try {
    const r = await apiFetch(`${BASE_URL}/health`);
    if (!r.ok) throw new Error(`Backend returned ${r.status}`);
    return { success: true, data: await r.json() };
  } catch (err) {
    return { success: false, error: String(err.message || err) };
  }
}

// ─── Password recovery ──────────────────────────────────────────────────────
export async function postForgotPassword(email) {
  try {
    const r = await apiFetch(`${BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    if (!r.ok) throw new Error(`Backend returned ${r.status}`);
    return { success: true, data: await r.json() };
  } catch (err) {
    return { success: false, error: String(err.message || err) };
  }
}

export async function postResetPassword({ token, newPassword }) {
  try {
    const r = await apiFetch(`${BASE_URL}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, new_password: newPassword }),
    });
    if (!r.ok) {
      let detail = '';
      try { detail = (await r.json()).detail || ''; } catch (_) {}
      throw new Error(detail || `Backend returned ${r.status}`);
    }
    return { success: true, data: await r.json() };
  } catch (err) {
    return { success: false, error: String(err.message || err) };
  }
}

// ─── Official feedback (from staleness modal) ───────────────────────────────
export async function postOfficialFeedback({ officialId, note, category, reporterUserId }) {
  try {
    const r = await apiFetch(`${BASE_URL}/feedback/official-error`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        official_id: officialId,
        note,
        category: category || null,
        reporter_user_id: reporterUserId || null,
      }),
    });
    if (!r.ok) throw new Error(`Backend returned ${r.status}`);
    return { success: true, data: await r.json() };
  } catch (err) {
    return { success: false, error: String(err.message || err) };
  }
}

// ─── Crime trend + misconduct cases (best-effort) ───────────────────────────
export async function fetchCrimeTrend(officialId) {
  try {
    const r = await apiFetch(`${BASE_URL}/officials/${officialId}/crime-trend`);
    if (!r.ok) throw new Error(`Backend returned ${r.status}`);
    return { success: true, data: await r.json() };
  } catch (err) {
    return { success: false, data: null, error: String(err.message || err) };
  }
}

export async function fetchMisconductCases(officialId) {
  try {
    const r = await apiFetch(`${BASE_URL}/officials/${officialId}/misconduct-cases`);
    if (!r.ok) throw new Error(`Backend returned ${r.status}`);
    return { success: true, data: await r.json() };
  } catch (err) {
    return { success: false, data: null, error: String(err.message || err) };
  }
}

// Sheriff cost-to-taxpayers (lawsuit summary + per-case detail + budget trends).
// Backend returns { available: false } for non-sheriff officials or those
// without sheriff_cost_to_taxpayers view data; callers should hide the section
// in that case.
export async function fetchOfficialCostToTaxpayers(officialId) {
  try {
    const r = await apiFetch(`${BASE_URL}/officials/${officialId}/cost-to-taxpayers`);
    if (!r.ok) throw new Error(`Backend returned ${r.status}`);
    return { success: true, data: await r.json() };
  } catch (err) {
    return { success: false, data: null, error: String(err.message || err) };
  }
}

// ─── Recent votes by this user, joined to bill metadata ────────────────────
export async function fetchUserRecentVotes(userId, { limit = 10 } = {}) {
  if (!userId) return { success: false, items: [] };
  try {
    const r = await apiFetch(`${BASE_URL}/users/${encodeURIComponent(userId)}/votes?limit=${limit}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!r.ok) throw new Error(`Backend returned ${r.status}`);
    const data = await r.json();
    return { success: true, items: Array.isArray(data?.items) ? data.items : [] };
  } catch (err) {
    console.error('PolitiScore user votes error:', err);
    return { success: false, items: [], error: String(err.message || err) };
  }
}

// ─── Typology quiz ───────────────────────────────────────────────────────────
// Quiz endpoints get a 45s timeout instead of the default 20s. The backend
// lives on Render's free tier and spins down after ~15min idle; a cold start
// can take 30-50s. Users hit "Take the quiz" rarely enough that they almost
// always trigger that cold start, and a 20s abort surfaces as "Failed to
// fetch" in the UI.
const QUIZ_TIMEOUT_MS = 45000;

export async function fetchTypologyQuestions() {
  try {
    const r = await apiFetch(`${BASE_URL}/typology/questions`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      timeoutMs: QUIZ_TIMEOUT_MS,
    });
    if (!r.ok) throw new Error(`Backend returned ${r.status}`);
    return { success: true, data: await r.json() };
  } catch (err) {
    console.error('PolitiScore typology questions error:', err);
    return { success: false, data: null, error: String(err.message || err) };
  }
}

export async function submitTypologyQuiz({ userId, answers }) {
  try {
    const r = await apiFetch(`${BASE_URL}/typology/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, answers }),
      timeoutMs: QUIZ_TIMEOUT_MS,
    });
    if (!r.ok) throw new Error(`Backend returned ${r.status}`);
    return { success: true, data: await r.json() };
  } catch (err) {
    console.error('PolitiScore typology submit error:', err);
    return { success: false, data: null, error: String(err.message || err) };
  }
}

// Composite roll-up for chief-executive offices and the shared-context
// layer of collegial bodies. Returns components + per-component
// benchmark_method so the UI can render the drill-down + footnote
// without a second round-trip.
export async function fetchOfficialComposite(officialId) {
  try {
    const r = await apiFetch(`${BASE_URL}/api/v1/officials/${officialId}/composite`);
    if (r.status === 404) return { success: true, data: null };
    if (!r.ok) throw new Error(`Backend returned ${r.status}`);
    return { success: true, data: await r.json() };
  } catch (err) {
    console.error('PolitiScore composite error:', err);
    return { success: false, data: null, error: String(err.message || err) };
  }
}

// fl_municipalities row for the official's city — drives the
// strong_mayor / council_manager / null treatment in the input-output
// loop. The endpoint may not exist yet (Phase 3b); a 404 is treated as
// "no row" rather than an error so the UI falls back to the neutral
// default.
export async function fetchMunicipalityForm(city, county) {
  if (!city) return { success: true, data: null };
  try {
    const qs = new URLSearchParams({ city, ...(county ? { county } : {}) }).toString();
    const r = await apiFetch(`${BASE_URL}/api/v1/municipalities?${qs}`);
    if (r.status === 404) return { success: true, data: null };
    if (!r.ok) throw new Error(`Backend returned ${r.status}`);
    return { success: true, data: await r.json() };
  } catch (err) {
    // Endpoint may not be wired yet; treat as silent neutral fallback.
    return { success: true, data: null, error: String(err.message || err) };
  }
}

// Justice-pipeline composition layer for a county. Returns the ordered
// stage list (population through sentencing) with every stage included,
// even those still awaiting upstream data, so the UI can render the
// structural placeholders honestly. Endpoint already wraps in
// {success, data}; the helper unwraps to match the shape of the other
// fetchers in this module.
export async function fetchCountyJusticePipeline(county) {
  if (!county) return { success: true, data: null };
  try {
    const path = `/api/v1/counties/${encodeURIComponent(county)}/justice-pipeline`;
    const r = await apiFetch(`${BASE_URL}${path}`);
    if (r.status === 404) return { success: true, data: null };
    if (!r.ok) throw new Error(`Backend returned ${r.status}`);
    const body = await r.json();
    // Endpoint shape: { success: true, data: {...} } — unwrap.
    if (body && typeof body === 'object' && 'success' in body && 'data' in body) {
      return { success: body.success, data: body.data };
    }
    return { success: true, data: body };
  } catch (err) {
    console.error('PolitiCard justice-pipeline error:', err);
    return { success: false, data: null, error: String(err.message || err) };
  }
}

// One district's full record — geometry, accountability chain,
// demographics, statewide benchmark. Backend already wraps in
// {success, data}; the helper unwraps to match the shape of the
// other fetchers in this module.
export async function fetchDistrict(planType, label) {
  if (!planType || label == null) return { success: true, data: null };
  try {
    const path = `/api/v1/districts/${encodeURIComponent(planType)}/${encodeURIComponent(label)}`;
    const r = await apiFetch(`${BASE_URL}${path}`);
    if (r.status === 404) return { success: true, data: null };
    if (!r.ok) throw new Error(`Backend returned ${r.status}`);
    const body = await r.json();
    if (body && typeof body === 'object' && 'success' in body && 'data' in body) {
      return { success: body.success, data: body.data };
    }
    return { success: true, data: body };
  } catch (err) {
    console.error('PolitiCard district error:', err);
    return { success: false, data: null, error: String(err.message || err) };
  }
}

// Unified findings layer (audit_findings + county_cafr_audits +
// document_findings). Returns null when the official has no findings —
// the frontend hides the section entirely rather than rendering "clean,"
// because absence here is not exoneration.
export async function fetchOfficialFindings(officialId) {
  if (officialId == null) return { success: true, data: null };
  try {
    const r = await apiFetch(`${BASE_URL}/api/v1/officials/${officialId}/findings`);
    if (r.status === 404) return { success: true, data: null };
    if (!r.ok) throw new Error(`Backend returned ${r.status}`);
    const data = await r.json();
    return { success: true, data };
  } catch (err) {
    console.error('PolitiCard findings error:', err);
    return { success: false, data: null, error: String(err.message || err) };
  }
}
