import React, { useEffect, useState } from 'react';
import { fetchOfficialComposite } from '../services/api';

/**
 * Composite roll-up for chief-executive offices and the shared-context
 * layer of collegial bodies. Renders:
 *   - the label ("Composite of N measures: above/at/below peer median")
 *   - the component list with weights and per-component direction
 *   - a tap-to-expand "how is this calculated?" footnote
 *   - a tap-to-expand drill-down per component (re-uses the same
 *     why_it_matters/how_calculated/source layer the metric pill uses)
 *
 * The composite is intentionally labeled, NEVER graded — no letter, no
 * percentile, no rating. Placeholder rows are excluded server-side and
 * the renderer hides itself when no eligible components exist.
 */

const POSITION_GLYPH = {
  '-1': { glyph: '↓', color: '#9a3412', label: 'below peer median' },
  '0':  { glyph: '=', color: '#64748b', label: 'at peer median' },
  '1':  { glyph: '↑', color: '#0f766e', label: 'above peer median' },
};

function _fmtUnit(v, u) {
  if (v == null || v === '') return '';
  if (!u) return String(v);
  return u.match(/^[%$€£°]/) ? `${v}${u}` : `${v} ${u}`;
}

export default function CompositePanel({ officialId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [methodOpen, setMethodOpen] = useState(false);
  const [expanded, setExpanded] = useState(new Set());

  useEffect(() => {
    if (!officialId) { setLoading(false); return; }
    let cancelled = false;
    setLoading(true);
    fetchOfficialComposite(officialId).then((res) => {
      if (cancelled) return;
      if (res.success) setData(res.data);
      else setError(res.error || 'Could not load composite');
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [officialId]);

  if (loading) return null;
  if (error || !data || !data.available || !data.components || data.components.length === 0) {
    return null;
  }

  const toggle = (key) => setExpanded((prev) => {
    const next = new Set(prev);
    if (next.has(key)) next.delete(key); else next.add(key);
    return next;
  });

  return (
    <div style={wrap}>
      <div style={header}>
        <div style={{ fontWeight: 800, fontSize: '0.92rem', color: '#0f172a' }}>
          📐 {data.label}
        </div>
        <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: 2 }}>
          A composite — not a rating. Tap any component to see why it matters.
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {data.components.map((c) => {
          const pos = POSITION_GLYPH[String(c.position)] || POSITION_GLYPH['0'];
          const isOpen = expanded.has(c.key);
          return (
            <div key={c.key} style={componentCard}>
              <button
                type="button"
                onClick={() => toggle(c.key)}
                aria-expanded={isOpen}
                style={componentBtn}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={componentLabel}>{c.label}</div>
                  <div style={componentValueRow}>
                    <span style={{ fontWeight: 800, color: '#0f172a' }}>
                      {_fmtUnit(c.value, c.unit)}
                    </span>
                    <span style={{ color: '#475569' }}>
                      <span title={pos.label} style={{ color: pos.color, fontWeight: 800, marginRight: 4 }}>
                        {pos.glyph}
                      </span>
                      {c.benchmark_label || `peer median: ${_fmtUnit(c.benchmark_value, c.unit)}`}
                    </span>
                    <span style={{ color: '#94a3b8', fontSize: '0.7rem' }}>
                      weight {Number(c.weight).toFixed(1)}
                      {c.lower_is_better ? ' · lower is better' : ''}
                    </span>
                    {c.year ? <span style={{ color: '#94a3b8', fontSize: '0.7rem' }}>· {c.year}</span> : null}
                  </div>
                </div>
                <span style={caretStyle} aria-hidden="true">
                  {isOpen ? '▾' : '▸'}
                </span>
              </button>
              {isOpen && (
                <div style={drilldown}>
                  {c.benchmark_method && (
                    <div style={{ marginBottom: 6 }}>
                      <span style={{ fontWeight: 800, color: '#334155' }}>Benchmark: </span>
                      {c.benchmark_method}
                    </div>
                  )}
                  {(c.source || c.source_url) && (
                    <div style={{ fontSize: '0.72rem', color: '#475569' }}>
                      <span style={{ color: '#64748b' }}>Source: </span>
                      {c.source_url ? (
                        <a href={c.source_url} target="_blank" rel="noopener noreferrer"
                           style={{ color: '#4f46e5', textDecoration: 'none', fontWeight: 600 }}>
                          {c.source || c.source_url}
                        </a>
                      ) : (
                        <span>{c.source}</span>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => setMethodOpen((v) => !v)}
        style={methodToggle}
        aria-expanded={methodOpen}
      >
        {methodOpen ? '▾ how is this calculated?' : '▸ how is this calculated?'}
      </button>
      {methodOpen && (
        <div style={methodBox}>
          {data.method}
          <div style={{ marginTop: 6, fontSize: '0.72rem', color: '#475569' }}>
            <strong>This run:</strong> {data.components_count} components,
            total weight {data.weight_total}, score {data.score}.
            {data.skipped_no_benchmark > 0 && (
              <> {data.skipped_no_benchmark} eligible metric(s) skipped — no benchmark yet.</>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const wrap = {
  margin: '0.6rem 1rem',
  padding: '0.75rem 0.85rem',
  background: 'linear-gradient(135deg,#f0f9ff,#fff)',
  border: '1px solid #bae6fd',
  borderRadius: '0.75rem',
};
const header = { marginBottom: 8 };
const componentCard = {
  background: '#fff', border: '1px solid #e2e8f0',
  borderRadius: '0.55rem', overflow: 'hidden',
};
const componentBtn = {
  width: '100%', display: 'flex', alignItems: 'flex-start',
  gap: 8, padding: '0.5rem 0.7rem',
  background: 'transparent', border: 'none', textAlign: 'left', cursor: 'pointer',
};
const componentLabel = {
  fontSize: '0.8rem', fontWeight: 700, color: '#0f172a',
  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
};
const componentValueRow = {
  marginTop: 2, fontSize: '0.74rem', color: '#334155',
  display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', gap: 6,
};
const caretStyle = {
  color: '#6366f1', fontSize: '0.78rem', alignSelf: 'center', fontWeight: 700,
};
const drilldown = {
  padding: '0.5rem 0.7rem', borderTop: '1px solid #f1f5f9',
  fontSize: '0.78rem', color: '#0f172a', background: '#f8fafc',
};
const methodToggle = {
  marginTop: 8, padding: '0.4rem 0.6rem', borderRadius: 7,
  border: '1px dashed #c7d2fe', background: 'transparent',
  color: '#4338ca', fontWeight: 700, fontSize: '0.74rem', cursor: 'pointer',
};
const methodBox = {
  marginTop: 6, padding: '0.6rem 0.7rem',
  background: '#fff', border: '1px solid #e2e8f0', borderRadius: '0.55rem',
  fontSize: '0.78rem', color: '#0f172a', lineHeight: 1.45,
};
