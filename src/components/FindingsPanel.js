import React, { useEffect, useState } from 'react';
import { fetchOfficialFindings } from '../services/api';

/**
 * Findings on record panel for an official's profile.
 *
 *   <FindingsPanel officialId={o.id} />
 *
 * Reads /api/v1/officials/{id}/findings, which unifies audit_findings,
 * county_cafr_audits (where related_office matches), and document_findings
 * into a single, status-labeled list. The endpoint already applies the
 * attribution rules (direct vs shared collegial context) and drops
 * clean-sentinel rows.
 *
 * Strict spec rules honored, by construction:
 *
 *  1. Status labels are ALWAYS shown prominently. Each finding renders
 *     a status pill (alleged / under investigation / found / dismissed
 *     / settled / overturned / resolved / repeat / action in progress
 *     / partially corrected / not corrected / implemented / reported).
 *     "Under investigation" stays "under investigation" — never
 *     promoted to "found."
 *
 *  2. Source link is required. The endpoint drops rows without a
 *     source_url, so every finding in `findings` has one; we render
 *     it as a "View source" link on each card.
 *
 *  3. Absence of findings ≠ "clean." When count is 0, the entire
 *     section is HIDDEN. No "Clean record" badge, no zero counter.
 *     Per spec: "absence of findings in our sources is not a clean
 *     bill."
 *
 *  4. Repeat findings flagged distinctly. is_repeat=true rows carry
 *     a "Repeat finding" pill in a warmer color and are tied for
 *     first within their date bucket (sorting handled server-side).
 *
 *  5. Plain-language header rendered verbatim from the server payload
 *     so the language stays sourced + auditable in one place.
 *
 *  6. No causal / intent verbs anywhere ("corrupt," "lied," "bought,"
 *     "guilty"). Status labels are factual; the source's own text
 *     summary is shown if present.
 */

// Map of status → {bg, fg, label}. Anything not in this map renders as
// a neutral grey "reported." Color choices are intentional: orange/red
// for "found" / "not_corrected" (the source said something concrete);
// blue for "under investigation" (in-progress); grey for terminal
// outcomes that don't survive ("dismissed", "overturned").
const STATUS_STYLE = {
  alleged:               { bg: '#fef3c7', fg: '#78350f', label: 'Alleged' },
  under_investigation:   { bg: '#dbeafe', fg: '#1e3a8a', label: 'Under investigation' },
  found:                 { bg: '#fee2e2', fg: '#7f1d1d', label: 'Found' },
  not_corrected:         { bg: '#fee2e2', fg: '#7f1d1d', label: 'Not corrected' },
  partially_corrected:   { bg: '#fef3c7', fg: '#78350f', label: 'Partially corrected' },
  action_in_progress:    { bg: '#fef3c7', fg: '#78350f', label: 'Action in progress' },
  implemented:           { bg: '#dcfce7', fg: '#14532d', label: 'Implemented' },
  resolved:              { bg: '#dcfce7', fg: '#14532d', label: 'Resolved' },
  dismissed:             { bg: '#e2e8f0', fg: '#334155', label: 'Dismissed' },
  overturned:            { bg: '#e2e8f0', fg: '#334155', label: 'Overturned' },
  settled:               { bg: '#e0e7ff', fg: '#3730a3', label: 'Settled' },
  reported:              { bg: '#f1f5f9', fg: '#334155', label: 'Reported' },
};

function statusStyleFor(status) {
  return STATUS_STYLE[status] || STATUS_STYLE.reported;
}

function fmtDate(d) {
  if (!d) return null;
  const s = String(d).slice(0, 10);
  // YYYY-MM-DD or close; render as-is, parsing is brittle.
  return s.match(/^\d{4}-\d{2}-\d{2}$/) ? s : s;
}

export default function FindingsPanel({ officialId }) {
  const [payload, setPayload] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (officialId == null) { setLoading(false); return; }
    let cancelled = false;
    setLoading(true);
    fetchOfficialFindings(officialId).then((res) => {
      if (cancelled) return;
      setPayload(res && res.success ? res.data : null);
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [officialId]);

  // Spec rule: if no findings, the section is HIDDEN entirely.
  // Don't render a header. Don't render "Clean." Just absent.
  if (loading) return null;
  if (!payload || !Array.isArray(payload.findings) || payload.findings.length === 0) {
    return null;
  }

  const findings = payload.findings;

  return (
    <section style={wrap}>
      <h3 style={panelTitle}>📄 Findings on record</h3>
      <p style={headerCopy}>{payload.header}</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {findings.map((f, i) => {
          const s = statusStyleFor(f.status);
          const date = fmtDate(f.status_as_of) || fmtDate(f.finding_date);
          return (
            <article key={i} style={card}>
              <div style={cardHeaderRow}>
                <span style={{ ...statusPill, background: s.bg, color: s.fg }}>
                  {s.label}
                </span>
                {f.is_repeat && (
                  <span style={repeatPill} title="Flagged as a repeat from a prior audit period">
                    ↻ Repeat finding
                  </span>
                )}
                {f.attribution === 'shared' && (
                  <span style={sharedPill}
                        title="Shared body context — comes from the body's audit, not this seat's own record.">
                    Shared
                  </span>
                )}
                {date && (
                  <span style={dateText}>· {date}</span>
                )}
              </div>

              <div style={cardTitle}>{f.title}</div>

              {f.summary && (
                <p style={cardBody}>{f.summary}</p>
              )}

              <div style={cardFooter}>
                <span style={{ color: '#475569' }}>
                  {f.issuing_body || f.source || 'Source'}
                </span>
                {f.severity && (
                  <span style={severityBadge}>{f.severity}</span>
                )}
                {f.source_url && (
                  <a href={f.source_url} target="_blank" rel="noopener noreferrer"
                     style={sourceLink}>
                    View source ↗
                  </a>
                )}
              </div>
            </article>
          );
        })}
      </div>

      {payload.repeat_count > 0 && (
        <div style={countSummary}>
          {findings.length} finding{findings.length === 1 ? '' : 's'} on record ·
          {' '}{payload.repeat_count} flagged as repeat
        </div>
      )}
    </section>
  );
}

const wrap = {
  margin: '0.7rem 1rem',
  padding: '0.85rem 1rem',
  background: '#fff',
  border: '1px solid #cbd5e1',
  borderRadius: '0.75rem',
};
const panelTitle = {
  margin: 0,
  fontSize: '0.95rem',
  fontWeight: 800,
  color: '#0f172a',
};
const headerCopy = {
  margin: '4px 0 12px',
  fontSize: '0.74rem',
  color: '#475569',
  lineHeight: 1.5,
};
const card = {
  padding: '0.65rem 0.8rem',
  background: '#f8fafc',
  border: '1px solid #e2e8f0',
  borderRadius: '0.55rem',
};
const cardHeaderRow = {
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  flexWrap: 'wrap',
  marginBottom: 6,
};
const statusPill = {
  display: 'inline-block',
  padding: '0.15rem 0.55rem',
  borderRadius: 999,
  fontSize: '0.7rem',
  fontWeight: 800,
  textTransform: 'uppercase',
  letterSpacing: '0.03em',
};
const repeatPill = {
  display: 'inline-block',
  padding: '0.15rem 0.5rem',
  borderRadius: 999,
  fontSize: '0.68rem',
  fontWeight: 800,
  background: '#fde68a',
  color: '#78350f',
};
const sharedPill = {
  display: 'inline-block',
  padding: '0.15rem 0.5rem',
  borderRadius: 999,
  fontSize: '0.65rem',
  fontWeight: 700,
  background: '#eef2ff',
  color: '#3730a3',
};
const dateText = {
  fontSize: '0.7rem',
  color: '#64748b',
};
const cardTitle = {
  fontSize: '0.86rem',
  fontWeight: 700,
  color: '#0f172a',
  marginBottom: 4,
};
const cardBody = {
  margin: '0 0 8px',
  fontSize: '0.78rem',
  color: '#334155',
  lineHeight: 1.45,
};
const cardFooter = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  flexWrap: 'wrap',
  fontSize: '0.72rem',
  paddingTop: 6,
  borderTop: '1px dashed #cbd5e1',
};
const severityBadge = {
  padding: '0.1rem 0.4rem',
  background: '#fff',
  border: '1px solid #cbd5e1',
  borderRadius: 6,
  fontSize: '0.68rem',
  fontWeight: 600,
  color: '#334155',
};
const sourceLink = {
  marginLeft: 'auto',
  color: '#4f46e5',
  fontWeight: 700,
  textDecoration: 'none',
};
const countSummary = {
  marginTop: 8,
  fontSize: '0.72rem',
  color: '#475569',
  textAlign: 'right',
};
