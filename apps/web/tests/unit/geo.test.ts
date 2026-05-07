import { describe, expect, it } from 'vitest'
import {
  compassLabel,
  formatDistance,
  haversineDistance,
  initialBearing,
  polygonCentroid
} from '../../src/lib/geo'
import type { LatLng } from '../../src/types/domain'

describe('haversineDistance', () => {
  it('returns 0 for identical points', () => {
    const p: LatLng = [36.394, 140.168]
    expect(haversineDistance(p, p)).toBe(0)
  })

  it('matches the textbook Tokyo - Kyoto great-circle distance (~360 km)', () => {
    // 東京駅・京都駅
    const tokyo: LatLng = [35.681236, 139.767125]
    const kyoto: LatLng = [34.985458, 135.758766]
    const d = haversineDistance(tokyo, kyoto) / 1000
    expect(d).toBeGreaterThan(355)
    expect(d).toBeLessThan(380)
  })

  it('is symmetric', () => {
    const a: LatLng = [36.394, 140.168]
    const b: LatLng = [36.395, 140.169]
    expect(haversineDistance(a, b)).toBeCloseTo(haversineDistance(b, a), 6)
  })

  it('handles small displacement (~140 m for ~0.001 degree near equator)', () => {
    const a: LatLng = [0, 0]
    const b: LatLng = [0, 0.001]
    const d = haversineDistance(a, b)
    expect(d).toBeGreaterThan(100)
    expect(d).toBeLessThan(120)
  })
})

describe('initialBearing', () => {
  it('returns 0° (north) for a point directly north', () => {
    const a: LatLng = [35, 139]
    const b: LatLng = [36, 139]
    expect(initialBearing(a, b)).toBeCloseTo(0, 6)
  })

  it('returns ~90° (east) for a point along the same parallel', () => {
    // 球面のため緯度35°で東に動くと厳密には 89.7° 前後になる（北寄りに緩む）
    const a: LatLng = [35, 139]
    const b: LatLng = [35, 140]
    const bearing = initialBearing(a, b)
    expect(bearing).toBeGreaterThan(89)
    expect(bearing).toBeLessThan(91)
  })

  it('returns 90° on the equator', () => {
    const a: LatLng = [0, 0]
    const b: LatLng = [0, 1]
    expect(initialBearing(a, b)).toBeCloseTo(90, 6)
  })

  it('returns 180° (south) for a point directly south', () => {
    const a: LatLng = [35, 139]
    const b: LatLng = [34, 139]
    expect(initialBearing(a, b)).toBeCloseTo(180, 6)
  })

  it('returns ~270° (west) for a point along the same parallel', () => {
    const a: LatLng = [35, 139]
    const b: LatLng = [35, 138]
    const bearing = initialBearing(a, b)
    expect(bearing).toBeGreaterThan(269)
    expect(bearing).toBeLessThan(271)
  })

  it('always falls within [0, 360)', () => {
    const a: LatLng = [35, 139]
    const samples: LatLng[] = [
      [36, 138],
      [36, 140],
      [34, 138],
      [34, 140]
    ]
    for (const s of samples) {
      const b = initialBearing(a, s)
      expect(b).toBeGreaterThanOrEqual(0)
      expect(b).toBeLessThan(360)
    }
  })
})

describe('polygonCentroid', () => {
  it('returns the center of a square', () => {
    const square: LatLng[] = [
      [0, 0],
      [0, 2],
      [2, 2],
      [2, 0]
    ]
    const [lat, lng] = polygonCentroid(square)
    expect(lat).toBeCloseTo(1, 6)
    expect(lng).toBeCloseTo(1, 6)
  })

  it('falls back to vertex average for degenerate polygons (zero area)', () => {
    const line: LatLng[] = [
      [0, 0],
      [0, 1],
      [0, 2]
    ]
    const [lat, lng] = polygonCentroid(line)
    expect(lat).toBe(0)
    expect(lng).toBeCloseTo(1, 6)
  })

  it('returns the only point for a 1-point polygon', () => {
    const single: LatLng[] = [[36.5, 140.1]]
    expect(polygonCentroid(single)).toEqual([36.5, 140.1])
  })

  it('throws for empty polygon', () => {
    expect(() => polygonCentroid([])).toThrow()
  })

  it('handles a roughly axis-aligned ikegami area polygon', () => {
    const polygon: LatLng[] = [
      [36.394008, 140.168023],
      [36.394008, 140.169478],
      [36.395402, 140.169478],
      [36.395402, 140.168023]
    ]
    const [lat, lng] = polygonCentroid(polygon)
    expect(lat).toBeCloseTo(36.394705, 4)
    expect(lng).toBeCloseTo(140.16875, 4)
  })
})

describe('formatDistance', () => {
  it('formats sub-1km in meters (rounded)', () => {
    expect(formatDistance(0)).toBe('0 m')
    expect(formatDistance(123.4)).toBe('123 m')
    expect(formatDistance(999)).toBe('999 m')
  })

  it('formats >=1km with 1 decimal up to 10km, no decimal beyond', () => {
    expect(formatDistance(1000)).toBe('1.0 km')
    expect(formatDistance(2_500)).toBe('2.5 km')
    expect(formatDistance(15_400)).toBe('15 km')
  })

  it('returns dash for invalid values', () => {
    expect(formatDistance(Number.NaN)).toBe('—')
    expect(formatDistance(-1)).toBe('—')
  })
})

describe('compassLabel', () => {
  it('maps cardinal degrees to Japanese labels', () => {
    expect(compassLabel(0)).toBe('北')
    expect(compassLabel(45)).toBe('北東')
    expect(compassLabel(90)).toBe('東')
    expect(compassLabel(180)).toBe('南')
    expect(compassLabel(270)).toBe('西')
    expect(compassLabel(360)).toBe('北')
  })

  it('handles negative bearings by wrapping around', () => {
    expect(compassLabel(-45)).toBe('北西')
  })
})
