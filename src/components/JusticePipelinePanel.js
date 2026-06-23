import React, { useEffect, useState } from 'react';
import { fetchCountyJusticePipeline } from '../services/api';

/**
 * Justice-pipeline composition panel for a county.
 *
 *   <JusticePipelinePanel county="Alachua" />
 *
 * The point of this layer is to show, from government sources, the
 * demographic composition at each successive stage of the justice
 * pipeline (population -> arrest -> charges filed -> conviction ->
 * sentence to incarceration), with strict display rules:
 *
 *  1. Show the structure ALWAYS. Every stage renders, even when the
 *     upstream source has not been ingested yet. A stage in isolation
 *     would let a reader form an impression off one number; the
 *     structure prevents that by surfacing the awaiting-data placeholders
 *     side-by-side with the populated stage.
 *
 *  2. Header and limit note are rendered VERBATIM from the server. The
 *     copy is the contract: "Composition at each stage, from government
 *     sources. This shows what the data is, not why. A difference
 *     between stages is a fact to examine, not a conclusion." Any change
 *     to that string has to happen in the backend, not the UI, so it
 *     stays auditable in one place.
 *
 *  3. Each populated row carries the source link inline. No source ->
 *     not shown (the backend already drops sourceless rows).
 *
 *  4. Each stage shows the office that ACTS at it (sheriff for arrest,
 *     state attorney for charging, judiciary for conviction and
 *     sentencing). The attribution travels with the data.
 *
 *  5. Demographic group labels are rendered VERBATIM as the source
 *     publishes them. No relabeling, no aggregation, no "people of
 *     color" rollups.
 *
 *  6. NO causal or intent verbs anywhere in this file. This is enforced
 *     by a grep in the branch report.
 */

const STAGE_ICON = {
  population: '👥',
  arrest: '🚔',
  charge_filed: '📄',
  conviction: '⚖️',
  sentence_incarceration: '🏛️',
};

function fmtPct(p) {
  if (p == null || Number.isNaN(Number(p))) return '—';
  return `${Number(p).toFixed(1)}%`;
}
function fmtCount(n) {
  if (n == null || Number.isNaN(Number(n))) return '—';
  return Number(n).toLocaleString();
}

export default function JusticePipelinePanel({ county }) {
  const [payload, setPayload] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!county) { setLoading(false); return; }
    let cancelled = false;
    setLoading(true);
    fetchCountyJusticePipeline(county).then((res) => {
      if (cancelled) return;
      setPayload(res && res.success ? res.data : null);
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [county]);

  if (loading) return null;
  if (!payload || !Array.isArray(payload.stages) || payload.stages.length === 0) {
    return null;
  }

  const populated = payload.populated_stages || 0;
  const total = payload.total_stages || payload.stages.length;

  return (
    <section style={wrap}>
      <h3 style={panelTitle}>🧭 Justice pipeline composition — {payload.county}</h3>
      <p style={headerCopy}>{payload.header}</p>

      <div style={progressBar}>
        <span style={{ ...progressFill, width: `${(populated / total) * 100}%` }} />
        <span style={progressText}>
          {populated} of {total} stages with published data
        </span>
      </div>

      <ol style={stageList}>
        {payload.stages.map((stage) => (
          <li key={stage.key} style={stageItem}>
            <div style={stageHeader}>
              <span style={stageIcon}>{STAGE_ICON[stage.key] || '•'}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={stageTitle}>
                  <span style={stageNum}>Stage {stage.order}</span>{' '}
                  {stage.label}
                </div>
                <div style={stageOffice}>
                  <strong>Acting body: </strong>{stage.attribution.office}
                </div>
                <div style={stageOfficeRole}>
                  {stage.attribution.office_role}
                </div>
              </div>
              {stage.year && (
                <span style={yearTag}>{stage.year}</span>
              )}
            </div>

            {stage.awaiting_data ? (
              <div style={awaitingBox}>
                <div style={awaitingLabel}>Awaiting data</div>
                <div style={awaitingNote}>
                  Expected source: {stage.attribution.expected_source}.
                  This stage renders as a placeholder until those records
                  are ingested. The structure is shown alongside the
                  populated stages so no single stage is presented in
                  isolation.
                </div>
              </div>
            ) : (
              <DimensionGroups dims={stage.dimensions} />
            )}
          </li>
        ))}
      </ol>

      <p style={limitNote}>{payload.limit_note}</p>
    </section>
  );
}

function DimensionGroups({ dims }) {
  const keys = Object.keys(dims || {});
  if (keys.length === 0) return null;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {keys.map((dimKey) => {
        const rows = dims[dimKey] || [];
        if (rows.length === 0) return null;
        const stageTotal = rows[0] && rows[0].stage_total;
        return (
          <div key={dimKey} style={dimBox}>
            <div style={dimHeader}>
              {dimKey === 'race_ethnicity' ? 'Race / ethnicity' :
               dimKey === 'sex' ? 'Sex' : dimKey}
              {stageTotal != null && (
                <span style={dimDenom}>· total {fmtCount(stageTotal)}</span>
              )}
            </div>
            <table style={dimTable}>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={i}>
                    <td style={groupCell}>{r.group}</td>
                    <td style={countCell}>{fmtCount(r.count)}</td>
                    <td style={pctCell}>{fmtPct(r.share_pct)}</td>
                    <td style={srcCell}>
                      {r.source_url && (
                        <a href={r.source_url} target="_blank"
                           rel="noopener noreferrer" style={srcLink}>
                          source ↗
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      })}
    </div>
  );
}

const wrap = {
  margin: '0.7rem 1rem',
  padding: '0.95rem 1rem',
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
  margin: '6px 0 10px',
  fontSize: '0.78rem',
  color: '#334155',
  lineHeight: 1.55,
  fontStyle: 'italic',
  background: '#f1f5f9',
  padding: '8px 10px',
  borderLeft: '3px solid #64748b',
  borderRadius: 4,
};
const progressBar = {
  position: 'relative',
  height: 22,
  background: '#e2e8f0',
  borderRadius: 11,
  overflow: 'hidden',
  margin: '8px 0 14px',
};
const progressFill = {
  position: 'absolute',
  left: 0, top: 0, bottom: 0,
  background: 'linear-gradient(90deg,#94a3b8,#64748b)',
};
const progressText = {
  position: 'relative',
  display: 'block',
  textAlign: 'center',
  fontSize: '0.72rem',
  fontWeight: 700,
  color: '#0f172a',
  lineHeight: '22px',
};
const stageList = {
  listStyle: 'none', margin: 0, padding: 0,
  display: 'flex', flexDirection: 'column', gap: 10,
};
const stageItem = {
  padding: '0.7rem 0.85rem',
  background: '#f8fafc',
  border: '1px solid #e2e8f0',
  borderRadius: '0.6rem',
};
const stageHeader = {
  display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 8,
};
const stageIcon = { fontSize: '1.4rem', lineHeight: 1 };
const stageTitle = {
  fontSize: '0.92rem',
  fontWeight: 800,
  color: '#0f172a',
};
const stageNum = {
  display: 'inline-block',
  padding: '0.05rem 0.4rem',
  background: '#0f172a',
  color: '#fff',
  fontSize: '0.66rem',
  fontWeight: 800,
  borderRadius: 5,
  marginRight: 6,
  textTransform: 'uppercase',
};
const stageOffice = {
  fontSize: '0.76rem',
  color: '#0f172a',
  marginTop: 3,
};
const stageOfficeRole = {
  fontSize: '0.72rem',
  color: '#475569',
  marginTop: 2,
  lineHeight: 1.4,
};
const yearTag = {
  fontSize: '0.66rem',
  color: '#475569',
  fontWeight: 700,
  padding: '0.15rem 0.45rem',
  background: '#e2e8f0',
  borderRadius: 9,
  whiteSpace: 'nowrap',
};
const awaitingBox = {
  padding: '0.55rem 0.7rem',
  background: '#fff',
  border: '1px dashed #cbd5e1',
  borderRadius: '0.5rem',
};
const awaitingLabel = {
  fontSize: '0.74rem',
  fontWeight: 800,
  color: '#64748b',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  marginBottom: 4,
};
const awaitingNote = {
  fontSize: '0.74rem',
  color: '#475569',
  lineHeight: 1.5,
};
const dimBox = {
  background: '#fff',
  border: '1px solid #e2e8f0',
  borderRadius: '0.5rem',
  padding: '0.4rem 0.55rem',
};
const dimHeader = {
  fontSize: '0.72rem',
  fontWeight: 800,
  color: '#0f172a',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  marginBottom: 4,
};
const dimDenom = {
  marginLeft: 6,
  fontSize: '0.7rem',
  color: '#64748b',
  fontWeight: 600,
  textTransform: 'none',
  letterSpacing: 0,
};
const dimTable = {
  width: '100%',
  borderCollapse: 'collapse',
  fontSize: '0.76rem',
};
const groupCell = {
  padding: '3px 4px',
  color: '#0f172a',
};
const countCell = {
  padding: '3px 4px',
  color: '#334155',
  textAlign: 'right',
  fontVariantNumeric: 'tabular-nums',
};
const pctCell = {
  padding: '3px 4px',
  color: '#0f172a',
  fontWeight: 700,
  textAlign: 'right',
  fontVariantNumeric: 'tabular-nums',
  width: 64,
};
const srcCell = {
  padding: '3px 4px',
  textAlign: 'right',
  width: 80,
};
const srcLink = {
  color: '#4f46e5',
  fontSize: '0.7rem',
  textDecoration: 'none',
  fontWeight: 700,
};
const limitNote = {
  marginTop: 12,
  padding: '8px 10px',
  background: '#fefce8',
  border: '1px solid #fde68a',
  borderRadius: 6,
  fontSize: '0.74rem',
  color: '#713f12',
  lineHeight: 1.5,
};
