import React, { useEffect, useMemo, useState } from 'react';
import { fetchDistrict } from '../services/api';

/**
 * District-shape + demographics + who-drew-it chain panel.
 *
 *   <DistrictMapPanel planType="congressional" label="3" />
 *
 * Renders three colocated facts about a single legislative district:
 *
 *   1. THE SHAPE. The TIGER/Line polygon is drawn as inline SVG fitted
 *      to its bounding box. Inline SVG was chosen over a tiled basemap
 *      so the panel stays a self-contained drop-in (no Leaflet/Mapbox
 *      dependency) — the question on the page is "does this shape make
 *      sense to you?" and the shape itself is what matters for the
 *      answer. A future iteration can layer this over a government
 *      basemap if the bundle cost is justified.
 *
 *   2. THE PEOPLE INSIDE. Demographic composition with Census labels
 *      preserved verbatim, alongside the statewide benchmark share so
 *      a reader sees the district share next to the FL share. Never
 *      causal — composition is shown as a fact.
 *
 *   3. THE CHAIN. Drawn by → signed by → enacted on → court status.
 *      Each link points back to the FL Legislature redistricting
 *      portal / FL Senate bill tracker.
 *
 * Strict-display rules baked in:
 *   - Header (reader_prompt) and footer (limit_note) are rendered
 *     verbatim from the server payload. Centralizing the copy in the
 *     backend prevents a UI rewrite from inadvertently softening or
 *     hardening the language.
 *   - NO causal / intent words anywhere — the branch report greps the
 *     usual suspects to confirm they never appear in user-visible
 *     strings or in this file.
 *   - The court_outcome string already lives on the server and is
 *     factual, with a source_url back at the gov source.
 */

export default function DistrictMapPanel({ planType, label }) {
  const [payload, setPayload] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!planType || label == null) { setLoading(false); return; }
    let cancelled = false;
    setLoading(true);
    fetchDistrict(planType, label).then((res) => {
      if (cancelled) return;
      setPayload(res && res.success ? res.data : null);
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [planType, label]);

  if (loading) return null;
  if (!payload) return null;

  if (payload.awaiting_data) {
    return (
      <section style={wrap}>
        <h3 style={panelTitle}>🗺️ District map — {payload.plan_type_label} {payload.label}</h3>
        <div style={awaitingBox}>
          <div style={awaitingLabel}>Awaiting data</div>
          <div style={awaitingNote}>
            {payload.awaiting_note ||
              'Boundary shapes for this plan tier have not been centralized yet.'}
          </div>
        </div>
        <p style={limitNote}>{payload.limit_note}</p>
      </section>
    );
  }

  return (
    <section style={wrap}>
      <h3 style={panelTitle}>
        🗺️ {payload.plan_type_label} {payload.label}
      </h3>
      <p style={readerPrompt}>{payload.reader_prompt}</p>

      <ShapeView geometry={payload.geometry} centroid={payload.centroid} />

      <Chain chain={payload.chain} />

      <Demographics
        demographics={payload.demographics}
        statewide={payload.statewide_benchmark}
      />

      <SourcesFooter
        geom={payload.geometry_source}
        chain={payload.chain}
        demographics={payload.demographics}
      />

      <p style={limitNote}>{payload.limit_note}</p>
    </section>
  );
}

/* ───────────────────── shape view ───────────────────── */

function ShapeView({ geometry, centroid }) {
  const path = useMemo(() => geometryToSvg(geometry), [geometry]);
  if (!path) {
    return (
      <div style={shapeMissing}>
        Geometry could not be rendered for this district.
      </div>
    );
  }
  return (
    <div style={shapeBox}>
      <svg
        viewBox={path.viewBox}
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label="District boundary"
        style={shapeSvg}
      >
        <rect x={path.x0} y={path.y0} width={path.w} height={path.h}
              fill="#f8fafc" />
        <path d={path.d} fill="#dbeafe" stroke="#1d4ed8" strokeWidth={path.stroke} />
        {centroid && centroid.lat != null && centroid.lng != null && (
          <circle
            cx={path.project(centroid.lng, centroid.lat).x}
            cy={path.project(centroid.lng, centroid.lat).y}
            r={path.stroke * 2}
            fill="#1e3a8a"
          />
        )}
      </svg>
      {centroid && centroid.lat != null && (
        <div style={shapeCaption}>
          Centroid: {centroid.lat.toFixed(3)}°, {centroid.lng.toFixed(3)}°
        </div>
      )}
    </div>
  );
}

// Convert a GeoJSON Polygon / MultiPolygon into an SVG path string
// fitted to a viewBox. We invert latitude (SVG y grows downward).
function geometryToSvg(geo) {
  if (!geo) return null;
  let rings = [];
  if (geo.type === 'Polygon') {
    rings = geo.coordinates;
  } else if (geo.type === 'MultiPolygon') {
    rings = geo.coordinates.flat();
  } else {
    return null;
  }
  if (rings.length === 0) return null;

  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const ring of rings) {
    for (const pt of ring) {
      if (pt[0] < minX) minX = pt[0];
      if (pt[0] > maxX) maxX = pt[0];
      if (pt[1] < minY) minY = pt[1];
      if (pt[1] > maxY) maxY = pt[1];
    }
  }
  const w = maxX - minX || 1;
  const h = maxY - minY || 1;
  const pad = Math.max(w, h) * 0.04;
  // Translate (lng, lat) → SVG-local coords with origin at the bbox's
  // NW corner. SVG y grows downward, so flip latitude (maxY → 0 top,
  // minY → h bottom). preserveAspectRatio on the <svg> handles scaling.
  const project = (lng, lat) => ({
    x: lng - minX,
    y: maxY - lat,
  });

  const parts = rings.map((ring) => {
    const coords = ring.map((pt, i) => {
      const p = project(pt[0], pt[1]);
      return `${i === 0 ? 'M' : 'L'}${p.x.toFixed(5)},${p.y.toFixed(5)}`;
    }).join(' ');
    return coords + ' Z';
  }).join(' ');

  return {
    d: parts,
    viewBox: `${-pad} ${-pad} ${w + pad * 2} ${h + pad * 2}`,
    x0: -pad,
    y0: -pad,
    w: w + pad * 2,
    h: h + pad * 2,
    stroke: Math.max(w, h) * 0.003,
    project,
  };
}

/* ───────────────────── accountability chain ───────────────────── */

function Chain({ chain }) {
  if (!chain) return null;
  return (
    <div style={chainBox}>
      <div style={chainTitle}>Who drew this district</div>
      <ul style={chainList}>
        <li style={chainItem}>
          <span style={chainKey}>Drawn by</span>
          <span style={chainVal}>{chain.drawn_by || '—'}</span>
        </li>
        <li style={chainItem}>
          <span style={chainKey}>Signed by</span>
          <span style={chainVal}>
            {chain.signed_by || (
              <em style={{ color: '#64748b' }}>
                Not applicable — legislative joint resolutions are not signed by the governor (Fla. Const. Art. III, §16(c))
              </em>
            )}
          </span>
        </li>
        <li style={chainItem}>
          <span style={chainKey}>Enacted</span>
          <span style={chainVal}>{chain.enacted_date || '—'}</span>
        </li>
        <li style={chainItem}>
          <span style={chainKey}>Court status</span>
          <span style={chainVal}>
            {chain.court_outcome || (chain.court_challenged
              ? 'Litigated — see source for current status.'
              : 'No litigation on record.')}
          </span>
        </li>
      </ul>
      {chain.source_url && (
        <a href={chain.source_url} target="_blank" rel="noopener noreferrer"
           style={chainSourceLink}>
          Florida Legislature source ↗
        </a>
      )}
    </div>
  );
}

/* ───────────────────── demographics ───────────────────── */

function Demographics({ demographics, statewide }) {
  if (!demographics) return null;
  const stateByGroup = (statewide && statewide.race_ethnicity) ? Object.fromEntries(
    statewide.race_ethnicity.map((r) => [r.group, r.share_pct]),
  ) : {};
  const stateBySex = (statewide && statewide.sex) ? Object.fromEntries(
    statewide.sex.map((r) => [r.group, r.share_pct]),
  ) : {};
  const stageTotal = demographics.race_ethnicity?.[0]?.stage_total;

  return (
    <div style={demoBox}>
      <div style={demoTitle}>
        Who lives in this district
        {stageTotal != null && (
          <span style={demoTotal}> · total {Number(stageTotal).toLocaleString()}</span>
        )}
      </div>
      <DimTable
        title="Race / ethnicity"
        rows={demographics.race_ethnicity || []}
        statewide={stateByGroup}
      />
      <DimTable
        title="Sex"
        rows={demographics.sex || []}
        statewide={stateBySex}
      />
      {demographics.source_url && (
        <a href={demographics.source_url} target="_blank" rel="noopener noreferrer"
           style={demoSourceLink}>
          Census ACS source ↗
        </a>
      )}
    </div>
  );
}

function DimTable({ title, rows, statewide }) {
  if (!rows || rows.length === 0) return null;
  return (
    <div style={{ marginTop: 6 }}>
      <div style={dimHeader}>{title}</div>
      <table style={dimTable}>
        <thead>
          <tr style={{ color: '#475569', textAlign: 'left' }}>
            <th style={th}>group</th>
            <th style={thRight}>district</th>
            <th style={thRight}>FL statewide</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => {
            const sw = statewide[r.group];
            return (
              <tr key={i}>
                <td style={groupCell}>{r.group}</td>
                <td style={pctCell}>{r.share_pct != null ? `${r.share_pct.toFixed(1)}%` : '—'}</td>
                <td style={pctCellSecondary}>{sw != null ? `${Number(sw).toFixed(1)}%` : '—'}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* ───────────────────── sources footer ───────────────────── */

function SourcesFooter({ geom, chain, demographics }) {
  return (
    <div style={sourcesFooter}>
      <strong>Sources:</strong>{' '}
      {geom && geom.source_url && (
        <>
          <a href={geom.source_url} target="_blank" rel="noopener noreferrer"
             style={footLink}>boundary ({geom.source}) ↗</a>
          {' · '}
        </>
      )}
      {demographics && demographics.source_url && (
        <>
          <a href={demographics.source_url} target="_blank" rel="noopener noreferrer"
             style={footLink}>demographics ({demographics.source}) ↗</a>
          {' · '}
        </>
      )}
      {chain && chain.source_url && (
        <a href={chain.source_url} target="_blank" rel="noopener noreferrer"
           style={footLink}>accountability chain ↗</a>
      )}
    </div>
  );
}

/* ───────────────────── styles ───────────────────── */

const wrap = {
  margin: '0.7rem 1rem',
  padding: '0.95rem 1rem',
  background: '#fff',
  border: '1px solid #cbd5e1',
  borderRadius: '0.75rem',
};
const panelTitle = {
  margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#0f172a',
};
const readerPrompt = {
  margin: '6px 0 12px',
  fontSize: '0.78rem',
  color: '#334155',
  lineHeight: 1.55,
  fontStyle: 'italic',
  background: '#f1f5f9',
  padding: '8px 10px',
  borderLeft: '3px solid #1e3a8a',
  borderRadius: 4,
};
const shapeBox = {
  background: '#f8fafc',
  border: '1px solid #e2e8f0',
  borderRadius: '0.55rem',
  padding: '8px',
  marginBottom: 10,
};
const shapeSvg = { width: '100%', height: 260, display: 'block' };
const shapeCaption = {
  marginTop: 4, fontSize: '0.7rem', color: '#64748b', textAlign: 'center',
};
const shapeMissing = {
  background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '0.55rem',
  padding: '20px 12px', textAlign: 'center', color: '#64748b',
  fontSize: '0.78rem', marginBottom: 10,
};
const chainBox = {
  background: '#fff8f1',
  border: '1px solid #fed7aa',
  borderRadius: '0.55rem',
  padding: '0.65rem 0.8rem',
  marginBottom: 10,
};
const chainTitle = {
  fontSize: '0.78rem',
  fontWeight: 800,
  color: '#7c2d12',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  marginBottom: 6,
};
const chainList = { listStyle: 'none', margin: 0, padding: 0 };
const chainItem = {
  display: 'flex', gap: 8, padding: '3px 0',
  borderTop: '1px dashed #fed7aa', fontSize: '0.8rem',
};
const chainKey = {
  width: 110, color: '#9a3412', fontWeight: 700, flexShrink: 0,
};
const chainVal = { color: '#0f172a', flex: 1 };
const chainSourceLink = {
  display: 'inline-block', marginTop: 8, color: '#4f46e5',
  fontSize: '0.74rem', fontWeight: 700, textDecoration: 'none',
};
const demoBox = {
  background: '#fff',
  border: '1px solid #e2e8f0',
  borderRadius: '0.55rem',
  padding: '0.65rem 0.8rem',
  marginBottom: 10,
};
const demoTitle = {
  fontSize: '0.82rem',
  fontWeight: 800,
  color: '#0f172a',
  marginBottom: 4,
};
const demoTotal = { fontWeight: 500, color: '#64748b' };
const dimHeader = {
  fontSize: '0.72rem',
  fontWeight: 800,
  color: '#0f172a',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  marginTop: 4, marginBottom: 2,
};
const dimTable = { width: '100%', borderCollapse: 'collapse', fontSize: '0.76rem' };
const th = { fontWeight: 700, fontSize: '0.7rem', padding: '3px 4px' };
const thRight = { ...th, textAlign: 'right' };
const groupCell = { padding: '3px 4px', color: '#0f172a' };
const pctCell = {
  padding: '3px 4px', color: '#0f172a', fontWeight: 700,
  textAlign: 'right', fontVariantNumeric: 'tabular-nums', width: 80,
};
const pctCellSecondary = {
  padding: '3px 4px', color: '#475569',
  textAlign: 'right', fontVariantNumeric: 'tabular-nums', width: 90,
};
const demoSourceLink = {
  display: 'inline-block', marginTop: 6, color: '#4f46e5',
  fontSize: '0.74rem', fontWeight: 700, textDecoration: 'none',
};
const sourcesFooter = {
  fontSize: '0.72rem', color: '#475569', lineHeight: 1.6,
  padding: '6px 0', borderTop: '1px solid #f1f5f9',
};
const footLink = { color: '#4f46e5', textDecoration: 'none', fontWeight: 600 };
const awaitingBox = {
  margin: '8px 0', padding: '12px',
  background: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '0.55rem',
};
const awaitingLabel = {
  fontSize: '0.78rem', fontWeight: 800, color: '#64748b',
  textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4,
};
const awaitingNote = { fontSize: '0.76rem', color: '#475569', lineHeight: 1.5 };
const limitNote = {
  marginTop: 12, padding: '8px 10px',
  background: '#fefce8', border: '1px solid #fde68a', borderRadius: 6,
  fontSize: '0.72rem', color: '#713f12', lineHeight: 1.5,
};
