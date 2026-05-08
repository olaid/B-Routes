import type { CSSProperties } from 'react'

type Props = {
  /** 北が 0°、時計回り（CSS rotate と同じ） */
  bearingDeg: number
  distanceLabel: string
  className?: string
}

export function BearingCard({ bearingDeg, distanceLabel, className }: Props) {
  const style: CSSProperties = {
    transform: `rotate(${bearingDeg}deg)`
  }
  return (
    <div className={['bearing-card', className].filter(Boolean).join(' ')} role="status">
      <div className="bearing-card__compass" aria-hidden>
        <div className="bearing-card__arrow" style={style} />
      </div>
      <div className="bearing-card__meta">
        <span className="bearing-card__dist">{distanceLabel}</span>
      </div>
    </div>
  )
}
