import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';
import Icon from '../components/Icon';
import FormField from '../components/FormField';
import { btnPrimary, inputStyle } from '../styles';

const STATS = [
  { value: '5', label: 'Modules' },
  { value: 'Real-time', label: 'Stock levels' },
  { value: 'CSV', label: 'Reports export' },
];

const DEMO_ACCOUNTS = [
  { label: 'Admin', sub: 'full access', email: 'admin@stockwell.com', password: 'admin123', admin: true },
  { label: 'Yomer Hakan', sub: 'staff', email: 'yomerhakanyoryuk@stockwell.com', password: 'staff123' },
  { label: 'Ahmet Kugu', sub: 'staff', email: 'ahmetkugu@stockwell.com', password: 'staff123' },
  { label: 'Gamze Beyti', sub: 'staff', email: 'gamzebeyti@stockwell.com', password: 'staff123' },
];

export default function Login() {
  const { session, loading, signIn } = useAuth();
  const navigate = useNavigate();

  // Pre-filled with the admin account — graders sign in with one click.
  const [email, setEmail] = useState('admin@stockwell.com');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!loading && session) return <Navigate to="/dashboard" replace />;

  async function attemptLogin(loginEmail, loginPassword) {
    setError('');
    setSubmitting(true);
    const { error: signInError } = await signIn(loginEmail, loginPassword);
    setSubmitting(false);
    if (signInError) setError(signInError.message);
    else navigate('/dashboard', { replace: true });
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your email');
      return;
    }
    if (!password) {
      setError('Please enter your password');
      return;
    }
    attemptLogin(email.trim(), password);
  }

  function quickLogin(acc) {
    setEmail(acc.email);
    setPassword(acc.password);
    attemptLogin(acc.email, acc.password);
  }

  return (
    <div className="login-shell">
      {/* ── Left brand panel (hidden on mobile via .login-brand) ── */}
      <div className="login-brand">
        <svg
          style={{ position: 'absolute', inset: 0, opacity: 0.07, width: '100%', height: '100%' }}
          viewBox="0 0 400 600"
          preserveAspectRatio="xMidYMid slice"
        >
          {Array.from({ length: 10 }).map((_, r) =>
            Array.from({ length: 7 }).map((_, c) => (
              <g key={`${r}-${c}`} transform={`translate(${c * 60 + (r % 2) * 30} ${r * 52})`}>
                <path d="M30 0 L60 15 L30 30 L0 15 Z" fill="#fff" />
                <path d="M0 15 L30 30 L30 60 L0 45 Z" fill="#fff" opacity="0.6" />
                <path d="M60 15 L30 30 L30 60 L60 45 Z" fill="#fff" opacity="0.8" />
              </g>
            ))
          )}
        </svg>

        <div style={{ position: 'relative' }}>
          <Logo size={48} color="#fff" wordColor="#fff" />
        </div>

        <div style={{ position: 'relative', maxWidth: 440 }}>
          <div
            style={{
              fontFamily: 'var(--font-head)',
              fontWeight: 600,
              fontSize: 38,
              lineHeight: 1.15,
              letterSpacing: '-0.025em',
              marginBottom: 18,
            }}
          >
            Keep track of every box on every shelf.
          </div>
          <p
            style={{
              fontSize: 15,
              lineHeight: 1.6,
              color: 'rgba(255,255,255,0.78)',
              maxWidth: 380,
            }}
          >
            A simple warehouse inventory system for recording stock movements, monitoring levels,
            and generating reports.
          </p>
          <div style={{ marginTop: 36, display: 'flex', gap: 22, flexWrap: 'wrap' }}>
            {STATS.map((s) => (
              <div key={s.label}>
                <div style={{ fontFamily: 'var(--font-head)', fontSize: 26, fontWeight: 600 }}>
                  {s.value}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: 'rgba(255,255,255,0.7)',
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                    marginTop: 2,
                  }}
                >
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ position: 'relative', fontSize: 12.5, color: 'rgba(255,255,255,0.6)' }}>
          University Project · 2026 · Warehouse Inventory System
        </div>
      </div>

      {/* ── Right form panel ───────────────────────────────── */}
      <div className="login-form-panel">
        <div style={{ width: '100%', maxWidth: 380 }} className="fade-in">
          <div className="login-logo-mobile" style={{ marginBottom: 22 }}>
            <Logo size={32} />
          </div>
          <div style={{ marginBottom: 28 }}>
            <div
              style={{
                fontFamily: 'var(--font-head)',
                fontSize: 13,
                fontWeight: 600,
                color: 'var(--c-accent)',
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                marginBottom: 8,
              }}
            >
              Welcome back
            </div>
            <h1
              style={{
                fontFamily: 'var(--font-head)',
                fontSize: 32,
                fontWeight: 600,
                color: 'var(--c-text)',
                letterSpacing: '-0.025em',
                lineHeight: 1.1,
              }}
            >
              Sign in to your account
            </h1>
            <p style={{ fontSize: 14, color: 'var(--c-text-muted)', marginTop: 8 }}>
              Enter your credentials to access the warehouse dashboard.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <FormField label="Email address">
              <div style={{ position: 'relative' }}>
                <span
                  style={{
                    position: 'absolute',
                    left: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--c-text-soft)',
                  }}
                >
                  <Icon name="mail" size={16} />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError('');
                  }}
                  placeholder="you@stockwell.com"
                  autoComplete="email"
                  style={{ ...inputStyle, paddingLeft: 38 }}
                />
              </div>
            </FormField>

            <FormField label="Password">
              <div style={{ position: 'relative' }}>
                <span
                  style={{
                    position: 'absolute',
                    left: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--c-text-soft)',
                  }}
                >
                  <Icon name="lock" size={16} />
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError('');
                  }}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  style={{ ...inputStyle, paddingLeft: 38 }}
                />
              </div>
            </FormField>

            {error && (
              <div
                style={{
                  background: 'var(--c-danger-bg)',
                  color: 'var(--c-danger)',
                  padding: '10px 14px',
                  borderRadius: 'var(--r-sm)',
                  fontSize: 13,
                  fontWeight: 500,
                  marginBottom: 14,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <Icon name="warn" size={15} /> {error}
              </div>
            )}

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                margin: '4px 0 22px',
                fontSize: 13,
              }}
            >
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 7,
                  cursor: 'pointer',
                  color: 'var(--c-text-muted)',
                }}
              >
                <input type="checkbox" defaultChecked style={{ accentColor: 'var(--c-primary)' }} />
                Remember me
              </label>
              <a
                href="#"
                onClick={(e) => e.preventDefault()}
                style={{ color: 'var(--c-primary)', fontWeight: 500 }}
              >
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              className="btn-primary"
              disabled={submitting}
              style={{
                ...btnPrimary,
                width: '100%',
                padding: '12px',
                fontSize: 15,
                opacity: submitting ? 0.7 : 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              {submitting ? (
                'Signing in…'
              ) : (
                <>
                  Sign in <Icon name="arrow" size={15} />
                </>
              )}
            </button>
          </form>

          {/* Quick login — demo accounts */}
          <div
            style={{
              marginTop: 18,
              padding: 14,
              background: 'var(--c-accent-soft)',
              border: '1px dashed #f7c477',
              borderRadius: 'var(--r-sm)',
            }}
          >
            <div style={{ fontSize: 12, fontWeight: 700, color: '#92400e', marginBottom: 8 }}>
              Quick login — demo accounts
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {DEMO_ACCOUNTS.map((a) => (
                <button
                  key={a.email}
                  type="button"
                  onClick={() => quickLogin(a)}
                  disabled={submitting}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    gap: 1,
                    padding: '8px 11px',
                    borderRadius: 'var(--r-sm)',
                    border: `1px solid ${a.admin ? 'var(--c-primary)' : 'var(--c-border-strong)'}`,
                    background: a.admin ? 'var(--c-primary)' : '#fff',
                    color: a.admin ? '#fff' : 'var(--c-text)',
                    cursor: submitting ? 'default' : 'pointer',
                    fontFamily: 'inherit',
                    textAlign: 'left',
                    opacity: submitting ? 0.7 : 1,
                  }}
                >
                  <span style={{ fontSize: 12.5, fontWeight: 600 }}>{a.label}</span>
                  <span style={{ fontSize: 10.5, opacity: 0.75 }}>{a.sub}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
