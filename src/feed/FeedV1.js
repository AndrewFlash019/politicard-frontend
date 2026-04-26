import React, { useEffect, useMemo, useState } from 'react';
import { useFeedV1 } from './useFeedV1';
import { useStreak } from './useStreak';
import { useReadTracker } from './useReadTracker';
import './FeedV1.css';

const HOURS_24_MS = 24 * 60 * 60 * 1000;

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

function todayLabel() {
  return new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });
}

function formatEventDate(iso) {
  if (!iso) return '';
  try {
    return new Date(iso + 'T12:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  } catch (_) {
    return iso;
  }
}

// ---------------------------------------------------------------------------
// Card primitives
// ---------------------------------------------------------------------------

function CardBadge({ card }) {
  if (card.is_new) return <span className="fcv1-badge fcv1-badge-new">NEW</span>;
  if (card.is_updated) return <span className="fcv1-badge fcv1-badge-updated">UPDATED</span>;
  return null;
}

function FeedCard({ card, isRead, observe, onMarkRead, compact }) {
  const handleClick = () => onMarkRead(card.id);
  let stateClass = '';
  if (card.is_new) stateClass = 'fcv1-card-new';
  else if (card.is_updated) stateClass = 'fcv1-card-updated';
  else if (isRead) stateClass = 'fcv1-card-read';

  return (
    <article
      ref={observe(card.id)}
      onClick={handleClick}
      className={`fcv1-card ${stateClass} ${compact ? 'fcv1-card-compact' : ''}`}
    >
      <div className="fcv1-card-top">
        <span className="fcv1-card-icon" aria-hidden="true">{card.icon || '📰'}</span>
        <div className="fcv1-card-title-block">
          <h3 className="fcv1-card-title">{card.title}</h3>
          <div className="fcv1-card-meta">
            {card.relative_time && <span className="fcv1-card-time">{card.relative_time}</span>}
            {card.official_name && <span className="fcv1-card-official">· {card.official_name}</span>}
          </div>
        </div>
        <div className="fcv1-card-badges">
          <CardBadge card={card} />
          {isRead && !card.is_new && !card.is_updated && (
            <span className="fcv1-card-check" title="Read">✓</span>
          )}
        </div>
      </div>
      {card.body && <p className="fcv1-card-body">{card.body}</p>}
      {(card.source || card.source_url) && (
        <div className="fcv1-card-source">
          {card.source_url ? (
            <a href={card.source_url} target="_blank" rel="noreferrer noopener">
              Source: {card.source || card.source_url}
            </a>
          ) : (
            <span>Source: {card.source}</span>
          )}
        </div>
      )}
    </article>
  );
}

function BriefCard({ card, isRead, observe, onMarkRead }) {
  if (!card) {
    return (
      <section className="fcv1-brief fcv1-brief-evergreen">
        <div className="fcv1-brief-label">TODAY · {todayLabel()}</div>
        <h2 className="fcv1-brief-title">Quiet day in your district.</h2>
        <p className="fcv1-brief-body">
          No fresh activity from your reps today. Check back tomorrow — or browse "This week" below
          for recent bills and votes.
        </p>
      </section>
    );
  }
  return (
    <section
      ref={observe(card.id)}
      onClick={() => onMarkRead(card.id)}
      className={`fcv1-brief ${isRead ? 'fcv1-brief-read' : ''}`}
    >
      <div className="fcv1-brief-label">TODAY · {todayLabel()}</div>
      <h2 className="fcv1-brief-title">
        <span className="fcv1-card-icon">{card.icon || '📰'}</span>
        {card.title}
      </h2>
      {card.body && <p className="fcv1-brief-body">{card.body}</p>}
      <div className="fcv1-brief-footer">
        {card.relative_time && <span className="fcv1-brief-time">{card.relative_time}</span>}
        {card.source_url ? (
          <a className="fcv1-brief-cta" href={card.source_url} target="_blank" rel="noreferrer noopener">
            VIEW DETAILS →
          </a>
        ) : null}
      </div>
      {card.source && (
        <div className="fcv1-card-source fcv1-brief-source">Source: {card.source}</div>
      )}
    </section>
  );
}

function ComingUpItem({ event }) {
  return (
    <article className="fcv1-cu-item">
      <div className="fcv1-cu-date">{formatEventDate(event.event_date)}</div>
      <div className="fcv1-cu-body">
        <div className="fcv1-cu-title">{event.title}</div>
        {event.description && <div className="fcv1-cu-desc">{event.description}</div>}
        {event.related_official_name && (
          <div className="fcv1-cu-meta">{event.related_official_name}</div>
        )}
        {event.source_url && (
          <a href={event.source_url} target="_blank" rel="noreferrer noopener" className="fcv1-cu-source">
            {event.source || event.source_url}
          </a>
        )}
      </div>
    </article>
  );
}

// ---------------------------------------------------------------------------
// Welcome Back header
// ---------------------------------------------------------------------------

function WelcomeBack({ userName, lastVisitIso, sinceCount, yourOfficialsCount, streak }) {
  if (!lastVisitIso) return null;
  const ms = Date.now() - new Date(lastVisitIso).getTime();
  if (Number.isNaN(ms) || ms < HOURS_24_MS) return null;
  const tone = ms > 7 * HOURS_24_MS * 24 ? "It's been a while." : `Welcome back, ${userName || 'voter'}.`;
  const sub =
    sinceCount > 0
      ? `${sinceCount} update${sinceCount === 1 ? '' : 's'} since ${relativeFromIso(lastVisitIso)}` +
        (yourOfficialsCount > 0
          ? `, including ${yourOfficialsCount} from your reps.`
          : '.')
      : `Quiet stretch since ${relativeFromIso(lastVisitIso)}.`;

  return (
    <header className="fcv1-welcome">
      <div className="fcv1-welcome-text">
        <h1 className="fcv1-welcome-title">{tone}</h1>
        <p className="fcv1-welcome-sub">{sub}</p>
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
// Section components
// ---------------------------------------------------------------------------

function ExpandableList({ items, initial, render, expandLabel, emptyHint }) {
  const [expanded, setExpanded] = useState(false);
  if (!items || items.length === 0) {
    return emptyHint ? <p className="fcv1-empty-hint">{emptyHint}</p> : null;
  }
  const visible = expanded ? items : items.slice(0, initial);
  return (
    <>
      {visible.map(render)}
      {items.length > initial && !expanded && (
        <button className="fcv1-expand-btn" onClick={() => setExpanded(true)}>
          {expandLabel(items.length - initial)}
        </button>
      )}
    </>
  );
}

function YourOfficialsList({ cards, isRead, observe, onMarkRead }) {
  // Group by official_name visually so a Randy Fine digest stays adjacent to
  // Randy Fine cards.
  const grouped = useMemo(() => {
    const m = new Map();
    cards.forEach((c) => {
      const k = c.official_name || '__unknown__';
      if (!m.has(k)) m.set(k, []);
      m.get(k).push(c);
    });
    return Array.from(m.entries());
  }, [cards]);
  if (grouped.length === 0) {
    return <p className="fcv1-empty-hint">No recent activity from your officials.</p>;
  }
  return (
    <div className="fcv1-your-officials">
      {grouped.map(([owner, list]) => (
        <div key={owner} className="fcv1-yo-group">
          <div className="fcv1-yo-owner">{owner}</div>
          {list.map((c) => (
            <FeedCard
              key={c.id}
              card={c}
              isRead={isRead(c.id)}
              observe={observe}
              onMarkRead={onMarkRead}
              compact
            />
          ))}
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Skeleton + error states
// ---------------------------------------------------------------------------

function FeedSkeleton() {
  return (
    <div className="fcv1-skeleton">
      <div className="fcv1-skel-brief" />
      <div className="fcv1-skel-row">
        <div className="fcv1-skel-card" />
        <div className="fcv1-skel-card" />
        <div className="fcv1-skel-card" />
      </div>
    </div>
  );
}

function FeedError({ onRetry }) {
  return (
    <div className="fcv1-error">
      <p>Could not load feed.</p>
      <button onClick={onRetry} className="fcv1-error-btn">Tap to retry</button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Top-level component
// ---------------------------------------------------------------------------

export default function FeedV1({ zip, userName }) {
  const { data, loading, error, lastVisitAtLoad, reload } = useFeedV1(zip);
  const streak = useStreak();
  const { isRead, markRead, observe } = useReadTracker();
  // Force a re-render once dwell timers may have fired so badges hide naturally.
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((n) => n + 1), 5000);
    return () => clearInterval(id);
  }, []);

  if (loading) {
    return (
      <div className="tab-content fcv1-root">
        <FeedSkeleton />
      </div>
    );
  }
  if (error || !data) {
    return (
      <div className="tab-content fcv1-root">
        <FeedError onRetry={reload} />
      </div>
    );
  }

  const showSinceLastVisit =
    lastVisitAtLoad &&
    Date.now() - new Date(lastVisitAtLoad).getTime() > HOURS_24_MS &&
    data.sinceLastVisit.length > 0;

  return (
    <div className="tab-content fcv1-root">
      <WelcomeBack
        userName={userName}
        lastVisitIso={lastVisitAtLoad}
        sinceCount={data.sinceLastVisit.length}
        yourOfficialsCount={data.yourOfficials.filter((c) => c.is_new || c.is_updated).length}
        streak={streak}
      />

      {/* Today's Brief — always rendered (shows evergreen fallback if null) */}
      <BriefCard
        card={data.today?.brief}
        isRead={data.today?.brief ? isRead(data.today.brief.id) : false}
        observe={observe}
        onMarkRead={markRead}
      />

      {/* Since Last Visit */}
      {showSinceLastVisit && (
        <section className="fcv1-section">
          <h2 className="fcv1-section-title">
            {data.sinceLastVisit.length} update{data.sinceLastVisit.length === 1 ? '' : 's'} since you last visited
          </h2>
          <ExpandableList
            items={data.sinceLastVisit}
            initial={5}
            expandLabel={(n) => `Show all ${n + 5}`}
            render={(c) => (
              <FeedCard
                key={c.id}
                card={c}
                isRead={isRead(c.id)}
                observe={observe}
                onMarkRead={markRead}
                compact
              />
            )}
          />
        </section>
      )}

      {/* This Week */}
      <section className="fcv1-section">
        <h2 className="fcv1-section-title">This week in your district</h2>
        <ExpandableList
          items={data.thisWeek}
          initial={8}
          expandLabel={(n) => `Show ${n} more`}
          emptyHint="Nothing new this week. Check back soon."
          render={(c) => (
            <FeedCard
              key={c.id}
              card={c}
              isRead={isRead(c.id)}
              observe={observe}
              onMarkRead={markRead}
            />
          )}
        />
      </section>

      {/* Your Officials */}
      <section className="fcv1-section">
        <h2 className="fcv1-section-title">Your officials' activity</h2>
        <YourOfficialsList
          cards={data.yourOfficials}
          isRead={isRead}
          observe={observe}
          onMarkRead={markRead}
        />
      </section>

      {/* Coming Up */}
      <section className="fcv1-section">
        <h2 className="fcv1-section-title">Coming up this week</h2>
        {data.comingUp && data.comingUp.length > 0 ? (
          data.comingUp.map((e) => <ComingUpItem key={e.id} event={e} />)
        ) : (
          <p className="fcv1-empty-hint">
            Florida Legislature is out of session. Next regular session starts January 13, 2026.
          </p>
        )}
      </section>

      <footer className="fcv1-footer">
        <div className="fcv1-footer-meta">
          ZIP {data.zipCode}
          {data.county && ` · ${data.county} County`}
          {' · '}
          {data.activeCardCount} active card{data.activeCardCount === 1 ? '' : 's'}
        </div>
        {data.lastRefreshAt && (
          <div className="fcv1-footer-refresh">
            Refreshed {relativeFromIso(data.lastRefreshAt)}
          </div>
        )}
      </footer>
    </div>
  );
}
