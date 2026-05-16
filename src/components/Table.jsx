export default function Table({ columns, rows, emptyMsg = 'No data' }) {
  return (
    <div
      style={{
        background: 'var(--c-surface)',
        borderRadius: 'var(--r-lg)',
        border: '1px solid var(--c-border)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      {/* horizontal scroll on narrow screens */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', minWidth: 480, borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: 'var(--c-surface-alt)' }}>
              {columns.map((col) => (
                <th
                  key={col.key}
                  style={{
                    padding: '11px 16px',
                    textAlign: col.right ? 'right' : 'left',
                    fontWeight: 600,
                    fontSize: 11,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    color: 'var(--c-text-muted)',
                    borderBottom: '1px solid var(--c-border)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  style={{
                    padding: 36,
                    textAlign: 'center',
                    color: 'var(--c-text-soft)',
                    fontSize: 13,
                  }}
                >
                  {emptyMsg}
                </td>
              </tr>
            ) : (
              rows.map((row, i) => (
                <tr
                  key={i}
                  className="row-hover"
                  style={{
                    borderBottom: i < rows.length - 1 ? '1px solid var(--c-border)' : 'none',
                    transition: 'background 0.1s',
                  }}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      style={{
                        padding: '11px 16px',
                        textAlign: col.right ? 'right' : 'left',
                        color: 'var(--c-text)',
                      }}
                    >
                      {row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
