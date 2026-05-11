import Icon from './Icon';

export default function Toast({ msg, type, onClose }) {
  const colors = { success: '#15803d', error: '#dc2626' };
  return (
    <div
      style={{
        position: 'fixed',
        bottom: 28,
        right: 28,
        zIndex: 999,
        background: '#1a1a2e',
        color: '#fff',
        borderRadius: 9,
        padding: '13px 20px',
        fontSize: 14,
        fontWeight: 500,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        boxShadow: '0 4px 24px rgba(0,0,0,0.18)',
        borderLeft: `4px solid ${colors[type] || '#6c9fff'}`,
        maxWidth: 340,
      }}
    >
      {type === 'success' && <Icon name="check" size={16} color="#4ade80" />}
      {type === 'error' && <Icon name="warn" size={16} color="#f87171" />}
      <span>{msg}</span>
      <button
        onClick={onClose}
        style={{
          marginLeft: 'auto',
          background: 'none',
          border: 'none',
          color: '#8892b0',
          cursor: 'pointer',
          fontSize: 18,
          lineHeight: 1,
          padding: 0,
        }}
      >
        ×
      </button>
    </div>
  );
}
