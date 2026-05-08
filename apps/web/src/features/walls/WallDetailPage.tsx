import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { RouteTopo } from '../../components/RouteTopo'
import { findWallWithArea } from '../../data/areasRepository'
import { useAreasData } from '../../hooks/useAreasData'
import type { Route } from '../../types/domain'

export function WallDetailPage() {
  const { wallId } = useParams<{ wallId: string }>()
  const areasState = useAreasData()

  const found = useMemo(() => {
    if (areasState.status !== 'ready' || !wallId) return undefined
    return findWallWithArea(areasState.data.areas, wallId)
  }, [areasState, wallId])

  if (areasState.status === 'loading') {
    return (
      <section className="page-state wall-detail">
        <p>読み込み中…</p>
      </section>
    )
  }

  if (areasState.status === 'error') {
    return (
      <section className="page-state page-state--error wall-detail">
        <p>{areasState.message}</p>
      </section>
    )
  }

  if (!wallId || !found) {
    return (
      <section className="page-empty wall-detail">
        <p>この岩の情報は見つかりませんでした。</p>
        <Link to="/">全体地図へ</Link>
      </section>
    )
  }

  const { area, wall } = found

  return (
    <article className="wall-detail">
      <nav className="wall-detail__nav">
        <Link to={`/areas/${area.slug}`}>← {area.name}</Link>
      </nav>

      <header className="wall-detail__header">
        <h1 className="wall-detail__title">{wall.name}</h1>
      </header>

      {wall.imageUrl ? (
        <RouteTopo
          imageUrl={wall.imageUrl}
          imageWidth={wall.imageWidth}
          imageHeight={wall.imageHeight}
          routes={wall.routes}
        />
      ) : (
        <>
          <p className="wall-detail__placeholder">岩写真はまだ登録されていません。</p>
          {wall.routes.length > 0 ? <RouteList routes={wall.routes} /> : null}
        </>
      )}

      {(wall.accessNotes || wall.safetyNotes || wall.hazardNotes) && (
        <section className="wall-detail__notes">
          {wall.accessNotes ? (
            <p>
              <strong>アクセス:</strong> {wall.accessNotes}
            </p>
          ) : null}
          {wall.safetyNotes ? (
            <p>
              <strong>安全:</strong> {wall.safetyNotes}
            </p>
          ) : null}
          {wall.hazardNotes ? (
            <p>
              <strong>注意:</strong> {wall.hazardNotes}
            </p>
          ) : null}
        </section>
      )}
    </article>
  )
}

function RouteList({ routes }: { routes: Route[] }) {
  return (
    <ul className="wall-detail__routes">
      {routes.map((r) => (
        <li key={r.id} className="wall-detail__route-row">
          <span className="wall-detail__route-name">{r.name}</span>
          {(r.gradeJp || r.gradeV) && (
            <span className="wall-detail__route-grade">
              {[r.gradeJp, r.gradeV].filter(Boolean).join(' / ')}
            </span>
          )}
          {r.comment ? <p className="wall-detail__route-comment">{r.comment}</p> : null}
        </li>
      ))}
    </ul>
  )
}
