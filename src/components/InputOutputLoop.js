import React, { useEffect, useState } from 'react';
import { fetchMunicipalityForm } from '../services/api';

/**
 * Money-in / benefit-out structural view, multi-year.
 *
 * The intent is to show residents what their jurisdiction takes in
 * (revenue, growth, permits) alongside what it CONTROLS in services
 * out. Strictly scoped to what the office actually controls — we
 * deliberately do NOT draw an arrow from city revenue to county
 * sheriff services, because the mayor doesn't control county-sheriff
 * spending.
 *
 * Government form gating (fl_municipalities.government_form):
 *   strong_mayor    → executive treatment ("you elected the person
 *                    who runs day-to-day operations")
 *   council_manager → council-member treatment ("you elected a council
 *                    that hires a city manager; the manager runs
 *                    day-to-day operations")
 *   null / unknown  → neutral default ("Phase 3b will classify this
 *                    municipality; until then, the controls assigned
 *                    here are conservative — line items that are
 *                    sometimes city, sometimes county, are shown as
 *                    awaiting data")
 *
 * Most line items will render as "Awaiting data" today because the
 * underlying revenue/permits/services tables are not yet ingested.
 * That is the intended Phase 3a state — the structure exists so a
 * later ingest wave fills it without UI changes.
 */

const PLACEHOLDERS = new Set(['', 'no public data', 'awaiting data ingestion']);
const isPlaceholder = (v) => PLACEHOLDERS.has(String(v || '').trim().toLowerCase());

function _fmtUnit(v, u) {
  if (v == null || v === '') return null;
  if (!u) return String(v);
  return u.match(/^[%$€£°]/) ? `${v}${u}` : `${v} ${u}`;
}

// Line items the loop tracks. Each names the slot, what feeds it, and
// the government_form treatments that surface it. metric_keys map
// slots back into the accountability_metrics rows we already pull on
// the profile.
const MONEY_IN_SLOTS = [
  { slot: 'tax_base', label: 'Property tax base', metric_keys: ['tax_rate_change'],
    note: 'Local property-tax revenue is set by the millage rate; the rate is the input the city directly controls.' },
  { slot: 'population', label: 'Population growth', metric_keys: ['population_change'],
    note: 'Bigger population grows the revenue base but not by the elected official\'s action.' },
  { slot: 'permits', label: 'Permits / fees', metric_keys: [],
    note: 'Awaiting data: city permit-revenue tables not yet ingested.' },
];

const BENEFIT_OUT_BY_FORM = {
  strong_mayor: [
    { slot: 'fiscal',   label: 'Fiscal management',          metric_keys: ['budget_variance', 'bond_rating'] },
    { slot: 'capital',  label: 'Capital projects delivery',  metric_keys: ['capital_projects_on_budget', 'capital_projects_on_time'] },
    { slot: 'sunshine', label: 'Public records response',    metric_keys: ['public_records_response_time'] },
    { slot: 'safety',   label: 'Public safety',              metric_keys: [], note: 'Awaiting data: city-controlled police/fire metrics not yet ingested.' },
    { slot: 'roads',    label: 'Roads & infrastructure',     metric_keys: [], note: 'Awaiting data: city PW dashboards not yet ingested.' },
  ],
  council_manager: [
    { slot: 'fiscal',    label: 'Fiscal posture (manager-run)', metric_keys: ['budget_variance', 'bond_rating'],
      note: 'Operations are run by an appointed city manager. The council\'s lever is hiring, oversight, and the budget vote.' },
    { slot: 'oversight', label: 'Council oversight',            metric_keys: [], note: 'Awaiting data: council manager-evaluation cadence not tracked.' },
    { slot: 'sunshine',  label: 'Public records response',      metric_keys: ['public_records_response_time'] },
  ],
  null_default: [
    { slot: 'fiscal',   label: 'Fiscal management',         metric_keys: ['budget_variance', 'bond_rating'] },
    { slot: 'sunshine', label: 'Public records response',   metric_keys: ['public_records_response_time'] },
    // Deliberately conservative — when we don't know who runs operations,
    // we don't claim the mayor controls services that often live with a
    // city manager.
    { slot: 'unknown_services', label: 'City services (control unknown)', metric_keys: [],
      note: 'Awaiting data: government_form not yet classified for this municipality.' },
  ],
};

// Pull every metric row in the relevant slot, grouped by year so the
// multi-year structure isn't lost when there are multiple data points.
function _yearsForSlot(allMetrics, metricKeys) {
  if (!metricKeys || metricKeys.length === 0) return [];
  const rows = (allMetrics || []).filter(
    (m) => metricKeys.includes(m.metric_key || m.key)
            && !isPlaceholder(m.metric_value || m.value),
  );
  if (rows.length === 0) return [];
  const byYear = rows.reduce((acc, m) => {
    const y = m.year || 'undated';
    (acc[y] = acc[y] || []).push(m);
    return acc;
  }, {});
  return Object.entries(byYear)
    .sort(([a], [b]) => (b === 'undated' ? -1 : a === 'undated' ? 1 : Number(b) - Number(a)));
}

function Slot({ entry, allMetrics }) {
  const years = _yearsForSlot(allMetrics, entry.metric_keys);
  if (years.length === 0) {
    return (
      <div style={slotCard}>
        <div style={slotLabel}>{entry.label}</div>
        <div style={slotAwaiting}>Awaiting data</div>
        {entry.note && <div style={slotNote}>{entry.note}</div>}
      </div>
    );
  }
  return (
    <div style={slotCard}>
      <div style={slotLabel}>{entry.label}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 4 }}>
        {years.map(([year, rows]) => (
          <div key={year} style={yearRow}>
            <span style={yearTag}>{year}</span>
            {rows.map((m, i) => {
              const v = _fmtUnit(m.metric_value || m.value, m.metric_unit || m.unit);
              return (
                <span key={i} style={{ fontSize: '0.78rem', color: '#0f172a' }}>
                  <strong>{m.metric_label || m.label}</strong>: {v}
                </span>
              );
            })}
          </div>
        ))}
      </div>
      {entry.note && <div style={slotNote}>{entry.note}</div>}
    </div>
  );
}

export default function InputOutputLoop({
  metrics, officialTitle, city, county,
}) {
  const [form, setForm] = useState(null);
  const [formChecked, setFormChecked] = useState(false);

  // Mayors get the government_form gate. Other officials skip the
  // lookup entirely — for now we render the neutral default treatment
  // for them too, since they share the "what does this office control"
  // question but don't have a strong/weak distinction to resolve.
  const titleLc = (officialTitle || '').toLowerCase();
  const isMayor = titleLc.includes('mayor');

  useEffect(() => {
    if (!isMayor || !city) { setFormChecked(true); return; }
    let cancelled = false;
    fetchMunicipalityForm(city, county).then((res) => {
      if (cancelled) return;
      setForm(res && res.data ? (res.data.government_form || null) : null);
      setFormChecked(true);
    });
    return () => { cancelled = true; };
  }, [isMayor, city, county]);

  if (isMayor && !formChecked) return null;

  const treatment = form && BENEFIT_OUT_BY_FORM[form]
    ? form
    : 'null_default';
  const benefitSlots = BENEFIT_OUT_BY_FORM[treatment];

  return (
    <div style={wrap}>
      <div style={header}>
        <div style={{ fontWeight: 800, fontSize: '0.92rem', color: '#0f172a' }}>
          🔁 What this office takes in vs what it controls
        </div>
        <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: 2 }}>
          {isMayor
            ? (treatment === 'strong_mayor'
                ? 'Strong-mayor form: the mayor runs day-to-day operations.'
                : treatment === 'council_manager'
                  ? 'Council-manager form: an appointed city manager runs day-to-day operations.'
                  : 'Government form not yet classified — treatments stay conservative until Phase 3b.')
            : 'Office-controlled services only — items outside this office are not drawn here.'}
        </div>
      </div>

      <div style={twoColumn}>
        <div>
          <div style={colHeader}>Money in</div>
          {MONEY_IN_SLOTS.map((s) => (
            <Slot key={s.slot} entry={s} allMetrics={metrics} />
          ))}
        </div>
        <div>
          <div style={colHeader}>Benefit out</div>
          {benefitSlots.map((s) => (
            <Slot key={s.slot} entry={s} allMetrics={metrics} />
          ))}
        </div>
      </div>
    </div>
  );
}

const wrap = {
  margin: '0.6rem 1rem',
  padding: '0.75rem 0.85rem',
  background: '#fff', border: '1px solid #e2e8f0', borderRadius: '0.75rem',
};
const header = { marginBottom: 10 };
const twoColumn = {
  display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10,
};
const colHeader = {
  fontSize: '0.72rem', fontWeight: 800, color: '#64748b',
  textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6,
};
const slotCard = {
  padding: '0.55rem 0.7rem', marginBottom: 6,
  background: '#f8fafc', border: '1px solid #e2e8f0',
  borderRadius: '0.5rem',
};
const slotLabel = {
  fontSize: '0.8rem', fontWeight: 700, color: '#0f172a',
};
const slotAwaiting = {
  marginTop: 4, fontSize: '0.74rem', color: '#94a3b8',
};
const slotNote = {
  marginTop: 6, fontSize: '0.7rem', color: '#64748b', lineHeight: 1.4,
};
const yearRow = {
  display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'baseline',
};
const yearTag = {
  fontSize: '0.66rem', color: '#475569', fontWeight: 700,
  padding: '0.1rem 0.4rem', background: '#e2e8f0', borderRadius: 9,
};
