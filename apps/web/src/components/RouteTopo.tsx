import { useState } from 'react'
import type { Route } from '../types/domain'

type Props = {
  imageUrl: string
  imageWidth?: number
  imageHeight?: number
  routes: Route[]
}

export function RouteTopo({ imageUrl, imageWidth, imageHeight, routes }: Props) {
  const [natural, setNatural] = useState<{ w: number; h: number } | null>(() =>
    imageWidth && imageHeight ? { w: imageWidth, h: imageHeight } : null
  )
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const routesWithPath = routes.filter((r) => r.svgPath)
  const dims = natural

  return (
    <div className="route-topo">
      <div className="route-topo__frame">
        <img
          src={imageUrl}
          alt="岩の写真"
          className="route-topo__img"
          loading="lazy"
          decoding="async"
          onLoad={(e) => {
            const img = e.currentTarget
            if (!natural) {
              setNatural({ w: img.naturalWidth, h: img.naturalHeight })
            }
          }}
        />
        {dims && routesWithPath.length > 0 ? (
          <svg
            className="route-topo__svg"
            viewBox={`0 0 ${dims.w} ${dims.h}`}
            preserveAspectRatio="xMidYMid meet"
          >
            {routesWithPath.map((r) => (
              <path
                key={r.id}
                d={r.svgPath!}
                fill="none"
                strokeWidth={selectedId === r.id ? 5 : 3}
                strokeLinecap="round"
                strokeLinejoin="round"
                stroke={selectedId === r.id ? '#f59e0b' : '#0d9488'}
                className="route-topo__path"
                onClick={() => setSelectedId((cur) => (cur === r.id ? null : r.id))}
                onKeyDown={(ev) => {
                  if (ev.key === 'Enter' || ev.key === ' ') {
                    ev.preventDefault()
                    setSelectedId((cur) => (cur === r.id ? null : r.id))
                  }
                }}
                tabIndex={0}
                role="button"
                aria-label={r.name}
              />
            ))}
          </svg>
        ) : null}
      </div>
      {routes.length > 0 ? (
        <ul className="route-topo__legend">
          {routes.map((r) => (
            <li key={r.id}>
              <button
                type="button"
                className={
                  r.svgPath ? 'route-topo__legend-btn' : 'route-topo__legend-btn route-topo__legend-btn--muted'
                }
                onClick={() => {
                  if (r.svgPath) {
                    setSelectedId((cur) => (cur === r.id ? null : r.id))
                  }
                }}
                disabled={!r.svgPath}
              >
                <span className="route-topo__legend-name">{r.name}</span>
                {(r.gradeJp || r.gradeV) && (
                  <span className="route-topo__legend-grade">
                    {[r.gradeJp, r.gradeV].filter(Boolean).join(' / ')}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
