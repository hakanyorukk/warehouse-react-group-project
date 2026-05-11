import { NavLink, useNavigate } from 'react-router-dom';
import Icon from './Icon';
import { useAuth } from '../context/AuthContext';

const NAV = [
  { to: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
  { to: '/entry', label: 'Stock Entry', icon: 'entry' },
  { to: '/writedown', label: 'Write-Down', icon: 'writedown' },
  { to: '/reports', label: 'Stock Report', icon: 'report' },
  { to: '/products', label: 'Products', icon: 'products' },
];

export default function Sidebar() {
  const { profile, session, signOut } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await signOut();
    navigate('/login', { replace: true });
  }

  const userName = profile?.full_name || session?.user?.email || 'User';
  const userRole = profile?.role || 'staff';

  return (
    <aside
      style={{
        width: 220,
        background: '#1a1a2e',
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        height: '100vh',
      }}
    >
      <div style={{ padding: '24px 20px 16px' }}>
        <div
          style={{
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '0.1em',
            color: '#6b7db3',
            marginBottom: 4,
            textTransform: 'uppercase',
          }}
        >
          Warehouse
        </div>
        <div style={{ fontSize: 18, fontWeight: 700, color: '#fff', letterSpacing: '-0.02em' }}>
          Inventory System
        </div>
      </div>

      <div style={{ height: 1, background: '#2e2e4a', margin: '0 20px 16px' }} />

      <nav style={{ flex: 1, padding: '0 12px' }}>
        {NAV.map((n) => (
          <NavLink
            key={n.to}
            to={n.to}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              width: '100%',
              padding: '10px 12px',
              borderRadius: 7,
              background: isActive ? '#2e3a6e' : 'transparent',
              color: isActive ? '#fff' : '#8892b0',
              fontSize: 14,
              fontWeight: isActive ? 600 : 400,
              marginBottom: 2,
              textDecoration: 'none',
              transition: 'background 0.15s, color 0.15s',
            })}
          >
            {({ isActive }) => (
              <>
                <Icon name={n.icon} size={16} color={isActive ? '#6c9fff' : '#6b7db3'} />
                {n.label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div style={{ padding: '16px 20px', borderTop: '1px solid #2e2e4a' }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#cdd6f4' }}>{userName}</div>
        <div style={{ fontSize: 11, color: '#6b7db3', marginTop: 2, marginBottom: 10 }}>
          {userRole}
        </div>
        <button
          onClick={handleLogout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: 'transparent',
            border: '1px solid #2e2e4a',
            color: '#8892b0',
            padding: '6px 10px',
            borderRadius: 6,
            fontSize: 12,
            cursor: 'pointer',
            width: '100%',
          }}
        >
          <Icon name="logout" size={14} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
