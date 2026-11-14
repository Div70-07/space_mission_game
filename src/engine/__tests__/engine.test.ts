import { describe, it, expect } from 'vitest'
import { computeTotals } from '../index'
import type { Design, GameData } from '@/shared/types'

describe('engine totals', () => {
  it('returns an object with a mass field', () => {
    const mockDesign = {} as Design
    const mockData = {} as GameData
    const totals = computeTotals(mockDesign, mockData)
    expect(totals).toHaveProperty('mass')
  })
})
