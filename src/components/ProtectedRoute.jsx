import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--c-text-muted)',
          fontSize: 14,
          background: 'var(--c-bg)',
        }}
      >
        Loading…
      </div>
    );
  }

  if (!session) return <Navigate to="/login" replace />;

  return children;
}
