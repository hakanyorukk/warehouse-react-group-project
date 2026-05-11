const STYLES = {
  IN: { bg: '#dcfce7', color: '#15803d', label: 'IN' },
  OUT: { bg: '#fee2e2', color: '#b91c1c', label: 'OUT' },
  LOW: { bg: '#fef9c3', color: '#92400e', label: 'LOW' },
  OK: { bg: '#f0fdf4', color: '#15803d', label: 'OK' },
};

export default function Badge({ type }) {
  const s = STYLES[type] || STYLES.OK;
  return (
    <span
      style={{
        background: s.bg,
        color: s.color,
        padding: '2px 8px',
        borderRadius: 4,
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: '0.05em',
      }}
    >
      {s.label}
    </span>
  );
}
