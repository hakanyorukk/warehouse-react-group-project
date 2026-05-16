export default function FormField({ label, error, hint, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label
        style={{
          display: 'block',
          fontSize: 13,
          fontWeight: 500,
          color: 'var(--c-text)',
          marginBottom: 6,
        }}
      >
        {label}
      </label>
      {children}
      {hint && !error && (
        <div style={{ fontSize: 12, color: 'var(--c-text-soft)', marginTop: 5 }}>{hint}</div>
      )}
      {error && (
        <div style={{ fontSize: 12, color: 'var(--c-danger)', marginTop: 5, fontWeight: 500 }}>
          {error}
        </div>
      )}
    </div>
  );
}
