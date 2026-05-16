const STYLES = {
  IN: { bg: 'var(--c-success-bg)', color: 'var(--c-success)', label: 'IN' },
  OUT: { bg: 'var(--c-danger-bg)', color: 'var(--c-danger)', label: 'OUT' },
  LOW: { bg: 'var(--c-warning-bg)', color: 'var(--c-warning)', label: 'LOW' },
  OK: { bg: 'var(--c-primary-soft)', color: 'var(--c-primary)', label: 'OK' },
};

export default function Badge({ type }) {
  const s = STYLES[type] || STYLES.OK;
  return (
    <span
      style={{
        background: s.bg,
        color: s.color,
        padding: '3px 9px',
        borderRadius: 4,
        fontSize: 10.5,
        fontWeight: 700,
        letterSpacing: '0.06em',
        fontFamily: 'var(--font-mono)',
        display: 'inline-block',
      }}
    >
      {s.label}
    </span>
  );
}
