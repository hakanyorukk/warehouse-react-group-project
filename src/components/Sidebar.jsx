import { NavLink, useNavigate } from 'react-router-dom';
import Logo from './Logo';
import Icon from './Icon';
import { useAuth } from '../context/AuthContext';

const NAV = [
  { to: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
  { to: '/entry', label: 'Stock Entry', icon: 'entry' },
  { to: '/writedown', label: 'Write-Down', icon: 'writedown' },
  { to: '/reports', label: 'Stock Report', icon: 'report' },
  { to: '/products', label: 'Products', icon: 'products' },
  { to: '/users', label: 'Users', icon: 'users', adminOnly: true },
];

function getInitials(name, email) {
  if (name && name.trim()) {
    return name
      .trim()
      .split(/\s+/)
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }
  return (email || '?').slice(0, 2).toUpperCase();
}

export default function Sidebar({ open, onClose }) {
  const { profile, session, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();

  const name = profile?.full_name || session?.user?.email || 'User';
  const role = profile?.role || 'staff';
  const email = session?.user?.email || '';

  async function handleLogout() {
    onClose?.();
    await signOut();
    navigate('/login', { replace: true });
  }

  const navItems = NAV.filter((n) => !n.adminOnly || isAdmin);

  return (
    <aside className={'sidebar' + (open ? ' open' : '')}>
      <div style={{ padding: '0 22px 18px' }}>
        <Logo size={30} color="#fff" wordColor="#fff" />
      </div>

      <div style={{ height: 1, background: 'rgba(255,255,255,0.1)', margin: '0 22px 14px' }} />

      <div
        style={{
          padding: '0 22px 8px',
          fontSize: 10.5,
          color: 'rgba(255,255,255,0.5)',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          fontWeight: 600,
        }}
      >
        Workspace
      </div>

      <nav style={{ flex: 1, padding: '0 12px' }}>
        {navItems.map((n) => (
          <NavLink
            key={n.to}
            to={n.to}
            onClick={onClose}
            className={({ isActive }) => 'nav-item' + (isActive ? ' active' : '')}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: 11,
              width: '100%',
              padding: '10px 12px',
              borderRadius: 7,
              color: isActive ? '#fff' : 'rgba(255,255,255,0.7)',
              fontSize: 14,
              fontWeight: isActive ? 600 : 500,
              marginBottom: 2,
              borderLeft: isActive ? '3px solid var(--c-accent)' : '3px solid transparent',
              paddingLeft: isActive ? 9 : 12,
              transition: 'color 0.15s',
            })}
          >
            {({ isActive }) => (
              <>
                <Icon
                  name={n.icon}
                  size={16}
                  color={isActive ? 'var(--c-accent)' : 'rgba(255,255,255,0.65)'}
                />
                {n.label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div
        style={{
          padding: '14px 18px 0',
          borderTop: '1px solid rgba(255,255,255,0.1)',
          marginTop: 14,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: '50%',
              background: 'var(--c-accent)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: 13,
              fontFamily: 'var(--font-head)',
              flexShrink: 0,
            }}
          >
            {getInitials(profile?.full_name, email)}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: '#fff',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {name}
            </div>
            <span
              style={{
                display: 'inline-block',
                marginTop: 3,
                background: 'rgba(255,255,255,0.12)',
                color: isAdmin ? 'var(--c-accent)' : 'rgba(255,255,255,0.7)',
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                padding: '2px 7px',
                borderRadius: 4,
              }}
            >
              {role}
            </span>
          </div>
        </div>
        <button
          onClick={handleLogout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            width: '100%',
            padding: '8px 10px',
            background: 'transparent',
            color: 'rgba(255,255,255,0.6)',
            border: 'none',
            borderRadius: 6,
            cursor: 'pointer',
            fontSize: 12.5,
            fontWeight: 500,
          }}
        >
          <Icon name="logout" size={14} /> Sign out
        </button>
      </div>
    </aside>
  );
}
