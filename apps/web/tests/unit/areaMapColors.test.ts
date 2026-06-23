import { describe, expect, it } from 'vitest'
import { areaColorIndex, getAreaMapColor } from '../../src/lib/areaMapColors'

describe('areaMapColors', () => {
  it('同じ id 集合では常に同じパレット index', () => {
    const ids = ['c', 'a', 'b']
    expect(areaColorIndex('a', ids)).toBe(0)
    expect(areaColorIndex('b', ids)).toBe(1)
    expect(areaColorIndex('c', ids)).toBe(2)
    expect(areaColorIndex('a', ['b', 'c', 'a'])).toBe(0)
  })

  it('4色で循環する', () => {
    const ids = ['a', 'b', 'c', 'd', 'e']
    expect(areaColorIndex('e', ids)).toBe(0)
    expect(getAreaMapColor('e', ids.map((id) => ({ id } as { id: string }))).fillColor).toBe(
      getAreaMapColor('a', ids.map((id) => ({ id } as { id: string }))).fillColor
    )
  })
})
