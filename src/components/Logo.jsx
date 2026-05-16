export default function Logo({ size = 40, color = 'var(--c-primary)', showWord = true, wordColor }) {
  const wc = wordColor || color;
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
      <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* back box (top) */}
        <g>
          <path d="M32 4 L48 12 L32 20 L16 12 Z" fill={color} opacity="0.9" />
          <path d="M16 12 L32 20 L32 32 L16 24 Z" fill={color} opacity="0.55" />
          <path d="M48 12 L32 20 L32 32 L48 24 Z" fill={color} opacity="0.75" />
        </g>
        {/* front-left box */}
        <g transform="translate(-10 16)">
          <path d="M32 4 L48 12 L32 20 L16 12 Z" fill={color} opacity="0.85" />
          <path d="M16 12 L32 20 L32 32 L16 24 Z" fill={color} opacity="0.5" />
          <path d="M48 12 L32 20 L32 32 L48 24 Z" fill={color} opacity="0.7" />
        </g>
        {/* front-right box */}
        <g transform="translate(10 16)">
          <path d="M32 4 L48 12 L32 20 L16 12 Z" fill={color} />
          <path d="M16 12 L32 20 L32 32 L16 24 Z" fill={color} opacity="0.6" />
          <path d="M48 12 L32 20 L32 32 L48 24 Z" fill={color} opacity="0.8" />
        </g>
      </svg>
      {showWord && (
        <span
          style={{
            fontFamily: 'var(--font-head)',
            fontWeight: 700,
            fontSize: size * 0.5,
            color: wc,
            letterSpacing: '-0.02em',
            lineHeight: 1,
          }}
        >
          Stockwell
        </span>
      )}
    </div>
  );
}
