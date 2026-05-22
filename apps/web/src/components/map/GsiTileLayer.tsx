import { TileLayer } from 'react-leaflet'
import {
  GSI_STD_TILE_ATTRIBUTION,
  GSI_STD_TILE_MAX_ZOOM,
  GSI_STD_TILE_URL
} from '../../lib/gsiMapTiles'

export function GsiTileLayer() {
  return (
    <TileLayer
      attribution={GSI_STD_TILE_ATTRIBUTION}
      url={GSI_STD_TILE_URL}
      maxZoom={GSI_STD_TILE_MAX_ZOOM}
    />
  )
}
