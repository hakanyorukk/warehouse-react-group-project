import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Centered({ children }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 320,
        color: 'var(--c-text-muted)',
        fontSize: 14,
      }}
    >
      {children}
    </div>
  );
}

/**
 * Guards admin-only pages. Staff are redirected to the dashboard.
 * Used inside the Layout, so it renders within the main content area.
 */
export default function AdminRoute({ children }) {
  const { loading, session, profile } = useAuth();

  if (loading) return <Centered>Loading…</Centered>;
  if (!session) return <Navigate to="/login" replace />;
  if (!profile) return <Centered>Loading…</Centered>;
  if (profile.role !== 'admin') return <Navigate to="/dashboard" replace />;

  return children;
}
