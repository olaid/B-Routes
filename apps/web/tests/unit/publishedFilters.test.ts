import { describe, expect, it } from 'vitest'
import { filterAreasData } from '../../src/data/publishedFilters'
import type { Area } from '../../src/types/domain'

describe('filterAreasData', () => {
  it('drops draft areas', () => {
    const areas: Area[] = [
      {
        id: 'a1',
        slug: 'a1',
        name: 'X',
        polygon: [
          [0, 0],
          [0, 1],
          [1, 1]
        ],
        visibility: 'public',
        status: 'draft',
        walls: []
      }
    ]
    expect(filterAreasData(areas)).toHaveLength(0)
  })

  it('keeps published public areas', () => {
    const areas: Area[] = [
      {
        id: 'a1',
        slug: 'a1',
        name: 'Y',
        polygon: [
          [0, 0],
          [0, 1],
          [1, 1]
        ],
        visibility: 'public',
        status: 'published',
        walls: []
      }
    ]
    expect(filterAreasData(areas)).toHaveLength(1)
  })
})
