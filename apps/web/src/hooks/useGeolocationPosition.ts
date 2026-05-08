import { useEffect, useState } from 'react'
import type { LatLng } from '../types/domain'

export type GeoState =
  | { status: 'idle' }
  | { status: 'pending' }
  | { status: 'ok'; coords: LatLng; accuracyM?: number }
  | { status: 'denied' | 'unavailable' }

/**
 * 現在地をウォッチ（許可がなければ denied / unavailable で終了、警告文は出さない）
 */
export function useGeolocationPosition(enabled: boolean): GeoState {
  const [state, setState] = useState<GeoState>({ status: 'idle' })

  useEffect(() => {
    if (!enabled) {
      setState({ status: 'idle' })
      return
    }

    if (!navigator.geolocation) {
      setState({ status: 'unavailable' })
      return
    }

    setState({ status: 'pending' })

    const id = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords
        setState({
          status: 'ok',
          coords: [latitude, longitude],
          accuracyM: accuracy
        })
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setState({ status: 'denied' })
        } else {
          setState({ status: 'unavailable' })
        }
      },
      { enableHighAccuracy: false, maximumAge: 30_000, timeout: 15_000 }
    )

    return () => {
      navigator.geolocation.clearWatch(id)
    }
  }, [enabled])

  return state
}
