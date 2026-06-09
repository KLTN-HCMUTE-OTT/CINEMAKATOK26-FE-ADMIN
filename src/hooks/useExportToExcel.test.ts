import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook } from '@testing-library/react'

import { useExportToExcel } from './useExportToExcel'

describe('useExportToExcel', () => {
  let mockClick: ReturnType<typeof vi.fn>
  let mockSetAttribute: ReturnType<typeof vi.fn>
  let mockLink: any
  const originalCreateElement = document.createElement.bind(document)

  beforeEach(() => {
    mockClick = vi.fn()
    mockSetAttribute = vi.fn()

    mockLink = {
      setAttribute: mockSetAttribute,
      click: mockClick,
      style: {} as CSSStyleDeclaration
    }

    // Only intercept 'a' elements, pass through everything else
    vi.spyOn(document, 'createElement').mockImplementation((tagName: string, options?: ElementCreationOptions) => {
      if (tagName === 'a') return mockLink as any
      
return originalCreateElement(tagName, options)
    })
    vi.spyOn(document.body, 'appendChild').mockImplementation((node) => node)
    vi.spyOn(document.body, 'removeChild').mockImplementation((node) => node)
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-url')
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('exportToExcel', () => {
    it('creates a downloadable CSV file', () => {
      const { result } = renderHook(() => useExportToExcel())

      const data = [
        { name: 'Movie A', genre: 'Action' },
        { name: 'Movie B', genre: 'Drama' }
      ]

      result.current.exportToExcel(data, ['name', 'genre'], 'movies_export')

      expect(mockClick).toHaveBeenCalledOnce()
      expect(mockSetAttribute).toHaveBeenCalledWith('download', expect.stringMatching(/^movies_export_\d+\.csv$/))
      expect(mockSetAttribute).toHaveBeenCalledWith('href', 'blob:mock-url')
    })

    it('uses default filename when not provided', () => {
      const { result } = renderHook(() => useExportToExcel())

      result.current.exportToExcel([{ col: 'val' }], ['col'])

      expect(mockSetAttribute).toHaveBeenCalledWith('download', expect.stringMatching(/^export_\d+\.csv$/))
    })

    it('handles empty data without throwing', () => {
      const { result } = renderHook(() => useExportToExcel())

      expect(() => {
        result.current.exportToExcel([], ['col1', 'col2'], 'empty')
      }).not.toThrow()

      expect(mockClick).toHaveBeenCalled()
    })

    it('handles null/undefined cell values', () => {
      const { result } = renderHook(() => useExportToExcel())
      const data = [{ name: null, age: undefined }]

      expect(() => {
        result.current.exportToExcel(data as any, ['name', 'age'])
      }).not.toThrow()
    })
  })

  describe('exportMultipleSheets', () => {
    it('exports first sheet as CSV fallback', () => {
      const { result } = renderHook(() => useExportToExcel())

      const sheetsData = [
        {
          name: 'Users',
          headers: ['name', 'email'],
          data: [{ name: 'Alice', email: 'alice@test.com' }]
        },
        {
          name: 'Movies',
          headers: ['title'],
          data: [{ title: 'Inception' }]
        }
      ]

      result.current.exportMultipleSheets(sheetsData, 'report')

      expect(mockClick).toHaveBeenCalledOnce()
      expect(mockSetAttribute).toHaveBeenCalledWith('download', expect.stringMatching(/^report_\d+\.csv$/))
    })

    it('handles sheets with values containing commas', () => {
      const { result } = renderHook(() => useExportToExcel())

      const sheetsData = [
        {
          name: 'Data',
          headers: ['description'],
          data: [{ description: 'Hello, "World"' }]
        }
      ]

      expect(() => {
        result.current.exportMultipleSheets(sheetsData)
      }).not.toThrow()
    })
  })
})
