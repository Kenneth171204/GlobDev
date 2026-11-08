// Logo BulkUp: ikon dumbbell buatan sendiri (SVG) + wordmark.

export function LogoMark({ size = 36, className = '' }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
      <defs>
        <linearGradient id="lm-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FF8A3D" />
          <stop offset="1" stopColor="#FF5A1F" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="14" fill="url(#lm-bg)" />
      <g transform="rotate(-30 24 24)" fill="#fff">
        <rect x="13" y="22" width="22" height="4" rx="2" />
        <rect x="9" y="14" width="5.5" height="20" rx="2.2" />
        <rect x="4.5" y="18" width="4" height="12" rx="1.8" />
        <rect x="33.5" y="14" width="5.5" height="20" rx="2.2" />
        <rect x="39.5" y="18" width="4" height="12" rx="1.8" />
      </g>
      <circle cx="38" cy="10" r="3.2" fill="#C8F31D" />
    </svg>
  )
}

export default function Logo({ terang = false, size = 34 }) {
  return (
    <span className={`logo ${terang ? 'logo-terang' : ''}`}>
      <LogoMark size={size} />
      <span className="logo-teks">
        BULK<span>UP</span>
      </span>
    </span>
  )
}
