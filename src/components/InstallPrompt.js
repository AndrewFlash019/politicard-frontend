import React, { useEffect, useState } from 'react';

const DISMISSED_KEY = 'politiscore_install_dismissed';

export default function InstallPrompt() {
  const [deferred, setDeferred] = useState(null);
  const [dismissed, setDismissed] = useState(() => {
    try { return localStorage.getItem(DISMISSED_KEY) === '1'; } catch (_) { return false; }
  });

  useEffect(() => {
    // Already running as installed PWA — don't show
    const standalone =
      window.matchMedia && window.matchMedia('(display-mode: standalone)').matches;
    if (standalone) return;
    const handler = (e) => {
      e.preventDefault();
      setDeferred(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  if (!deferred || dismissed) return null;

  const dismiss = () => {
    try { localStorage.setItem(DISMISSED_KEY, '1'); } catch (_) {}
    setDismissed(true);
  };

  const install = async () => {
    try {
      deferred.prompt();
      await deferred.userChoice;
    } catch (_) {}
    setDeferred(null);
  };

  return (
    <div style={{
      margin: '0.6rem 1rem 0', padding: '0.6rem 0.85rem',
      background: 'linear-gradient(135deg, #eef2ff, #ffffff)',
      border: '1px solid #c7d2fe', borderRadius: '0.7rem',
      display: 'flex', alignItems: 'center', gap: '0.6rem',
      boxShadow: '0 1px 2px rgba(15,23,42,0.04)',
    }}>
      <div style={{flex: 1, minWidth: 0}}>
        <div style={{fontSize: '0.85rem', fontWeight: 800, color: '#0f172a'}}>
          Add PolitiScore to your home screen →
        </div>
        <div style={{fontSize: '0.7rem', color: '#475569', marginTop: '0.1rem'}}>
          Faster access, works offline.
        </div>
      </div>
      <button
        onClick={install}
        style={{padding: '0.45rem 0.85rem', borderRadius: 9, border: 'none', background: '#6366f1', color: '#fff', fontWeight: 800, fontSize: '0.78rem', cursor: 'pointer', whiteSpace: 'nowrap'}}
      >
        Install
      </button>
      <button
        onClick={dismiss}
        title="Dismiss"
        style={{background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '1.05rem', cursor: 'pointer', padding: '0.25rem 0.4rem'}}
      >
        ×
      </button>
    </div>
  );
}
