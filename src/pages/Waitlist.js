import React, { useState } from 'react';
import { postWaitlist } from '../services/api';

const styles = {
  screen: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0b1f4f 0%, #1a1a2e 50%, #2d1b3d 100%)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '1rem',
  },
  card: {
    background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1.5rem',
    padding: '2rem 1.75rem', width: '100%', maxWidth: '460px',
    display: 'flex', flexDirection: 'column', gap: '0.95rem',
    color: '#fff',
  },
  h1: { margin: 0, fontSize: '1.55rem', fontWeight: 800, letterSpacing: '-0.01em' },
  sub: { color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', margin: 0, lineHeight: 1.55 },
  input: {
    width: '100%', padding: '0.85rem 1rem', borderRadius: '0.75rem',
    border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.08)',
    color: '#fff', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box',
  },
  btn: {
    width: '100%', padding: '0.85rem', borderRadius: '0.75rem', border: 'none',
    background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
    color: '#fff', fontWeight: 800, fontSize: '1rem', cursor: 'pointer',
  },
  ok: { color: '#34d399', fontSize: '0.92rem', textAlign: 'center', margin: 0 },
  err: { color: '#f87171', fontSize: '0.85rem', textAlign: 'center', margin: 0 },
  pos: { color: '#fff', fontSize: '1.1rem', fontWeight: 800, textAlign: 'center', margin: '0.4rem 0' },
  share: {
    background: 'transparent', border: '1px solid rgba(255,255,255,0.2)',
    color: 'rgba(255,255,255,0.85)', padding: '0.6rem 0.9rem', borderRadius: 10,
    fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem',
  },
};

export default function Waitlist({ defaultZip = '', defaultSource = 'organic', onClose }) {
  const [email, setEmail] = useState('');
  const [zip, setZip] = useState(defaultZip);
  const [submitting, setSubmitting] = useState(false);
  const [position, setPosition] = useState(null);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email) { setError('Enter your email.'); return; }
    setSubmitting(true);
    const res = await postWaitlist({ email, zipCode: zip, source: defaultSource });
    setSubmitting(false);
    if (res.success) setPosition(res.data?.position ?? null);
    else setError(res.error || 'Could not join waitlist.');
  };

  const share = async () => {
    const text = "I just joined the PolitiScore waitlist — civic accountability for everyone. https://politiscore.com/waitlist";
    if (navigator.share) { try { await navigator.share({ text }); } catch (_) {} return; }
    if (navigator.clipboard) {
      try { await navigator.clipboard.writeText(text); alert('Copied to clipboard!'); } catch (_) {}
    }
  };

  return (
    <div style={styles.screen}>
      <form style={styles.card} onSubmit={submit}>
        <h1 style={styles.h1}>PolitiScore is coming to your state soon.</h1>
        {position == null ? (
          <>
            <p style={styles.sub}>
              We launched in Florida first. Drop your email and we'll let you know the moment your area is live.
            </p>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              required
            />
            <input
              type="text"
              placeholder="ZIP code (optional)"
              value={zip}
              onChange={(e) => setZip(e.target.value)}
              maxLength={5}
              style={styles.input}
            />
            {error && <p style={styles.err}>{error}</p>}
            <button type="submit" disabled={submitting} style={styles.btn}>
              {submitting ? 'Adding…' : 'Join the waitlist'}
            </button>
          </>
        ) : (
          <>
            <p style={styles.ok}>You're on the list! We'll notify you when PolitiScore launches in your area.</p>
            <p style={styles.pos}>You're #{position} on the waitlist</p>
            <button type="button" onClick={share} style={styles.share}>Share with friends →</button>
          </>
        )}
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            style={{...styles.share, alignSelf: 'center', border: 'none', background: 'transparent', textDecoration: 'underline'}}
          >
            ← Back
          </button>
        )}
      </form>
    </div>
  );
}
