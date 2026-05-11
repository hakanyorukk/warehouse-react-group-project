import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import FormField from '../components/FormField';
import { btnPrimary, inputStyle } from '../styles';

export default function Login() {
  const { session, loading, signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!loading && session) return <Navigate to="/dashboard" replace />;

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setInfo('');
    setSubmitting(true);
    try {
      if (mode === 'signin') {
        const { error } = await signIn(email, password);
        if (error) setError(error.message);
        else navigate('/dashboard', { replace: true });
      } else {
        if (!fullName.trim()) {
          setError('Full name is required');
          return;
        }
        const { data, error } = await signUp(email, password, fullName.trim());
        if (error) {
          setError(error.message);
        } else if (data.session) {
          navigate('/dashboard', { replace: true });
        } else {
          setInfo('Check your email to confirm your account, then sign in.');
          setMode('signin');
        }
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      style={{
        width: '100%',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f4f5f7',
      }}
    >
      <div
        style={{
          width: 380,
          background: '#fff',
          borderRadius: 12,
          border: '1px solid #e5e7eb',
          padding: 32,
          boxShadow: '0 4px 24px rgba(0,0,0,0.04)',
        }}
      >
        <div style={{ marginBottom: 24 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: '0.1em',
              color: '#64748b',
              textTransform: 'uppercase',
              marginBottom: 4,
            }}
          >
            Warehouse
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1a1a2e', letterSpacing: '-0.02em' }}>
            Inventory System
          </h1>
          <p style={{ fontSize: 13, color: '#64748b', marginTop: 6 }}>
            {mode === 'signin' ? 'Sign in to your account' : 'Create a new account'}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {mode === 'signup' && (
            <FormField label="Full name">
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Alex Johnson"
                style={inputStyle}
                autoComplete="name"
              />
            </FormField>
          )}

          <FormField label="Email">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              style={inputStyle}
              autoComplete="email"
              required
            />
          </FormField>

          <FormField label="Password">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={inputStyle}
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
              required
              minLength={6}
            />
          </FormField>

          {error && (
            <div
              style={{
                background: '#fee2e2',
                color: '#b91c1c',
                padding: '9px 12px',
                borderRadius: 7,
                fontSize: 13,
                marginBottom: 14,
              }}
            >
              {error}
            </div>
          )}

          {info && (
            <div
              style={{
                background: '#dcfce7',
                color: '#15803d',
                padding: '9px 12px',
                borderRadius: 7,
                fontSize: 13,
                marginBottom: 14,
              }}
            >
              {info}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            style={{ ...btnPrimary, width: '100%', opacity: submitting ? 0.7 : 1 }}
          >
            {submitting ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <div style={{ textAlign: 'center', fontSize: 13, color: '#64748b', marginTop: 18 }}>
          {mode === 'signin' ? (
            <>
              No account?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setError('');
                  setInfo('');
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#2e3a6e',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: 13,
                  padding: 0,
                }}
              >
                Create one
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('signin');
                  setError('');
                  setInfo('');
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#2e3a6e',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: 13,
                  padding: 0,
                }}
              >
                Sign in
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
