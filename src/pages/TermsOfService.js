import React from 'react';

const styles = {
  page: { maxWidth: 760, margin: '0 auto', padding: '1.5rem 1.25rem 3rem', color: '#1e293b', lineHeight: 1.6, fontSize: '0.95rem' },
  h1: { fontSize: '1.7rem', fontWeight: 800, margin: '0 0 0.4rem', letterSpacing: '-0.01em' },
  h2: { fontSize: '1.05rem', fontWeight: 800, margin: '1.6rem 0 0.4rem', color: '#0f172a' },
  meta: { color: '#64748b', fontSize: '0.78rem', marginBottom: '1.25rem' },
  p:  { margin: '0.4rem 0' },
  back: { display: 'inline-block', marginBottom: '1rem', color: '#6366f1', textDecoration: 'none', fontWeight: 700, fontSize: '0.85rem' },
};

export default function TermsOfService({ onBack }) {
  return (
    <div style={styles.page}>
      {onBack && <a href="/" onClick={(e) => { e.preventDefault(); onBack(); }} style={styles.back}>← Back</a>}
      <h1 style={styles.h1}>Terms of Service</h1>
      <div style={styles.meta}>Last updated: May 2026</div>

      <h2 style={styles.h2}>What PolitiScore is</h2>
      <p style={styles.p}>
        PolitiScore is a civic-information platform. We aggregate public records — voting histories, sponsorship
        records, committee assignments, campaign finance disclosures — and present them in a form ordinary
        residents can scan in seconds. We are not a legal-advice service, a political-advice service, or a
        replacement for your county's official communications.
      </p>

      <h2 style={styles.h2}>Your responsibilities</h2>
      <ul>
        <li>Don't manipulate vote counts (sock puppets, scripts, bot voting).</li>
        <li>Don't scrape the platform at volume; use the documented API where one is offered.</li>
        <li>Don't impersonate elected officials or PolitiScore staff.</li>
        <li>Use the "Report an error" button on a profile if you spot stale or wrong data.</li>
      </ul>

      <h2 style={styles.h2}>Data accuracy</h2>
      <p style={styles.p}>
        We pull from official sources — Congress.gov, GovTrack, OpenStates, the Florida Division of Elections,
        county supervisor of elections sites, FEC, etc. — but ingestion can lag and edge cases happen. Treat
        PolitiScore as best-effort civic information; verify important details against the underlying source
        before acting on them. Source links are on every record.
      </p>

      <h2 style={styles.h2}>Verified official accounts</h2>
      <p style={styles.p}>
        Coming soon. Officials will be able to claim their profile, respond to constituent votes, and post
        explanations of their voting record. Until then, all profiles are populated from public records.
      </p>

      <h2 style={styles.h2}>Limitation of liability</h2>
      <p style={styles.p}>
        PolitiScore is provided "as is." We are not responsible for decisions you make based on information
        displayed here, including voting decisions, contributions, or business decisions. To the maximum extent
        allowed by law our liability is limited to the amount you paid us — which is zero.
      </p>

      <h2 style={styles.h2}>Governing law</h2>
      <p style={styles.p}>
        These terms are governed by the laws of the State of Florida. Disputes will be resolved in courts
        sitting in Florida.
      </p>

      <h2 style={styles.h2}>Contact</h2>
      <p style={styles.p}>
        Legal questions: <a href="mailto:legal@politiscore.com">legal@politiscore.com</a>
      </p>
    </div>
  );
}
