import React, { useState } from 'react';

const KEY = 'politiscore_cookie_consent';

export default function CookieConsent({ onLearnMore }) {
  const [hidden, setHidden] = useState(() => {
    try { return localStorage.getItem(KEY) === '1'; } catch (_) { return false; }
  });
  if (hidden) return null;

  const accept = () => {
    try { localStorage.setItem(KEY, '1'); } catch (_) {}
    setHidden(true);
  };

  return (
    <div
      role="region"
      aria-label="Privacy notice"
      style={{
        position: 'fixed', bottom: '0.6rem', left: '0.6rem', right: '0.6rem',
        background: '#0f172a', color: '#e2e8f0',
        padding: '0.6rem 0.85rem', borderRadius: 12, zIndex: 999,
        display: 'flex', alignItems: 'center', gap: '0.6rem',
        boxShadow: '0 6px 20px rgba(0,0,0,0.18)',
        fontSize: '0.78rem', flexWrap: 'wrap',
      }}
    >
      <span style={{flex: 1, minWidth: '180px', lineHeight: 1.4}}>
        PolitiScore uses local storage to remember your ZIP code and voting preferences. We don't use tracking cookies or sell your data.
      </span>
      <div style={{display: 'flex', gap: '0.4rem'}}>
        <button
          onClick={onLearnMore}
          style={{padding: '0.4rem 0.7rem', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'transparent', color: '#cbd5e1', fontWeight: 700, cursor: 'pointer', fontSize: '0.75rem'}}
        >
          Learn more
        </button>
        <button
          onClick={accept}
          style={{padding: '0.4rem 0.85rem', borderRadius: 8, border: 'none', background: '#6366f1', color: '#fff', fontWeight: 800, cursor: 'pointer', fontSize: '0.78rem'}}
        >
          Got it
        </button>
      </div>
    </div>
  );
}
