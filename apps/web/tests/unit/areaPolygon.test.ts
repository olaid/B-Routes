import { describe, expect, it } from 'vitest'
import {
  buildAreaPolygon,
  convexHullLatLng,
  expandPolygonOutward
} from '../../src/lib/areaPolygon'
import { polygonCentroid } from '../../src/lib/geo'
import type { LatLng } from '../../src/types/domain'

describe('convexHullLatLng', () => {
  it('returns CCW hull of 4 corners as 4 points', () => {
    const pts: LatLng[] = [
      [0, 0],
      [0, 1],
      [1, 1],
      [1, 0],
      [0.5, 0.5]
    ]
    const hull = convexHullLatLng(pts)
    expect(hull).toHaveLength(4)
  })
})

describe('expandPolygonOutward', () => {
  it('moves every vertex outward by ~padMeters along radial', () => {
    const square: LatLng[] = [
      [36.394, 140.168],
      [36.395, 140.168],
      [36.395, 140.169],
      [36.394, 140.169]
    ]
    const before = polygonCentroid(square)
    const expanded = expandPolygonOutward(square, 30)
    const after = polygonCentroid(expanded)
    // 中心はほぼ動かない（µ deg / ~1m 程度の差は許容）
    expect(after[0]).toBeCloseTo(before[0], 4)
    expect(after[1]).toBeCloseTo(before[1], 4)
    // 各頂点が中心から離れたことを確認
    const before00 = Math.hypot(square[0][0] - before[0], square[0][1] - before[1])
    const after00 = Math.hypot(expanded[0][0] - after[0], expanded[0][1] - after[1])
    expect(after00).toBeGreaterThan(before00)
  })
})

describe('buildAreaPolygon', () => {
  it('drops a far-away outlier so polygon stays compact', () => {
    const walls: LatLng[] = [
      [36.3950, 140.1685],
      [36.3953, 140.1690],
      [36.3949, 140.1695],
      [36.3955, 140.1688],
      // 4 km 離れた異常座標
      [36.3609, 140.1442]
    ]
    const result = buildAreaPolygon(walls, { outlierMeters: 500, padMeters: 25 })
    expect(result.outliers).toHaveLength(1)
    expect(result.inlierCount).toBe(4)
    for (const [lat, lng] of result.polygon) {
      expect(lat).toBeGreaterThan(36.39)
      expect(lat).toBeLessThan(36.40)
      expect(lng).toBeGreaterThan(140.16)
      expect(lng).toBeLessThan(140.18)
    }
  })

  it('keeps all points if none exceed threshold', () => {
    const walls: LatLng[] = [
      [36.3950, 140.1685],
      [36.3953, 140.1690],
      [36.3949, 140.1695]
    ]
    const result = buildAreaPolygon(walls, { outlierMeters: 500, padMeters: 25 })
    expect(result.outliers).toHaveLength(0)
    expect(result.inlierCount).toBe(3)
  })

  it('returns small ring for a single wall', () => {
    const result = buildAreaPolygon([[36.3950, 140.1685]], { padMeters: 25 })
    expect(result.polygon.length).toBeGreaterThanOrEqual(8)
  })

  it('returns empty polygon for empty input', () => {
    const result = buildAreaPolygon([])
    expect(result.polygon).toEqual([])
  })

  it('falls back to all points when every point would be filtered (2-point case)', () => {
    // 2 点だけでメディアンが両者の中点になり、両者ともしきい値を超える状況
    const walls: LatLng[] = [
      [36.3, 140.1],
      [36.5, 140.3]
    ]
    const result = buildAreaPolygon(walls, { outlierMeters: 1, fallbackIfAllFiltered: true })
    expect(result.inlierCount).toBe(2)
  })
})
