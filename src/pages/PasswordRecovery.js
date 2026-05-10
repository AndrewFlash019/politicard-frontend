import React, { useEffect, useState } from 'react';
import { postForgotPassword, postResetPassword } from '../services/api';

const sharedStyles = {
  screen: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0b1f4f 0%, #1a1a2e 50%, #2d1b3d 100%)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '1rem',
  },
  card: {
    background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1.5rem',
    padding: '2rem 1.75rem', width: '100%', maxWidth: '420px',
    display: 'flex', flexDirection: 'column', gap: '0.95rem',
  },
  title: { color: '#fff', fontSize: '1.35rem', fontWeight: 800, margin: 0 },
  sub: { color: 'rgba(255,255,255,0.65)', fontSize: '0.85rem', margin: 0, lineHeight: 1.5 },
  input: {
    width: '100%', padding: '0.85rem 1rem', borderRadius: '0.75rem',
    border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.08)',
    color: '#fff', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box',
  },
  btn: {
    width: '100%', padding: '0.85rem', borderRadius: '0.75rem', border: 'none',
    background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
    color: '#fff', fontWeight: 700, fontSize: '1rem', cursor: 'pointer',
  },
  link: {
    background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.7)',
    cursor: 'pointer', fontSize: '0.85rem', textDecoration: 'underline',
    padding: 0, marginTop: '0.25rem', alignSelf: 'center',
  },
  ok: { color: '#34d399', fontSize: '0.9rem', textAlign: 'center', margin: 0 },
  err: { color: '#f87171', fontSize: '0.85rem', textAlign: 'center', margin: 0 },
};

export function ForgotPasswordScreen({ onBack }) {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    if (!email) { setError('Enter your email.'); return; }
    setSubmitting(true);
    setError('');
    const res = await postForgotPassword(email);
    setSubmitting(false);
    if (res.success) setDone(true);
    else setError(res.error || 'Could not send reset link.');
  };

  return (
    <div style={sharedStyles.screen}>
      <form style={sharedStyles.card} onSubmit={submit}>
        <h1 style={sharedStyles.title}>Reset your password</h1>
        {done ? (
          <>
            <p style={sharedStyles.ok}>Check your email for a reset link.</p>
            <p style={sharedStyles.sub}>If we have an account on file with that address, a reset link is on its way. The link is valid for 1 hour.</p>
          </>
        ) : (
          <>
            <p style={sharedStyles.sub}>Enter your email and we'll send you a link to reset your password.</p>
            <input
              type="email" placeholder="you@example.com"
              value={email} onChange={(e) => setEmail(e.target.value)}
              style={sharedStyles.input} required
            />
            {error && <p style={sharedStyles.err}>{error}</p>}
            <button type="submit" disabled={submitting} style={sharedStyles.btn}>
              {submitting ? 'Sending…' : 'Send reset link'}
            </button>
          </>
        )}
        <button type="button" onClick={onBack} style={sharedStyles.link}>← Back to login</button>
      </form>
    </div>
  );
}

export function ResetPasswordScreen({ onBackToLogin }) {
  const [token, setToken] = useState('');
  const [pw, setPw] = useState('');
  const [confirm, setConfirm] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    try {
      const url = new URL(window.location.href);
      setToken(url.searchParams.get('token') || '');
    } catch (_) {}
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!token) { setError('Reset token missing or invalid.'); return; }
    if (pw.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (pw !== confirm) { setError('Passwords do not match.'); return; }
    setSubmitting(true);
    const res = await postResetPassword({ token, newPassword: pw });
    setSubmitting(false);
    if (res.success) {
      setDone(true);
      setTimeout(() => {
        try {
          const u = new URL(window.location.href);
          u.searchParams.delete('token');
          u.pathname = '/';
          window.history.replaceState({}, '', u.toString());
        } catch (_) {}
        if (onBackToLogin) onBackToLogin();
      }, 1500);
    } else {
      setError(res.error || 'Could not reset password.');
    }
  };

  return (
    <div style={sharedStyles.screen}>
      <form style={sharedStyles.card} onSubmit={submit}>
        <h1 style={sharedStyles.title}>Pick a new password</h1>
        {done ? (
          <p style={sharedStyles.ok}>Password updated! Redirecting to login…</p>
        ) : (
          <>
            <input
              type="password" placeholder="New password (min 8)"
              value={pw} onChange={(e) => setPw(e.target.value)}
              style={sharedStyles.input} required
            />
            <input
              type="password" placeholder="Confirm new password"
              value={confirm} onChange={(e) => setConfirm(e.target.value)}
              style={sharedStyles.input} required
            />
            {error && <p style={sharedStyles.err}>{error}</p>}
            <button type="submit" disabled={submitting} style={sharedStyles.btn}>
              {submitting ? 'Updating…' : 'Update password'}
            </button>
          </>
        )}
      </form>
    </div>
  );
}
