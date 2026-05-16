import Icon from './Icon';

export default function StatCard({ label, value, sub, accent, icon }) {
  return (
    <div
      style={{
        background: 'var(--c-surface)',
        borderRadius: 'var(--r-lg)',
        padding: '18px 20px',
        border: '1px solid var(--c-border)',
        flex: 1,
        minWidth: 150,
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div
          style={{
            fontSize: 11,
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: 'var(--c-text-muted)',
          }}
        >
          {label}
        </div>
        {icon && <Icon name={icon} size={15} color="var(--c-text-soft)" />}
      </div>
      <div
        style={{
          fontFamily: 'var(--font-head)',
          fontSize: 30,
          fontWeight: 600,
          color: accent || 'var(--c-text)',
          lineHeight: 1,
          letterSpacing: '-0.02em',
        }}
      >
        {value}
      </div>
      {sub && <div style={{ fontSize: 12, color: 'var(--c-text-muted)' }}>{sub}</div>}
    </div>
  );
}
