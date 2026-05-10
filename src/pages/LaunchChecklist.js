import React, { useEffect, useState } from 'react';
import { fetchHealth } from '../services/api';

const Row = ({ ok, label, detail }) => (
  <div style={{
    display: 'flex', alignItems: 'flex-start', gap: '0.6rem',
    padding: '0.6rem 0.85rem',
    background: ok === true ? '#ecfdf5' : ok === false ? '#fef2f2' : '#f8fafc',
    border: `1px solid ${ok === true ? '#bbf7d0' : ok === false ? '#fecaca' : '#e2e8f0'}`,
    borderRadius: 8, marginBottom: '0.4rem',
  }}>
    <span style={{fontSize: '1.1rem', lineHeight: 1}}>
      {ok === true ? '✅' : ok === false ? '❌' : '⏳'}
    </span>
    <div style={{flex: 1, minWidth: 0}}>
      <div style={{fontWeight: 700, fontSize: '0.9rem', color: '#0f172a'}}>{label}</div>
      {detail && <div style={{fontSize: '0.78rem', color: '#475569', marginTop: '0.15rem'}}>{detail}</div>}
    </div>
  </div>
);

export default function LaunchChecklist() {
  const [health, setHealth] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchHealth().then((res) => {
      if (res.success) setHealth(res.data);
      else setError(res.error || 'Could not reach /health');
    });
  }, []);

  const env = health?.env;
  const dbOk = health?.database === 'connected';
  const officialsOk = (health?.officials_count || 0) >= 2400;
  const cardsOk = (health?.feed_cards_count || 0) >= 14000;

  return (
    <div style={{maxWidth: 720, margin: '0 auto', padding: '1.5rem 1.25rem 3rem', color: '#0f172a'}}>
      <h1 style={{margin: 0, fontSize: '1.6rem', fontWeight: 800}}>Launch Readiness Dashboard</h1>
      <p style={{color: '#64748b', fontSize: '0.85rem', margin: '0.4rem 0 1.2rem'}}>
        Internal page. Not linked from public navigation. When every row below is green we can flip the switch.
      </p>

      <h2 style={{fontSize: '1rem', fontWeight: 800, margin: '1rem 0 0.5rem'}}>Backend health</h2>
      {error && <Row ok={false} label="API unreachable" detail={error} />}
      {!error && !health && <Row ok={null} label="Probing /health…" />}
      {health && (
        <>
          <Row ok={dbOk} label="Database connected" detail={`status: ${health.database}`} />
          <Row ok={officialsOk}
               label={`Officials loaded (${health.officials_count?.toLocaleString() || '?'})`}
               detail={officialsOk ? 'Above launch threshold (2,400)' : 'Below launch threshold (2,400)'} />
          <Row ok={cardsOk}
               label={`Feed cards loaded (${health.feed_cards_count?.toLocaleString() || '?'})`}
               detail={cardsOk ? 'Above launch threshold (14,000)' : 'Below launch threshold (14,000)'} />
          <Row ok={env === 'production'} label="Environment = production" detail={`current: ${env || 'unknown'}`} />
        </>
      )}

      <h2 style={{fontSize: '1rem', fontWeight: 800, margin: '1.5rem 0 0.5rem'}}>Infrastructure (manual verify)</h2>
      <Row ok={null} label="Custom domain configured (politiscore.com)" detail="Verify in Netlify → Domain Settings" />
      <Row ok={null} label="Supabase Pro (no auto-pause)" detail="Verify at supabase.com → Project → Billing" />
      <Row ok={null} label="Render Starter or higher (no spin-down)" detail="Verify at render.com → service → Settings" />
      <Row ok={null} label="Supabase email auth configured" detail="Send a forgot-password test email" />

      <h2 style={{fontSize: '1rem', fontWeight: 800, margin: '1.5rem 0 0.5rem'}}>Code surface</h2>
      <Row ok={true}  label="Real authentication scaffolding" detail="Supabase JS client wired in src/lib/supabase.js" />
      <Row ok={true}  label="Privacy policy live" detail="/privacy" />
      <Row ok={true}  label="Terms of service live" detail="/terms" />
      <Row ok={true}  label="Rate limiting active (server-side)" detail="slowapi 60-120/min, 10/min on /auth/*" />
      <Row ok={true}  label="Error monitoring (Sentry) wired" detail="Auto-init when REACT_APP_SENTRY_DSN is set" />
      <Row ok={true}  label="First-party analytics wired" detail="POST /analytics/event, opt-out honored" />
      <Row ok={true}  label="PWA installable" detail="manifest.json + sw.js + offline.html" />
      <Row ok={true}  label="Feed routing by county working" detail="federal cards statewide, state/local by county" />
      <Row ok={null}  label="All officials have real photos" detail="See needs_photo column; Wikipedia/Bioguide pass shipped" />
      <Row ok={true}  label="RLS enabled" detail="13 tables locked down with public_read / anon_insert policies" />
    </div>
  );
}
