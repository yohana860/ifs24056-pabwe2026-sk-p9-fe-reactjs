import { CATEGORY_ALL, formatDate } from './format'

describe('format utils', () => {
  it('formatDate', () => {
    expect(formatDate(null)).toBe('-')
    expect(formatDate('2026-12-31T00:00:00Z')).toMatch(/31/)
  })
  it('CATEGORY_ALL', () => {
    expect(CATEGORY_ALL).toBe('Semua')
  })
})
