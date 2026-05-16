import Icon from './Icon';

export default function Toast({ msg, type, onClose }) {
  const colorByType = { success: 'var(--c-success)', error: 'var(--c-danger)' };
  return (
    <div
      style={{
        position: 'fixed',
        bottom: 28,
        right: 28,
        zIndex: 999,
        background: 'var(--c-text)',
        color: '#fff',
        borderRadius: 'var(--r-md)',
        padding: '13px 20px',
        fontSize: 14,
        fontWeight: 500,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        boxShadow: 'var(--shadow-lg)',
        borderLeft: `4px solid ${colorByType[type] || 'var(--c-primary)'}`,
        maxWidth: 380,
        animation: 'fadeIn 0.25s ease-out',
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
          color: '#cbd5e1',
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
