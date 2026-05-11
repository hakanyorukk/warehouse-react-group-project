export default function StatCard({ label, value, sub, accent }) {
  return (
    <div
      style={{
        background: '#fff',
        borderRadius: 10,
        padding: '18px 20px',
        border: '1px solid #e5e7eb',
        flex: 1,
        minWidth: 140,
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          color: '#94a3b8',
          marginBottom: 8,
        }}
      >
        {label}
      </div>
      <div style={{ fontSize: 28, fontWeight: 700, color: accent || '#1a1a2e', lineHeight: 1 }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: 12, color: '#64748b', marginTop: 6 }}>{sub}</div>}
    </div>
  );
}
