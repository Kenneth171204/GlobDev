/** Circular progress bar (SVG). Isi tengah lewat children. */
export default function RingProgress({ nilai, maks, ukuran = 220, tebal = 18, warna = 'oranye', children, label }) {
  const r = (ukuran - tebal) / 2
  const keliling = 2 * Math.PI * r
  const rasio = maks > 0 ? Math.min(1, nilai / maks) : 0
  const sudut = rasio * 2 * Math.PI - Math.PI / 2
  const c = ukuran / 2
  const titik = { x: c + r * Math.cos(sudut), y: c + r * Math.sin(sudut) }
  const id = `ring-${warna}`

  return (
    <div className="ring" style={{ width: ukuran, height: ukuran }} role="img" aria-label={label}>
      <svg width={ukuran} height={ukuran} viewBox={`0 0 ${ukuran} ${ukuran}`}>
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
            {warna === 'oranye' ? (
              <><stop offset="0" stopColor="#FFA24C" /><stop offset="1" stopColor="#FF5A1F" /></>
            ) : warna === 'lime' ? (
              <><stop offset="0" stopColor="#E4FF6B" /><stop offset="1" stopColor="#A6DB00" /></>
            ) : (
              <><stop offset="0" stopColor="#5AA2FF" /><stop offset="1" stopColor="#1F6BFF" /></>
            )}
          </linearGradient>
        </defs>
        <circle cx={c} cy={c} r={r} fill="none" className="ring-jalur" strokeWidth={tebal} />
        <circle
          cx={c} cy={c} r={r} fill="none" stroke={`url(#${id})`} strokeWidth={tebal} strokeLinecap="round"
          opacity={rasio > 0 ? 1 : 0}
          strokeDasharray={keliling} strokeDashoffset={keliling * (1 - rasio)}
          transform={`rotate(-90 ${c} ${c})`} className="ring-isi"
        />
        {rasio > 0 && (
          <circle cx={titik.x} cy={titik.y} r={tebal / 2 + 3} fill="#fff" className="ring-titik"
            stroke="#141414" strokeWidth="4" />
        )}
      </svg>
      <div className="ring-tengah">{children}</div>
    </div>
  )
}
