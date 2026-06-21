import React from 'react';

/**
 * Three-layer collegial profile rendering — for members of School Boards,
 * County Commissions, and City Councils.
 *
 *   Layer 1 — Shared body context
 *     "the {district/county/city} you help govern"
 *     Renders metrics whose backend scope is "shared". These read the
 *     SAME for every member of the body (a school district's grade is
 *     not Member X's grade; it's the district's grade, on which the
 *     member voted).
 *
 *   Layer 2 — Individual record
 *     "this member's own votes, attendance, sponsorship"
 *     Renders metrics whose backend scope is "individual" — the
 *     per-seat-holder record.
 *
 *   Layer 3 — Your district (only when district-scoped metrics exist)
 *     "the condition of your district — you are its voice, not its
 *     personal grade"
 *     Renders metrics whose backend scope is "district". Today's
 *     metric set has zero of these, so the layer hides by default;
 *     placeholder copy renders only when the section would otherwise
 *     mislead.
 *
 * Each layer renders via the same compact pill: label · value · vs
 * benchmark · "▸ how is this measured?". Placeholder rows always show
 * as "Awaiting data" with no number and no benchmark.
 *
 * Drop-in usage:
 *   <CollegialLayers
 *     metrics={scorecard.metrics}
 *     officialTitle={o.title}
 *     county={o.county}
 *     district={o.district}
 *   />
 */

const PLACEHOLDERS = new Set(['', 'no public data', 'awaiting data ingestion']);
const isPlaceholder = (v) => PLACEHOLDERS.has(String(v || '').trim().toLowerCase());

function _fmtUnit(v, u) {
  if (v == null || v === '') return '';
  if (!u) return String(v);
  return u.match(/^[%$€£°]/) ? `${v}${u}` : `${v} ${u}`;
}

function _numFrom(v) {
  if (v == null) return null;
  const s = String(v).replace(/[%$,\s]/g, '').replace(/[^\d.-]/g, '');
  if (!s) return null;
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : null;
}

function MetricRow({ m, expanded, onToggle }) {
  const key = m.metric_key || m.key;
  const label = m.metric_label || m.label;
  const value = m.metric_value || m.value;
  const unit = m.metric_unit || m.unit;
  const benchValue = m.benchmark_value;
  const benchLabel = m.benchmark_label;
  const placeholder = isPlaceholder(value);

  if (placeholder) {
    return (
      <div style={rowCard}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={rowLabel}>{label}</div>
          <div style={{ ...rowValueRow, color: '#94a3b8' }}>Awaiting data</div>
        </div>
      </div>
    );
  }

  const valueDisplay = _fmtUnit(value, unit);
  const benchDisplay = benchValue != null && benchValue !== ''
    ? (benchLabel || `peer median: ${_fmtUnit(benchValue, unit)}`)
    : null;

  const vNum = _numFrom(value);
  const bNum = _numFrom(benchValue);
  let indicator = null;
  if (vNum != null && bNum != null && benchDisplay) {
    if (Math.abs(vNum - bNum) < 1e-9) indicator = { g: '=', c: '#64748b', l: 'at peer median' };
    else if (vNum > bNum)             indicator = { g: '↑', c: '#0f766e', l: 'above peer median' };
    else                              indicator = { g: '↓', c: '#9a3412', l: 'below peer median' };
  }

  return (
    <div style={rowCard}>
      <button type="button" onClick={() => onToggle(key)} aria-expanded={expanded}
              style={rowButton}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={rowLabel}>{label}</div>
          <div style={rowValueRow}>
            <span style={{ fontWeight: 800, color: '#0f172a' }}>{valueDisplay}</span>
            {benchDisplay && (
              <span style={{ color: '#475569' }}>
                {indicator && (
                  <span title={indicator.l} style={{ color: indicator.c, fontWeight: 800, marginRight: 4 }}>
                    {indicator.g}
                  </span>
                )}
                {benchDisplay}
              </span>
            )}
            {m.year ? <span style={{ color: '#94a3b8', fontSize: '0.7rem' }}>· {m.year}</span> : null}
          </div>
        </div>
        <span style={caret}>{expanded ? '▾' : '▸'} how is this measured?</span>
      </button>
      {expanded && (
        <div style={drilldown}>
          {m.why_it_matters && (
            <div style={{ marginBottom: 6 }}>
              <span style={{ fontWeight: 800, color: '#334155' }}>Why it matters: </span>
              {m.why_it_matters}
            </div>
          )}
          {m.how_calculated && (
            <div style={{ marginBottom: 6 }}>
              <span style={{ fontWeight: 800, color: '#334155' }}>How it's calculated: </span>
              {m.how_calculated}
            </div>
          )}
          {m.benchmark_method && (
            <div style={{ marginBottom: 6 }}>
              <span style={{ fontWeight: 800, color: '#334155' }}>Benchmark: </span>
              {m.benchmark_method}
            </div>
          )}
          {(m.source || m.source_url) && (
            <div style={{ fontSize: '0.72rem', color: '#475569' }}>
              <span style={{ color: '#64748b' }}>Source: </span>
              {m.source_url
                ? <a href={m.source_url} target="_blank" rel="noopener noreferrer"
                     style={{ color: '#4f46e5', textDecoration: 'none', fontWeight: 600 }}>
                    {m.source || m.source_url}
                  </a>
                : <span>{m.source}</span>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function LayerSection({ title, hint, items, expanded, onToggle, emptyCopy }) {
  if (!items || items.length === 0) {
    if (!emptyCopy) return null;
    return (
      <section style={layerWrap}>
        <h3 style={layerTitle}>{title}</h3>
        {hint && <p style={layerHint}>{hint}</p>}
        <div style={{ ...rowCard, padding: '0.6rem 0.75rem', color: '#64748b', fontSize: '0.78rem' }}>
          {emptyCopy}
        </div>
      </section>
    );
  }
  return (
    <section style={layerWrap}>
      <h3 style={layerTitle}>{title}</h3>
      {hint && <p style={layerHint}>{hint}</p>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {items.map((m, i) => (
          <MetricRow
            key={`${m.metric_key || m.key}-${i}`}
            m={m}
            expanded={expanded.has(m.metric_key || m.key)}
            onToggle={onToggle}
          />
        ))}
      </div>
    </section>
  );
}

export default function CollegialLayers({
  metrics, officialTitle, county, district, includeDistrictLayer = false,
}) {
  const [expanded, setExpanded] = React.useState(() => new Set());
  const toggle = (key) => setExpanded((prev) => {
    const next = new Set(prev);
    if (next.has(key)) next.delete(key); else next.add(key);
    return next;
  });

  if (!metrics || metrics.length === 0) return null;

  // Dedup latest year per metric_key
  const deduped = Object.values(
    metrics.reduce((acc, m) => {
      const key = m.metric_key || m.key;
      if (!acc[key] || (m.year || 0) > (acc[key].year || 0)) acc[key] = m;
      return acc;
    }, {})
  );

  // Scope on each metric comes from the backend role_metric_definitions
  // join (added in feature/metric-framework). Fall back to "individual"
  // when the backend didn't attach one — safer than dropping the row.
  const shared = deduped.filter((m) => (m.scope || m.metric_scope) === 'shared');
  const individual = deduped.filter((m) => {
    const s = m.scope || m.metric_scope;
    return !s || s === 'individual';
  });
  const districtMetrics = deduped.filter((m) => (m.scope || m.metric_scope) === 'district');

  // Wording derived from the officeholder's collegial body type.
  const titleLc = (officialTitle || '').toLowerCase();
  let bodyNoun = 'jurisdiction';
  if (titleLc.includes('school board')) bodyNoun = 'school district';
  else if (titleLc.includes('commission')) bodyNoun = 'county';
  else if (titleLc.includes('council') || titleLc.includes('mayor')) bodyNoun = 'city';

  const sharedTitle = `The ${bodyNoun} you help govern`;
  const sharedHint = `Body-wide outcomes. Every member of this ${bodyNoun}'s `
    + `governing body sees the same numbers here — these reflect the ${bodyNoun}, `
    + `not any one member.`;

  const individualTitle = 'This member\'s own record';
  const individualHint = 'Votes, attendance, sponsorship, and outreach attributed '
    + 'to this specific seat.';

  const districtTitle = district ? `Your district (${district})` : 'Your district';
  const districtHint = 'The condition of your district — you are its voice, not '
    + 'its personal grade.';

  return (
    <div style={{ margin: '0.6rem 1rem' }}>
      <LayerSection
        title={sharedTitle} hint={sharedHint}
        items={shared} expanded={expanded} onToggle={toggle}
        emptyCopy={`No body-wide outcomes tracked for this ${bodyNoun} yet.`}
      />
      <LayerSection
        title={individualTitle} hint={individualHint}
        items={individual} expanded={expanded} onToggle={toggle}
        emptyCopy="No individual record metrics tracked yet."
      />
      {includeDistrictLayer && (
        <LayerSection
          title={districtTitle} hint={districtHint}
          items={districtMetrics} expanded={expanded} onToggle={toggle}
          emptyCopy="District-level data is not yet ingested for this seat."
        />
      )}
    </div>
  );
}

const layerWrap = {
  marginBottom: '0.8rem',
  padding: '0.7rem 0.85rem',
  background: '#ffffff',
  border: '1px solid #e2e8f0',
  borderRadius: '0.7rem',
};
const layerTitle = {
  margin: 0, fontSize: '0.9rem', fontWeight: 800, color: '#0f172a',
};
const layerHint = {
  margin: '4px 0 8px 0', fontSize: '0.72rem', color: '#64748b', lineHeight: 1.4,
};
const rowCard = {
  background: '#f8fafc', border: '1px solid #e2e8f0',
  borderRadius: '0.55rem', overflow: 'hidden',
};
const rowButton = {
  width: '100%', display: 'flex', alignItems: 'flex-start',
  gap: 8, padding: '0.5rem 0.7rem',
  background: 'transparent', border: 'none', textAlign: 'left', cursor: 'pointer',
};
const rowLabel = {
  fontSize: '0.8rem', fontWeight: 700, color: '#0f172a',
  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
};
const rowValueRow = {
  marginTop: 2, fontSize: '0.74rem', color: '#334155',
  display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', gap: 6,
};
const caret = {
  fontSize: '0.68rem', color: '#6366f1', fontWeight: 700,
  whiteSpace: 'nowrap', alignSelf: 'center',
};
const drilldown = {
  padding: '0.5rem 0.7rem', borderTop: '1px solid #f1f5f9',
  fontSize: '0.78rem', color: '#0f172a', background: '#fff',
};
