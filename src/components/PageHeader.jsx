export default function PageHeader({ title, subtitle }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1a1a2e', letterSpacing: '-0.02em' }}>
        {title}
      </h1>
      {subtitle && <p style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>{subtitle}</p>}
    </div>
  );
}
