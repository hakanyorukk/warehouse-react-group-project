import { useLocation } from 'react-router-dom';
import Icon from './Icon';
import { useAuth } from '../context/AuthContext';

const LABELS = {
  '/dashboard': 'Dashboard',
  '/entry': 'Stock Entry',
  '/writedown': 'Write-Down',
  '/reports': 'Stock Report',
  '/products': 'Products',
};

export default function TopBar({ onMenuClick }) {
  const location = useLocation();
  const { session } = useAuth();
  const label = LABELS[location.pathname] || 'Dashboard';
  const email = session?.user?.email || '';

  return (
    <div
      style={{
        padding: '12px 28px',
        background: 'var(--c-surface)',
        borderBottom: '1px solid var(--c-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
        gap: 12,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
        <button
          className="menu-btn"
          onClick={onMenuClick}
          aria-label="Open menu"
          style={{
            background: 'var(--c-surface-alt)',
            border: '1px solid var(--c-border)',
            width: 36,
            height: 36,
            borderRadius: 8,
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            flexShrink: 0,
          }}
        >
          <Icon name="menu" size={17} color="var(--c-text-muted)" />
        </button>
        <div
          style={{
            fontSize: 12.5,
            color: 'var(--c-text-muted)',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <span>Stockwell</span>
          <span style={{ color: 'var(--c-text-soft)' }}>/</span>
          <span style={{ color: 'var(--c-text)', fontWeight: 500 }}>{label}</span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <button
          aria-label="Notifications"
          style={{
            background: 'var(--c-surface-alt)',
            border: '1px solid var(--c-border)',
            width: 34,
            height: 34,
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            position: 'relative',
          }}
        >
          <Icon name="bell" size={15} color="var(--c-text-muted)" />
          <span
            style={{
              position: 'absolute',
              top: 7,
              right: 8,
              width: 7,
              height: 7,
              borderRadius: '50%',
              background: 'var(--c-accent)',
              border: '1.5px solid var(--c-surface-alt)',
            }}
          />
        </button>
        <div className="hide-on-mobile" style={{ fontSize: 12.5, color: 'var(--c-text)' }}>
          {email}
        </div>
      </div>
    </div>
  );
}
