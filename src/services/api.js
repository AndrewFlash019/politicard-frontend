const BASE_URL = 'https://politicard-backend.onrender.com';

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

// Map backend official to frontend format
const mapOfficial = (official, index) => ({
  id: official.id || index + 9000,
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
    const response = await fetch(`${BASE_URL}/officials/zip/${zip}`, {
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

// Register new user
export async function registerUser({ email, password, full_name, zip_code }) {
  try {
    const response = await fetch(`${BASE_URL}/auth/register`, {
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
    const response = await fetch(`${BASE_URL}/auth/login`, {
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
    const res = await fetch(`${BASE_URL}/docs`);
    return res.ok;
  } catch {
    return false;
  }
}

// Fetch county metrics by ZIP
export async function fetchMetricsByZip(zip) {
  try {
    const token = window._psToken || localStorage.getItem('politiscore_token') || '';
    const response = await fetch(`${BASE_URL}/metrics/zip/${zip}`, {
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
    const response = await fetch(`${BASE_URL}/officials/${officialId}/metrics`, {
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
    const response = await fetch(`${BASE_URL}/officials/${officialId}/donors`, {
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
    const response = await fetch(`${BASE_URL}/officials/${officialId}/funders-by-industry`, {
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
    const response = await fetch(`${BASE_URL}/officials/${officialId}/spending`, {
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

// Fetch legislative activity for a specific official by id
export async function fetchOfficialLegislation(officialId) {
  try {
    const token = window._psToken || localStorage.getItem('politiscore_token') || '';
    const response = await fetch(`${BASE_URL}/officials/${officialId}/legislation`, {
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

// Fetch real feed items (legislation, votes) by ZIP
export async function fetchFeedByZip(zip) {
  try {
    const token = window._psToken || localStorage.getItem('politiscore_token') || '';
    const response = await fetch(`${BASE_URL}/feed/zip/${zip}`, {
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
