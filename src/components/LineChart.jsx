/**
 * Grafik garis sederhana (SVG, tanpa library).
 * data: [{ label, nilai }] — nilai null = hari tanpa data (dilewati).
 * target: garis putus-putus opsional.
 */
export default function LineChart({ data, target, warna = '#FF5A1F', satuan = '', label, kosong = 'Belum ada data.' }) {
  const L = 340, T = 170, padX = 14, padAtas = 18, padBawah = 28
  const ada = data.filter((d) => d.nilai != null)
  if (ada.length === 0) return <p className="grafik-kosong">{kosong}</p>

  const nilai = ada.map((d) => d.nilai).concat(target != null ? [target] : [])
  let min = Math.min(...nilai), max = Math.max(...nilai)
  if (min === max) { min -= 5; max += 5 }
  const jarak = max - min
  min -= jarak * 0.15
  max += jarak * 0.15

  const x = (i) => padX + (i * (L - padX * 2)) / Math.max(1, data.length - 1)
  const y = (v) => padAtas + ((max - v) * (T - padAtas - padBawah)) / (max - min)

  const titik = data.map((d, i) => (d.nilai == null ? null : { x: x(i), y: y(d.nilai), d }))
  const valid = titik.filter(Boolean)
  // Kurva halus (Catmull-Rom → Bézier) melewati semua titik yang ada.
  let path = `M ${valid[0].x} ${valid[0].y}`
  for (let i = 0; i < valid.length - 1; i++) {
    const p0 = valid[i - 1] || valid[i], p1 = valid[i], p2 = valid[i + 1], p3 = valid[i + 2] || p2
    const c1x = p1.x + (p2.x - p0.x) / 6, c1y = p1.y + (p2.y - p0.y) / 6
    const c2x = p2.x - (p3.x - p1.x) / 6, c2y = p2.y - (p3.y - p1.y) / 6
    path += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2.x} ${p2.y}`
  }
  const area = `${path} L ${valid.at(-1).x} ${T - padBawah} L ${valid[0].x} ${T - padBawah} Z`
  const terakhir = valid.at(-1)
  const tiapLabel = data.length > 10 ? Math.ceil(data.length / 6) : 1
  const gid = `area-${warna.replace('#', '')}`

  return (
    <svg className="grafik" viewBox={`0 0 ${L} ${T}`} role="img" aria-label={label}>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={warna} stopOpacity="0.28" />
          <stop offset="1" stopColor={warna} stopOpacity="0" />
        </linearGradient>
      </defs>
      {data.map((d, i) => (
        <line key={i} x1={x(i)} x2={x(i)} y1={padAtas} y2={T - padBawah} className="grafik-kisi" />
      ))}
      {target != null && (
        <g>
          <line x1={padX} x2={L - padX} y1={y(target)} y2={y(target)} className="grafik-target" />
          <text x={padX + 2} y={y(target) - 5} textAnchor="start" className="grafik-target-teks">
            target {target}{satuan}
          </text>
        </g>
      )}
      <path d={area} fill={`url(#${gid})`} />
      <path d={path} fill="none" stroke={warna} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
      {valid.length <= 31 && valid.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="3.5" fill="#fff" stroke={warna} strokeWidth="2.5" />
      ))}
      <circle cx={terakhir.x} cy={terakhir.y} r="7" fill="#fff" stroke={warna} strokeWidth="4" />
      <g>
        <rect x={Math.min(L - 62, Math.max(2, terakhir.x - 30))} y={Math.max(0, terakhir.y - 30)} width="60" height="20"
          rx="10" fill="#141414" />
        <text x={Math.min(L - 32, Math.max(32, terakhir.x))} y={Math.max(0, terakhir.y - 30) + 14} textAnchor="middle"
          className="grafik-tip">{terakhir.d.nilai}{satuan}</text>
      </g>
      {data.map((d, i) => (i % tiapLabel === 0 || i === data.length - 1) && (
        <text key={i} x={x(i)} y={T - 8} textAnchor="middle" className="grafik-label">{d.label}</text>
      ))}
    </svg>
  )
}
