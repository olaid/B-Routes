import { useMemo } from 'react'
import { MapContainer, Polygon, Popup, TileLayer } from 'react-leaflet'
import { useNavigate } from 'react-router-dom'
import { FitBounds } from '../../components/map/FitBounds'
import { useAreasData } from '../../hooks/useAreasData'
import { boundsFromAreas } from '../../lib/mapHelpers'
import '../../lib/leafletSetup'

export function TopMapPage() {
  const areasState = useAreasData()
  const navigate = useNavigate()

  const bounds = useMemo(() => {
    if (areasState.status !== 'ready') return null
    return boundsFromAreas(areasState.data.areas)
  }, [areasState])

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

  const { areas } = areasState.data
  if (!bounds || areas.length === 0) {
    return (
      <section className="page-state map-page">
        <p>表示できるエリアがありません。</p>
      </section>
    )
  }

  const center = bounds.getCenter()

  return (
    <div className="map-page">
      <p className="map-page__hint">エリアをタップして詳細地図へ</p>
      <MapContainer
        className="map-page__canvas"
        center={[center.lat, center.lng]}
        zoom={14}
        scrollWheelZoom
        maxZoom={19}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds bounds={bounds} />
        {areas.map((area) => (
          <Polygon
            key={area.id}
            positions={area.polygon.map(([lat, lng]) => [lat, lng])}
            pathOptions={{
              color: '#0f766e',
              weight: 2,
              fillColor: '#14b8a6',
              fillOpacity: 0.22
            }}
            eventHandlers={{
              click: () => {
                navigate(`/areas/${area.slug}`)
              }
            }}
          >
            <Popup>
              <strong>{area.name}</strong>
              <div>
                <button type="button" onClick={() => navigate(`/areas/${area.slug}`)}>
                  このエリアへ
                </button>
              </div>
            </Popup>
          </Polygon>
        ))}
      </MapContainer>
    </div>
  )
}
