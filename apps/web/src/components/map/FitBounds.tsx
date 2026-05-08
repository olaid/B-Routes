import { useEffect } from 'react'
import { useMap } from 'react-leaflet'
import type { LatLngBounds } from 'leaflet'

const DEFAULT_PADDING: [number, number] = [28, 28]

export function FitBounds({
  bounds,
  padding = DEFAULT_PADDING
}: {
  bounds: LatLngBounds
  padding?: [number, number]
}) {
  const map = useMap()
  useEffect(() => {
    map.fitBounds(bounds, { padding })
  }, [map, bounds, padding])
  return null
}
