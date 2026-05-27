import React, { useCallback, useEffect, useState } from 'react';
import { useStreak } from './useStreak';
import { fetchFeedStream, postConstituentVote } from '../services/api';
import { formatResult } from '../utils';
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

// Pill styling for the vote-position chip on the stream card. "Not Voting"
// must be matched before "Nay" because both start with "n".
function voteBadgeStyle(vote_position) {
  const v = (vote_position || '').toLowerCase().trim();
  if (!v) return null;
  if (v.startsWith('not')) return { bg: '#f1f5f9', fg: '#64748b', text: '~ Not Voting' };
  if (v.startsWith('y'))   return { bg: '#dcfce7', fg: '#15803d', text: '✓ Yea' };
  if (v.startsWith('n'))   return { bg: '#fee2e2', fg: '#b91c1c', text: '✗ Nay' };
  if (v.startsWith('p'))   return { bg: '#f1f5f9', fg: '#64748b', text: '~ Present' };
  return null;
}

// "2026-04-23" → "Apr 23, 2026". Anchored at local noon so a UTC date
// doesn't slide a day on negative timezones.
function formatAbsoluteDate(date) {
  if (!date) return '';
  const iso = typeof date === 'string' && date.length === 10 ? `${date}T12:00:00` : date;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function truncate60(s) {
  if (!s) return s;
  return s.length > 60 ? s.slice(0, 59) + '…' : s;
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

// Short, scannable headline: "<Who> voted YEA on <Bill#>".
// Falls back to "acted on" when vote_position is missing/null.
function buildShortTitle(item) {
  const who = item.official_name || 'Official';
  const bill = item.bill_number ? ` on ${item.bill_number}` : '';
  if (item.activity_type === 'vote') {
    if (item.vote_position) {
      const pos = item.vote_position.toLowerCase();
      let display = item.vote_position.toUpperCase();
      if (pos.startsWith('y')) display = 'YEA';
      else if (pos.startsWith('n') && !pos.startsWith('not')) display = 'NAY';
      return `${who} voted ${display}${bill}`;
    }
    return `${who} acted${bill}`;
  }
  if (item.activity_type === 'bill_sponsored' || item.activity_type === 'bill_cosponsored') {
    const verb = item.activity_type === 'bill_cosponsored' ? 'cosponsored' : 'sponsored';
    return item.bill_number ? `${who} ${verb} ${item.bill_number}` : `${who} ${verb} a bill`;
  }
  return `${who} acted${bill}`;
}

// Bill name: prefer the official title, fall back to description.
function buildBillName(item) {
  const t = (item.title && item.title.trim()) || (item.description && item.description.trim()) || '';
  return t;
}

function StreamCard({ item, onVote }) {
  const [pending, setPending] = useState(false);
  const [myPosition, setMyPosition] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const [counts, setCounts] = useState({
    support: Number(item.support_count) || 0,
    oppose: Number(item.oppose_count) || 0,
    neutral: Number(item.neutral_count) || 0,
  });

  const shortTitle = buildShortTitle(item);
  const billName = truncate60(buildBillName(item));
  const fullSummary = (item.plain_english_summary && item.plain_english_summary.trim()) || '';

  const lvl = levelBadge(item.official_level);
  const icon = activityIcon(item.activity_type, item.vote_position);
  const when = relativeFromDate(item.date);
  const absDate = formatAbsoluteDate(item.date);
  const voteBadge = item.activity_type === 'vote' ? voteBadgeStyle(item.vote_position) : null;
  const linkUrl = item.full_text_url || item.source_url || null;

  const handleVote = async (e, position) => {
    if (e && e.stopPropagation) e.stopPropagation();
    if (pending) return;
    setPending(true);
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

  const handleCardClick = () => {
    if (linkUrl) window.open(linkUrl, '_blank', 'noopener,noreferrer');
  };

  const totalVotes = counts.support + counts.oppose + counts.neutral;

  return (
    <article
      className="fcv1-stream-card"
      onClick={handleCardClick}
      style={linkUrl ? { cursor: 'pointer' } : undefined}
      role={linkUrl ? 'link' : undefined}
      tabIndex={linkUrl ? 0 : undefined}
    >
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
            {voteBadge && (
              <span
                style={{
                  background: voteBadge.bg,
                  color: voteBadge.fg,
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: '999px',
                  whiteSpace: 'nowrap',
                }}
              >
                {voteBadge.text}
              </span>
            )}
          </div>
          <h3 className="fcv1-stream-title">{shortTitle}</h3>
          {billName && <div className="fcv1-stream-billname" title={billName}>{billName}</div>}
          {fullSummary && (
            <button
              type="button"
              className="fcv1-stream-disclose-btn"
              onClick={(e) => { e.stopPropagation(); setExpanded((v) => !v); }}
              aria-expanded={expanded}
            >
              {expanded ? 'Hide summary ▲' : 'Read summary ▼'}
            </button>
          )}
          <div
            className={`fcv1-stream-summary-panel${expanded ? ' is-open' : ''}`}
            onClick={(e) => e.stopPropagation()}
          >
            {fullSummary && <p className="fcv1-stream-summary-text">{fullSummary}</p>}
            {item.source_url && (
              <a
                href={item.source_url}
                target="_blank"
                rel="noreferrer noopener"
                className="fcv1-stream-readbill-link"
              >
                Read full bill →
              </a>
            )}
          </div>
          <div className="fcv1-stream-meta-bot">
            {absDate && (
              <span className="fcv1-stream-time" title={when}>{absDate}</span>
            )}
            {(item.result || item.status) && (
              <span className="fcv1-stream-status">· {formatResult(item.result, item.status)}</span>
            )}
          </div>
        </div>
      </div>

      <div className="fcv1-stream-vote-row" onClick={(e) => e.stopPropagation()}>
        <button
          className={`fcv1-vote-btn fcv1-vote-support ${myPosition === 'support' ? 'is-active' : ''}`}
          onClick={(e) => handleVote(e, 'support')}
          disabled={pending}
        >
          👍 Support {counts.support > 0 && <span className="fcv1-vote-count">{counts.support}</span>}
        </button>
        <button
          className={`fcv1-vote-btn fcv1-vote-oppose ${myPosition === 'oppose' ? 'is-active' : ''}`}
          onClick={(e) => handleVote(e, 'oppose')}
          disabled={pending}
        >
          👎 Oppose {counts.oppose > 0 && <span className="fcv1-vote-count">{counts.oppose}</span>}
        </button>
        <button
          className={`fcv1-vote-btn fcv1-vote-neutral ${myPosition === 'neutral' ? 'is-active' : ''}`}
          onClick={(e) => handleVote(e, 'neutral')}
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

// Group consecutive cards from the same official (vote streaks tend to come
// in batches). Returns array of either {kind:'single', item} or
// {kind:'group', who, level, items:[...]}.
function groupByOfficial(items) {
  const out = [];
  let buf = [];
  const flush = () => {
    if (buf.length === 0) return;
    if (buf.length === 1) out.push({ kind: 'single', item: buf[0] });
    else out.push({ kind: 'group', who: buf[0].official_name, level: buf[0].official_level, items: buf });
    buf = [];
  };
  for (const it of items) {
    if (buf.length && buf[0].official_name === it.official_name && buf[0].activity_type === 'vote' && it.activity_type === 'vote') {
      buf.push(it);
    } else {
      flush();
      buf = [it];
    }
  }
  flush();
  return out;
}

function GroupedVotes({ group, onVote }) {
  // Default-open so the cards inside the group are immediately visible. The
  // prior default of `false` was the root cause of "300 items loaded, nothing
  // visible" — consecutive votes from one official all collapsed into a
  // single title button. The toggle still works for users who want to fold
  // a long streak back up.
  const [open, setOpen] = useState(true);
  return (
    <div className="fcv1-stream-card">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={{display:'flex', justifyContent:'space-between', alignItems:'center', width:'100%', padding:'0.5rem 0', background:'transparent', border:'none', cursor:'pointer', color:'var(--text)', fontWeight:800, fontSize:'0.95rem'}}
      >
        <span>{group.who} — {group.items.length} recent vote{group.items.length === 1 ? '' : 's'}</span>
        <span aria-hidden="true">{open ? '▴' : '▾'}</span>
      </button>
      {open && (
        <div style={{display:'flex', flexDirection:'column', gap:'0.6rem', marginTop:'0.5rem'}}>
          {group.items.map((it) => <StreamCard key={it.id} item={it} onVote={onVote} />)}
        </div>
      )}
    </div>
  );
}

export default function FeedV1({ zip, userName }) {
  const streak = useStreak();
  const [items, setItems] = useState([]);
  const [nextOffset, setNextOffset] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [lastVisitAtLoad, setLastVisitAtLoad] = useState(null);
  const [reloadTick, setReloadTick] = useState(0);
  const [levelFilter, setLevelFilter] = useState('all');

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
      ) : (() => {
        const filtered = levelFilter === 'all'
          ? items
          : items.filter((it) => (it.official_level || '').toLowerCase() === levelFilter);
        const newSinceLastVisit = lastVisitAtLoad
          ? filtered.filter((it) => it.date && new Date(it.date) > new Date(lastVisitAtLoad)).length
          : 0;
        const grouped = groupByOfficial(filtered);
        return (
          <>
            {newSinceLastVisit > 0 && (
              <div style={{margin:'0 0 0.6rem', padding:'0.6rem 0.85rem', background:'#eef2ff', border:'1px solid #c7d2fe', borderRadius:'0.65rem', color:'#4338ca', fontSize:'0.85rem', fontWeight:700}}>
                {newSinceLastVisit} new vote{newSinceLastVisit === 1 ? '' : 's'} since your last visit
              </div>
            )}
            <div style={{display:'flex', gap:'0.35rem', flexWrap:'wrap', marginBottom:'0.6rem'}}>
              {[
                {id:'all',     label:'All levels'},
                {id:'federal', label:'Federal'},
                {id:'state',   label:'State'},
                {id:'local',   label:'Local'},
              ].map((f) => {
                const active = levelFilter === f.id;
                return (
                  <button
                    key={f.id}
                    onClick={() => setLevelFilter(f.id)}
                    style={{
                      padding:'0.3rem 0.7rem', borderRadius:999, cursor:'pointer',
                      border:`1px solid ${active ? '#6366f1' : 'var(--border, #e2e8f0)'}`,
                      background: active ? '#eef2ff' : 'var(--surface, #fff)',
                      color: active ? '#4338ca' : 'var(--text-2, #475569)',
                      fontWeight: active ? 800 : 600, fontSize:'0.78rem',
                    }}
                  >
                    {f.label}
                  </button>
                );
              })}
            </div>
            <div className="fcv1-stream-list">
              {grouped.map((g, i) =>
                g.kind === 'group'
                  ? <GroupedVotes key={`g-${i}-${g.who}`} group={g} onVote={onVote} />
                  : <StreamCard key={g.item.id} item={g.item} onVote={onVote} />
              )}
            </div>
          </>
        );
      })()}

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
