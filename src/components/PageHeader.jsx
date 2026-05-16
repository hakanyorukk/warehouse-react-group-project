export default function PageHeader({ title, subtitle, action }) {
  return (
    <div
      style={{
        marginBottom: 24,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        gap: 16,
        flexWrap: 'wrap',
      }}
    >
      <div>
        <h1
          style={{
            fontFamily: 'var(--font-head)',
            fontSize: 26,
            fontWeight: 600,
            color: 'var(--c-text)',
            letterSpacing: '-0.025em',
          }}
        >
          {title}
        </h1>
        {subtitle && (
          <p style={{ fontSize: 13.5, color: 'var(--c-text-muted)', marginTop: 4 }}>{subtitle}</p>
        )}
      </div>
      {action}
    </div>
  );
}
