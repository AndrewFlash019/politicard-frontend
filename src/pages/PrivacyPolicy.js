import React from 'react';

const styles = {
  page: { maxWidth: 760, margin: '0 auto', padding: '1.5rem 1.25rem 3rem', color: '#1e293b', lineHeight: 1.6, fontSize: '0.95rem' },
  h1: { fontSize: '1.7rem', fontWeight: 800, margin: '0 0 0.4rem', letterSpacing: '-0.01em' },
  h2: { fontSize: '1.05rem', fontWeight: 800, margin: '1.6rem 0 0.4rem', color: '#0f172a' },
  meta: { color: '#64748b', fontSize: '0.78rem', marginBottom: '1.25rem' },
  p:  { margin: '0.4rem 0' },
  back: { display: 'inline-block', marginBottom: '1rem', color: '#6366f1', textDecoration: 'none', fontWeight: 700, fontSize: '0.85rem' },
};

export default function PrivacyPolicy({ onBack }) {
  return (
    <div style={styles.page}>
      {onBack && <a href="/" onClick={(e) => { e.preventDefault(); onBack(); }} style={styles.back}>← Back</a>}
      <h1 style={styles.h1}>Privacy Policy</h1>
      <div style={styles.meta}>Last updated: May 2026</div>

      <p style={styles.p}>
        PolitiScore is a free civic-information service. We try to collect as little data as possible while still
        giving you a useful product. This page tells you exactly what we collect, what we do with it, and what
        we will never do.
      </p>

      <h2 style={styles.h2}>What we collect</h2>
      <ul>
        <li><strong>ZIP code.</strong> Required to look up the officials who represent you. Stored locally and used to query our backend.</li>
        <li><strong>Anonymous voting behavior.</strong> When you tap Support / Oppose / Neutral on a bill, we record the position with a per-device anonymous ID (no email, no IP, no name). This is what powers the constituent-vote counts you see on each card.</li>
        <li><strong>Typology quiz answers.</strong> Stored against the same anonymous ID so we can compute your alignment scores.</li>
        <li><strong>Email and password.</strong> Only if you choose to register an account. Used solely for sign-in and password recovery. Passwords are bcrypt-hashed.</li>
        <li><strong>Aggregate analytics.</strong> Page views, vote counts, search queries, quiz completions — fully anonymous. You can opt out below.</li>
      </ul>

      <h2 style={styles.h2}>What we do with it</h2>
      <ul>
        <li>Show you the right officials, bills, and votes for your area.</li>
        <li>Compute aggregate constituent-vote tallies that everyone sees on each card.</li>
        <li>Compute your alignment scores against your reps.</li>
        <li>Diagnose errors and improve the product.</li>
      </ul>

      <h2 style={styles.h2}>What we will never do</h2>
      <ul>
        <li>Sell your personal data.</li>
        <li>Share your individual voting records with anyone.</li>
        <li>Display your individual votes publicly. Only aggregate counts are shown.</li>
        <li>Use third-party advertising or tracking pixels.</li>
        <li>Email you anything you didn't sign up for.</li>
      </ul>

      <h2 style={styles.h2}>Data retention</h2>
      <p style={styles.p}>
        Anonymous votes are retained indefinitely in aggregate so historical alignment scores remain meaningful.
        Email accounts are deleted on request — write to <a href="mailto:privacy@politiscore.com">privacy@politiscore.com</a>.
      </p>

      <h2 style={styles.h2}>Florida law</h2>
      <p style={styles.p}>
        We comply with the Florida Deceptive and Unfair Trade Practices Act (FDUTPA). If you believe we've handled
        your data improperly, you can file a complaint with the Florida Attorney General.
      </p>

      <h2 style={styles.h2}>Opt out of anonymous analytics</h2>
      <p style={styles.p}>
        Click the button below to stop sending anonymous usage events from this device. Your civic data still
        loads normally — we just won't record page views or aggregate-engagement counters from you.
      </p>
      <button
        onClick={() => {
          try { localStorage.setItem('analytics_opted_out', '1'); } catch (_) {}
          alert('Anonymous analytics turned off on this device.');
        }}
        style={{padding: '0.6rem 1rem', borderRadius: 10, border: '1px solid #e2e8f0', background: '#f8fafc', color: '#475569', fontWeight: 700, cursor: 'pointer'}}
      >
        Opt out of analytics
      </button>

      <h2 style={styles.h2}>Contact</h2>
      <p style={styles.p}>
        Questions? <a href="mailto:privacy@politiscore.com">privacy@politiscore.com</a>
      </p>
    </div>
  );
}
