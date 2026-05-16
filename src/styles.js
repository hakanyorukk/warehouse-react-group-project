export const inputStyle = {
  width: '100%',
  padding: '10px 13px',
  border: '1px solid var(--c-border-strong)',
  borderRadius: 'var(--r-sm)',
  fontSize: 14,
  background: '#fff',
  color: 'var(--c-text)',
};

export const btnPrimary = {
  padding: '10px 22px',
  background: 'var(--c-primary)',
  color: '#fff',
  border: 'none',
  borderRadius: 'var(--r-sm)',
  fontSize: 14,
  fontWeight: 600,
  cursor: 'pointer',
  letterSpacing: '0.01em',
};

export const btnSecondary = {
  padding: '10px 22px',
  background: 'var(--c-surface-alt)',
  color: 'var(--c-text)',
  border: '1px solid var(--c-border-strong)',
  borderRadius: 'var(--r-sm)',
  fontSize: 14,
  fontWeight: 500,
  cursor: 'pointer',
};

export const btnDanger = {
  ...btnPrimary,
  background: 'var(--c-danger)',
};
