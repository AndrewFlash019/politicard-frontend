import React, { useState } from 'react';
import { registerUser, loginUser } from './services/api';

export default function Login({ onAuth }) {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [form, setForm] = useState({ email: '', password: '', full_name: '', zip_code: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const update = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    let result;
    if (mode === 'login') {
      result = await loginUser({ email: form.email, password: form.password });
    } else {
      if (!form.full_name || !form.email || !form.password) {
        setError('Please fill in all required fields.');
        setLoading(false);
        return;
      }
      result = await registerUser({
        email: form.email,
        password: form.password,
        full_name: form.full_name,
        zip_code: form.zip_code || null,
      });
      // Auto-login after register
      if (result.success) {
        result = await loginUser({ email: form.email, password: form.password });
      }
    }

    setLoading(false);
    if (result.success) {
      onAuth(window._psUser || { email: form.email }, form.zip_code || null);
    } else {
      setError(result.error || 'Something went wrong. Please try again.');
    }
  };

  return (
    <div style={styles.screen}>
      <div style={styles.orb1} />
      <div style={styles.orb2} />

      <div style={styles.card}>
        {/* Logo */}
        <div style={styles.logoWrap}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 72" width={200} height={34}>
            <defs>
              <linearGradient id="nm" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#6b9fdf" />
                <stop offset="44%" stopColor="#a8c0ee" />
                <stop offset="50%" stopColor="#f0f0f8" />
                <stop offset="56%" stopColor="#dfa0a0" />
                <stop offset="100%" stopColor="#c94040" />
              </linearGradient>
            </defs>
            <text x="0" y="56" fontFamily="Georgia, serif" fontSize="60" fontWeight="700" fill="url(#nm)" letterSpacing="-2">PolitiScore</text>
          </svg>
        </div>

        <p style={styles.tagline}>Unbiased. Ad-free. Your elected officials, all in one place.</p>

        {/* Toggle */}
        <div style={styles.toggle}>
          <button
            onClick={() => { setMode('login'); setError(''); }}
            style={{ ...styles.toggleBtn, ...(mode === 'login' ? styles.toggleActive : {}) }}
          >
            Log In
          </button>
          <button
            onClick={() => { setMode('register'); setError(''); }}
            style={{ ...styles.toggleBtn, ...(mode === 'register' ? styles.toggleActive : {}) }}
          >
            Sign Up
          </button>
        </div>

        {/* Form */}
        <form onSubmit={submit} style={styles.form}>
          {mode === 'register' && (
            <input
              name="full_name"
              type="text"
              placeholder="Full Name"
              value={form.full_name}
              onChange={update}
              style={styles.input}
              required
            />
          )}

          <input
            name="email"
            type="email"
            placeholder="Email Address"
            value={form.email}
            onChange={update}
            style={styles.input}
            required
          />

          <input
            name="password"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={update}
            style={styles.input}
            required
          />

          {mode === 'register' && (
            <input
              name="zip_code"
              type="text"
              placeholder="ZIP Code (optional — set later)"
              value={form.zip_code}
              onChange={update}
              maxLength={5}
              style={styles.input}
            />
          )}

          {error && <p style={styles.error}>{error}</p>}

          <button type="submit" style={styles.btn} disabled={loading}>
            {loading ? 'Please wait...' : mode === 'login' ? 'Log In →' : 'Create Account →'}
          </button>
        </form>

        <p style={styles.note}>Free · No ads · No data selling</p>
      </div>
    </div>
  );
}

const styles = {
  screen: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0b1f4f 0%, #1a1a2e 50%, #2d1b3d 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1rem',
    position: 'relative',
    overflow: 'hidden',
  },
  orb1: {
    position: 'absolute', top: '-10%', left: '-10%',
    width: '500px', height: '500px', borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(107,159,223,0.15) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  orb2: {
    position: 'absolute', bottom: '-10%', right: '-10%',
    width: '400px', height: '400px', borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(201,64,64,0.12) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  card: {
    background: 'rgba(255,255,255,0.05)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '1.5rem',
    padding: '2.5rem 2rem',
    width: '100%',
    maxWidth: '420px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1.2rem',
    zIndex: 1,
  },
  logoWrap: { marginBottom: '0.2rem' },
  tagline: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: '0.85rem',
    textAlign: 'center',
    margin: 0,
    lineHeight: 1.5,
  },
  toggle: {
    display: 'flex',
    background: 'rgba(255,255,255,0.08)',
    borderRadius: '2rem',
    padding: '0.2rem',
    gap: '0.2rem',
    width: '100%',
  },
  toggleBtn: {
    flex: 1,
    padding: '0.6rem',
    border: 'none',
    borderRadius: '1.8rem',
    background: 'transparent',
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '600',
    fontSize: '0.9rem',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  toggleActive: {
    background: 'rgba(255,255,255,0.15)',
    color: '#ffffff',
  },
  form: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.8rem',
  },
  input: {
    width: '100%',
    padding: '0.85rem 1rem',
    borderRadius: '0.75rem',
    border: '1px solid rgba(255,255,255,0.15)',
    background: 'rgba(255,255,255,0.08)',
    color: '#ffffff',
    fontSize: '0.95rem',
    outline: 'none',
    boxSizing: 'border-box',
  },
  error: {
    color: '#f87171',
    fontSize: '0.85rem',
    textAlign: 'center',
    margin: 0,
  },
  btn: {
    width: '100%',
    padding: '0.9rem',
    borderRadius: '0.75rem',
    border: 'none',
    background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
    color: '#ffffff',
    fontWeight: '700',
    fontSize: '1rem',
    cursor: 'pointer',
    marginTop: '0.3rem',
  },
  note: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: '0.78rem',
    margin: 0,
  },
};
