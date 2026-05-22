import { useMemo } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { MapContainer, Marker, Polygon, Popup, TileLayer } from 'react-leaflet'
import { BearingCard } from '../../components/BearingCard'
import { FitBounds } from '../../components/map/FitBounds'
import { getAreaBySlug } from '../../data/areasRepository'
import { formatDistance, haversineDistance, initialBearing, polygonCentroid } from '../../lib/geo'
import { boundsFromPolygon, toLeafletLatLng } from '../../lib/mapHelpers'
import { useAreasData } from '../../hooks/useAreasData'
import { useGeolocationPosition } from '../../hooks/useGeolocationPosition'

export function AreaMapPage() {
  const { areaSlug } = useParams<{ areaSlug: string }>()
  const navigate = useNavigate()
  const areasState = useAreasData()

  const area = useMemo(() => {
    if (areasState.status !== 'ready' || !areaSlug) return undefined
    return getAreaBySlug(areasState.data.areas, areaSlug)
  }, [areasState, areaSlug])

  const bounds = useMemo(() => (area ? boundsFromPolygon(area.polygon) : null), [area])

  const centroid = useMemo(() => (area ? polygonCentroid(area.polygon) : null), [area])

  const geoEnabled = areasState.status === 'ready' && !!area
  const geo = useGeolocationPosition(geoEnabled)

  const bearingOverlay = useMemo(() => {
    if (!centroid || geo.status !== 'ok') return null
    const from = geo.coords
    return {
      bearingDeg: initialBearing(from, centroid),
      label: formatDistance(haversineDistance(from, centroid))
    }
  }, [centroid, geo])

  if (areasState.status === 'loading') {
    return (
      <section className="page-state map-page map-page--loading">
        <p>地図を読み込んでいます…</p>
      </section>
    )
  }

  if (areasState.status === 'error') {
    return (
      <section className="page-state page-state--error map-page">
        <p>{areasState.message}</p>
      </section>
    )
  }

  if (!areaSlug || !area || !bounds) {
    return (
      <section className="page-empty wall-detail">
        <p>エリアが見つかりません。</p>
        <Link to="/">全体地図へ</Link>
      </section>
    )
  }

  const center = bounds.getCenter()
  const unlocatedWalls = area.walls.filter((w) => w.outOfBounds)

  return (
    <div className="map-page map-page--stack">
      <div className="map-toolbar">
        <button type="button" className="map-toolbar__back" onClick={() => navigate('/')}>
          ← 全体地図
        </button>
        <h1 className="map-toolbar__title">{area.name}</h1>
      </div>

      <div className="map-page__wrap">
        <MapContainer
          key={area.id}
          className="map-page__canvas"
          center={[center.lat, center.lng]}
          zoom={15}
          scrollWheelZoom
          maxZoom={19}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <FitBounds bounds={bounds} />
          <Polygon
            positions={area.polygon.map(([lat, lng]) => [lat, lng])}
            pathOptions={{
              color: '#0f766e',
              weight: 2,
              fillColor: '#14b8a6',
              fillOpacity: 0.12
            }}
          />
          {area.walls
            .filter((w) => !w.outOfBounds)
            .map((w) => (
              <Marker key={w.id} position={toLeafletLatLng(w.coordinates)}>
                <Popup>
                  <strong>{w.name}</strong>
                  <div>
                    <button type="button" onClick={() => navigate(`/walls/${w.id}`)}>
                      詳細へ
                    </button>
                  </div>
                </Popup>
              </Marker>
            ))}
        </MapContainer>

        {bearingOverlay ? (
          <div className="map-page__bearing">
            <BearingCard bearingDeg={bearingOverlay.bearingDeg} distanceLabel={bearingOverlay.label} />
          </div>
        ) : null}
      </div>

      {unlocatedWalls.length > 0 ? (
        <section className="unlocated-walls">
          <h2 className="unlocated-walls__title">位置未確定の岩</h2>
          <ul className="unlocated-walls__list">
            {unlocatedWalls.map((w) => (
              <li key={w.id}>
                <Link to={`/walls/${w.id}`}>{w.name}</Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  )
}
