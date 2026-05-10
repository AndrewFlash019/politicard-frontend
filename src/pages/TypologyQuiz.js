import React, { useEffect, useState } from 'react';
import { fetchTypologyQuestions, submitTypologyQuiz } from '../services/api';

const STORAGE_KEY = 'politiscore_typology_result';
const ANON_KEY = 'politicard_anon_uid';

function getAnonUserId() {
  try {
    let stored = localStorage.getItem(ANON_KEY);
    if (!stored) {
      stored = 'anon-' + Math.random().toString(36).slice(2) + Date.now().toString(36);
      localStorage.setItem(ANON_KEY, stored);
    }
    return stored;
  } catch (_) {
    return 'anon-volatile';
  }
}

// Plot a (-2,2) x (-2,2) point on a square chart. Economic axis horizontal:
// negative left, positive right. Social axis vertical: negative top, positive
// bottom — matches the political-compass convention.
function CompassChart({ economic, social, size = 220 }) {
  const half = size / 2;
  const cx = half + (economic / 2) * (half - 12);
  const cy = half + (social / 2) * (half - 12);
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label="Political compass position">
      <rect x="0" y="0" width={size} height={size} fill="#f8fafc" stroke="#e2e8f0" />
      <line x1="0" y1={half} x2={size} y2={half} stroke="#cbd5e1" strokeDasharray="4 4" />
      <line x1={half} y1="0" x2={half} y2={size} stroke="#cbd5e1" strokeDasharray="4 4" />
      <text x="6"        y="14"   fontSize="10" fill="#64748b" textAnchor="start">Liberal</text>
      <text x={size - 6} y="14"   fontSize="10" fill="#64748b" textAnchor="end">Authoritarian</text>
      <text x="6"        y={size - 6} fontSize="10" fill="#64748b" textAnchor="start">Left</text>
      <text x={size - 6} y={size - 6} fontSize="10" fill="#64748b" textAnchor="end">Right</text>
      <circle cx={cx} cy={cy} r="9" fill="#6366f1" stroke="#312e81" strokeWidth="2" />
    </svg>
  );
}

function Progress({ current, total }) {
  const pct = Math.round(((current) / total) * 100);
  return (
    <div style={{margin:'0 0 1.25rem'}}>
      <div style={{display:'flex', justifyContent:'space-between', fontSize:'0.7rem', color:'#64748b', fontWeight:700, marginBottom:'0.35rem'}}>
        <span>Question {current} of {total}</span>
        <span>{pct}%</span>
      </div>
      <div style={{height:8, background:'#e2e8f0', borderRadius:999, overflow:'hidden'}}>
        <div style={{width:`${pct}%`, height:'100%', background:'#6366f1', transition:'width 0.25s ease'}} />
      </div>
    </div>
  );
}

export default function TypologyQuiz({ onClose, onResult }) {
  const [questions, setQuestions] = useState(null);
  const [error, setError] = useState(null);
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    fetchTypologyQuestions().then((res) => {
      if (res.success && res.data) setQuestions(res.data.questions || []);
      else setError(res.error || 'Could not load quiz.');
    });
  }, []);

  const onPick = async (q, value) => {
    const next = { ...answers, [q.id]: value };
    setAnswers(next);
    if (idx + 1 < questions.length) {
      setIdx(idx + 1);
      return;
    }
    // Final answer — submit
    setSubmitting(true);
    const payload = Object.entries(next).map(([qid, v]) => ({ question_id: Number(qid), value: v }));
    const res = await submitTypologyQuiz({ userId: getAnonUserId(), answers: payload });
    setSubmitting(false);
    if (res.success && res.data) {
      const stamped = { ...res.data, completed_at: new Date().toISOString() };
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(stamped)); } catch (_) {}
      setResult(stamped);
      if (onResult) onResult(stamped);
    } else {
      setError(res.error || 'Submission failed.');
    }
  };

  if (error) {
    return (
      <div style={{padding:'2rem 1rem', maxWidth:'520px', margin:'0 auto', textAlign:'center'}}>
        <p style={{color:'#b91c1c', fontWeight:700}}>{error}</p>
        <button onClick={onClose} style={{marginTop:'0.85rem', padding:'0.5rem 1rem', borderRadius:8, border:'1px solid #e2e8f0', background:'#fff', cursor:'pointer'}}>Back</button>
      </div>
    );
  }

  if (!questions) {
    return (
      <div style={{padding:'2rem 1rem', textAlign:'center', color:'#64748b'}}>Loading quiz…</div>
    );
  }

  if (result) {
    return (
      <div style={{padding:'1.25rem 1rem 2.5rem', maxWidth:'520px', margin:'0 auto'}}>
        <div style={{textAlign:'center', marginBottom:'1.25rem'}}>
          <div style={{fontSize:'0.78rem', fontWeight:800, letterSpacing:'0.06em', color:'#64748b', textTransform:'uppercase'}}>
            Your political typology
          </div>
          <h1 style={{margin:'0.4rem 0 0.5rem', fontSize:'2rem', fontWeight:900, letterSpacing:'-0.02em', color:'#0f172a'}}>
            You are a {result.typology}
          </h1>
          <p style={{margin:0, color:'#475569', lineHeight:1.5}}>{result.description}</p>
        </div>
        <div style={{display:'flex', justifyContent:'center', marginBottom:'1.25rem'}}>
          <CompassChart economic={result.economic_score} social={result.social_score} />
        </div>
        <div style={{display:'flex', justifyContent:'space-around', fontSize:'0.78rem', color:'#475569', marginBottom:'1.25rem'}}>
          <div>Economic: <strong>{result.economic_score?.toFixed(2)}</strong></div>
          <div>Social: <strong>{result.social_score?.toFixed(2)}</strong></div>
        </div>
        <button
          onClick={onClose}
          style={{display:'block', width:'100%', padding:'0.85rem 1.25rem', borderRadius:12, border:'none', background:'#6366f1', color:'#fff', fontWeight:800, fontSize:'0.95rem', cursor:'pointer'}}
        >
          See how your officials align →
        </button>
      </div>
    );
  }

  const q = questions[idx];
  return (
    <div style={{padding:'1.25rem 1rem 2.5rem', maxWidth:'520px', margin:'0 auto'}}>
      <Progress current={idx + 1} total={questions.length} />
      <h2 style={{fontSize:'1.15rem', fontWeight:800, lineHeight:1.4, color:'#0f172a', marginBottom:'1rem'}}>
        {q.text}
      </h2>
      <div style={{display:'flex', flexDirection:'column', gap:'0.55rem'}}>
        {q.options.map((opt, i) => (
          <button
            key={i}
            disabled={submitting}
            onClick={() => onPick(q, opt.value)}
            style={{
              textAlign:'left', padding:'0.75rem 1rem', borderRadius:12,
              border:'1px solid #e2e8f0', background:'#fff',
              fontSize:'0.92rem', color:'#1e293b', cursor: submitting ? 'progress' : 'pointer',
              transition:'border-color 0.12s ease, transform 0.12s ease',
            }}
            onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.99)'}
            onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            {opt.text}
          </button>
        ))}
      </div>
      {submitting && idx === questions.length - 1 && (
        <p style={{marginTop:'1rem', textAlign:'center', color:'#64748b', fontSize:'0.85rem'}}>
          Calculating your typology…
        </p>
      )}
      {idx > 0 && !submitting && (
        <button
          onClick={() => setIdx(idx - 1)}
          style={{marginTop:'1.25rem', background:'transparent', border:'none', color:'#64748b', fontWeight:700, cursor:'pointer'}}
        >
          ← Back
        </button>
      )}
    </div>
  );
}

export function getStoredTypology() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (_) {
    return null;
  }
}

export function clearStoredTypology() {
  try { localStorage.removeItem(STORAGE_KEY); } catch (_) {}
}
