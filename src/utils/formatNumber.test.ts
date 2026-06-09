import { describe, it, expect } from 'vitest'

import { formatNumber, formatCurrency, formatCompactNumber, formatPercentage } from './formatNumber'

describe('formatNumber', () => {
  it('formats integer with thousands separator', () => {
    expect(formatNumber(1000)).toBe('1,000')
    expect(formatNumber(1234567)).toBe('1,234,567')
  })

  it('formats zero correctly', () => {
    expect(formatNumber(0)).toBe('0')
  })

  it('returns "0" for NaN input', () => {
    expect(formatNumber(NaN)).toBe('0')
  })

  it('returns "0" for non-number input', () => {
    expect(formatNumber('abc' as any)).toBe('0')
    expect(formatNumber(undefined as any)).toBe('0')
    expect(formatNumber(null as any)).toBe('0')
  })

  it('formats negative numbers', () => {
    expect(formatNumber(-5000)).toBe('-5,000')
  })

  it('formats decimal numbers', () => {
    expect(formatNumber(1234.56)).toBe('1,234.56')
  })
})

describe('formatCurrency', () => {
  it('formats USD by default', () => {
    expect(formatCurrency(1000)).toBe('$1,000.00')
    expect(formatCurrency(0)).toBe('$0.00')
  })

  it('returns "$0" for NaN input', () => {
    expect(formatCurrency(NaN)).toBe('$0')
  })

  it('returns "$0" for non-number input', () => {
    expect(formatCurrency('abc' as any)).toBe('$0')
  })

  it('formats with custom currency', () => {
    const result = formatCurrency(1000, 'EUR')

    expect(result).toContain('1,000')
  })

  it('formats negative currency values', () => {
    const result = formatCurrency(-500)

    expect(result).toContain('500')
  })
})

describe('formatCompactNumber', () => {
  it('formats thousands as K', () => {
    expect(formatCompactNumber(1500)).toBe('1.5K')
    expect(formatCompactNumber(1000)).toBe('1K')
  })

  it('formats millions as M', () => {
    expect(formatCompactNumber(1200000)).toBe('1.2M')
  })

  it('returns "0" for NaN', () => {
    expect(formatCompactNumber(NaN)).toBe('0')
  })

  it('returns "0" for non-number', () => {
    expect(formatCompactNumber(null as any)).toBe('0')
  })

  it('formats small numbers without compact notation', () => {
    expect(formatCompactNumber(42)).toBe('42')
    expect(formatCompactNumber(999)).toBe('999')
  })
})

describe('formatPercentage', () => {
  it('formats value as percentage (divides by 100)', () => {
    expect(formatPercentage(50)).toBe('50.0%')
    expect(formatPercentage(100)).toBe('100.0%')
  })

  it('formats decimal percentages', () => {
    expect(formatPercentage(33.33)).toBe('33.3%')
  })

  it('returns "0%" for NaN', () => {
    expect(formatPercentage(NaN)).toBe('0%')
  })

  it('returns "0%" for non-number', () => {
    expect(formatPercentage(undefined as any)).toBe('0%')
  })

  it('formats zero', () => {
    expect(formatPercentage(0)).toBe('0.0%')
  })
})
