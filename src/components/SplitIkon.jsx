import { Activity, BicepsFlexed, Dumbbell, Flame, Footprints, Moon } from 'lucide-react'
import { WARNA_SPLIT } from '../lib/bulking.js'

const IKON = {
  Push: BicepsFlexed, Pull: Dumbbell, Legs: Footprints, Upper: BicepsFlexed,
  Lower: Footprints, 'Full Body': Flame, Rest: Moon,
}

export default function SplitIkon({ split, size = 22 }) {
  const Ikon = IKON[split] ?? Activity
  return (
    <span className={`split-ikon warna-${WARNA_SPLIT[split] ?? 'abu'}`} aria-hidden="true">
      <Ikon size={size} strokeWidth={2.4} />
    </span>
  )
}
