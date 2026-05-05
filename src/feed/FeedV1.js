import React, { useCallback, useEffect, useState } from 'react';
import { useStreak } from './useStreak';
import { fetchFeedStream, postConstituentVote } from '../services/api';
import './FeedV1.css';

const HOURS_24_MS = 24 * 60 * 60 * 1000;
const PAGE_SIZE = 50;
const LAST_VISIT_KEY = 'politiscore_last_visit';

function relativeFromIso(iso) {
  if (!iso) return '';
  const ts = new Date(iso);
  const ms = Date.now() - ts.getTime();
  if (Number.isNaN(ms)) return '';
  const mins = Math.floor(ms / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} minute${mins === 1 ? '' : 's'} ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs === 1 ? '' : 's'} ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return 'yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} week${Math.floor(days / 7) === 1 ? '' : 's'} ago`;
  if (days < 365) return `${Math.floor(days / 30)} month${Math.floor(days / 30) === 1 ? '' : 's'} ago`;
  return `${Math.floor(days / 365)} year${Math.floor(days / 365) === 1 ? '' : 's'} ago`;
}

function relativeFromDate(date) {
  if (!date) return '';
  // backend date column is YYYY-MM-DD; normalise to local noon to dodge TZ flips
  const iso = typeof date === 'string' && date.length === 10 ? `${date}T12:00:00` : date;
  return relativeFromIso(iso);
}

function activityIcon(activity_type, vote_position) {
  if (activity_type === 'vote') {
    if ((vote_position || '').toLowerCase().startsWith('y')) return '✅';
    if ((vote_position || '').toLowerCase().startsWith('n')) return '❌';
    return '🗳️';
  }
  if (activity_type === 'bill_sponsored') return '📜';
  if (activity_type === 'bill_cosponsored') return '🤝';
  if (activity_type === 'committee') return '🏛️';
  return '📰';
}

function levelBadge(level) {
  const v = (level || '').toLowerCase();
  if (v === 'federal') return { label: 'FEDERAL', color: '#7c3aed' };
  if (v === 'state') return { label: 'STATE', color: '#0891b2' };
  if (v === 'local') return { label: 'LOCAL', color: '#16a34a' };
  return null;
}

// ---------------------------------------------------------------------------
// WelcomeBack header (unchanged from prior implementation)
// ---------------------------------------------------------------------------

function WelcomeBack({ userName, lastVisitIso, streak }) {
  if (!lastVisitIso) return null;
  const ms = Date.now() - new Date(lastVisitIso).getTime();
  if (Number.isNaN(ms) || ms < HOURS_24_MS) return null;
  const tone = ms > 7 * HOURS_24_MS * 24 ? "It's been a while." : `Welcome back, ${userName || 'voter'}.`;
  return (
    <header className="fcv1-welcome">
      <div className="fcv1-welcome-text">
        <h1 className="fcv1-welcome-title">{tone}</h1>
        <p className="fcv1-welcome-sub">Latest activity from your reps, newest first.</p>
      </div>
      {streak > 1 && (
        <div className="fcv1-streak" title={`${streak}-day visit streak`}>
          <span className="fcv1-streak-icon">🔥</span>
          <span className="fcv1-streak-count">{streak}</span>
          <span className="fcv1-streak-label">day streak</span>
        </div>
      )}
    </header>
  );
}

// ---------------------------------------------------------------------------
// Stream card — bills, votes, committees, local Legistar — one shape
// ---------------------------------------------------------------------------

function StreamCard({ item, onVote }) {
  const [pending, setPending] = useState(false);
  const [myPosition, setMyPosition] = useState(null);
  const [counts, setCounts] = useState({
    support: Number(item.support_count) || 0,
    oppose: Number(item.oppose_count) || 0,
    neutral: Number(item.neutral_count) || 0,
  });

  const summary = (item.plain_english_summary && item.plain_english_summary.trim())
    || (item.description && item.description.trim())
    || null;

  const lvl = levelBadge(item.official_level);
  const icon = activityIcon(item.activity_type, item.vote_position);
  const when = relativeFromDate(item.date);

  const handleVote = async (position) => {
    if (pending) return;
    setPending(true);
    // Optimistic: bump count locally
    setCounts((c) => {
      const next = { ...c };
      if (myPosition && next[myPosition] > 0) next[myPosition] -= 1;
      next[position] = (next[position] || 0) + 1;
      return next;
    });
    setMyPosition(position);
    const result = await onVote({
      officialId: item.official_id,
      feedCardId: item.id,
      position,
    });
    setPending(false);
    if (result && result.success && result.data) {
      setCounts({
        support: result.data.support_count || 0,
        oppose: result.data.oppose_count || 0,
        neutral: result.data.neutral_count || 0,
      });
    }
  };

  const totalVotes = counts.support + counts.oppose + counts.neutral;

  return (
    <article className="fcv1-stream-card">
      <div className="fcv1-stream-top">
        <span className="fcv1-card-icon" aria-hidden="true">{icon}</span>
        <div className="fcv1-stream-title-block">
          <div className="fcv1-stream-meta-top">
            {lvl && (
              <span className="fcv1-stream-level" style={{ color: lvl.color, borderColor: lvl.color + '66' }}>
                {lvl.label}
              </span>
            )}
            {item.bill_number && <span className="fcv1-stream-bill">{item.bill_number}</span>}
            {item.vote_position && (
              <span className="fcv1-stream-vote-pos">Voted {item.vote_position}</span>
            )}
          </div>
          <h3 className="fcv1-stream-title">{item.title || '(untitled)'}</h3>
          <div className="fcv1-stream-meta-bot">
            {item.official_name && (
              <span className="fcv1-stream-official">{item.official_name}</span>
            )}
            {when && <span className="fcv1-stream-time">· {when}</span>}
            {item.status && <span className="fcv1-stream-status">· {item.status.replace(/_/g, ' ')}</span>}
          </div>
        </div>
      </div>

      {summary && <p className="fcv1-stream-summary">{summary}</p>}

      <div className="fcv1-stream-vote-row">
        <button
          className={`fcv1-vote-btn fcv1-vote-support ${myPosition === 'support' ? 'is-active' : ''}`}
          onClick={() => handleVote('support')}
          disabled={pending}
        >
          👍 Support {counts.support > 0 && <span className="fcv1-vote-count">{counts.support}</span>}
        </button>
        <button
          className={`fcv1-vote-btn fcv1-vote-oppose ${myPosition === 'oppose' ? 'is-active' : ''}`}
          onClick={() => handleVote('oppose')}
          disabled={pending}
        >
          👎 Oppose {counts.oppose > 0 && <span className="fcv1-vote-count">{counts.oppose}</span>}
        </button>
        <button
          className={`fcv1-vote-btn fcv1-vote-neutral ${myPosition === 'neutral' ? 'is-active' : ''}`}
          onClick={() => handleVote('neutral')}
          disabled={pending}
        >
          😐 Neutral {counts.neutral > 0 && <span className="fcv1-vote-count">{counts.neutral}</span>}
        </button>
        {totalVotes > 0 && (
          <span className="fcv1-vote-total">{totalVotes} vote{totalVotes === 1 ? '' : 's'}</span>
        )}
      </div>

      {(item.source_url || item.full_text_url || item.source) && (
        <div className="fcv1-card-source">
          {item.full_text_url && (
            <a href={item.full_text_url} target="_blank" rel="noreferrer noopener">
              Full text →
            </a>
          )}
          {item.full_text_url && item.source_url && <span> · </span>}
          {item.source_url ? (
            <a href={item.source_url} target="_blank" rel="noreferrer noopener">
              Source: {item.source || item.source_url}
            </a>
          ) : (
            item.source && <span>Source: {item.source}</span>
          )}
        </div>
      )}
    </article>
  );
}

// ---------------------------------------------------------------------------
// Skeleton + error
// ---------------------------------------------------------------------------

function FeedSkeleton() {
  return (
    <div className="fcv1-skeleton">
      <div className="fcv1-skel-row">
        <div className="fcv1-skel-card" />
        <div className="fcv1-skel-card" />
        <div className="fcv1-skel-card" />
      </div>
    </div>
  );
}

function FeedError({ onRetry, msg }) {
  return (
    <div className="fcv1-error">
      <p>{msg || 'Could not load feed.'}</p>
      <button onClick={onRetry} className="fcv1-error-btn">Tap to retry</button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Top-level component — single chronological stream with infinite scroll
// ---------------------------------------------------------------------------

export default function FeedV1({ zip, userName }) {
  const streak = useStreak();
  const [items, setItems] = useState([]);
  const [nextOffset, setNextOffset] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [lastVisitAtLoad, setLastVisitAtLoad] = useState(null);
  const [reloadTick, setReloadTick] = useState(0);

  // First page
  useEffect(() => {
    if (!zip) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    setItems([]);
    setNextOffset(null);
    try { setLastVisitAtLoad(localStorage.getItem(LAST_VISIT_KEY) || null); } catch (_) {}

    fetchFeedStream(zip, { limit: PAGE_SIZE, offset: 0 })
      .then((res) => {
        if (cancelled) return;
        if (!res.success || !res.data) {
          setError(res.error || 'Could not load feed.');
          return;
        }
        setItems(res.data.items || []);
        setNextOffset(res.data.next_offset);
        try { localStorage.setItem(LAST_VISIT_KEY, new Date().toISOString()); } catch (_) {}
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [zip, reloadTick]);

  const loadMore = useCallback(() => {
    if (!zip || loadingMore || nextOffset == null) return;
    setLoadingMore(true);
    fetchFeedStream(zip, { limit: PAGE_SIZE, offset: nextOffset })
      .then((res) => {
        if (!res.success || !res.data) return;
        setItems((prev) => [...prev, ...(res.data.items || [])]);
        setNextOffset(res.data.next_offset);
      })
      .finally(() => setLoadingMore(false));
  }, [zip, loadingMore, nextOffset]);

  const onVote = useCallback(async ({ officialId, feedCardId, position }) => {
    return await postConstituentVote({ officialId, feedCardId, position });
  }, []);

  if (loading) {
    return (
      <div className="tab-content fcv1-root">
        <WelcomeBack userName={userName} lastVisitIso={lastVisitAtLoad} streak={streak} />
        <FeedSkeleton />
      </div>
    );
  }
  if (error) {
    return (
      <div className="tab-content fcv1-root">
        <FeedError onRetry={() => setReloadTick((n) => n + 1)} msg={error} />
      </div>
    );
  }

  return (
    <div className="tab-content fcv1-root">
      <WelcomeBack userName={userName} lastVisitIso={lastVisitAtLoad} streak={streak} />

      {items.length === 0 ? (
        <div className="fcv1-empty-stream">
          <p>No legislative activity yet for ZIP {zip}.</p>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-3)' }}>
            We're tracking your federal, state, and local reps. Bills they introduce and votes they cast
            will appear here as they happen.
          </p>
        </div>
      ) : (
        <div className="fcv1-stream-list">
          {items.map((it) => (
            <StreamCard key={it.id} item={it} onVote={onVote} />
          ))}
        </div>
      )}

      {nextOffset != null && items.length > 0 && (
        <button
          className="fcv1-loadmore-btn"
          onClick={loadMore}
          disabled={loadingMore}
        >
          {loadingMore ? 'Loading…' : 'Load more'}
        </button>
      )}

      <footer className="fcv1-footer">
        <div className="fcv1-footer-meta">
          ZIP {zip} · {items.length} item{items.length === 1 ? '' : 's'} loaded
        </div>
      </footer>
    </div>
  );
}
